import './AddMovieFom.css'
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useMovieContext } from '../../context/MovieContext';

function AddMovieForm({ isAuthenticated }) {
    const [query, setQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState(null);
    const { userLists, addMovie } = useMovieContext();

    // Effacer les résultats quand la recherche est vide
    useEffect(() => {
        if (!query.trim()) {
            setSearchResults([]);
        }
    }, [query]);

    // Rechercher des films
    const searchMovies = async (e) => {
        e.preventDefault();
        if (!query.trim() || !isAuthenticated) return;

        setIsSearching(true);
        try {
            const response = await axios.get('https://api.themoviedb.org/3/search/movie', {
                params: {
                    query: query,
                    language: 'fr-FR',
                    page: 1,
                },
                headers: {
                    'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`,
                    'accept': 'application/json'
                }
            });

            setSearchResults(response.data.results);
            setError(null);
        } catch (error) {
            console.error('Erreur lors de la recherche:', error);
            setError('Impossible de rechercher des films pour le moment');
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    // Ajouter un film à une liste
    const handleAddMovie = async (movie, listId) => {
        if (!listId || !movie) return;

        try {
            await addMovie(movie, listId);
            // Message de confirmation
            const list = userLists.find(l => l.id === listId);
            if (list) {
                alert(`Film ajouté à la liste "${list.name}"`);
            }
            // Vider les résultats de recherche après l'ajout
            setQuery('');
            setSearchResults([]);
        } catch (err) {
            console.error('Erreur lors de l\'ajout du film:', err);
            alert('Erreur lors de l\'ajout du film à la liste');
        }
    };

    return (
        <div className="add-movie-form-container">
            <form onSubmit={searchMovies} className="search-form">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Rechercher un film..."
                    disabled={!isAuthenticated}
                    className="search-input"
                />
                <button
                    type="submit"
                    disabled={!isAuthenticated || isSearching}
                    className="search-button"
                >
                    {isSearching ? 'Recherche...' : 'Rechercher'}
                </button>
            </form>

            {error && <div className="search-error">{error}</div>}

            {searchResults.length > 0 && (
                <div className="search-results">
                    <h3>Résultats de recherche</h3>
                    <div className="results-grid">
                        {searchResults.map((movie) => (
                            <div key={movie.id} className="result-card">
                                {movie.poster_path ? (
                                    <img
                                        src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                                        alt={movie.title}
                                        className="result-poster"
                                    />
                                ) : (
                                    <div className="no-poster">Pas d'affiche</div>
                                )}
                                <div className="result-details">
                                    <h4>{movie.title}</h4>
                                    <p>{movie.release_date ? new Date(movie.release_date).getFullYear() : 'Date inconnue'}</p>
                                    <div className="result-actions">
                                        {userLists && userLists.length > 0 ? (
                                            <div className="list-selector">
                                                <select
                                                    onChange={(e) => {
                                                        if (e.target.value) {
                                                            handleAddMovie(movie, parseInt(e.target.value, 10));
                                                        }
                                                    }}
                                                    defaultValue=""
                                                >
                                                    <option value="" disabled>Ajouter à une liste</option>
                                                    {userLists.map(list => (
                                                        <option key={list.id} value={list.id}>
                                                            {list.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        ) : (
                                            <p className="no-lists-message">Aucune liste disponible</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default AddMovieForm;