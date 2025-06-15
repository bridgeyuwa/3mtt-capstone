import React, { useState, useEffect } from 'react';
import API from '../api/api';
import { Link } from 'react-router-dom';

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
    <div className="min-h-screen bg-gray-900 text-gray-100 px-4 sm:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6">Discover Movies</h1>

      <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-6 gap-4 mb-8">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by title..."
          className="col-span-2 px-4 py-2 rounded-md bg-gray-800 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <select
          value={filter.genre}
          onChange={e => setFilter(f => ({ ...f, genre: e.target.value }))}
          className="col-span-1 px-4 py-2 rounded-md bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Genre</option>
          {genreList.map(g => (
            <option key={g.id} value={g.id} className="bg-gray-900 text-gray-100">{g.name}</option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Year"
          value={filter.year}
          onChange={e => setFilter(f => ({ ...f, year: e.target.value }))}
          className="col-span-1 px-4 py-2 rounded-md bg-gray-800 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <input
          type="number"
          placeholder="Min Rating"
          min="0"
          max="10"
          value={filter.rating}
          onChange={e => setFilter(f => ({ ...f, rating: e.target.value }))}
          className="col-span-1 px-4 py-2 rounded-md bg-gray-800 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <select
          value={filter.sort_by}
          onChange={e => setFilter(f => ({ ...f, sort_by: e.target.value }))}
          className="col-span-1 px-4 py-2 rounded-md bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Sort by</option>
          <option value="popularity.desc" className="bg-gray-900 text-gray-100">Popularity</option>
          <option value="release_date.desc" className="bg-gray-900 text-gray-100">Release Date</option>
          <option value="vote_average.desc" className="bg-gray-900 text-gray-100">Rating</option>
        </select>
        <button
          type="submit"
          className="col-span-full sm:col-span-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md transition"
        >
          Search
        </button>
      </form>

      <section className="mb-10">
  <h2 className="text-2xl font-semibold mb-4">Results</h2>

  {movies.length === 0 ? (
    <div className="text-center text-gray-400 text-lg">
      No results found. Try searching or refining your filters.
    </div>
  ) : (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {movies.map(movie => (
        <Link
          key={movie.id}
          to={`/movie/${movie.id}`}
          className="bg-gray-800 rounded-md overflow-hidden hover:scale-105 transition-transform"
        >
          <img
            src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
            alt={movie.title}
            className="w-full h-auto"
          />
          <div className="p-2 text-sm font-medium text-center">
            {movie.title} ({movie.release_date?.slice(0, 4)})
          </div>
        </Link>
      ))}
    </div>
  )}
</section>


      <section>
        <h2 className="text-2xl font-semibold mb-4">Trending This Week</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {trending.map(movie => (
            <Link
              key={movie.id}
              to={`/movie/${movie.id}`}
              className="bg-gray-800 rounded-md overflow-hidden hover:scale-105 transition-transform"
            >
              <img
                src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                alt={movie.title}
                className="w-full h-auto"
              />
              <div className="p-2 text-sm font-medium text-center">{movie.title} ({movie.release_date?.slice(0, 4)})</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;
