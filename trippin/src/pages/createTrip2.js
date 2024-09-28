import React, { useState, useEffect } from 'react';
import { Typography, Grid, Checkbox, Slider, Box, Container, Paper, Button } from '@mui/material';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { useLocation, useNavigate } from 'react-router-dom';
import { doc, setDoc, getDoc } from 'firebase/firestore'; // Firestore methods to fetch and update data
import { auth, db } from './firebase'; // Import Firestore config and auth

const mapStyles = {
  height: '300px',
  width: '100%',
};

const initialCenter = {
  lat: 48.8584, // Default to Eiffel Tower initially
  lng: 2.2945,
};

const transportationMethods = [
  { name: 'walking', maxDistance: 20 },
  { name: 'biking', maxDistance: 30 },
  { name: 'driving', maxDistance: 100 },
  { name: 'bus', maxDistance: 100 },
  { name: 'train', maxDistance: 100 },
];

const CreateTrip2 = () => {
  const [center, setCenter] = useState(initialCenter); // State for map center, defaults to Eiffel Tower
  const [markerPosition, setMarkerPosition] = useState(initialCenter); // State for marker position
  const [checked, setChecked] = useState({
    walking: false,
    biking: false,
    driving: false,
    bus: false,
    train: false,
  });
  const [distances, setDistances] = useState({
    walking: 0,
    biking: 0,
    driving: 0,
    bus: 0,
    train: 0,
  });
  const [loading, setLoading] = useState(false); // Loading state for button
  const [tripData, setTripData] = useState(null); // State to store trip data from Firestore

  const location = useLocation();
  const { tripId, address: initialAddress } = location.state || {}; // Extract tripId and address from location state
  const navigate = useNavigate();

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: 'AIzaSyAaKr-fzmU_al-JZInXlxH2c3XJZghcvds',
  });

  // Geocode the address to get the lat/lng
  const handleGeocodeAddress = (address) => {
    if (!isLoaded) return;

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK') {
        const location = results[0].geometry.location;
        setCenter({ lat: location.lat(), lng: location.lng() });
        setMarkerPosition({ lat: location.lat(), lng: location.lng() });
      } else {
        alert('Geocode was not successful for the following reason: ' + status);
      }
    });
  };

  // Fetch trip details (like address) from Firestore using tripId
  useEffect(() => {
    const fetchTripData = async () => {
      if (tripId) {
        const tripDoc = await getDoc(doc(db, 'trips', tripId));
        if (tripDoc.exists()) {
          const trip = tripDoc.data();
          setTripData(trip);

          // Use the trip's address from Firestore or the initial address from state
          const destinationAddress = trip.address || initialAddress;
          if (destinationAddress) {
            handleGeocodeAddress(destinationAddress); // Geocode and update map
          }
        }
      }
    };

    // If the initial address is available from state, use it before fetching trip data
    if (initialAddress) {
      handleGeocodeAddress(initialAddress);
    }

    fetchTripData();
  }, [tripId, initialAddress, isLoaded]);

  // Handle transportation method selection (checkboxes)
  const handleCheckboxChange = (method) => {
    setChecked((prev) => ({ ...prev, [method]: !prev[method] }));
  };

  // Handle distance sliders
  const handleSliderChange = (method, value) => {
    setDistances((prev) => ({ ...prev, [method]: value }));
  };

  const savePreferences = async () => {
    try {
      setLoading(true); // Start loading
      console.log('Saving preferences...'); // Debugging log
      const user = auth.currentUser; // Get the current logged-in user
      if (user && tripId) {
        console.log('User is authenticated:', user.email); // Debugging log
        const preferences = {
          preferredTransportation: checked,
          distances: distances,
          formComplete: true, // Mark the form as complete
        };
  
        // Reference to the user's preferences document in the subcollection
        const preferencesDocRef = doc(db, 'trips', tripId, 'userPreferences', user.email);
  
        // Save the user's preferences in the "userPreferences" subcollection
        await setDoc(preferencesDocRef, preferences, { merge: true });
  
        console.log('Preferences saved successfully!'); // Debugging log
        setLoading(false); // End loading
        alert('Preferences saved successfully!');
  
        // Navigate to the dashboard after saving the preferences
        navigate('/dashboard');
      } else {
        console.error('User is not authenticated or tripId is missing.');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('There was an error saving your preferences. Please try again.');
      setLoading(false); // End loading in case of error
    }
  };

  if (!isLoaded) {
    return <div>Loading Maps...</div>;
  }

  return (
    <Container maxWidth="md">
      <Typography variant="h4" align="center" sx={{ marginY: 4 }}>
        How Do You Like to Get Around?
      </Typography>

      <Typography variant="h6" align="center" sx={{ marginY: 2 }}>
        Destination: {initialAddress || tripData?.address || 'Loading...'}
      </Typography>

      <Grid container spacing={2}>
        {/* Left Side: Transportation Methods */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ padding: 2 }}>
            <Typography variant="h6">Transportation Methods</Typography>
            <Typography variant="body2" sx={{ marginBottom: 2 }}>
              Select the transportation methods you use and how far you're willing to travel with each method.
            </Typography>

            {transportationMethods.map((method) => (
              <Box
                key={method.name}
                sx={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}
              >
                <Checkbox
                  checked={checked[method.name]}
                  onChange={() => handleCheckboxChange(method.name)}
                />
                <Typography variant="body2" sx={{ marginRight: 2, minWidth: 80 }}>
                  {method.name}
                </Typography>
                <Slider
                  value={distances[method.name]}
                  min={0}
                  max={method.maxDistance}
                  step={0.1}
                  valueLabelDisplay="auto"
                  onChange={(e, value) => handleSliderChange(method.name, value)}
                  sx={{ color: 'green', flex: 1 }}
                  disabled={!checked[method.name]}
                />
                <Typography variant="body2" sx={{ marginLeft: 2 }}>
                  {distances[method.name]} miles
                </Typography>
              </Box>
            ))}
          </Paper>
        </Grid>

        {/* Right Side: Map */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ padding: 2, height: 300 }}>
            <GoogleMap
              mapContainerStyle={mapStyles}
              zoom={14}
              center={center}
            >
              {markerPosition && <Marker position={markerPosition} />} {/* Display marker */}
            </GoogleMap>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', marginY: 4 }}>
        <Button variant="contained" color="primary" onClick={() => navigate('/createTrip1')}>
          Back
        </Button>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={savePreferences} 
          disabled={loading} // Disable button when loading
        >
          {loading ? 'Saving...' : 'Next'} {/* Show "Saving..." when saving */}
        </Button>
      </Box>
    </Container>
  );
};

export default CreateTrip2;
