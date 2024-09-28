import React, { useState, useEffect } from 'react';
import './createTrip1.css';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'; // Import Firestore methods
import { db, auth } from './firebase'; // Import Firestore and Auth instances from Firebase
import { onAuthStateChanged } from 'firebase/auth'; // Import Auth state change listener
import { useNavigate } from 'react-router-dom';

function CreateTrip() {
  const [tripName, setTripName] = useState('');
  const [tripArea, setTripArea] = useState('');
  const [inviteEmails, setInviteEmails] = useState([]); // List of invited emails
  const [emailInput, setEmailInput] = useState(''); // Current input value for email
  const [errorMessage, setErrorMessage] = useState(''); // Error message for invalid email
  const [userEmail, setUserEmail] = useState(''); // State to store the authenticated user's email
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
    navigate('/createTrip2');

    // Firestore logic: store the trip object
    try {
      await addDoc(collection(db, 'trips'), {
        tripName,
        tripArea,
        inviteEmails,
        createdBy: userEmail, // Use the authenticated user's email
        createdAt: serverTimestamp(), // Use server timestamp for creation date
      });
      console.log('Trip successfully created!');
    } catch (error) {
      console.error('Error adding trip: ', error);
    }
  };

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
            <button type="button" className="submit-btn" onClick={handleAddEmail}>
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

        {/* Submit Button */}
        <div className="form-group">
          <button type="submit" className="submit-btn">Create Trip</button>
        </div>
      </form>
    </div>
  );
}

export default CreateTrip;
