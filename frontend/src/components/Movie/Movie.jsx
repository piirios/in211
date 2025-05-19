import { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { useMovieContext } from '../../context/MovieContext';
import axios from 'axios';
import "./Movie.css"

function Movie({ movie, listId = null }) {
    const navigate = useNavigate();
    const { myMovieList, userLists, addMovie, removeMovie, createList } = useMovieContext();
    const [showListsMenu, setShowListsMenu] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const dropdownRef = useRef(null);

    // Vérifier si le film est dans la liste courante ou dans myMovieList s'il n'y a pas de listId
    const isInList = listId
        ? userLists.find(list => list.id === listId)?.movies.some(m => m.id === movie.id)
        : Array.isArray(myMovieList) && myMovieList.some(item => item && item.id === movie.id);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowListsMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleViewDetails = () => {
        navigate(`/movie/${movie.id}`);
    };

    const handleAddToList = (e) => {
        e.stopPropagation();

        if (!isInList) {
            // Si on est dans une liste spécifique, on ajoute directement à cette liste
            if (listId) {
                addMovie(movie, listId)
                    .then(() => {
                        // Message de succès
                        const listName = userLists.find(list => list.id === listId)?.name;
                        if (listName) {
                            alert(`Film ajouté à la liste "${listName}"`);
                        }
                    })
                    .catch(err => {
                        setError(err.message || "Erreur lors de l'ajout du film");
                    });
                return;
            }
            // Sinon on affiche le menu des listes
            setShowListsMenu(!showListsMenu);
        } else {
            // Si on est dans une liste spécifique, on retire de cette liste
            if (listId) {
                removeMovie(movie.id, listId)
                    .then(() => {
                        // Message de succès
                        const listName = userLists.find(list => list.id === listId)?.name;
                        if (listName) {
                            alert(`Film retiré de la liste "${listName}"`);
                        }
                    })
                    .catch(err => {
                        setError(err.message || "Erreur lors du retrait du film");
                    });
                return;
            }
            // Sinon, on retire de myMovieList
            removeMovie(movie.id);
        }
    };

    const handleAddToSpecificList = async (e, listId) => {
        e.stopPropagation();
        setLoading(true);

        try {
            // Ajouter à une liste spécifique
            await addMovie(movie, listId);

            // Message de confirmation
            const selectedList = userLists.find(list => list.id === listId);
            if (selectedList) {
                alert(`Film ajouté à la liste "${selectedList.name}"`);
            }

            setShowListsMenu(false);
            setError(null);
        } catch (err) {
            setError(err.message || "Erreur lors de l'ajout à la liste");
            console.error("Erreur lors de l'ajout à la liste:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateNewList = async (e) => {
        e.stopPropagation();
        const listName = prompt('Nom de la nouvelle liste:');

        if (!listName || !listName.trim()) return;

        setLoading(true);

        try {
            // Créer une nouvelle liste
            const newListId = await createList(listName.trim());

            if (newListId) {
                // Ajouter le film à la nouvelle liste
                await addMovie(movie, newListId);
                alert(`Film ajouté à la nouvelle liste "${listName.trim()}"`);
            } else {
                throw new Error("Impossible de créer la liste");
            }

            setShowListsMenu(false);
            setError(null);
        } catch (err) {
            setError(err.message || "Erreur lors de la création de la liste");
            console.error("Erreur lors de la création de la liste:", err);
        } finally {
            setLoading(false);
        }
    };

    const getMoviesInListText = (list) => {
        if (!list.movies || list.movies.length === 0) {
            return "Aucun film";
        }

        if (list.movies.length === 1) {
            return `1 film: ${list.movies[0].title}`;
        }

        if (list.movies.length === 2) {
            return `2 films: ${list.movies[0].title}, ${list.movies[1].title}`;
        }

        return `${list.movies.length} films: ${list.movies[0].title}, ${list.movies[1].title}, ...`;
    };

    return <div className="movie-card">
        <div className="movie-image-container">
            {movie.poster_path ? (
                <img
                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                    alt={movie.title}
                    className="movie-poster"
                />
            ) : (
                <div className="no-poster">Pas d'affiche</div>
            )}
            <div className="movie-overlay">
                <div className="movie-buttons">
                    <button
                        className="movie-btn btn-details"
                        onClick={handleViewDetails}
                    >
                        Voir détails
                    </button>

                    <button
                        className={`movie-btn ${isInList ? 'btn-remove' : 'btn-add'}`}
                        onClick={handleAddToList}
                        disabled={loading}
                    >
                        {loading ? 'Chargement...' : isInList ? 'Retirer' : listId ? 'Ajouter' : 'Ajouter à une liste'}
                    </button>

                    {showListsMenu && !listId && (
                        <div className="lists-dropdown" ref={dropdownRef}>
                            {loading ? (
                                <div className="dropdown-loading">Chargement...</div>
                            ) : error ? (
                                <div className="dropdown-error">{error}</div>
                            ) : (
                                <>
                                    <div className="dropdown-title">Choisir une liste:</div>
                                    {userLists && userLists.length > 0 ? (
                                        userLists.map(list => (
                                            <button
                                                key={list.id}
                                                className="list-option"
                                                onClick={(e) => handleAddToSpecificList(e, list.id)}
                                            >
                                                <div className="list-option-name">{list.name}</div>
                                            </button>
                                        ))
                                    ) : (
                                        <div className="no-lists">Aucune liste disponible</div>
                                    )}
                                    <button
                                        className="create-list-option"
                                        onClick={handleCreateNewList}
                                    >
                                        + Créer une nouvelle liste
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
        <h3 className="movie-title">{movie.title}</h3>
    </div>
}

export default Movie;