import React, { useEffect, useState } from 'react';
import API, { setAuthToken } from '../api/api';
import { useParams } from 'react-router-dom';
import '../styles/profile.css';

export default function Profile({ token, onLogout }) {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ bio: '', avatar: '' });
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setAuthToken(token);
    API.get(userId ? `/users/${userId}` : '/users/me').then(res => {
      setUser(res.data);
      setForm({ bio: res.data.bio, avatar: res.data.avatar });
    });
    if (userId) {
      API.get(`/social/followers/${userId}`).then(res => setFollowers(res.data));
      API.get(`/social/following/${userId}`).then(res => setFollowing(res.data));
    }
  }, [token, userId]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setAuthToken(token);
    await API.put('/users/me', form);
    setEditing(false);
    setMessage('Profile updated!');
    API.get('/users/me').then(res => setUser(res.data));
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="profile-container">
      <h2>{user.username}'s Profile</h2>
      <img src={user.avatar || "https://ui-avatars.com/api/?name=" + user.username} alt="avatar" className="avatar" />
      <div><b>Email:</b> {user.email}</div>
      <div><b>Bio:</b> {user.bio}</div>
      <button onClick={onLogout}>Logout</button>
      <button onClick={() => setEditing(!editing)}>{editing ? "Cancel" : "Edit Profile"}</button>
      {editing && (
        <form onSubmit={handleUpdate} className="profile-form">
          <input value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} placeholder="Bio" />
          <input value={form.avatar} onChange={e => setForm(f => ({ ...f, avatar: e.target.value }))} placeholder="Avatar URL" />
          <button type="submit">Save</button>
        </form>
      )}
      {message && <div className="info">{message}</div>}
      <h3>Favorites</h3>
      <ul>{user.favorites.map(f => <li key={f}>{f}</li>)}</ul>
      <h3>Watchlists</h3>
      <ul>
        {user.watchlists.map(wl => (
          <li key={wl.name}>{wl.name}: {wl.movies.join(', ')}</li>
        ))}
      </ul>
      <h3>Followers: {followers.length} | Following: {following.length}</h3>
      <div>
        <b>Followers:</b> {followers.map(f => f.username).join(', ')}
      </div>
      <div>
        <b>Following:</b> {following.map(f => f.username).join(', ')}
      </div>
    </div>
  );
}