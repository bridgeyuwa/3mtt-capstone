import React, { useEffect, useState } from 'react';
import API, { setAuthToken } from '../api/api';

export default function Social({ token }) {
  const [users, setUsers] = useState([]);
  const [me, setMe] = useState(null);

  useEffect(() => {
    setAuthToken(token);
    API.get('/users/me').then(res => setMe(res.data));
    API.get('/users/all').then(res => setUsers(res.data));
  }, [token]);

  const handleFollow = async (userId) => {
    await API.post(`/social/follow/${userId}`);
    API.get('/users/me').then(res => setMe(res.data));
  };

  const handleUnfollow = async (userId) => {
    await API.post(`/social/unfollow/${userId}`);
    API.get('/users/me').then(res => setMe(res.data));
  };

  return (
    <div className="profile-container">
      <h2>Social</h2>
      <ul>
        {users.filter(u => u._id !== me?._id).map(u => (
          <li key={u._id}>
            {u.username}
            {me && me.following.includes(u._id) ? (
              <button onClick={() => handleUnfollow(u._id)}>Unfollow</button>
            ) : (
              <button onClick={() => handleFollow(u._id)}>Follow</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}