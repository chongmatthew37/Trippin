// src/components/TravelProfile.js
import React, { useState } from 'react';
import { Button, Card, CardContent, Grid, TextField } from '@mui/material';
import { db } from "./firebase"
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, doc, setDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const initialPreferences = [
  "Accessibility", "Active Lifestyle", "Affordability", "Casual", "Cleanliness", 
  "Community", "Convenient", "Cultural", "Entertainment", "Family Friendly", 
  "Fine Dining", "Green Spaces", "Healthy", "Quiet", "Safety", "Shopping"
];

const TravelProfile = () => {
  const [selectedPreferences, setSelectedPreferences] = useState([]);
  const [preferencesList, setPreferencesList] = useState(initialPreferences);  // Move preferences to state
  const [newPreference, setNewPreference] = useState('');
  const navigate = useNavigate();

  const handleSelect = (preference) => {
    setSelectedPreferences(prev => 
      prev.includes(preference) 
      ? prev.filter(p => p !== preference) 
      : [...prev, preference]
    );
  };

  const handleAddPreference = () => {
    if (newPreference && !preferencesList.includes(newPreference)) {
      // Add the new preference to the list and allow it to be selectable
      setPreferencesList([...preferencesList, newPreference]);

      // Automatically select the new preference after it's added
      setSelectedPreferences([...selectedPreferences, newPreference]);

      // Clear the input field
      setNewPreference('');
    }
  };

  const handleSubmit = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      console.error("User is not authenticated");
      return;
    }

    console.log("Selected Preferences:", selectedPreferences);

    try {
      // Set the document ID to the user's UID to match Firestore rules
      const docRef = await setDoc(doc(db, "userPreferences", user.uid), {
        preferences: selectedPreferences,
        timestamp: new Date(),
        userId: user.uid  // Include user ID for tracking
      });

      console.log("Document written successfully");
      navigate('/dashboard');
    } catch (e) {
      console.error("Error adding document: ", e);
    }
};

  return (
    <div>
      <h1>Create Your Travel Profile</h1>
      <Grid container spacing={2}>
        {preferencesList.map((preference, idx) => (
          <Grid item xs={6} sm={4} key={idx}>
            <Card onClick={() => handleSelect(preference)} style={{
              backgroundColor: selectedPreferences.includes(preference) ? '#84e3f3' : '#ffffff',
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
