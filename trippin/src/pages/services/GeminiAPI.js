import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI('AIzaSyD_i2Z5txpsXGLQU3nbHBS8H6ELczp3qxM'); // Use environment variable for API key

const GeminiAPI = {
  generateItinerary: async (prompt) => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      // Generate content based on the provided prompt
      const result = await model.generateContent(prompt);
      console.log(result)
      // Handle the response and return the text content
      return result.response.text(); 
    } catch (error) {
      console.error('Error generating itinerary:', error);
      throw error;
    }
  },
}

export default GeminiAPI;