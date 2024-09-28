import React, { useState } from 'react';
import { db } from './firebase'; // Import your Firebase configuration
import { doc, setDoc} from 'firebase/firestore';
import './TravelProfile2.css'; // Import the CSS file here
import { useNavigate } from 'react-router-dom';
import { getAuth } from "firebase/auth";

const TravelProfile2 = () => {
    const navigate = useNavigate();
  const [foodPrefs, setFoodPrefs] = useState({
    title: 'Restaurant',
    costPreference: '$$',
    preferences: '',
  });

  const [shoppingPrefs, setShoppingPrefs] = useState({
    title: 'Shopping',
    costPreference: '$$',
    preferences: '',
  });

  const [activityPrefs, setActivityPrefs] = useState({
    title: 'Activities & Entertainment',
    costPreference: '$$',
    preferences: '',
  });

  const [naturePrefs, setNaturePrefs] = useState({
    title: 'Nature',
    costPreference: '',
    preferences: '',
  });

  const handleRestaurantChange = (e) => {
    setFoodPrefs({ ...foodPrefs, [e.target.name]: e.target.value });
  };

  const handleShoppingChange = (e) => {
    setShoppingPrefs({ ...shoppingPrefs, [e.target.name]: e.target.value });
  };

  const handleActivityChange = (e) => {
    setActivityPrefs({ ...activityPrefs, [e.target.name]: e.target.value });
  };

  const handleNatureChange = (e) => {
    setNaturePrefs({ ...naturePrefs, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      console.error("User is not authenticated");
      return;
    }


    try {
        // Set the document ID to the user's UID to match Firestore rules
        const docRef = await setDoc(doc(db, "userPreferences", user.uid), {
            foodPreferences: foodPrefs,        // Save food preferences under the user's document
            shoppingPreferences: shoppingPrefs,  // Save shopping preferences
            activityPreferences: activityPrefs,  // Save activity preferences
            naturePreferences: naturePrefs,      // Save nature preferences
            timestamp: new Date(),               // Include a timestamp             
        });
  
        console.log("Document written successfully");
        navigate('/dashboard');
      } catch (e) {
        console.error("Error adding document: ", e);
      }
    
  };

  return (
    <div className="travel-profile-container">
      <h2 className="title">Travel Profile Preferences</h2>

      <form onSubmit={handleSubmit} className="profile-form">
        {/* Restaurant Preferences */}
        <div className="profile-section">
          <h3 className="category-title">
            🍽 Restaurant Preferences
            <span className="cost">{foodPrefs.costPreference}</span>
          </h3>
          <textarea
            name="preferences"
            value={foodPrefs.preferences}
            onChange={handleRestaurantChange}
            placeholder="Describe your restaurant preferences..."
            className="input-box"
            required
          />
        </div>

        {/* Shopping Preferences */}
        <div className="profile-section">
          <h3 className="category-title">
            🛍 Shopping Preferences
            <span className="cost">{shoppingPrefs.costPreference}</span>
          </h3>
          <textarea
            name="preferences"
            value={shoppingPrefs.preferences}
            onChange={handleShoppingChange}
            placeholder="Describe your shopping preferences..."
            className="input-box"
            required
          />

        </div>

        {/* Activities Preferences */}
        <div className="profile-section">
          <h3 className="category-title">
            🎭 Activities & Entertainment
            <span className="cost">{activityPrefs.costPreference}</span>
          </h3>
          <textarea
            name="preferences"
            value={activityPrefs.preferences}
            onChange={handleActivityChange}
            placeholder="Describe your activity preferences..."
            className="input-box"
            required
          />
        </div>

        {/* Nature Preferences */}
        <div className="profile-section">
          <h3 className="category-title">
            🌿 Nature Preferences
          </h3>
          <textarea
            name="preferences"
            value={naturePrefs.preferences}
            onChange={handleNatureChange}
            placeholder="Describe your nature preferences..."
            className="input-box"
            required
          />
        </div>

        <button type="submit" className="submit-btn">
          Finish
        </button>
      </form>
    </div>
  );
};

export default TravelProfile2;
