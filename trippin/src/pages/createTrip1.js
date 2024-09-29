import React, { useState, useEffect } from 'react';
import { Box, Button } from '@mui/material';
import './createTrip1.css';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'; // Import Firestore methods
import { db, auth } from './firebase'; // Import Firestore and Auth instances from Firebase
import { onAuthStateChanged } from 'firebase/auth'; // Import Auth state change listener
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker'; // Import DatePicker component
import 'react-datepicker/dist/react-datepicker.css'; // Import DatePicker CSS

function CreateTrip() {
  const [tripName, setTripName] = useState('');
  const [tripArea, setTripArea] = useState('');
  const [inviteEmails, setInviteEmails] = useState([]); // List of invited emails
  const [emailInput, setEmailInput] = useState(''); // Current input value for email
  const [errorMessage, setErrorMessage] = useState(''); // Error message for invalid email
  const [userEmail, setUserEmail] = useState(''); // State to store the authenticated user's email
  const [startDate, setStartDate] = useState(null); // Start date state
  const [endDate, setEndDate] = useState(null); // End date state
  const [address, setAddress] = useState(''); // New state for address
  const [loading, setLoading] = useState(false);
  const [dateError, setDateError] = useState(''); // Error message for date validation

  const navigate = useNavigate();

  // Handle adding a new email to the invite list
  const handleAddEmail = () => {
    if (emailInput && emailInput.endsWith('@gmail.com')) {
      if (!inviteEmails.includes(emailInput)) {
        setInviteEmails([...inviteEmails, emailInput]);
        setErrorMessage(''); // Clear any previous error
      }
    } else {
      setErrorMessage('Please enter a valid @gmail.com email');
    }
    setEmailInput(''); // Clear the input after adding
  };

  // Handle removing an email from the list
  const handleRemoveEmail = (emailToRemove) => {
    setInviteEmails(inviteEmails.filter((email) => email !== emailToRemove));
  };

  // Handle email input change
  const handleEmailChange = (e) => {
    setEmailInput(e.target.value);
    setErrorMessage(''); // Clear the error message when input changes
  };

  // Fetch the authenticated user's email when the component mounts
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email); // Set the authenticated user's email
      } else {
        setUserEmail(''); // If no user is authenticated, clear the email
      }
    });

    // Clean up the listener when the component unmounts
    return () => unsubscribe();
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Firestore logic: store the trip object
    try {
      // Create a new trip document in Firestore and capture the document reference
      const tripDocRef = await addDoc(collection(db, 'trips'), {
        tripName,
        tripArea,
        inviteEmails,
        startDate: startDate?.toISOString() || null, // Store start date in ISO format
        endDate: endDate?.toISOString() || null, // Store end date in ISO format
        address, // Include address in the Firestore document
        createdBy: userEmail, // Use the authenticated user's email
        createdAt: serverTimestamp(), // Use server timestamp for creation date
      });

      const tripId = tripDocRef.id; // Get the generated tripId (document ID)

      console.log('Trip successfully created with ID:', tripId);

      // Navigate to CreateTrip2 and pass the tripId and address via state
      navigate('/createTrip2', { state: { tripId, address } });
    } catch (error) {
      console.error('Error adding trip: ', error);
    } finally {
      setLoading(false);
    }
  };

  // Validate form completeness
  const isFormComplete = () => {
    return tripName && tripArea && address && startDate && endDate && inviteEmails.length > 0 && !dateError;
  };

  // Validate if the End Date is on or after the Start Date
  useEffect(() => {
    if (startDate && endDate) {
      if (endDate < startDate) {
        setDateError('End Date cannot be before Start Date');
      } else {
        setDateError(''); // Clear the error if valid
      }
    } else {
      setDateError(''); // No error if dates aren't both selected
    }
  }, [startDate, endDate]);

  return (
    <div className="create-trip-container">
      <h1 className="form-title">Create a New Trip</h1>
      <form onSubmit={handleSubmit} className="trip-form">
        {/* Trip Name */}
        <div className="form-group">
          <label htmlFor="tripName">Trip Name</label>
          <input
            type="text"
            id="tripName"
            className="form-control"
            value={tripName}
            onChange={(e) => setTripName(e.target.value)}
            placeholder="Enter a Trip Name"
            required
          />
        </div>

        {/* Trip Area */}
        <div className="form-group">
          <label htmlFor="tripArea">Trip Description</label>
          <input
            type="text"
            id="tripArea"
            className="form-control"
            value={tripArea}
            onChange={(e) => setTripArea(e.target.value)}
            placeholder="Describe your trip here!"
            required
          />
        </div>

        {/* Address Field */}
        <div className="form-group">
          <label htmlFor="address">Lodging Address</label>
          <input
            type="text"
            id="address"
            className="form-control"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter trip address"
            required
          />
        </div>

        {/* Start Date Picker */}
        <div className="form-group">
          <label>Start Date</label>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            className="form-control"
            placeholderText="Select a start date"
            required
          />
        </div>

        {/* End Date Picker */}
        <div className="form-group">
          <label>End Date</label>
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            className="form-control"
            placeholderText="Select an end date"
            required
          />
        </div>

        {/* Display date validation error */}
        {dateError && <p className="error-message">{dateError}</p>}

        {/* Invite Emails */}
        <div className="form-group">
          <label>Invite Emails</label>
          <div className="email-input-wrapper">
            <input
              type="email"
              className="form-control"
              value={emailInput}
              onChange={handleEmailChange}
              placeholder="Enter Gmail Invites"
            />
            <button type="button" className="add-email-btn" onClick={handleAddEmail}>
              Add
            </button>
          </div>

          {/* Display error message if email is not valid */}
          {errorMessage && <p className="error-message">{errorMessage}</p>}

          {/* Display added emails */}
          <div className="email-list">
            {inviteEmails.map((email, index) => (
              <div key={index} className="email-chip">
                {email}
                <span className="remove-chip" onClick={() => handleRemoveEmail(email)}>
                  &times;
                </span>
              </div>
            ))}
          </div>
        </div>

        <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%', // Ensure full width
            paddingX: '0px', // Optional: add horizontal padding
            marginY: 4, // Add vertical margin
          }}>
          <Button
            variant="contained"
            onClick={() => navigate('/Dashboard')}
            sx={{ 
              backgroundColor: '#4dacd1', 
              '&:hover': { backgroundColor: '#4293a9' }
            }}
          >
            Back
          </Button>
          <Button
            variant="contained"
            type="submit"
            disabled={!isFormComplete() || loading}
            sx={{ 
              backgroundColor: '#4dacd1', 
              '&:hover': { backgroundColor: '#4293a9' }
            }}
          >
            {loading ? 'Saving...' : 'Next'}
          </Button>
        </Box>
      </form>
    </div>
  );
}

export default CreateTrip;
