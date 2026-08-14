const { GoogleGenAI, Type } = require('@google/genai');
const axios = require('axios');

const searchPlaces = async (keyword, locationBias, apiKey) => {
  try {
    const response = await axios.post(
      'https://places.googleapis.com/v1/places:searchText',
      { textQuery: keyword, ...(locationBias && { locationBias }) },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.location',
        },
      }
    );
    return response.data?.places || [];
  } catch {
    return [];
  }
};

const getRecommendations = async (req, res) => {
  try {
    const { mood, latitude, longitude } = req.body;

    if (!mood?.trim()) {
      return res.status(400).json({ error: 'Mood is required.' });
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    const googlePlacesApiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!geminiApiKey || !googlePlacesApiKey) {
      return res.status(500).json({ error: 'Server API keys are missing.' });
    }

    const ai = new GoogleGenAI({ apiKey: geminiApiKey });
    const geminiResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze this user mood: "${mood.trim()}". Return a JSON array of 3 distinct venue search ideas for nearby places. For each idea, provide:
1. "keyword": Google Places search query (e.g. "cozy cafe", "botanical garden", "art gallery").
2. "reason": A single, concise friendly sentence (max 18 words) explaining why this specific venue type fits the "${mood.trim()}" mood.`,
      config: {

        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              keyword: { type: Type.STRING },
              reason: { type: Type.STRING },
            },
            required: ['keyword', 'reason'],
          },
        },
      },
    });

    let rawIdeas = [];
    try {
      rawIdeas = JSON.parse(geminiResponse.text || '[]').slice(0, 3);
    } catch {
      rawIdeas = [];
    }

    const searchIdeas = rawIdeas.map((item) => {
      if (typeof item === 'string') {
        return { keyword: item, reason: `Fits your "${mood}" mood with relaxing and positive vibes.` };
      }
      return {
        keyword: item.keyword || 'popular spots',
        reason: item.reason || `Handpicked to match your "${mood}" mood.`,
      };
    });

    if (!searchIdeas.length) {
      return res.status(500).json({ error: 'Failed to generate recommendations.' });
    }

    const keywords = searchIdeas.map((idea) => idea.keyword);

    const hasCoords = !isNaN(Number(latitude)) && !isNaN(Number(longitude));
    const locationBias = hasCoords
      ? { circle: { center: { latitude: Number(latitude), longitude: Number(longitude) }, radius: 5000.0 } }
      : null;

    const rawPlaces = await Promise.all(
      searchIdeas.map(async (idea) => {
        const places = await searchPlaces(idea.keyword, locationBias, googlePlacesApiKey);
        return places.map((place) => ({
          ...place,
          matchedKeyword: idea.keyword,
          reason: idea.reason,
          mood: mood.trim(),
        }));
      })
    );

    const seenIds = new Set();
    const recommendations = rawPlaces.flat().filter((place) => {
      if (!place?.id || seenIds.has(place.id)) return false;
      seenIds.add(place.id);
      return true;
    });

    return res.status(200).json({
      mood,
      keywords,
      recommendations,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Server error generating recommendations.' });
  }
};

module.exports = { getRecommendations };