import React, { useState, useEffect, useRef } from 'react';
import { db } from './firebase'; // Import your Firebase configuration
import { doc, updateDoc } from 'firebase/firestore';
import './TravelProfile2.css'; // Import the CSS file here
import { useNavigate } from 'react-router-dom';
import { getAuth } from "firebase/auth";
import { Box, Button, IconButton, TextField, Typography, MenuItem, FormControl, Select, FormHelperText } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';

const TravelProfile2 = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Add edit mode states for each preference
  const [editMode, setEditMode] = useState({
    food: false,
    shopping: false,
    activity: false,
    nature: false,
  });

  const [foodPrefs, setFoodPrefs] = useState({
    title: 'Restaurant',
    costPreference: '',
    preferences: '',
  });

  const [shoppingPrefs, setShoppingPrefs] = useState({
    title: 'Shopping',
    costPreference: '',
    preferences: '',
  });

  const [activityPrefs, setActivityPrefs] = useState({
    title: 'Activities & Entertainment',
    costPreference: '',
    preferences: '',
  });

  const [naturePrefs, setNaturePrefs] = useState({
    title: 'Nature',
    costPreference: '',
    preferences: '',
  });

  const [allFieldsFilled, setAllFieldsFilled] = useState(false);

  useEffect(() => {
    const checkIfAllFieldsFilled = () => {
      if (
        foodPrefs.preferences &&
        shoppingPrefs.preferences &&
        activityPrefs.preferences &&
        naturePrefs.preferences &&
        foodPrefs.costPreference &&
        shoppingPrefs.costPreference &&
        activityPrefs.costPreference &&
        naturePrefs.costPreference
      ) {
        setAllFieldsFilled(true);
      } else {
        setAllFieldsFilled(false);
      }
    };

    checkIfAllFieldsFilled();
  }, [foodPrefs, shoppingPrefs, activityPrefs, naturePrefs]);

  // Function to toggle edit mode
  const toggleEditMode = (section) => {
    setEditMode((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Handlers for input changes
  const handleInputChange = (setter) => (e) => {
    setter((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCostChange = (setter) => (e) => {
    setter((prev) => ({
      ...prev,
      costPreference: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      console.error("User is not authenticated");
      return;
    }

    setLoading(true);

    try {
      await updateDoc(doc(db, "userPreferences", user.uid), {
        foodPreferences: foodPrefs,
        shoppingPreferences: shoppingPrefs,
        activityPreferences: activityPrefs,
        naturePreferences: naturePrefs,
        timestamp: new Date(),
      });

      console.log("Document written successfully");
      navigate('/dashboard');
    } catch (e) {
      console.error("Error adding document: ", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="travel-profile-container">
      <h2 className="title" style={{ color: '#0e395a' }}>Travel Categories</h2>
      <p style={{ fontSize: '14px', color: '#656ca6', marginTop: '-15px', marginBottom: '20px' }}>
      Let us know a little bit more about your travel preferences! We use this information to help create a detailed profile for you.
    </p>
      <form onSubmit={handleSubmit} className="profile-form">
        {/* Restaurant Preferences */}
        <div className="profile-section">
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" sx={{ color: '#0e395a', fontWeight: 'bold' }}>
              🍽 Restaurants & Dining
            </Typography>
            <IconButton onClick={() => toggleEditMode('food')}>
              {editMode.food ? <SaveIcon /> : <EditIcon />}
            </IconButton>
          </Box>
          {editMode.food ? (
            <>
              <TextField
                name="preferences"
                value={foodPrefs.preferences}
                onChange={handleInputChange(setFoodPrefs)}
                placeholder="Provide a brief description of your restaurant preferences..."
                fullWidth
                multiline
                minRows={3}
                sx={{ textAlign: 'left', color: '#0e395a', fontStyle: 'italic' }}
              />
              <FormControl fullWidth sx={{ mt: 2 }}>
                <Select
                  value={foodPrefs.costPreference}
                  onChange={handleCostChange(setFoodPrefs)}
                  sx={{ color: '#0e395a', height: '40px', fontSize: '0.9rem' }}
                >
                  <MenuItem value="$">$</MenuItem>
                  <MenuItem value="$$">$$</MenuItem>
                  <MenuItem value="$$$">$$$</MenuItem>
                  <MenuItem value="$$$$">$$$$</MenuItem>
                </Select>
                <FormHelperText sx={{ color: '#0e395a' }}>Choose between $, $$, $$$, $$$$</FormHelperText>
              </FormControl>
            </>
          ) : (
            <>
              <Typography variant="body1" sx={{ textAlign: 'left', color: '#0e395a'}}>
                {foodPrefs.preferences || "Provide a brief description of your restaurant preferences..."}
              </Typography>
              <Typography variant="body2" sx={{ textAlign: 'left', color: '#0e395a' }}>
                Cost Preference: {foodPrefs.costPreference}
              </Typography>
            </>
          )}
        </div>

        {/* Shopping Preferences */}
        <div className="profile-section">
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" sx={{ color: '#0e395a', fontWeight: 'bold' }}>
              🛍 Shopping & Retail
            </Typography>
            <IconButton onClick={() => toggleEditMode('shopping')}>
              {editMode.shopping ? <SaveIcon /> : <EditIcon />}
            </IconButton>
          </Box>
          {editMode.shopping ? (
            <>
              <TextField
                name="preferences"
                value={shoppingPrefs.preferences}
                onChange={handleInputChange(setShoppingPrefs)}
                placeholder="Provide a brief description of your shopping preferences..."
                fullWidth
                multiline
                minRows={3}
                sx={{ textAlign: 'left', color: '#0e395a', fontStyle: 'italic' }}
              />
              <FormControl fullWidth sx={{ mt: 2 }}>
                <Select
                  value={shoppingPrefs.costPreference}
                  onChange={handleCostChange(setShoppingPrefs)}
                  sx={{ color: '#0e395a', height: '40px', fontSize: '0.9rem' }}
                >
                  <MenuItem value="$">$</MenuItem>
                  <MenuItem value="$$">$$</MenuItem>
                  <MenuItem value="$$$">$$$</MenuItem>
                  <MenuItem value="$$$$">$$$$</MenuItem>
                </Select>
                <FormHelperText sx={{ color: '#0e395a' }}>Choose between $, $$, $$$, $$$$</FormHelperText>
              </FormControl>
            </>
          ) : (
            <>
              <Typography variant="body1" sx={{ textAlign: 'left', color: '#0e395a'}}>
                {shoppingPrefs.preferences || "Provide a brief description of your shopping preferences..."}
              </Typography>
              <Typography variant="body2" sx={{ textAlign: 'left', color: '#0e395a' }}>
                Cost Preference: {shoppingPrefs.costPreference}
              </Typography>
            </>
          )}
        </div>

        {/* Activities Preferences */}
        <div className="profile-section">
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" sx={{ color: '#0e395a', fontWeight: 'bold' }}>
              🎭 Activities & Entertainment
            </Typography>
            <IconButton onClick={() => toggleEditMode('activity')}>
              {editMode.activity ? <SaveIcon /> : <EditIcon />}
            </IconButton>
          </Box>
          {editMode.activity ? (
            <>
              <TextField
                name="preferences"
                value={activityPrefs.preferences}
                onChange={handleInputChange(setActivityPrefs)}
                placeholder="Provide a brief description of your activity preferences..."
                fullWidth
                multiline
                minRows={3}
                sx={{ textAlign: 'left', color: '#0e395a', fontStyle: 'italic' }}
              />
              <FormControl fullWidth sx={{ mt: 2 }}>
                <Select
                  value={activityPrefs.costPreference}
                  onChange={handleCostChange(setActivityPrefs)}
                  sx={{ color: '#0e395a', height: '40px', fontSize: '0.9rem' }}
                >
                  <MenuItem value="$">$</MenuItem>
                  <MenuItem value="$$">$$</MenuItem>
                  <MenuItem value="$$$">$$$</MenuItem>
                  <MenuItem value="$$$$">$$$$</MenuItem>
                </Select>
                <FormHelperText sx={{ color: '#0e395a' }}>Choose between $, $$, $$$, $$$$</FormHelperText>
              </FormControl>
            </>
          ) : (
            <>
              <Typography variant="body1" sx={{ textAlign: 'left', color: '#0e395a'}}>
                {activityPrefs.preferences || "Provide a brief description of your activity preferences..."}
              </Typography>
              <Typography variant="body2" sx={{ textAlign: 'left', color: '#0e395a' }}>
                Cost Preference: {activityPrefs.costPreference}
              </Typography>
            </>
          )}
        </div>

        {/* Nature Preferences */}
        <div className="profile-section">
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" sx={{ color: '#0e395a', fontWeight: 'bold' }}>
              🌿 Nature & Sightseeing
            </Typography>
            <IconButton onClick={() => toggleEditMode('nature')}>
              {editMode.nature ? <SaveIcon /> : <EditIcon />}
            </IconButton>
          </Box>
          {editMode.nature ? (
            <>
              <TextField
                name="preferences"
                value={naturePrefs.preferences}
                onChange={handleInputChange(setNaturePrefs)}
                placeholder="Provide a brief description of your nature preferences..."
                fullWidth
                multiline
                minRows={3}
                sx={{ textAlign: 'left', color: '#0e395a', fontStyle: 'italic' }}
              />
              <FormControl fullWidth sx={{ mt: 2 }}>
                <Select
                  value={naturePrefs.costPreference}
                  onChange={handleCostChange(setNaturePrefs)}
                  sx={{ color: '#0e395a', height: '40px', fontSize: '0.9rem' }}
                >
                  <MenuItem value="$">$</MenuItem>
                  <MenuItem value="$$">$$</MenuItem>
                  <MenuItem value="$$$">$$$</MenuItem>
                  <MenuItem value="$$$$">$$$$</MenuItem>
                </Select>
                <FormHelperText sx={{ color: '#0e395a' }}>Choose between $, $$, $$$, $$$$</FormHelperText>
              </FormControl>
            </>
          ) : (
            <>
              <Typography variant="body1" sx={{ textAlign: 'left', color: '#0e395a'}}>
                {naturePrefs.preferences || "Provide a brief description of your nature preferences..."}
              </Typography>
              <Typography variant="body2" sx={{ textAlign: 'left', color: '#0e395a' }}>
                Cost Preference: {naturePrefs.costPreference}
              </Typography>
            </>
          )}
        </div>

        {/* Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', marginY: 4 }}>
          <Button
            variant="contained"
            onClick={() => navigate('/TravelProfile')}
            sx={{ 
              backgroundColor: '#4dacd1', 
              '&:hover': { backgroundColor: '#4293a9' }
            }}
          >
            Back
          </Button>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', marginY: 4 }}>
          <Button>
          </Button>
          <Button
            variant="contained"
            type="submit"
            disabled={loading || !allFieldsFilled}
            sx={{ 
              backgroundColor: '#4dacd1', 
              '&:hover': { backgroundColor: '#4293a9' }
            }}
          >
            {loading ? 'Saving...' : 'Finish'}
          </Button>
        </Box>
      </form>
    </div>
  );
};

export default TravelProfile2;
