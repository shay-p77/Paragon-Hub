const express = require('express');
const router = express.Router();
const multer = require('multer');
const { sanitizeText, logPIIWarning } = require('../utils/sanitize');

// Lazy load these to avoid startup issues
let Anthropic;
let pdfParse;

// Configure multer for PDF uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// Initialize Anthropic client (lazy load)
const getAnthropicClient = () => {
  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your_anthropic_api_key_here') {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }
  if (!Anthropic) {
    Anthropic = require('@anthropic-ai/sdk');
  }
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
};

// Lazy load pdf-parse
const getPdfParse = () => {
  if (!pdfParse) {
    pdfParse = require('pdf-parse');
  }
  return pdfParse;
};

// System prompt for parsing booking confirmations
const PARSING_SYSTEM_PROMPT = `You are an expert at extracting structured booking information from travel confirmation emails, PDFs, and text.

Your job is to analyze the provided text and extract booking details into a structured JSON format.

IMPORTANT RULES:
1. Only extract information that is explicitly present in the text
2. Use null for any field you cannot find
3. Detect the booking type: "FLIGHT", "HOTEL", or "LOGISTICS" (car rental, transfer, etc.)
4. For dates, use YYYY-MM-DD format
5. For times, use HH:MM format (24-hour)
6. Be precise with confirmation/PNR numbers - copy them exactly

Return a JSON object with this structure:
{
  "bookingType": "FLIGHT" | "HOTEL" | "LOGISTICS",
  "confidence": 0-100,

  // For FLIGHTS:
  "flight": {
    "pnr": "confirmation/PNR number",
    "airline": "airline name",
    "routes": "JFK-LAX, LAX-SFO (departure-arrival codes)",
    "dates": "departure date(s)",
    "passengerCount": number,
    "passengers": ["name1", "name2"],
    "flightNumbers": ["AA123", "AA456"]
  },

  // For HOTELS:
  "hotel": {
    "confirmationNumber": "confirmation number",
    "hotelName": "hotel name",
    "roomType": "room type/category",
    "checkIn": "YYYY-MM-DD",
    "checkOut": "YYYY-MM-DD",
    "guestCount": number,
    "guests": ["name1", "name2"],
    "address": "hotel address"
  },

  // For LOGISTICS (car rental, transfers, etc.):
  "logistics": {
    "confirmationNumber": "confirmation number",
    "serviceType": "Car Rental / Airport Transfer / Chauffeur / etc.",
    "provider": "company name",
    "date": "YYYY-MM-DD",
    "time": "HH:MM",
    "pickupLocation": "pickup address/location",
    "dropoffLocation": "dropoff address/location",
    "vehicleType": "vehicle type if mentioned",
    "passengerCount": number
  },

  // Common fields:
  "clientName": "primary guest/passenger name",
  "totalCost": number or null,
  "currency": "USD/EUR/etc.",
  "notes": "any important notes or special requests mentioned"
}

Only include the relevant section (flight/hotel/logistics) based on the booking type detected.`;

// Parse text endpoint
router.post('/text', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length < 20) {
      return res.status(400).json({ error: 'Please provide booking confirmation text (at least 20 characters)' });
    }

    // Log PII detection for audit purposes
    logPIIWarning(text, '/api/parse/text');

    // Sanitize sensitive data before sending to external AI
    const sanitizedText = sanitizeText(text, {
      maskPassport: true,
      maskSSN: true,
      maskCreditCard: true,
      maskDOB: true,
      maskPhone: false, // Keep phone for booking contact
      maskEmail: false, // Keep email for booking contact
    });

    const anthropic = getAnthropicClient();

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      system: PARSING_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Please extract the booking information from the following confirmation:\n\n${sanitizedText}`
        }
      ]
    });

    // Extract JSON from response
    const responseText = message.content[0].text;

    // Try to parse JSON from the response
    let parsedData;
    try {
      // Look for JSON in the response (might be wrapped in markdown code blocks)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return res.status(500).json({ error: 'Failed to parse AI response', raw: responseText });
    }

    res.json({ success: true, data: parsedData });

  } catch (error) {
    console.error('Parse text error:', error);
    if (error.message === 'ANTHROPIC_API_KEY not configured') {
      return res.status(500).json({ error: 'AI parsing not configured. Please add ANTHROPIC_API_KEY to server .env file.' });
    }
    res.status(500).json({ error: error.message || 'Failed to parse text' });
  }
});

// Parse PDF endpoint
router.post('/pdf', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a PDF file' });
    }

    // Extract text from PDF
    const pdfParser = getPdfParse();
    const pdfData = await pdfParser(req.file.buffer);
    const extractedText = pdfData.text;

    if (!extractedText || extractedText.trim().length < 20) {
      return res.status(400).json({ error: 'Could not extract enough text from PDF. The file may be image-based or empty.' });
    }

    // Log PII detection for audit purposes
    logPIIWarning(extractedText, '/api/parse/pdf');

    // Sanitize sensitive data before sending to external AI
    const sanitizedText = sanitizeText(extractedText, {
      maskPassport: true,
      maskSSN: true,
      maskCreditCard: true,
      maskDOB: true,
      maskPhone: false,
      maskEmail: false,
    });

    const anthropic = getAnthropicClient();

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      system: PARSING_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Please extract the booking information from the following confirmation (extracted from PDF):\n\n${sanitizedText}`
        }
      ]
    });

    // Extract JSON from response
    const responseText = message.content[0].text;

    let parsedData;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return res.status(500).json({ error: 'Failed to parse AI response', raw: responseText });
    }

    res.json({ success: true, data: parsedData, extractedText: extractedText.substring(0, 500) + '...' });

  } catch (error) {
    console.error('Parse PDF error:', error);
    if (error.message === 'ANTHROPIC_API_KEY not configured') {
      return res.status(500).json({ error: 'AI parsing not configured. Please add ANTHROPIC_API_KEY to server .env file.' });
    }
    res.status(500).json({ error: error.message || 'Failed to parse PDF' });
  }
});

module.exports = router;
