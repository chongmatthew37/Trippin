import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, CircularProgress, Box, Card, CardContent, Button, Container } from '@mui/material';
import Slider from 'react-slick'; // Carousel library
import GeminiAPI from './services/GeminiAPI'; // Import the API service for Gemini AI

const ItineraryPage = () => {
  const { tripId } = useParams(); // Get the tripId from the URL
  const [itinerary, setItinerary] = useState(null); // State to store the itinerary
  const [loading, setLoading] = useState(true); // Loading state
  const navigate = useNavigate(); // Navigation for buttons

  // Fetch the itinerary using Gemini AI
  useEffect(() => {
    const fetchItinerary = async () => {
      try {
        const response = await GeminiAPI.generateItinerary(tripId); // Fetch itinerary from the API
        setItinerary(response); // Save the fetched itinerary
        setLoading(false); // Set loading to false
      } catch (error) {
        console.error('Error fetching itinerary:', error);
        setLoading(false);
      }
    };
    fetchItinerary();
  }, [tripId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!itinerary || !itinerary.days) {
    return (
      <Typography variant="h6" color="error" sx={{ textAlign: 'center', marginTop: 4 }}>
        Unable to load itinerary.
      </Typography>
    );
  }

  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: itinerary.days.length > 5 ? 3 : itinerary.days.length, // Show 3 if more than 5 days
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

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
        Your Itinerary
      </Typography>

      {/* Carousel or List of Days */}
      {itinerary.days.length > 5 ? (
        <Slider {...settings}>
          {itinerary.days.map((day, index) => (
            <Box key={index} sx={{ padding: 2 }}>
              <Typography
                variant="h6"
                sx={{
                  textAlign: 'center',
                  fontFamily: 'Metropolis, sans-serif',
                  color: '#0e395a',
                }}
              >
                {day.date}
              </Typography>
              {day.activities.map((activity, idx) => (
                <Card key={idx} sx={{ marginBottom: 2 }}>
                  <CardContent>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontFamily: 'Metropolis, sans-serif',
                        color: '#0e395a',
                      }}
                    >
                      {activity.type}: {activity.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: 'Metropolis, sans-serif',
                        color: '#0e395a',
                      }}
                    >
                      {activity.time}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: 'Metropolis, sans-serif',
                        color: '#0e395a',
                      }}
                    >
                      {activity.location}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: 'Metropolis, sans-serif',
                        color: '#0e395a',
                      }}
                    >
                      {activity.cost}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          ))}
        </Slider>
      ) : (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', overflow: 'auto' }}>
          {itinerary.days.map((day, index) => (
            <Box key={index} sx={{ minWidth: '200px', padding: 2 }}>
              <Typography
                variant="h6"
                sx={{
                  textAlign: 'center',
                  fontFamily: 'Metropolis, sans-serif',
                  color: '#0e395a',
                }}
              >
                {day.date}
              </Typography>
              {day.activities.map((activity, idx) => (
                <Card key={idx} sx={{ marginBottom: 2 }}>
                  <CardContent>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontFamily: 'Metropolis, sans-serif',
                        color: '#0e395a',
                      }}
                    >
                      {activity.type}: {activity.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: 'Metropolis, sans-serif',
                        color: '#0e395a',
                      }}
                    >
                      {activity.time}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: 'Metropolis, sans-serif',
                        color: '#0e395a',
                      }}
                    >
                      {activity.location}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: 'Metropolis, sans-serif',
                        color: '#0e395a',
                      }}
                    >
                      {activity.cost}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          ))}
        </Box>
      )}

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
