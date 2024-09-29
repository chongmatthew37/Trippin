import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import logo from './trippinlogo.png';
import textLogo from './trippinTextLogo.png';
import './App.css';
import Login from './pages/Login';
import TravelProfile from './pages/TravelProfile';
import TravelProfile2 from './pages/TravelProfile2';
import Dashboard from './pages/Dashboard';
import CreateTrip1 from './pages/createTrip1';
import CreateTrip2 from './pages/createTrip2';
import Itinerary from './pages/Itinerary';

function App() {
  const navigate = useNavigate();  // Initialize useNavigate

  const handleLogout = () => {
    // Perform any logout logic here (e.g., clearing session, local storage)
    alert('You have been logged out successfully');
    navigate('/login');  // Redirect to the login page after logout
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <img src={textLogo} className="App-text-logo" alt="Trippin" />
        {/* Add Logout button */}
        <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
          <button onClick={handleLogout}>Sign out</button>
        </div>
      </header>
      <div className="App-body">
        <Routes>
          <Route path="/login" element={<Login />} /> {/* The login route */}
          <Route path="/TravelProfile" element={<TravelProfile />} />
          <Route path="/TravelProfile2" element={<TravelProfile2 />} />
          <Route path="/Dashboard" element={<Dashboard />} />
          <Route path="/createTrip1" element={<CreateTrip1 />} />
          <Route path="/createTrip2" element={<CreateTrip2 />} />
          <Route path="/itinerary/:tripId" element={<Itinerary />} />
        </Routes>
      </div>
    </div>
  );
}

export default function WrappedApp() {
  return (
    <Router basename="/Trippin">
      <App />
    </Router>
  );
}
