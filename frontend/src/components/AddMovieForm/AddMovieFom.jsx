import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './AddMovieForm.css';

function AddMovieForm({ MovieList, SetMovieList }) {
    // Nombre de résultats à afficher dans le dropdown (facilement modifiable)
    const MAX_SEARCH_RESULTS = 5;

    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    // Fonction pour rechercher des films
    const searchMovies = async (query) => {
        if (!query || query.length < 2) {
            setSearchResults([]);
            setShowDropdown(false);
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.get('https://api.themoviedb.org/3/search/movie', {
                params: {
                    query: query,
                    language: 'fr-FR',
                    page: 1
                },
                headers: {
                    'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`,
                    'accept': 'application/json'
                }
            });

            setSearchResults(response.data.results.slice(0, MAX_SEARCH_RESULTS));
            setShowDropdown(true);
        } catch (error) {
            console.error('Erreur lors de la recherche de films:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Debounce pour la recherche
    useEffect(() => {
        const timer = setTimeout(() => {
            searchMovies(searchTerm);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Ajouter un film à la liste
    const addMovie = (movie) => {
        if (!MovieList.some(m => m.id === movie.id)) {
            SetMovieList([...MovieList, movie]);
        }
        setSearchTerm('');
        setShowDropdown(false);
    };

    // Gérer le clic en dehors du dropdown pour le fermer
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="search-container" ref={dropdownRef}>
            <div className="search-input-container">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Rechercher un film..."
                    className="search-input"
                />
                {isLoading && <div className="search-loader"></div>}
            </div>

            {showDropdown && searchResults.length > 0 && (
                <div className="search-dropdown">
                    {searchResults.map(movie => (
                        <div
                            key={movie.id}
                            className="search-result"
                            onClick={() => addMovie(movie)}
                        >
                            {movie.poster_path ? (
                                <img
                                    src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                                    alt={movie.title}
                                    className="search-result-poster"
                                />
                            ) : (
                                <div className="search-result-no-poster">
                                    <span>No Image</span>
                                </div>
                            )}
                            <div className="search-result-info">
                                <div className="search-result-title">{movie.title}</div>
                                <div className="search-result-year">
                                    {movie.release_date ? new Date(movie.release_date).getFullYear() : 'Inconnue'}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showDropdown && searchTerm && searchResults.length === 0 && !isLoading && (
                <div className="search-dropdown">
                    <div className="search-no-results">Aucun résultat trouvé</div>
                </div>
            )}
        </div>
    );
}

export default AddMovieForm;