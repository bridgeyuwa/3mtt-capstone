import React, { useEffect, useState } from 'react';
import API, { setAuthToken } from '../api/api';
import { Link } from 'react-router-dom';

export default function Users({ token }) {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    setAuthToken(token);
    API.get('/users')
      .then(res => setUsers(res.data))
      .catch(() => setError('Failed to load users.'));
  }, [token]);

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-red-500 font-semibold">
        {error}
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200  mx-auto p-6">
<div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-semibold mb-6">All Users</h2>
      <ul className="space-y-4">
        {users.map(u => (
          <li
            key={u._id}
            className="flex items-center space-x-4 bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition"
          >
            <img
              src={
                u.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(u.username)}&background=4a5568&color=edf2f7&size=48`
              }
              alt={`${u.username} avatar`}
              className="w-12 h-12 rounded-full object-cover"
              loading="lazy"
            />
            <Link
              to={`/users/${u._id}`}
              className="text-blue-400 hover:underline font-medium"
            >
              {u.username}
            </Link>
          </li>
        ))}
      </ul>
      </div>
    </div>
  );
}
