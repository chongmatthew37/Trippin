// src/components/TravelProfile.js
import React, { useState } from 'react';
import { Button, Card, CardContent, Grid, TextField } from '@mui/material';

const preferencesList = [
  "Accessibility", "Active Lifestyle", "Affordability", "Casual", "Cleanliness", 
  "Community", "Convenient", "Cultural", "Entertainment", "Family Friendly", 
  "Fine Dining", "Green Spaces", "Healthy", "Quiet", "Safety", "Shopping"
];

const TravelProfile = () => {
  const [selectedPreferences, setSelectedPreferences] = useState([]);
  const [newPreference, setNewPreference] = useState('');

  const handleSelect = (preference) => {
    setSelectedPreferences(prev => 
      prev.includes(preference) 
      ? prev.filter(p => p !== preference) 
      : [...prev, preference]
    );
  };

  const handleAddPreference = () => {
    if (newPreference && !selectedPreferences.includes(newPreference)) {
      setSelectedPreferences([...selectedPreferences, newPreference]);
      setNewPreference('');
    }
  };

  const handleSubmit = () => {
    console.log("Selected Preferences:", selectedPreferences);
    // Here you would save the preferences to a backend or local storage
    // For example, send the data to a server:
    // fetch('/api/savePreferences', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ preferences: selectedPreferences }),
    // })
  };

  return (
    <div>
      <h1>Create Your Travel Profile</h1>
      <Grid container spacing={2}>
        {preferencesList.map((preference, idx) => (
          <Grid item xs={6} sm={4} key={idx}>
            <Card onClick={() => handleSelect(preference)} style={{
              backgroundColor: selectedPreferences.includes(preference) ? '#4e97ae' : '#ffffff',
              cursor: 'pointer',
              border: selectedPreferences.includes(preference) ? '2px solid blue' : '1px solid gray'
            }}>
              <CardContent>
                <h3>{preference}</h3>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <div style={{ marginTop: '20px' }}>
        <TextField 
          value={newPreference} 
          onChange={(e) => setNewPreference(e.target.value)} 
          placeholder="Add a new preference" 
          fullWidth 
        />
        <Button onClick={handleAddPreference} style={{ marginTop: '10px' }}>Add Preference</Button>
      </div>

      <Button onClick={handleSubmit} style={{ marginTop: '20px' }} disabled={selectedPreferences.length < 3}>
        Submit Preferences
      </Button>
    </div>
  );
}

export default TravelProfile;
