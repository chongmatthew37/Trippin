const GeminiAPI = {
  generateItinerary: async (tripId) => {
    try {
      const response = await fetch('https://gemini-ai-api.com/generate-itinerary', {
        method: 'POST', // Specify the HTTP method
        headers: {
          'Content-Type': 'application/json', // Ensure the content type is JSON
        },
        body: JSON.stringify({ tripId }), // Convert the tripId to a JSON string
      });

      // Check if the response is OK
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json(); // Parse the JSON from the response
      return data; // Return the generated itinerary
    } catch (error) {
      console.error('Error generating itinerary:', error);
      throw error;
    }
  },
};

export default GeminiAPI;
