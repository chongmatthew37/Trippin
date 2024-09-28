import React, { useState, useEffect } from 'react';
import { Typography, Card, CardContent, Container, Box, Avatar, List, ListItem, ListItemText, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Slider from 'react-slick';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db, auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [userEmail, setUserEmail] = useState('');
  const [inviteeStatus, setInviteeStatus] = useState({}); // Store form status for invitees
  const [selfStatus, setSelfStatus] = useState({}); // Store the invitee's own form status

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const email = user.email.toLowerCase(); // Ensure the email is lowercase
        setUserEmail(email);

        const invitedTripsQuery = query(collection(db, 'trips'), where('inviteEmails', 'array-contains', email));
        const createdTripsQuery = query(collection(db, 'trips'), where('createdBy', '==', email));

        const invitedTripsSnapshot = await getDocs(invitedTripsQuery);
        const invitedTripsData = invitedTripsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const createdTripsSnapshot = await getDocs(createdTripsQuery);
        const createdTripsData = createdTripsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

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

  // Fetch invitee preferences for the inviter to see their form completion status
  const fetchInviteePreferences = async (tripId) => {
    const inviteeFormStatus = {};
    try {
      const tripDoc = await getDoc(doc(db, 'trips', tripId));
      if (tripDoc.exists() && tripDoc.data().inviteEmails) {
        const inviteEmails = tripDoc.data().inviteEmails.map(email => email.toLowerCase()); // Normalize email to lowercase
        for (const email of inviteEmails) {
          const preferencesDoc = await getDoc(doc(db, 'trips', tripId, 'userPreferences', email));
          inviteeFormStatus[email] = preferencesDoc.exists() && preferencesDoc.data()?.formComplete ? 'Complete' : 'Incomplete';
        }
      }
    } catch (error) {
      console.error('Error fetching invitee preferences:', error);
    }
    return inviteeFormStatus;
  };

  // Fetch the invitee's own form completion status
  const fetchSelfStatus = async (tripId, email) => {
    try {
      const preferencesDoc = await getDoc(doc(db, 'trips', tripId, 'userPreferences', email));
      return preferencesDoc.exists() && preferencesDoc.data()?.formComplete ? 'Complete' : 'Incomplete';
    } catch (error) {
      console.error('Error fetching own preferences:', error);
      return 'Incomplete';
    }
  };

  useEffect(() => {
    const fetchAllInviteeStatuses = async () => {
      const statusMap = {};
      const selfStatusMap = {};

      for (const trip of trips) {
        const statuses = await fetchInviteePreferences(trip.id);
        statusMap[trip.id] = statuses;

        // Fetch the logged-in user's own status if they're an invitee
        const selfStatusForTrip = await fetchSelfStatus(trip.id, userEmail);
        selfStatusMap[trip.id] = selfStatusForTrip;
      }

      setInviteeStatus(statusMap); // Set the invitee form status for all trips
      setSelfStatus(selfStatusMap); // Set the user's own form status for each trip
    };

    if (trips.length > 0) {
      fetchAllInviteeStatuses();
    }
  }, [trips, userEmail]);

  const handleCardClick = (tripId, isInviter) => {
    if (!isInviter && selfStatus[tripId] !== 'Complete') {
      // If the user is an invitee and their form status is not 'Complete', navigate to the form
      navigate('/createTrip2', { state: { tripId } });
    }
  };

  const isInviter = (trip) => trip.createdBy === userEmail;

  // Function to check if all invitees have completed the form
  const allInviteesCompleted = (tripId) => {
    const statuses = inviteeStatus[tripId] || {};
    return Object.values(statuses).every(status => status === 'Complete');
  };

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
            onClick={() => handleCardClick(trip.id, isInviter(trip))}
            sx={{
              margin: '20px 50px',
              backgroundColor: '#fff',
              borderRadius: '8px',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
              cursor: !isInviter(trip) && selfStatus[trip.id] !== 'Complete' ? 'pointer' : 'default', // Only allow clicking if status is not 'Complete'
            }}
          >
            <CardContent>
              <Typography variant="h6" sx={{ marginTop: 2 }}>
                {trip.tripName}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {trip.tripArea || 'No description provided'}
              </Typography>

              {/* Show invitee's own status */}
              {!isInviter(trip) && (
                <Typography variant="body2" sx={{ marginTop: 1, color: 'green' }}>
                  Your Status: {selfStatus[trip.id] || 'Incomplete'}
                </Typography>
              )}

              {/* Display Invitee Status for the inviter */}
              {isInviter(trip) && (
                <>
                  <Typography variant="subtitle1" sx={{ marginTop: 2 }}>
                    Invited Members:
                  </Typography>
                  <List dense>
                    {trip.inviteEmails && trip.inviteEmails.length > 0 ? (
                      trip.inviteEmails.map((email, index) => (
                        <ListItem key={index}>
                          <ListItemText primary={`${email} - ${inviteeStatus[trip.id]?.[email] || 'Incomplete'}`} />
                        </ListItem>
                      ))
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        No invitees for this trip.
                      </Typography>
                    )}
                  </List>

                  {/* Blend button (grayed out if not all invitees have completed the form) */}
                  <Button
                    variant="contained"
                    sx={{ marginTop: 2 }}
                    disabled={!allInviteesCompleted(trip.id)} // Disable the button if not all invitees have completed the form
                  >
                    Blend
                  </Button>
                </>
              )}

              {/* Avatar and User Info */}
              <Box sx={{ display: 'flex', alignItems: 'center', marginTop: 2 }}>
                <Avatar alt={trip.createdBy} src="/static/images/avatar/1.jpg" sx={{ marginRight: 1 }} />
                <Box>
                  <Typography variant="body2">{trip.createdBy}</Typography>
                  <Typography variant="caption" color="textSecondary">
                    Created on {new Date(trip.createdAt?.seconds * 1000).toLocaleDateString() || 'Invalid Date'}
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
          onClick={() => navigate('/createTrip1')}
        >
          Create New Trip
        </Button>
      </Box>
    </Container>
  );
}
