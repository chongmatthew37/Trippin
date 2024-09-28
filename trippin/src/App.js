// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import logo from './trippinlogo.png';
import './App.css';
import Login from './pages/Login'; // Make sure path to Login is correct
import TravelProfile from './pages/TravelProfile';

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
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
