import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Typography, Grid, Slider, Box, Container, Paper, Button } from '@mui/material';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { useLocation, useNavigate } from 'react-router-dom';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

const mapStyles = {
  height: '300px',
  width: '100%',
};

const initialCenter = {
  lat: 48.8584, // Default to Eiffel Tower initially
  lng: 2.2945,
};

const transportationMethods = [
  { name: 'walking', maxDistance: 20, color: '#4dacd1' },
  { name: 'biking', maxDistance: 30, color: '#4dacd1' },
  { name: 'driving', maxDistance: 100, color: '#4dacd1' },
  { name: 'bus', maxDistance: 100, color: '#4dacd1' },
  { name: 'train', maxDistance: 100, color: '#4dacd1' },
];

const CreateTrip2 = () => {
  const [center, setCenter] = useState(initialCenter);
  const [markerPosition, setMarkerPosition] = useState(null); // Start with null
  const [distances, setDistances] = useState({
    walking: 0,
    biking: 0,
    driving: 0,
    bus: 0,
    train: 0,
  });
  const [loading, setLoading] = useState(false);
  const [tripData, setTripData] = useState(null);

  const location = useLocation();
  const { tripId, address: initialAddress } = location.state || {};
  const navigate = useNavigate();

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: 'AIzaSyAaKr-fzmU_al-JZInXlxH2c3XJZghcvds', // Replace with your API key
    libraries: ['places'], // Include any necessary libraries
  });

  const mapInstance = useRef(null);
  const circlesRef = useRef([]);
  const markersRef = useRef([]);

  const createCircles = useCallback(() => {
    if (isLoaded && mapInstance.current && window.google) {
      circlesRef.current.forEach((circle) => circle.setMap(null));
      markersRef.current.forEach((marker) => marker.setMap(null));
      circlesRef.current = [];
      markersRef.current = [];

      transportationMethods.forEach((method) => {
        const { name, color } = method;
        const selected = distances[name] > 0;
        const radius = distances[name];

        if (selected) {
          const circle = new window.google.maps.Circle({
            map: mapInstance.current,
            center: mapInstance.current.getCenter(),
            radius: Number(radius) * 1609.34, // convert radius from miles to meters
            strokeColor: color,
            strokeOpacity: 0.5,
            strokeWeight: 2,
            fillColor: color,
            fillOpacity: 0.1,
          });

          circlesRef.current.push(circle);

          const earthRadiusMeters = 6371000;
          const center = circle.getCenter();
          const labelLat =
            center.lat() +
            ((radius * 1609.34) / earthRadiusMeters) * (180 / Math.PI);

          const marker = new window.google.maps.Marker({
            position: { lat: labelLat, lng: center.lng() },
            map: mapInstance.current,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 0,
              labelOrigin: new window.google.maps.Point(0, 0),
            },
            label: {
              text: name,
              color: '#0e395a',
              fontSize: '14px',
              fontWeight: 'bold',
              fontFamily: 'Metropolis, sans-serif',
            },
          });

          markersRef.current.push(marker);
        }
      });
    }
  }, [distances, isLoaded]);

  const onMapLoad = useCallback(
    (map) => {
      mapInstance.current = map;
      createCircles();
    },
    [createCircles]
  );

  const handleGeocodeAddress = useCallback(
    (address) => {
      if (!isLoaded) return;

      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK') {
          const location = results[0].geometry.location;
          const newCenter = { lat: location.lat(), lng: location.lng() };
          setCenter(newCenter);
          setMarkerPosition(newCenter);

          if (mapInstance.current) {
            mapInstance.current.setCenter(newCenter);
            createCircles();
          }
        } else {
          alert('Geocode was not successful for the following reason: ' + status);
        }
      });
    },
    [isLoaded, createCircles]
  );

  useEffect(() => {
    const fetchTripData = async () => {
      if (tripId) {
        const tripDoc = await getDoc(doc(db, 'trips', tripId));
        if (tripDoc.exists()) {
          const trip = tripDoc.data();
          setTripData(trip);

          const destinationAddress = trip.address || initialAddress;
          if (destinationAddress) {
            handleGeocodeAddress(destinationAddress);
          }
        }
      }
    };

    if (initialAddress) {
      handleGeocodeAddress(initialAddress);
    }

    fetchTripData();
  }, [tripId, initialAddress, handleGeocodeAddress]);

  const handleSliderChange = (method, value) => {
    setDistances((prev) => ({ ...prev, [method]: value }));
  };

  const savePreferences = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (user && tripId) {
        const preferredTransportation = {};
        Object.keys(distances).forEach((method) => {
          preferredTransportation[method] = distances[method] > 0;
        });

        const preferences = {
          preferredTransportation: preferredTransportation,
          distances: distances,
          formComplete: true,
        };

        const preferencesDocRef = doc(
          db,
          'trips',
          tripId,
          'userTravelPreferences',
          user.email
        );

        await setDoc(preferencesDocRef, preferences, { merge: true });

        setLoading(false);
        //alert('Preferences saved successfully!');

        navigate('/dashboard');
      } else {
        console.error('User is not authenticated or tripId is missing.');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      //alert('There was an error saving your preferences. Please try again.');
      setLoading(false);
    }
  };

  useEffect(() => {
    createCircles();
  }, [createCircles]);

  if (!isLoaded) {
    return <div>Loading Maps...</div>;
  }

  return (
    <Container
      maxWidth="lg" // Changed maxWidth to lg to expand the container
      sx={{ paddingLeft: '20px', paddingRight: '20px' }} // Reduced padding for a wider layout
    >
      <Typography
        variant="h4"
        align="center"
        sx={{
          marginTop: 2, // Reduced space from top
          marginBottom: 2, // Adjust this to change spacing below the title
          fontFamily: 'Metropolis, sans-serif',
          color: '#0e395a',
          fontWeight: 'bold', // Make it bold
        }}
      >
        How Do You Like to Get Around?
      </Typography>

      <Typography
        variant="h6"
        align="center"
        sx={{
          marginY: 2,
          fontFamily: 'Metropolis, sans-serif',
          color: '#0e395a',
        }}
      >
        Destination: {initialAddress || tripData?.address || 'Loading...'}
      </Typography>

      <Grid container spacing={3}> {/* Increased spacing to provide some extra room between elements */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ padding: 2 }}>
            <Typography
              variant="h6"
              sx={{ fontFamily: 'Metropolis, sans-serif', color: '#0e395a' }}
            >
              Transportation Methods
            </Typography>
            <Typography
              variant="body2"
              sx={{
                marginBottom: 2,
                fontFamily: 'Metropolis, sans-serif',
                color: '#0e395a',
              }}
            >
              Adjust the sliders to indicate how far you're willing to travel with
              each method.
            </Typography>

            {transportationMethods.map((method) => (
              <Box
                key={method.name}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: 2,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    marginRight: 2,
                    minWidth: 80,
                    fontFamily: 'Metropolis, sans-serif',
                    color: '#0e395a',
                  }}
                >
                  {method.name}
                </Typography>
                <Slider
                  value={distances[method.name]}
                  min={0}
                  max={method.maxDistance}
                  step={0.1}
                  valueLabelDisplay="auto"
                  onChange={(e, value) => handleSliderChange(method.name, value)}
                  sx={{ color: method.color, flex: 1 }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    marginLeft: 2,
                    fontFamily: 'Metropolis, sans-serif',
                    color: '#0e395a',
                  }}
                >
                  {distances[method.name]} miles
                </Typography>
              </Box>
            ))}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ padding: 2, height: 300 }}>
            <GoogleMap
              mapContainerStyle={mapStyles}
              zoom={10}
              center={center}
              onLoad={onMapLoad}
            >
              {markerPosition && (
                <Marker position={markerPosition} title="Destination Address" />
              )}
            </GoogleMap>
          </Paper>
        </Grid>
      </Grid>

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
        <Button
          variant="contained"
          onClick={savePreferences}
          disabled={loading}
          sx={{
            backgroundColor: '#4dacd1',
            '&:hover': { backgroundColor: '#4293a9' },
            fontFamily: 'Metropolis, sans-serif',
          }}
        >
          {loading ? 'Saving...' : 'Finish'}
        </Button>
      </Box>
    </Container>
  );
};

export default CreateTrip2;
