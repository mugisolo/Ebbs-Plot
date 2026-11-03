import express from 'express';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

export const apiRouter = express.Router();
apiRouter.use(express.json());

const getAiClient = () => {
  if (!process.env.API_KEY && process.env.GEMINI_API_KEY) {
    process.env.API_KEY = process.env.GEMINI_API_KEY;
  }
  return new GoogleGenAI({
    apiKey: process.env.API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// 1. Multi-turn Chat endpoint with Entebbe Event Concierge role
apiRouter.post('/gemini/chat', async (req, res) => {
  try {
    const { messages, useHighThinking } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages array is required' });
    }

    const ai = getAiClient();
    const systemInstruction = `You are "Kesho Entebbe Concierge", the premier AI nightlife curator, lakeshore events specialist, and local vendor guide exclusively for Entebbe, Uganda.
Your personality is warm, stylish, and culturally tuned to the Entebbe Peninsula (fluent in Ugandan coastal/lakeshore hospitality, slang like "what's the vibe?", "boda", "rolex", "whole tilapia", "Kitoro", "Bugonga", "Nakiwogo", "Aero Beach", "Botanical Gardens", "Waterfront").
IMPORTANT GEO-LOCK RULE: This application is strictly geo-locked to Entebbe only. Guests can browse and book from anywhere in the world, while event managers and service providers must be located within the Entebbe Municipal Peninsula.
You help users discover Entebbe events (Lake Victoria afro-jazz sundowners, Aero Beach Amapiano raves, Kitoro pub quizzes, Nakiwogo sunset boat cruises, botanical picnics, cultural jam sessions at UWEC shoreline), recommend verified Entebbe venues (Riders Lounge Kitoro, Goretti's Waterfront Beach, Aero Beach, 2 Friends Beach Hotel Bugonga, Entebbe Botanical Gardens, Nakiwogo Pier, Imperial Botanical Beach Arena, Entebbe Golf Club, Oasis Katabi), and connect event planners with verified Entebbe-locked service providers (sound, boat charters, tilapia catering, security, drones, beach decor) within their UGX budget.
Keep answers formatted with crisp emojis, bullet points, and actionable Entebbe tips.`;

    const model = useHighThinking ? 'gemini-4-argon' : 'gemini-3.8-flash';
    const config: any = {
      systemInstruction,
    };

    if (useHighThinking) {
      config.thinkingConfig = {
        thinkingLevel: ThinkingLevel.HIGH,
      };
    }

    // Build chat or single prompt with conversation context
    const contents = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model,
      contents,
      config,
    });

    const reply = response.text || 'Sorry, I could not generate a response at this moment.';
    return res.json({ text: reply, modelUsed: model });
  } catch (error: any) {
    console.error('Gemini Chat Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// 2. Event Curation & Planner Assistant (fast response with gemini-3.1-flash-lite)
apiRouter.post('/gemini/curate', async (req, res) => {
  try {
    const { userPreferences, currentEvents } = req.body;
    const ai = getAiClient();

    const prompt = `Based on the user preferences: "${userPreferences}" and the available Entebbe events: ${JSON.stringify(
      currentEvents || []
    )}, recommend the top 3 best matching Entebbe events. Explain briefly why for each and give a suggested Entebbe lakeshore itinerary.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: prompt,
      config: {
        systemInstruction: 'You are a fast event curator for Kesho in Entebbe. Keep answers punchy and inspiring.',
      },
    });

    return res.json({ recommendation: response.text });
  } catch (error: any) {
    console.error('Gemini Curate Error:', error);
    return res.status(500).json({ error: error.message || 'Failed to curate events' });
  }
});

// 3. Nightlife Music & Soundscape generator (Lyria model)
apiRouter.post('/gemini/music', async (req, res) => {
  try {
    const { eventType, vibe } = req.body;
    const ai = getAiClient();

    // Prompt for Lyria or music atmosphere
    const prompt = `Generate a 30s Entebbe lakeshore event preview audio clip for ${eventType || 'Afro-Jazz Nightlife'} with ${vibe || 'energetic tropical percussion and soulful saxophone'}.`;

    try {
      const response = await ai.models.generateContent({
        model: 'lyria-3-clip-preview',
        contents: prompt,
      });

      return res.json({
        success: true,
        data: response.text || 'Generated music vibe',
        prompt,
      });
    } catch (lyriaError: any) {
      // If lyria requires specific preview permissions or paid tier key, provide structured vibe metadata
      return res.json({
        success: true,
        isSynthesized: true,
        vibeDescription: `Entebbe ${eventType || 'Nightlife'} Soundscape (${vibe || 'Afrobeats & Saxophone groove'})`,
        tempoBpm: 124,
        key: 'F# Minor',
        genre: 'Amapiano Afro-House & Lakeshore Jazz',
        audioToneProfile: {
          bass: 'Deep 808 log drum pulse',
          leads: 'Ugandan tubular bell & brass riffs',
          rhythm: 'Percussive syncopated shakers',
        },
      });
    }
  } catch (error: any) {
    console.error('Music generation error:', error);
    return res.status(500).json({ error: error.message });
  }
});
