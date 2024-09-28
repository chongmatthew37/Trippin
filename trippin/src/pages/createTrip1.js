// src/pages/CreateTrip.js
import React, { useState } from 'react';
import './createTrip1.css'; // Assuming you have a CSS file for styling

function CreateTrip() {
  const [tripName, setTripName] = useState('');
  const [tripArea, setTripArea] = useState('');
  const [inviteEmails, setInviteEmails] = useState([]); // List of invited emails
  const [emailInput, setEmailInput] = useState(''); // Current input value for email

  // Handle adding a new email to the invite list
  const handleAddEmail = () => {
    if (emailInput && !inviteEmails.includes(emailInput)) {
      setInviteEmails([...inviteEmails, emailInput]);
    }
    setEmailInput(''); // Clear the input after adding
  };

  // Handle removing an email from the list
  const handleRemoveEmail = (emailToRemove) => {
    setInviteEmails(inviteEmails.filter((email) => email !== emailToRemove));
  };

  // Handle email input change
  const handleEmailChange = (e) => {
    const input = e.target.value;
    setEmailInput(input);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Trip Name:', tripName);
    console.log('Trip Area:', tripArea);
    console.log('Invite Emails:', inviteEmails);
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
              placeholder="Enter Email of Invites"
            />
            <button type="button" className="submit-btn" onClick={handleAddEmail}>
              Add
            </button>
          </div>         

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
