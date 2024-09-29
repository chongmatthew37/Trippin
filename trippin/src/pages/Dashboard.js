import React, { useState, useEffect, useMemo } from 'react';
import {
  Typography,
  Card,
  CardContent,
  Container,
  Box,
  Avatar,
  List,
  ListItem,
  ListItemText,
  Button,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Slider from 'react-slick';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { Favorite, FavoriteBorder } from '@mui/icons-material';

export default function Dashboard() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [userEmail, setUserEmail] = useState('');
  const [inviteeStatus, setInviteeStatus] = useState({});
  const [selfStatus, setSelfStatus] = useState({});
  const [favoriteTrips, setFavoriteTrips] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const email = user.email.toLowerCase();
        setUserEmail(email);

        // Fetch favorite trips from localStorage
        const storedFavorites = localStorage.getItem(`favoriteTrips_${email}`);
        if (storedFavorites) {
          setFavoriteTrips(JSON.parse(storedFavorites));
        } else {
          setFavoriteTrips([]);
        }

        const invitedTripsQuery = query(
          collection(db, 'trips'),
          where('inviteEmails', 'array-contains', email)
        );
        const createdTripsQuery = query(
          collection(db, 'trips'),
          where('createdBy', '==', email)
        );

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

        setTrips(uniqueTrips);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchInviteePreferences = async (tripId) => {
    const inviteeFormStatus = {};
    try {
      const tripDoc = await getDoc(doc(db, 'trips', tripId));
      if (tripDoc.exists() && tripDoc.data().inviteEmails) {
        const inviteEmails = tripDoc
          .data()
          .inviteEmails.map((email) => email.toLowerCase());
        for (const email of inviteEmails) {
          const preferencesDoc = await getDoc(
            doc(db, 'trips', tripId, 'userPreferences', email)
          );
          inviteeFormStatus[email] =
            preferencesDoc.exists() && preferencesDoc.data()?.formComplete
              ? 'Complete'
              : 'Incomplete';
        }
      }
    } catch (error) {
      console.error('Error fetching invitee preferences:', error);
    }
    return inviteeFormStatus;
  };

  const fetchSelfStatus = async (tripId, email) => {
    try {
      const preferencesDoc = await getDoc(
        doc(db, 'trips', tripId, 'userPreferences', email)
      );
      return preferencesDoc.exists() && preferencesDoc.data()?.formComplete
        ? 'Complete'
        : 'Incomplete';
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

        const selfStatusForTrip = await fetchSelfStatus(trip.id, userEmail);
        selfStatusMap[trip.id] = selfStatusForTrip;
      }

      setInviteeStatus(statusMap);
      setSelfStatus(selfStatusMap);
    };

    if (trips.length > 0) {
      fetchAllInviteeStatuses();
    }
  }, [trips, userEmail]);

  const handleCardClick = (tripId, isInviter) => {
    if (!isInviter && selfStatus[tripId] !== 'Complete') {
      navigate('/createTrip2', { state: { tripId } });
    }
  };

  const isInviter = (trip) => trip.createdBy === userEmail;

  const allInviteesCompleted = (tripId) => {
    const statuses = inviteeStatus[tripId] || {};
    return Object.values(statuses).every((status) => status === 'Complete');
  };

  const handleFavoriteClick = (e, tripId) => {
    e.stopPropagation();

    let updatedFavorites;
    if (favoriteTrips.includes(tripId)) {
      // Remove from favorites
      updatedFavorites = favoriteTrips.filter((id) => id !== tripId);
    } else {
      // Add to favorites
      updatedFavorites = [tripId, ...favoriteTrips];
    }

    setFavoriteTrips(updatedFavorites);

    // Update localStorage
    localStorage.setItem(
      `favoriteTrips_${userEmail}`,
      JSON.stringify(updatedFavorites)
    );
  };

  const sortedTrips = useMemo(() => {
    const sorted = [...trips];
    sorted.sort((a, b) => {
      const aFavorited = favoriteTrips.includes(a.id) ? 1 : 0;
      const bFavorited = favoriteTrips.includes(b.id) ? 1 : 0;
      return bFavorited - aFavorited;
    });
    return sorted;
  }, [trips, favoriteTrips]);

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
    <Container
      maxWidth="auto"
      sx={{ fontFamily: 'Metropolis, sans-serif', color: '#0e395a' }}
    >
      <Box sx={{ textAlign: 'center', marginTop: 2, marginBottom: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 'bold',
            color: '#0e395a',
            fontFamily: 'Metropolis, sans-serif',
          }}
        >
          Your Saved Trips
        </Typography>
      </Box>

      {/* Carousel layout for trip cards */}
      <Slider {...settings}>
        {sortedTrips.map((trip) => (
          <Card
            key={trip.id}
            onClick={() => handleCardClick(trip.id, isInviter(trip))}
            sx={{
              margin: '20px 50px',
              backgroundColor: '#fff',
              borderRadius: '8px',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
              cursor:
                !isInviter(trip) && selfStatus[trip.id] !== 'Complete'
                  ? 'pointer'
                  : 'default',
              fontFamily: 'Metropolis, sans-serif',
              color: '#0e395a',
            }}
          >
            <CardContent sx={{ position: 'relative' }}>
              {/* Favorite Icon */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  cursor: 'pointer',
                }}
                onClick={(e) => handleFavoriteClick(e, trip.id)}
              >
                {favoriteTrips.includes(trip.id) ? (
                  <Favorite sx={{ color: '#0e395a' }} />
                ) : (
                  <FavoriteBorder />
                )}
              </Box>

              <Typography
                variant="h6"
                sx={{
                  marginTop: 2,
                  fontFamily: 'Metropolis, sans-serif',
                  color: '#0e395a',
                }}
              >
                {trip.tripName}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: '#0e395a', fontFamily: 'Metropolis, sans-serif' }}
              >
                {trip.tripArea || 'No description provided'}
              </Typography>

              {!isInviter(trip) && (
                <Typography
                  variant="body2"
                  sx={{
                    marginTop: 1,
                    color: 'green',
                    fontFamily: 'Metropolis, sans-serif',
                  }}
                >
                  Your Status: {selfStatus[trip.id] || 'Incomplete'}
                </Typography>
              )}

              {isInviter(trip) && (
                <>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      marginTop: 2,
                      fontFamily: 'Metropolis, sans-serif',
                      color: '#0e395a',
                    }}
                  >
                    Invited Members:
                  </Typography>
                  <List dense>
                    {trip.inviteEmails && trip.inviteEmails.length > 0 ? (
                      trip.inviteEmails.map((email, index) => (
                        <ListItem key={index}>
                          <ListItemText
                            primary={`${email} - ${
                              inviteeStatus[trip.id]?.[email] || 'Incomplete'
                            }`}
                            sx={{
                              fontFamily: 'Metropolis, sans-serif',
                              color: '#0e395a',
                            }}
                          />
                        </ListItem>
                      ))
                    ) : (
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#0e395a',
                          fontFamily: 'Metropolis, sans-serif',
                        }}
                      >
                        No invitees for this trip.
                      </Typography>
                    )}
                  </List>

                  <Button
                    variant="contained"
                    sx={{
                      marginTop: 2,
                      backgroundColor: '#8bdfe9',
                      fontFamily: 'Metropolis, sans-serif',
                      padding: '10px 20px',
                      '&:hover': { backgroundColor: '#78c8d2' },
                    }}
                    disabled={!allInviteesCompleted(trip.id)}
                    onClick={() => navigate('/itinerary')}
                  >
                    Let's Trip!
                  </Button>
                </>
              )}

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  marginTop: 2,
                  fontFamily: 'Metropolis, sans-serif',
                  color: '#0e395a',
                }}
              >
                <Avatar
                  alt={trip.createdBy}
                  src="/static/images/avatar/1.jpg"
                  sx={{ marginRight: 1 }}
                />
                <Box>
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: 'Metropolis, sans-serif',
                      color: '#0e395a',
                    }}
                  >
                    {trip.createdBy}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#0e395a',
                      fontFamily: 'Metropolis, sans-serif',
                    }}
                  >
                    Created on{' '}
                    {trip.createdAt?.seconds
                      ? new Date(trip.createdAt.seconds * 1000).toLocaleDateString()
                      : 'Invalid Date'}
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
            backgroundColor: '#8bdfe9',
            padding: '10px 20px',
            fontFamily: 'Metropolis, sans-serif',
            '&:hover': { backgroundColor: '#78c8d2' },
          }}
          onClick={() => navigate('/createTrip1')}
        >
          Create New Trip
        </Button>
      </Box>
    </Container>
  );
}
