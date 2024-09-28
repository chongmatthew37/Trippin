import React from 'react';
import { Typography, Grid, Card, CardContent, Button, Container } from '@mui/material';
import { Box } from '@mui/system';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate(); // Initialize useNavigate

  // Function to handle the navigation
  const handleCreateTrip = () => {
    navigate('/createTrip1'); // Navigate to the create-trip route
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ textAlign: 'center', marginTop: 4, marginBottom: 4 }}>
        <Typography variant="h4" sx={{ color: '#84e3f3' }}>
          Your Saved Trips
        </Typography>
      </Box>

      {/* Grid layout for trip cards */}
      <Grid container spacing={3} justifyContent="center">
        {/* Example card: Repeat this as needed */}
        {[1, 2, 3, 4].map((trip) => (
          <Grid item xs={12} sm={6} md={4} key={trip}>
            <Card sx={{ backgroundColor: '#c5f5fc' }}>
              <CardContent>
                <Typography variant="h6">
                  Trip {trip}
                </Typography>
                <Typography variant="body2">
                  Description of the trip goes here...
                </Typography>
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
          onClick={handleCreateTrip} // Call the function to navigate
        >
          Create New Trip
        </Button>
      </Box>
    </Container>
  );
}
