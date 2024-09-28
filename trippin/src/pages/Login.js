// src/pages/Login.js
import React, { useState } from 'react';
import { signInWithPopup, signOut, auth, provider } from './firebase'; // Import from firebase.js
// src/pages/Login.js
import './Login.css';


function Login() {
  const [user, setUser] = useState(null);

  // Google Sign-In Handler
  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
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
      {!user ? (
        <div>
          <h2>Sign in with Google!</h2>
          <button onClick={handleLogin}>Sign in with Google</button>
        </div>
      ) : (
        <div>
          <h2>Welcome, {user.displayName}</h2>
          <img src={user.photoURL} alt={user.displayName} style={{ borderRadius: '50%', width: '100px' }} />
          <p>Email: {user.email}</p>
          <button onClick={handleLogout}>Sign Out</button>
        </div>
      )}
    </div>
  );
}

export default Login;
