import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ListDetail.css';

function ListDetail() {
    const { listId } = useParams();
    const navigate = useNavigate();
    const [list, setList] = useState(null);
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Données mock pour le développement
    const mockLists = {
        "1": {
            id: 1,
            name: "Films à voir",
            movies: [
                { id: 123, title: "Inception", poster_path: "/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg" },
                { id: 456, title: "Interstellar", poster_path: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg" }
            ]
        },
        "2": {
            id: 2,
            name: "Films favoris",
            movies: [
                { id: 789, title: "The Dark Knight", poster_path: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg" }
            ]
        },
        "3": {
            id: 3,
            name: "Films d'action",
            movies: []
        }
    };

    useEffect(() => {
        // Simuler un délai réseau
        setTimeout(() => {
            const selectedList = mockLists[listId];
            if (selectedList) {
                setList({
                    id: selectedList.id,
                    name: selectedList.name
                });
                setMovies(selectedList.movies || []);
                setError(null);
            } else {
                setError("Liste introuvable");
                setMovies([]);
            }
            setLoading(false);
        }, 800);
    }, [listId]);

    const handleRemoveMovie = (movieId) => {
        try {
            // Simuler la suppression d'un film de la liste
            setMovies(movies.filter(movie => movie.id !== movieId));
            // Message de confirmation
            alert("Film retiré de la liste avec succès");
        } catch (err) {
            console.error("Erreur lors de la suppression du film:", err);
            alert("Erreur lors de la suppression du film");
        }
    };

    const handleViewMovie = (movieId) => {
        navigate(`/movie/${movieId}`);
    };

    const handleBackToLists = () => {
        navigate('/lists');
    };

    if (loading) {
        return (
            <div className="list-detail-container">
                <div className="loading">
                    <span>Chargement des détails de la liste...</span>
                </div>
            </div>
        );
    }

    // Si la liste n'existe pas
    if (error) {
        return (
            <div className="list-detail-container">
                <button className="back-button" onClick={handleBackToLists}>
                    ← Retour aux listes
                </button>
                <div className="error-message">{error}</div>
                <div className="empty-list">
                    <button onClick={() => navigate('/lists')}>
                        Voir toutes mes listes
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="list-detail-container">
            <button className="back-button" onClick={handleBackToLists}>
                ← Retour aux listes
            </button>

            {list && (
                <>
                    <h1 className="list-title">{list.name}</h1>

                    {Array.isArray(movies) && movies.length === 0 ? (
                        <div className="empty-list">
                            <p>Cette liste ne contient aucun film</p>
                            <button onClick={() => navigate('/')}>
                                Parcourir les films
                            </button>
                        </div>
                    ) : (
                        <div className="movies-grid">
                            {Array.isArray(movies) && movies.map(movie => (
                                <div key={movie.id} className="movie-card">
                                    <div className="movie-poster-container">
                                        {movie.poster_path ? (
                                            <img
                                                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                                                alt={movie.title}
                                                className="movie-poster"
                                            />
                                        ) : (
                                            <div className="no-poster">
                                                Pas d'affiche
                                            </div>
                                        )}
                                        <div className="movie-overlay">
                                            <div className="movie-actions">
                                                <button
                                                    className="btn-view"
                                                    onClick={() => handleViewMovie(movie.id)}
                                                >
                                                    Voir détails
                                                </button>

                                                <button
                                                    className="btn-remove"
                                                    onClick={() => handleRemoveMovie(movie.id)}
                                                >
                                                    Retirer
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <h3 className="movie-title" title={movie.title}>
                                        {movie.title}
                                    </h3>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default ListDetail; 