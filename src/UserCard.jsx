// src/UserCard.jsx
import React from 'react';

const UserCard = ({ username, email, isOnline, badges }) => {
  return (
    <div className="card">
      <h2>{username}</h2>
      <p>{email}</p>
      <span>Status 123: {isOnline ? 'Active' : 'Offline'}</span>
      <ul>
        {badges.map((badge, index) => (
          <li key={index}>{badge}</li>
        ))}
      </ul>
    </div>
  );
};

export default UserCard;