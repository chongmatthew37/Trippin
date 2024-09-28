import React from 'react';
import { Typography, Card, CardContent, Box, Container } from '@mui/material';
import Slider from 'react-slick'; // Carousel library

// Sample itinerary data
const itineraryData = [
  {
    date: '27th September',
    activities: [
      { type: 'Activity', name: 'Wander around Santa Gertrudis', time: '11:00 - 13:00', location: 'Santa Gertrudis de Fruiteria, Spain', cost: '£100' },
      { type: 'Food', name: 'La Granja Ibiza', time: '13:00 - 15:00', location: 'Carretera de Forada, Spain', cost: '£110' },
    ],
  },
  {
    date: '28th September',
    activities: [
      { type: 'Activity', name: 'Visit Cala Mastella', time: '11:00 - 14:00', location: 'Cala Mastella, Spain', cost: '£86' },
    ],
  },
  // More days...
];

const Itinerary = () => {
  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: itineraryData.length > 5 ? 3 : itineraryData.length, // Show 3 if more than 5 days
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
      <Typography variant="h4" sx={{ textAlign: 'center', marginTop: 4, marginBottom: 4 }}>
        Your Itinerary
      </Typography>
      {itineraryData.length > 5 ? (
        <Slider {...settings}>
          {itineraryData.map((day, index) => (
            <Box key={index} sx={{ padding: 2 }}>
              <Typography variant="h6" sx={{ textAlign: 'center' }}>
                {day.date}
              </Typography>
              {day.activities.map((activity, idx) => (
                <Card key={idx} sx={{ marginBottom: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle1">{activity.type}: {activity.name}</Typography>
                    <Typography variant="body2">{activity.time}</Typography>
                    <Typography variant="body2">{activity.location}</Typography>
                    <Typography variant="body2">{activity.cost}</Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          ))}
        </Slider>
      ) : (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', overflow: 'auto' }}>
          {itineraryData.map((day, index) => (
            <Box key={index} sx={{ minWidth: '200px', padding: 2 }}>
              <Typography variant="h6" sx={{ textAlign: 'center' }}>
                {day.date}
              </Typography>
              {day.activities.map((activity, idx) => (
                <Card key={idx} sx={{ marginBottom: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle1">{activity.type}: {activity.name}</Typography>
                    <Typography variant="body2">{activity.time}</Typography>
                    <Typography variant="body2">{activity.location}</Typography>
                    <Typography variant="body2">{activity.cost}</Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          ))}
        </Box>
      )}
    </Container>
  );
};

export default Itinerary;
