const express = require('express');
const Anthropic = require('@anthropic-ai/sdk').default;
const { sanitizeText, logPIIWarning } = require('../utils/sanitize');

const router = express.Router();

// Initialize Anthropic client
const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

// POST /api/ai/parse - Parse a request snippet using Claude
router.post('/parse', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'No text provided' });
    }

    if (!anthropic) {
      return res.status(503).json({
        error: 'AI parsing not configured',
        message: 'ANTHROPIC_API_KEY not set'
      });
    }

    // Log PII detection for audit purposes
    logPIIWarning(text, '/api/ai/parse');

    // Sanitize sensitive data before sending to external AI
    const sanitizedText = sanitizeText(text, {
      maskPassport: true,
      maskSSN: true,
      maskCreditCard: true,
      maskDOB: true,
      maskPhone: false,
      maskEmail: false,
    });

    const systemPrompt = `You are a travel concierge assistant that extracts structured data from booking requests, PNRs, emails, and client notes.

Extract the following fields from the user's text. Return ONLY a valid JSON object with these fields:

{
  "clientName": "Full name of the client/passenger (string or null)",
  "serviceType": "FLIGHT, HOTEL, or LOGISTICS (string)",
  "priority": "NORMAL or URGENT (string)",
  "targetDate": "Target/travel date in YYYY-MM-DD format (string or null)",
  "origin": "Origin city/airport (string or null)",
  "destination": "Destination city/airport (string or null)",
  "airline": "Airline name or code (string or null)",
  "flightNumber": "Flight number (string or null)",
  "hotelName": "Hotel/property name (string or null)",
  "checkIn": "Check-in date in YYYY-MM-DD format (string or null)",
  "checkOut": "Check-out date in YYYY-MM-DD format (string or null)",
  "notes": "Any special requests, preferences, or additional details (string)",
  "confidence": "HIGH, MEDIUM, or LOW - your confidence in the extraction (string)"
}

Rules:
- If a field cannot be determined, use null
- For serviceType: default to "FLIGHT" if it mentions flights/airlines, "HOTEL" if it mentions hotels/stays, "LOGISTICS" for ground transport/other
- For priority: mark as "URGENT" only if there are explicit urgency indicators (ASAP, urgent, emergency, today, immediately)
- For dates: convert to YYYY-MM-DD format. If only month/day given, assume current or next occurrence
- Extract ALL relevant details into the notes field
- Return ONLY the JSON object, no other text`;

    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `Parse this booking request:\n\n${sanitizedText}`
        }
      ],
      system: systemPrompt
    });

    // Extract the text content from the response
    const responseText = message.content[0].type === 'text'
      ? message.content[0].text
      : '';

    // Parse the JSON response
    let parsed;
    try {
      // Try to extract JSON from the response (handle cases where there might be extra text)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', responseText);
      return res.status(500).json({
        error: 'Failed to parse AI response',
        raw: responseText
      });
    }

    res.json({
      success: true,
      data: parsed,
      usage: {
        inputTokens: message.usage.input_tokens,
        outputTokens: message.usage.output_tokens
      }
    });

  } catch (error) {
    console.error('AI parse error:', error);
    res.status(500).json({
      error: 'AI parsing failed',
      message: error.message
    });
  }
});

// Import models for chat context
const Customer = require('../models/Customer');
const BookingRequest = require('../models/BookingRequest');
const PipelineTrip = require('../models/PipelineTrip');
const Vendor = require('../models/Vendor');

