import React, { useEffect, useState } from 'react';
import API, { setAuthToken } from '../api/api';
import { Link } from 'react-router-dom';

export default function Social({ token }) {
  const [users, setUsers] = useState([]);
  const [me, setMe] = useState(null);
  const [loadingId, setLoadingId] = useState(null);

  // Checks if userId is in the following array (which is an array of user objects)
  const isFollowing = (userId) => {
    if (!me || !Array.isArray(me.following)) return false;
    return me.following.some(f => String(f._id) === String(userId));
  };

  const refreshData = async () => {
    try {
      setAuthToken(token);
      const [meRes, usersRes] = await Promise.all([
        API.get('/users/me'),
        API.get('/users/all'),
      ]);
      setMe(meRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      // Optionally handle error
    }
  };

  useEffect(() => {
    if (!token) return;
    refreshData();
    // eslint-disable-next-line
  }, [token]);

  const handleFollow = async (userId) => {
    setLoadingId(userId);
    try {
      await API.post(`/social/follow/${userId}`);
      await refreshData();
    } catch (err) {
      // Optionally show error
    } finally {
      setLoadingId(null);
    }
  };

  const handleUnfollow = async (userId) => {
    setLoadingId(userId);
    try {
      await API.post(`/social/unfollow/${userId}`);
      await refreshData();
    } catch (err) {
      // Optionally show error
    } finally {
      setLoadingId(null);
    }
  };

  if (!me || !users.length) return <div>Loading...</div>;

  return (
    <div className="profile-container">
      <h2>Social</h2>
      <ul>
        {users
          .filter(u => String(u._id) !== String(me._id))
          .map(u => (
            <li key={u._id}>
              <Link to={`/users/${u._id}`} style={{ textDecoration: 'none', color: 'inherit', fontWeight: 'bold' }}>
                {u.username}
              </Link>
              {isFollowing(u._id) ? (
                <button
                  onClick={() => handleUnfollow(u._id)}
                  disabled={loadingId === u._id}
                  style={{ marginLeft: 8 }}
                >Unfollow</button>
              ) : (
                <button
                  onClick={() => handleFollow(u._id)}
                  disabled={loadingId === u._id}
                  style={{ marginLeft: 8 }}
                >Follow</button>
              )}
            </li>
          ))}
      </ul>
    </div>
  );
}