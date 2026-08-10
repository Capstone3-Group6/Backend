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
      contents: `Convert this mood into 3 venue search keywords: "${mood.trim()}"`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
      },
    });

    const keywords = JSON.parse(geminiResponse.text || '[]').slice(0, 3);

    if (!keywords.length) {
      return res.status(500).json({ error: 'Failed to generate keywords.' });
    }

    const hasCoords = !isNaN(Number(latitude)) && !isNaN(Number(longitude));
    const locationBias = hasCoords
      ? { circle: { center: { latitude: Number(latitude), longitude: Number(longitude) }, radius: 5000.0 } }
      : null;

    const rawPlaces = await Promise.all(
      keywords.map((keyword) => searchPlaces(keyword, locationBias, googlePlacesApiKey))
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