// Helper to gather relevant context based on the question
async function gatherChatContext(question) {
  const context = {};
  const questionLower = question.toLowerCase();

  try {
    // Always get summary stats
    const [customerCount, bookingCount, tripCount, vendorCount] = await Promise.all([
      Customer.countDocuments(),
      BookingRequest.countDocuments(),
      PipelineTrip.countDocuments(),
      Vendor.countDocuments(),
    ]);

    context.summary = {
      totalCustomers: customerCount,
      totalBookings: bookingCount,
      totalTrips: tripCount,
      totalVendors: vendorCount,
    };

    // If asking about bookings
    if (questionLower.includes('booking') || questionLower.includes('request') || questionLower.includes('flight') || questionLower.includes('hotel')) {
      const bookings = await BookingRequest.find()
        .sort({ timestamp: -1 })
        .limit(50)
        .select('type status priority clientName agentName timestamp tripName');

      context.recentBookings = bookings.map(b => ({
        type: b.type,
        status: b.status,
        priority: b.priority,
        clientName: b.clientName,
        agentName: b.agentName,
        tripName: b.tripName,
        date: b.timestamp,
      }));

      // Get booking stats by status
      const statusCounts = await BookingRequest.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);
      context.bookingsByStatus = statusCounts.reduce((acc, s) => {
        acc[s._id] = s.count;
        return acc;
      }, {});

      // Get booking stats by type
      const typeCounts = await BookingRequest.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ]);
      context.bookingsByType = typeCounts.reduce((acc, t) => {
        acc[t._id] = t.count;
        return acc;
      }, {});
    }

    // If asking about trips or pipeline
    if (questionLower.includes('trip') || questionLower.includes('pipeline') || questionLower.includes('concierge')) {
      const trips = await PipelineTrip.find()
        .sort({ createdAt: -1 })
        .limit(30)
        .select('name clientName stage hasFlights hasHotels hasLogistics isUrgent startDate endDate agent');

      context.recentTrips = trips.map(t => ({
        name: t.name,
        clientName: t.clientName,
        stage: t.stage,
        hasFlights: t.hasFlights,
        hasHotels: t.hasHotels,
        hasLogistics: t.hasLogistics,
        isUrgent: t.isUrgent,
        startDate: t.startDate,
        endDate: t.endDate,
        agent: t.agent,
      }));

      // Get trips by stage
      const stageCounts = await PipelineTrip.aggregate([
        { $group: { _id: '$stage', count: { $sum: 1 } } }
      ]);
      context.tripsByStage = stageCounts.reduce((acc, s) => {
        acc[s._id] = s.count;
        return acc;
      }, {});
    }

    // If asking about customers/clients
    if (questionLower.includes('customer') || questionLower.includes('client')) {
      const customers = await Customer.find()
        .sort({ createdAt: -1 })
        .limit(30)
        .select('legalFirstName legalLastName displayName createdAt agentId');

      // Only include non-sensitive info
      context.recentCustomers = customers.map(c => ({
        name: c.displayName || `${c.legalFirstName} ${c.legalLastName}`,
        createdAt: c.createdAt,
        hasAgent: !!c.agentId,
      }));
    }

    // If asking about vendors
    if (questionLower.includes('vendor') || questionLower.includes('supplier')) {
      const vendors = await Vendor.find({ isActive: true })
        .select('name type commissionPercent collectionMethod paymentFrequency');

      context.vendors = vendors.map(v => ({
        name: v.name,
        type: v.type,
        commissionPercent: v.commissionPercent,
        collectionMethod: v.collectionMethod,
        paymentFrequency: v.paymentFrequency,
      }));
    }

    // Get this month's stats
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [bookingsThisMonth, tripsThisMonth, customersThisMonth] = await Promise.all([
      BookingRequest.countDocuments({ timestamp: { $gte: startOfMonth } }),
      PipelineTrip.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Customer.countDocuments({ createdAt: { $gte: startOfMonth } }),
    ]);

    context.thisMonth = {
      newBookings: bookingsThisMonth,
      newTrips: tripsThisMonth,
      newCustomers: customersThisMonth,
    };

  } catch (error) {
    console.error('Error gathering context:', error);
  }

  return context;
}

// POST /api/ai/chat - Chat with AI assistant
router.post('/chat', async (req, res) => {
  try {
    const { message, history = [], user } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Check if API key is configured
    if (!anthropic) {
      return res.status(503).json({
        error: 'AI service not configured',
        response: 'The AI assistant is not yet configured. Please add your Anthropic API key to enable this feature.'
      });
    }

    // Gather relevant context from the database
    const context = await gatherChatContext(message);

    // Build user context string
    const userContext = user
      ? `\nCURRENT USER: You are talking to ${user.name} (${user.email}). Address them by their first name when appropriate.`
      : '';

    // Build the system prompt
    const systemPrompt = `You are an AI assistant for Paragon Hub, a travel agency management platform. You help staff answer questions about their business data.${userContext}

IMPORTANT GUIDELINES:
- Be concise and helpful
- Only reference data that is provided in the context below
- If you don't have enough information to answer, say so
- Never make up or guess statistics - only use the data provided
- Do not reveal or discuss personal information like passport numbers, dates of birth, or contact details
- Format numbers nicely (e.g., use commas for thousands)
- If asked about something not in the context, explain what data you do have access to

CURRENT DATA CONTEXT:
${JSON.stringify(context, null, 2)}

Remember: Only answer based on the data provided above. If the data doesn't contain what's needed to answer the question, be honest about that.`;

    // Build messages array for Claude
    const messages = [
      ...history.slice(-10).map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: message }
    ];

    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages,
    });

    const assistantMessage = response.content[0]?.type === 'text'
      ? response.content[0].text
      : 'Sorry, I couldn\'t generate a response.';

    res.json({ response: assistantMessage });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      error: 'Failed to process chat',
      response: 'Sorry, I encountered an error. Please try again.'
    });
  }
});

// GET /api/ai/status - Check if AI is configured
router.get('/status', (req, res) => {
  res.json({
    configured: !!anthropic,
    model: 'claude-3-haiku-20240307'
  });
});

module.exports = router;
