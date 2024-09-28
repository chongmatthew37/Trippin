import React, { useState, useEffect } from 'react';
import { Typography, Grid, Card, CardContent, Button, Container } from '@mui/material';
import { Box } from '@mui/system';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore'; // Firestore imports
import { db, auth } from './firebase'; // Firebase Auth and Firestore
import { onAuthStateChanged } from 'firebase/auth'; // Firebase Auth state listener

export default function Dashboard() {
  const navigate = useNavigate(); // Initialize useNavigate
  const [trips, setTrips] = useState([]); // State to store fetched trips
  const [userEmail, setUserEmail] = useState(''); // State to store the authenticated user's email

  // Function to handle navigation to the "Create Trip" page
  const handleCreateTrip = () => {
    navigate('/createTrip1'); // Navigate to the create-trip route
  };

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

        // Combine both queries' results and remove any duplicates (if any trip is both created and invited)
        const allTrips = [...invitedTripsData, ...createdTripsData];
        const uniqueTrips = allTrips.reduce((acc, trip) => {
          if (!acc.some((t) => t.id === trip.id)) {
            acc.push(trip);
          }
          return acc;
        }, []);

        // Set the combined unique trips to state
        setTrips(uniqueTrips);
      }
    });

    // Clean up the listener when the component unmounts
    return () => unsubscribe();
  }, []);

  return (
    <Container maxWidth="md">
      <Box sx={{ textAlign: 'center', marginTop: 4, marginBottom: 4 }}>
        <Typography variant="h4" sx={{ color: '#84e3f3' }}>
          Your Saved Trips
        </Typography>
      </Box>

      {/* Grid layout for trip cards */}
      <Grid container spacing={3} justifyContent="center">
        {/* Loop through fetched trips and display them */}
        {trips.map((trip) => (
          <Grid item xs={12} sm={6} md={4} key={trip.id}>
            <Card sx={{ backgroundColor: '#c5f5fc' }}>
              <CardContent>
                <Typography variant="h6">{trip.tripName}</Typography>
                <Typography variant="body2">{trip.tripArea || 'No description provided'}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Create New Trip Button */}
      <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
        <Button
          variant="contained"
          sx={{
            backgroundColor: '#84e3f3',
            color: '#ffffff',
            padding: '10px 20px',
            '&:hover': {
              backgroundColor: '#6ccedf',
            },
          }}
          onClick={handleCreateTrip}
        >
          Create New Trip
        </Button>
      </Box>
    </Container>
  );
}
