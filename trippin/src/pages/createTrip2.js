import React, { useState } from 'react';
import {
  Typography,
  Grid,
  Checkbox,
  Slider,
  Box,
  Container,
  Paper,
  TextField,
  Button, // <-- Add this line to import the Button component
} from '@mui/material';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';


const mapStyles = {
  height: '300px',
  width: '100%',
};

const initialCenter = {
  lat: 48.8584, // Default to Eiffel Tower
  lng: 2.2945,
};
const transportationMethods = [
    { name: 'walking', maxDistance: 20 },
    { name: 'biking', maxDistance: 30 },
    { name: 'driving', maxDistance: 100 },
    { name: 'bus', maxDistance: 100 },
    { name: 'train', maxDistance: 100 },
  ];

const DashboardPage = () => {
  const [address, setAddress] = useState('Av. Gustave Eiffel, 75007 Paris, France');
  const [center, setCenter] = useState(initialCenter); // State for map center
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

  // Load the Google Maps API
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: 'AIzaSyAaKr-fzmU_al-JZInXlxH2c3XJZghcvds',
  });

  // Function to handle changes in the address input field
  const handleAddressChange = (e) => {
    setAddress(e.target.value); // Update the address state as the user types
  };

  // Function to handle geocoding of the entered address
  const handleAddressSubmit = () => {
    if (!isLoaded) {
      alert('Google Maps API is not loaded yet!');
      return;
    }

    const geocoder = new window.google.maps.Geocoder(); // Create a new Geocoder instance
    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK') {
        const location = results[0].geometry.location;
        setCenter({ lat: location.lat(), lng: location.lng() }); // Update the map center with geocoded lat/lng
        setMarkerPosition({ lat: location.lat(), lng: location.lng() }); // Update the marker position with geocoded lat/lng
      } else {
        alert('Geocode was not successful for the following reason: ' + status);
      }
    });
  };

  const handleCheckboxChange = (method) => {
    setChecked((prev) => ({ ...prev, [method]: !prev[method] }));
  };

  const handleSliderChange = (method, value) => {
    setDistances((prev) => ({ ...prev, [method]: value }));
  };

  if (!isLoaded) {
    return <div>Loading Maps...</div>;
  }

  return (
    <Container maxWidth="md">
      <Typography variant="h4" align="center" sx={{ marginY: 4 }}>
        How Do You Like to Get Around?
      </Typography>

      <Paper sx={{ padding: 2, marginBottom: 2 }}>
        {/* TextField to input the address */}
        <TextField
          fullWidth
          label="Enter Address"
          variant="outlined"
          value={address} // Address value from the state
          onChange={handleAddressChange} // Update address state on input change
          onKeyPress={(e) => {
            if (e.key === 'Enter') handleAddressSubmit(); // Automatically submit address when "Enter" is pressed
          }}
          sx={{ marginBottom: 2 }}
        />
      </Paper>

      <Grid container spacing={2}>
        {/* Left Side: Transportation Methods */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ padding: 2 }}>
            <Typography variant="h6">Transportation Methods</Typography>
            <Typography variant="body2" sx={{ marginBottom: 2 }}>
              Select the transportation methods you use and how far you're willing to travel with each method.
            </Typography>

            {/* Loop through transportation methods and display checkboxes and sliders */}
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
                max={method.maxDistance} // Set the max distance here
                step={0.1}
                valueLabelDisplay="auto"
                onChange={(e, value) => setDistances((prev) => ({ ...prev, [method.name]: value }))}
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
              center={center} // Center the map based on the 'center' state
            >
              {/* Marker is positioned based on the 'markerPosition' state */}
              {markerPosition && <Marker position={markerPosition} />}
            </GoogleMap>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', marginY: 4 }}>
        <Button variant="contained" color="primary">
          Back
        </Button>
        <Button variant="contained" color="primary">
          Next
        </Button>
      </Box>
    </Container>
  );
};

export default DashboardPage;
