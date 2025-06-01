import React, { useState, useEffect } from 'react';
import API from '../api/api';
import { Link } from 'react-router-dom';
import '../styles/home.css';

function Home({ token }) {
  const [search, setSearch] = useState('');
  const [genreList, setGenreList] = useState([]);
  const [filter, setFilter] = useState({ genre: '', year: '', rating: '', sort_by: '' });
  const [movies, setMovies] = useState([]);
  const [trending, setTrending] = useState([]);

  useEffect(() => {
    API.get('/movies/genres').then(res => setGenreList(res.data));
    API.get('/movies/trending').then(res => setTrending(res.data));
  }, []);

  const handleSearch = async e => {
    e.preventDefault();
    let params = { query: search };
    if (filter.genre) params.genre = filter.genre;
    if (filter.year) params.year = filter.year;
    if (filter.rating) params.rating = filter.rating;
    if (filter.sort_by) params.sort_by = filter.sort_by;
    const { data } = await API.get('/movies/search', { params });
    setMovies(data);
  };

  return (
    <div className="home-container">
      <h1>Discover Movies</h1>
      <form onSubmit={handleSearch} className="search-form">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by title..." />
        <select value={filter.genre} onChange={e => setFilter(f => ({ ...f, genre: e.target.value }))}>
          <option value="">Genre</option>
          {genreList.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
        <input type="number" placeholder="Year" value={filter.year} onChange={e => setFilter(f => ({ ...f, year: e.target.value }))} />
        <input type="number" placeholder="Min Rating" min="0" max="10" value={filter.rating} onChange={e => setFilter(f => ({ ...f, rating: e.target.value }))} />
        <select value={filter.sort_by} onChange={e => setFilter(f => ({ ...f, sort_by: e.target.value }))}>
          <option value="">Sort by</option>
          <option value="popularity.desc">Popularity</option>
          <option value="release_date.desc">Release Date</option>
          <option value="vote_average.desc">Rating</option>
        </select>
        <button type="submit">Search</button>
      </form>
      
      <h2>Results</h2>
      <div className="movies-list">
        {movies.map(movie => (
          <Link key={movie.id} to={`/movie/${movie.id}`} className="movie-card">
            <img src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`} alt={movie.title} />
            <div>{movie.title} ({movie.release_date?.slice(0,4)})</div>
          </Link>
        ))}
      </div>

      <h2>Trending This Week</h2>
      <div className="movies-list">
        {trending.map(movie => (
          <Link key={movie.id} to={`/movie/${movie.id}`} className="movie-card">
            <img src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`} alt={movie.title} />
            <div>{movie.title} ({movie.release_date?.slice(0,4)})</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Home;