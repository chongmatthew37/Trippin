import React, { useState, useEffect } from 'react';
import { Typography, Card, CardContent, Container, Box, Avatar, List, ListItem, ListItemText, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Slider from 'react-slick'; // Import react-slick
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

import 'slick-carousel/slick/slick.css'; // Slick Carousel CSS
import 'slick-carousel/slick/slick-theme.css';

export default function Dashboard() {
  const navigate = useNavigate(); // Initialize useNavigate
  const [trips, setTrips] = useState([]); // State to store fetched trips
  const [userEmail, setUserEmail] = useState(''); // State to store the authenticated user's email

  // Fetch trips where the user is invited or the creator
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const email = user.email;
        setUserEmail(email);

        // Query Firestore for trips where the user is invited
        const invitedTripsQuery = query(collection(db, 'trips'), where('inviteEmails', 'array-contains', email));
        const createdTripsQuery = query(collection(db, 'trips'), where('createdBy', '==', email));

        // Fetch invited trips
        const invitedTripsSnapshot = await getDocs(invitedTripsQuery);
        const invitedTripsData = invitedTripsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Fetch created trips
        const createdTripsSnapshot = await getDocs(createdTripsQuery);
        const createdTripsData = createdTripsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Combine both queries' results and remove any duplicates
        const allTrips = [...invitedTripsData, ...createdTripsData];
        const uniqueTrips = allTrips.reduce((acc, trip) => {
          if (!acc.some((t) => t.id === trip.id)) {
            acc.push(trip);
          }
          return acc;
        }, []);

        setTrips(uniqueTrips); // Set the combined unique trips to state
      }
    });

    return () => unsubscribe();
  }, []);

  // Slick carousel settings
  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 3,
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

  // Function to handle the navigation to the create trip page
  const handleCreateTrip = () => {
    navigate('/createTrip1'); // Navigate to the Create Trip page
  };

  return (
    <Container maxWidth="auto">
      <Box sx={{ textAlign: 'center', marginTop: 4, marginBottom: 4 }}>
        <Typography variant="h4" sx={{ color: '#000000' }}>
          Your Saved Trips
        </Typography>
      </Box>

      {/* Carousel layout for trip cards */}
      <Slider {...settings}>
        {trips.map((trip) => (
          <Card
            key={trip.id}
            sx={{
              margin: '20px 50px', // Adjust margins here
              backgroundColor: '#fff',
              borderRadius: '8px',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            }}
          >
            <CardContent>
              <Typography variant="h6" sx={{ marginTop: 2 }}>
                {trip.tripName}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {trip.tripArea || 'No description provided'}
              </Typography>

              {/* Display List of Invitees */}
              <Typography variant="subtitle1" sx={{ marginTop: 2 }}>
                Invited Users:
              </Typography>
              <List dense>
                {trip.inviteEmails && trip.inviteEmails.length > 0 ? (
                  trip.inviteEmails.map((email, index) => (
                    <ListItem key={index}>
                      <ListItemText primary={email} />
                    </ListItem>
                  ))
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    No invitees for this trip.
                  </Typography>
                )}
              </List>

              {/* Avatar and User Info */}
              <Box sx={{ display: 'flex', alignItems: 'center', marginTop: 2 }}>
                <Avatar alt={trip.createdBy} src="/static/images/avatar/1.jpg" sx={{ marginRight: 1 }} />
                <Box>
                  <Typography variant="body2">{trip.createdBy}</Typography>
                  <Typography variant="caption" color="textSecondary">
                    Created on {new Date().toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Slider>

      {/* Create New Trip Button */}
      <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
        <Button
          variant="contained"
          sx={{
            backgroundColor: '#000000',
            color: '#ffffff',
            padding: '10px 20px',
            '&:hover': {
              backgroundColor: '#6ccedf',
            },
          }}
          onClick={handleCreateTrip} // Call the function to navigate
        >
          Create New Trip
        </Button>
      </Box>
    </Container>
  );
}
