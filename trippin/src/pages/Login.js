// src/pages/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup, signOut, auth, provider } from './firebase'; // Import from firebase.js
// src/pages/Login.js
import './Login.css';
import { doc, getDoc } from "firebase/firestore";
import { db } from './firebase'



function Login() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Google Sign-In Handler
  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);

      const user = result.user;

      const userPreferencesRef = doc(db, 'userPreferences', user.uid);
    const userPreferencesSnap = await getDoc(userPreferencesRef);

    if (userPreferencesSnap.exists()) {
      const data = userPreferencesSnap.data();

      if (data.foodPreferences && data.shoppingPreferences && data.activityPreferences && data.naturePreferences) {
        navigate('/dashboard');
      } else {
        navigate('/TravelProfile2');
      }
    } else {
      navigate('/TravelProfile');
    }
    } catch (error) {
      console.error('Error during sign-in:', error);
    }
  };

  // Google Sign-Out Handler
  const handleLogout = () => {
    signOut(auth).then(() => setUser(null));
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      {
        <div>
          <h2 style={{ color: '#0e395a' }}>Sign in with Google</h2>
          <button className="login-with-google-btn" onClick={handleLogin}>Sign in with Google</button>
        </div>}
    </div>
  );
}

export default Login;
