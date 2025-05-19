import './AddMovieFom.css'
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useMovieContext } from '../../context/MovieContext';
import { useNavigate } from 'react-router-dom';

function AddMovieForm({ isAuthenticated }) {
    const [query, setQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState(null);
    const { userLists, addMovie } = useMovieContext();
    const [showDropdown, setShowDropdown] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [openSelectIndex, setOpenSelectIndex] = useState(-1);
    const inputRef = useRef();
    const dropdownRef = useRef();
    const navigate = useNavigate();

    // Recherche en direct à chaque frappe
    useEffect(() => {
        if (!query.trim()) {
            setSearchResults([]);
            setShowDropdown(false);
            return;
        }
        let cancel = false;
        setIsSearching(true);
        axios.get('https://api.themoviedb.org/3/search/movie', {
            params: {
                query: query,
                language: 'fr-FR',
                page: 1,
            },
            headers: {
                'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`,
                'accept': 'application/json'
            }
        })
            .then(response => {
                if (!cancel) {
                    setSearchResults(response.data.results);
                    setShowDropdown(true);
                    setError(null);
                }
            })
            .catch(error => {
                if (!cancel) {
                    setError('Impossible de rechercher des films pour le moment');
                    setSearchResults([]);
                    setShowDropdown(false);
                }
            })
            .finally(() => {
                if (!cancel) setIsSearching(false);
            });
        return () => { cancel = true; };
    }, [query]);

    // Fermer le dropdown si clic en dehors
    useEffect(() => {
        function handleClickOutside(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target) && inputRef.current && !inputRef.current.contains(e.target)) {
                setShowDropdown(false);
                setHighlightedIndex(-1);
                setOpenSelectIndex(-1);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Navigation clavier
    const handleKeyDown = (e) => {
        if (!showDropdown || searchResults.length === 0) return;
        if (e.key === 'ArrowDown') {
            setHighlightedIndex(i => (i + 1) % searchResults.length);
        } else if (e.key === 'ArrowUp') {
            setHighlightedIndex(i => (i - 1 + searchResults.length) % searchResults.length);
        } else if (e.key === 'Enter') {
            if (highlightedIndex >= 0 && highlightedIndex < searchResults.length) {
                handleGoToDetail(searchResults[highlightedIndex]);
            }
        } else if (e.key === 'Escape') {
            setShowDropdown(false);
        }
    };

    // Aller sur la fiche du film
    const handleGoToDetail = (movie) => {
        if (movie && movie.id) {
            navigate(`/movie/${movie.id}`);
        }
    };

    // Sélection d'un film (clic sur la ligne)
    const handleRowClick = (e, movie) => {
        // Si clic sur le bouton ou le select, ne pas naviguer
        if (e.target.closest('.add-to-list-btn') || e.target.closest('.list-selector')) return;
        handleGoToDetail(movie);
    };

    // Ouvre le select pour une ligne donnée
    const handleOpenSelect = (idx) => {
        setOpenSelectIndex(idx);
    };

    // Ajouter un film à une liste
    const handleAddMovie = async (movie, listId) => {
        if (!listId || !movie) return;
        try {
            await addMovie(movie, listId);
            const list = userLists.find(l => l.id === listId);
            if (list) {
                alert(`Film ajouté à la liste "${list.name}"`);
            }
            setQuery('');
            setSearchResults([]);
            setShowDropdown(false);
            setOpenSelectIndex(-1);
        } catch (err) {
            alert('Erreur lors de l\'ajout du film à la liste');
        }
    };

    return (
        <div className="add-movie-form-container">
            <div className="search-form sticky-search-bar">
                <input
                    type="text"
                    value={query}
                    onChange={e => { setQuery(e.target.value); setShowDropdown(true); }}
                    placeholder="Rechercher un film..."
                    disabled={!isAuthenticated}
                    className="search-input"
                    ref={inputRef}
                    onKeyDown={handleKeyDown}
                    autoComplete="off"
                />
                {isSearching && <div className="search-loader" />}
            </div>
            {error && <div className="search-error">{error}</div>}
            {showDropdown && searchResults.length > 0 && (
                <div className="search-dropdown search-dropdown-line" ref={dropdownRef}>
                    {searchResults.slice(0, 8).map((movie, idx) => (
                        <div
                            key={movie.id}
                            className={`search-result-line${highlightedIndex === idx ? ' highlighted' : ''}`}
                            onMouseDown={e => handleRowClick(e, movie)}
                            onMouseEnter={() => setHighlightedIndex(idx)}
                            tabIndex={0}
                            style={{ display: 'flex', alignItems: 'center', gap: 18 }}
                        >
                            {movie.poster_path ? (
                                <img src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`} alt={movie.title} className="search-result-poster" />
                            ) : (
                                <div className="search-result-no-poster">Pas d'affiche</div>
                            )}
                            <div className="search-result-info" style={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                <div style={{ fontWeight: 500, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 2 }}>{movie.title}</div>
                                <div style={{ color: '#999', fontSize: '0.98rem', flex: 1, minWidth: 60, textAlign: 'center' }}>{movie.release_date ? new Date(movie.release_date).getFullYear() : 'Date inconnue'}</div>
                            </div>
                            {userLists && userLists.length > 0 && (
                                <div className="list-selector" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
                                    <button
                                        type="button"
                                        className="add-to-list-btn"
                                        onClick={e => { e.stopPropagation(); handleOpenSelect(idx); }}
                                    >
                                        Ajouter à une liste
                                    </button>
                                    {openSelectIndex === idx && (
                                        <select
                                            autoFocus
                                            onBlur={() => setOpenSelectIndex(-1)}
                                            onChange={e => {
                                                if (e.target.value) {
                                                    handleAddMovie(movie, parseInt(e.target.value, 10));
                                                }
                                            }}
                                            defaultValue=""
                                            style={{ marginLeft: 8 }}
                                        >
                                            <option value="" disabled>Choisir une liste</option>
                                            {userLists.map(list => (
                                                <option key={list.id} value={list.id}>{list.name}</option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default AddMovieForm;