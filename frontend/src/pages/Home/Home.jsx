import './Home.css';
import MovieTable from '../../components/MovieTable/MovieTable'
import AddMovieForm from '../../components/AddMovieForm/AddMovieFom'
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useMovieContext } from '../../context/MovieContext';
import { Link } from 'react-router-dom';

function Home() {
  const {
    myMovieList,
    setMyMovieList,
    userLists,
    loading: listsLoading,
    error: listsError,
    refreshLists,
    createList,
    userId
  } = useMovieContext();

  const [trendingMovieList, setTrendingMovieList] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newListName, setNewListName] = useState('');
  const inputRef = useRef();

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
      setError('Erreur d\'authentification avec TMDB');
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

      setTrendingMovieList(response.data.results);
      setError(null);
    } catch (error) {
      console.error('Erreur lors de la récupération des films populaires:', error);
      setError('Impossible de charger les films populaires');
    } finally {
      setIsLoading(false);
    }
  };

  // Enrichissement TMDB systématique des films de chaque liste utilisateur
  useEffect(() => {
    const enrichMovies = async () => {
      if (!userLists || userLists.length === 0) return;
      for (const list of userLists) {
        if (!list.movies || list.movies.length === 0) continue;
        const enrichedMovies = await Promise.all(list.movies.map(async (movie) => {
          if (movie.poster_path && movie.title) return movie;
          try {
            const response = await axios.get(`https://api.themoviedb.org/3/movie/${movie.id}`, {
              params: { language: 'fr-FR' },
              headers: {
                'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`,
                'accept': 'application/json'
              }
            });
            return { ...movie, ...response.data };
          } catch (err) {
            return movie;
          }
        }));
        // Met à jour la liste localement
        list.movies = enrichedMovies;
      }
    };
    enrichMovies();
  }, [userLists]);

  useEffect(() => {
    authenticate();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchPopularMovies();
    }
  }, [isAuthenticated]);

  // Afficher un état de chargement si les données sont en cours de chargement
  if (isLoading || listsLoading) {
    return <div className="loading">Chargement...</div>;
  }

  // Afficher un message d'erreur si une erreur s'est produite
  if (error || listsError) {
    return (
      <div className="error-container">
        <div className="error-message">
          {error || listsError}
        </div>
        <button
          className="retry-button"
          onClick={() => {
            setError(null);
            authenticate();
            refreshLists();
            fetchPopularMovies();
          }}
        >
          Réessayer
        </button>
      </div>
    );
  }

  // Limiter le nombre de films affichés dans chaque catégorie pour l'aperçu
  const MAX_PREVIEW_MOVIES = 6;

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
          <AddMovieForm isAuthenticated={isAuthenticated} />
        </div>

        {/* Sections pour chaque liste d'utilisateur */}
        {userLists && userLists.length > 0 ? (
          <div className="user-lists-section">
            <h2>Mes Listes</h2>
            {userLists.map(list => (
              <div key={list.id} className="list-movies-section">
                <div className="list-header">
                  <h3>{list.name}</h3>
                  {list.movies && list.movies.length > MAX_PREVIEW_MOVIES && (
                    <Link to={`/list/${list.id}`} className="see-all-link">
                      Voir tous ({list.movies.length})
                    </Link>
                  )}
                </div>
                {list.movies && list.movies.length > 0 ? (
                  <MovieTable
                    MovieList={list.movies.slice(0, MAX_PREVIEW_MOVIES)}
                    listId={list.id}
                  />
                ) : (
                  <div className="empty-list-message">
                    Cette liste ne contient aucun film.
                    <Link to="/lists" className="manage-lists-link">
                      Gérer mes listes
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="user-lists-section">
            <h2>Mes Listes</h2>
            <div className="empty-list-message">
              Vous n'avez pas encore créé de liste.<br />
              <button
                className="retry-button"
                onClick={async () => {
                  const name = prompt('Nom de la nouvelle liste :');
                  if (name && name.trim()) {
                    await createList(name.trim());
                    await refreshLists();
                  }
                }}
              >
                Créer une liste
              </button>
            </div>
          </div>
        )}

        {/* Les films du moment */}
        <div className="movies-section">
          <h2>Films Populaires</h2>
          <MovieTable MovieList={trendingMovieList || []} />
        </div>
      </div>
    </div>
  );
}

export default Home;
