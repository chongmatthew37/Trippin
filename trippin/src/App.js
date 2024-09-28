// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import logo from './trippinlogo.png';
import './App.css';
import Login from './pages/Login'; // Make sure path to Login is correct
import TravelProfile from './pages/TravelProfile';
import TravelProfile2 from './pages/TravelProfile2';
import Dashboard from './pages/Dashboard';
import CreateTrip1 from './pages/createTrip1';
import CreateTrip2 from './pages/createTrip2';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
        </header>
        <div className="App-body">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/TravelProfile" element={<TravelProfile />} />
            <Route path="/TravelProfile2" element={<TravelProfile2 />} />
            <Route path="/Dashboard" element={<Dashboard />} />
            <Route path="/createTrip1" element={<CreateTrip1 />} />
            <Route path="/createTrip2" element={<CreateTrip2 />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
