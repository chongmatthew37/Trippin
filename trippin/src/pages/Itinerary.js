import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, CircularProgress, Box, Card, CardContent, Button, Container } from '@mui/material';
import GeminiAPI from './services/GeminiAPI'; // Import the API service for Gemini AI
import { db } from './firebase';
import { getDocs, doc, getDoc, collection } from 'firebase/firestore'; // Import Firestore methods

const ItineraryPage = () => {
  const { tripId } = useParams(); // Get the tripId from the URL
  const [itinerary, setItinerary] = useState(null); // State to store the itinerary
  const [loading, setLoading] = useState(true); // Loading state
  const navigate = useNavigate(); // Navigation for buttons

  // Fetch invite emails from Firestore
  const fetchInviteEmails = async (tripId) => {
    try {
      const tripDocRef = doc(db, 'trips', tripId); // Get reference to the specific trip document
      const tripDoc = await getDoc(tripDocRef); // Fetch the trip document

      if (tripDoc.exists()) {
        const tripData = tripDoc.data();
        return tripData.inviteEmails || []; // Return the inviteEmails or an empty array if not found
      } else {
        console.error("Trip document not found");
        return [];
      }
    } catch (error) {
      console.error("Error fetching invite emails:", error);
      return [];
    }
  };

  const fetchAddress = async (tripId) => {
    try {
      const tripDocRef = doc(db, 'trips', tripId); // Get reference to the specific trip document
      const tripDoc = await getDoc(tripDocRef); // Fetch the trip document

      if (tripDoc.exists()) {
        const tripData = tripDoc.data();
        return tripData.address || ""; // Return the inviteEmails or an empty array if not found
      } else {
        console.error("Trip document not found");
        return "";
      }
    } catch (error) {
      console.error("Error fetching address:", error);
      return "";
    }
  };

  // Fetch user preferences from Firestore
  const fetchUserPreferences = async (tripId) => {
    const preferences = {};

    try {
      const preferencesSnapshot = await getDocs(collection(db, 'userPreferences'));

      if (!preferencesSnapshot.empty) {
        preferencesSnapshot.forEach((doc) => {
          const data = doc.data();
          console.log(`Fetched preferences for user:`, data); // Debugging: Log the fetched preferences

          preferences[doc.id] = {
            activityPreferences: data.activityPreferences,
            foodPreferences: data.foodPreferences,
            naturePreferences: data.naturePreferences,
          };
        });
      } else {
        console.warn(`No preferences found for tripId ${tripId}`);
      }
    } catch (error) {
      console.error('Error fetching user preferences:', error);
    }

    return preferences;
  };

  // Generate a prompt for a 3-day itinerary based on the schema
  const generateCommonalityPrompt = (userPreferences) => {
    let prompt = `Create a 3-day travel itinerary in the following format:\n\n`;

    prompt += `Day 1:\nDate: YYYY-MM-DD\nActivities:\n`;
    prompt += `- Type: sightseeing, Name: Example Place, Time: 09:00 AM, Location: Example City, Cost: $50\n\n`;

    prompt += `Day 2:\nDate: YYYY-MM-DD\nActivities:\n`;
    prompt += `- Type: sightseeing, Name: Example Place, Time: 09:00 AM, Location: Example City, Cost: $50\n\n`;

    prompt += `Day 3:\nDate: YYYY-MM-DD\nActivities:\n`;
    prompt += `- Type: sightseeing, Name: Example Place, Time: 09:00 AM, Location: Example City, Cost: $50\n\n`;

    return prompt;
  };

  // Fetch the itinerary using Gemini AI
  useEffect(() => {
    const fetchItinerary = async () => {
      try {
        // Step 1: Fetch inviteEmails from Firestore
        const inviteEmails = await fetchInviteEmails(tripId);
        console.log("Fetched Invite Emails:", inviteEmails);

        const address = await fetchAddress(tripId);

        // Step 2: Fetch user preferences
        const userPreferences = await fetchUserPreferences(tripId, inviteEmails);
        console.log("User Preferences:", userPreferences);

        // Step 3: Generate commonality prompt
        const prompt = generateCommonalityPrompt(userPreferences);
        console.log("Generated Prompt:", prompt);

        // Step 4: Call Gemini API with the generated prompt
        const response = await GeminiAPI.generateItinerary(prompt); // Pass the prompt
        console.log("Gemini API Response:", response);

        if (response) {
          setItinerary(response); // Save the fetched itinerary
        } else {
          console.error("Unexpected API Response Structure:", response);
          setItinerary(null);
        }

        setLoading(false); // Set loading to false
      } catch (error) {
        console.error('Error fetching itinerary:', error);
        setLoading(false);
      }
    };

    fetchItinerary(); // Call the async function to fetch the itinerary
  }, [tripId]); // Run this effect when the tripId changes

  // Loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // If no itinerary was found
  if (!itinerary) {
    return (
      <Typography variant="h6" color="error" sx={{ textAlign: 'center', marginTop: 4 }}>
        Unable to load itinerary.
      </Typography>
    );
  }

  // Render the itinerary dynamically based on the response
  const renderDayItinerary = (day, idx) => (
    <Box key={idx} sx={{ marginBottom: 4 }}>
      <Typography variant="h6" sx={{ marginBottom: 2, fontFamily: 'Metropolis, sans-serif', color: '#0e395a' }}>
        {day.title || `Day ${idx + 1}`}
      </Typography>
      {day.activities && day.activities.map((activity, activityIdx) => (
        <Card key={activityIdx} sx={{ marginBottom: 2 }}>
          <CardContent>
            <Typography
              variant="subtitle1"
              sx={{ fontFamily: 'Metropolis, sans-serif', color: '#0e395a' }}
            >
              {`Type: ${activity.type}, Name: ${activity.name}`}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Metropolis, sans-serif', color: '#0e395a' }}>
              {`Time: ${activity.time}`}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Metropolis, sans-serif', color: '#0e395a' }}>
              {`Location: ${activity.location}`}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Metropolis, sans-serif', color: '#0e395a' }}>
              {`Cost: ${activity.cost}`}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Box>
  );

  return (
    <Container maxWidth="xl">
      <Typography
        variant="h4"
        sx={{
          textAlign: 'center',
          marginTop: 2,
          marginBottom: 3,
          fontFamily: 'Metropolis, sans-serif',
          color: '#0e395a',
          fontWeight: 'bold',
        }}
      >
        Group Trip Itinerary
      </Typography>

      {/* Dynamically render each day */}
      {itinerary.days.map((day, idx) => renderDayItinerary(day, idx))}

      {/* Back to Dashboard Button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', marginY: 4 }}>
        <Button
          variant="contained"
          onClick={() => navigate('/Dashboard')}
          sx={{
            backgroundColor: '#4dacd1',
            '&:hover': { backgroundColor: '#4293a9' },
            fontFamily: 'Metropolis, sans-serif',
          }}
        >
          Back To Dashboard
        </Button>
      </Box>
    </Container>
  );
};

export default ItineraryPage;
