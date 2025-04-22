import React, { useState } from 'react';
import '../styles/MyAccount.css';

const MyAccount = () => {
  const [activeTab, setActiveTab] = useState('personal');

  const userInfo = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
  };

  const donationHistory = [
    { date: '2024-01-15', amount: '$50', project: 'Clean Water in Kenya' },
    { date: '2024-03-10', amount: '$30', project: 'Rainwater Harvesting in India' },
  ];

  return (
    <div className="account-container">
      <h2 className="account-title">My Account</h2>

      <div className="tab-buttons">
        <button
          className={activeTab === 'personal' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('personal')}
        >
          Personal Information
        </button>
        <button
          className={activeTab === 'donations' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('donations')}
        >
          Donation History
        </button>
      </div>

      {activeTab === 'personal' && (
        <div className="tab-content">
          <h3>Personal Information</h3>
          <p><strong>First Name:</strong> {userInfo.firstName}</p>
          <p><strong>Last Name:</strong> {userInfo.lastName}</p>
          <p><strong>Email:</strong> {userInfo.email}</p>
        </div>
      )}

      {activeTab === 'donations' && (
        <div className="tab-content">
          <h3>Donation History</h3>
          {donationHistory.length === 0 ? (
            <p>No donation history available.</p>
          ) : (
            <ul className="donation-list">
              {donationHistory.map((donation, index) => (
                <li key={index}>
                  <p><strong>Date:</strong> {donation.date}</p>
                  <p><strong>Amount:</strong> {donation.amount}</p>
                  <p><strong>Project:</strong> {donation.project}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default MyAccount;
