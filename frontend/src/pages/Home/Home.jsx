import './Home.css';
import MovieTable from '../../components/MovieTable/MovieTable'
import AddMovieForm from '../../components/AddMovieForm/AddMovieFom'
import { useEffect, useState } from 'react';
import axios from 'axios';

function Home() {
  const [MovieList, SetMovieList] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const authenticate = async () => {
    try {
      await axios.get('https://api.themoviedb.org/3/authentication', {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`,
          'accept': 'application/json'
        }
      });
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Erreur d\'authentification:', error);
      setIsAuthenticated(false);
    }
  };

  const fetchPopularMovies = async () => {
    try {
      if (!isAuthenticated) return;

      const response = await axios.get('https://api.themoviedb.org/3/movie/popular', {
        params: {
          language: 'fr-FR',
          page: 1
        },
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`,
          'accept': 'application/json'
        }
      });

      SetMovieList(response.data.results);
    } catch (error) {
      console.error('Erreur lors de la récupération des films:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    authenticate();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchPopularMovies();
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return <div className="loading">Chargement...</div>;
  }

  return (
    <div className="home-page">
      <div className="hero-section">
        <div className="hero-content">
          <h1>Découvrez les meilleurs films</h1>
          <p>Explorez notre sélection de films populaires et ajoutez vos propres découvertes</p>
        </div>
      </div>
      <div className="content-section">
        <div className="add-movie-section">
          <h2>Ajouter un film</h2>
          <AddMovieForm MovieList={MovieList} SetMovieList={SetMovieList} />
        </div>
        <div className="movies-section">
          <h2>Films Populaires</h2>
          <MovieTable MovieList={MovieList} />
        </div>
      </div>
    </div>
  );
}

export default Home;
