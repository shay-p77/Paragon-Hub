const express = require('express');
const Anthropic = require('@anthropic-ai/sdk').default;

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
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `Parse this booking request:\n\n${text}`
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

// GET /api/ai/status - Check if AI is configured
router.get('/status', (req, res) => {
  res.json({
    configured: !!anthropic,
    model: 'claude-3-5-haiku-20241022'
  });
});

module.exports = router;
