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
  if (error) return <div>{error}</div>;
  return (
    <div className="users-list">
      <h2>All Users</h2>
      <ul>
        {users.map(u => (
          <li key={u._id}>
            <Link to={`/users/${u._id}`}>{u.username}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}