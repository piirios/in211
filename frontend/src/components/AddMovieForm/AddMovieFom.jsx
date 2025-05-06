import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './AddMovieForm.css';

function AddMovieForm({ MovieList, SetMovieList }) {
    const MAX_SEARCH_RESULTS = 5;

    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [userLists, setUserLists] = useState([]);
    const [selectedListId, setSelectedListId] = useState(null);
    const dropdownRef = useRef(null);

    // Mock listes pour le développement
    const mockLists = [
        { id: 1, name: "Films à voir", movies: [{ id: 11, title: "The Matrix" }, { id: 12, title: "Inception" }] },
        { id: 2, name: "Films favoris", movies: [{ id: 13, title: "The Dark Knight" }] },
        { id: 3, name: "Films d'action", movies: [{ id: 14, title: "Die Hard" }, { id: 15, title: "John Wick" }] },
        { id: 4, name: "Comédies", movies: [{ id: 16, title: "The Hangover" }] },
        { id: 5, name: "Science-fiction", movies: [{ id: 17, title: "Blade Runner" }] },
        { id: 6, name: "Thrillers", movies: [] }
    ];

    // Charger les listes au montage du composant
    useEffect(() => {
        // Simulation d'une récupération de listes
        setTimeout(() => {
            setUserLists(mockLists);
            if (mockLists.length > 0) {
                setSelectedListId(mockLists[0].id);
            }
        }, 300);
    }, []);

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

    useEffect(() => {
        const timer = setTimeout(() => {
            searchMovies(searchTerm);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const addMovie = (movie) => {
        const selectedList = userLists.find(list => list.id === selectedListId);
        const listName = selectedList ? selectedList.name : "Mes Films";

        if (!MovieList.some(m => m.id === movie.id)) {
            SetMovieList([...MovieList, movie]);
            alert(`Film "${movie.title}" ajouté à la liste "${listName}"`);
        } else {
            alert(`Ce film est déjà dans votre liste`);
        }
        setSearchTerm('');
        setShowDropdown(false);
    };

    const handleCreateNewList = () => {
        const listName = prompt('Nom de la nouvelle liste:');
        if (listName && listName.trim()) {
            const newListId = userLists.length > 0 ? Math.max(...userLists.map(list => list.id)) + 1 : 1;
            const newList = { id: newListId, name: listName.trim(), movies: [] };
            setUserLists([...userLists, newList]);
            setSelectedListId(newListId);
        }
    };

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
        <div className="search-form-container">
            <div className="search-options">
                <div className="list-selector">
                    <div className="select-container">
                        <select
                            id="list-select"
                            value={selectedListId || ''}
                            onChange={(e) => setSelectedListId(Number(e.target.value))}
                            className="list-select"
                        >
                            <option value="" disabled>Choisir une liste</option>
                            {userLists.map(list => (
                                <option key={list.id} value={list.id}>
                                    {list.name} ({list.movies ? list.movies.length : 0})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="search-container" ref={dropdownRef}>
                    <div className="search-input-container">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Rechercher un film à ajouter..."
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

                <button
                    className="new-list-btn"
                    onClick={handleCreateNewList}
                    type="button"
                    title="Créer une nouvelle liste"
                >
                    +
                </button>
            </div>
        </div>
    );
}

export default AddMovieForm;