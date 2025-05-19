import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useMovieContext } from '../../context/MovieContext';
import './MoviePage.css';

function MoviePage() {
    const { movieId } = useParams();
    const navigate = useNavigate();
    const { userLists, addMovie } = useMovieContext();

    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedListId, setSelectedListId] = useState('');

    // Récupérer les détails du film
    useEffect(() => {
        const fetchMovieDetails = async () => {
            if (!movieId) return;

            setLoading(true);
            try {
                const response = await axios.get(`https://api.themoviedb.org/3/movie/${movieId}`, {
                    params: {
                        language: 'fr-FR',
                    },
                    headers: {
                        'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`,
                        'accept': 'application/json'
                    }
                });

                setMovie(response.data);
                setError(null);
            } catch (err) {
                console.error('Erreur lors de la récupération des détails du film:', err);
                setError('Impossible de charger les détails du film');
                setMovie(null);
            } finally {
                setLoading(false);
            }
        };

        fetchMovieDetails();
    }, [movieId]);

    // Gérer l'ajout à une liste
    const handleAddToList = async () => {
        if (!selectedListId || !movie) return;

        try {
            await addMovie(movie, parseInt(selectedListId));

            // Message de confirmation
            const selectedList = userLists.find(list => list.id === parseInt(selectedListId));
            if (selectedList) {
                alert(`Film ajouté à la liste "${selectedList.name}"`);
            }

            // Réinitialiser la sélection
            setSelectedListId('');
        } catch (err) {
            console.error('Erreur lors de l\'ajout du film à la liste:', err);
            alert('Erreur lors de l\'ajout du film à la liste');
        }
    };

    // Retourner à la page d'accueil
    const goBack = () => {
        navigate('/');
    };

    // Afficher un état de chargement
    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading">Chargement...</div>
            </div>
        );
    }

    // Afficher un message d'erreur
    if (error || !movie) {
        return (
            <div className="error-container">
                <div className="error-message">{error || 'Film non trouvé'}</div>
                <button onClick={goBack} className="back-to-home">Retour à l'accueil</button>
            </div>
        );
    }

    // Formater la date de sortie
    const formatReleaseDate = (dateString) => {
        if (!dateString) return 'Date inconnue';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }).format(date);
    };

    // Formater le budget/revenu
    const formatCurrency = (amount) => {
        if (!amount) return 'Non communiqué';
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className="movie-page">
            <button onClick={goBack} className="back-to-home">
                ← Retour
            </button>

            <div className="movie-backdrop" style={{
                backgroundImage: movie.backdrop_path
                    ? `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`
                    : 'none'
            }}>
                <div className="backdrop-overlay"></div>
            </div>

            <div className="movie-content">
                <div className="movie-poster-container">
                    {movie.poster_path ? (
                        <img
                            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                            alt={movie.title}
                            className="movie-poster"
                        />
                    ) : (
                        <div className="no-poster">Pas d'affiche</div>
                    )}
                </div>

                <div className="movie-details">
                    <h1 className="movie-title">{movie.title}</h1>

                    {movie.tagline && (
                        <div className="movie-tagline">{movie.tagline}</div>
                    )}

                    <div className="movie-info">
                        <div className="info-item">
                            <span className="info-label">Date de sortie:</span>
                            <span className="info-value">{formatReleaseDate(movie.release_date)}</span>
                        </div>

                        <div className="info-item">
                            <span className="info-label">Durée:</span>
                            <span className="info-value">
                                {movie.runtime ? `${movie.runtime} minutes` : 'Non communiquée'}
                            </span>
                        </div>

                        <div className="info-item">
                            <span className="info-label">Genres:</span>
                            <span className="info-value">
                                {movie.genres && movie.genres.length > 0
                                    ? movie.genres.map(genre => genre.name).join(', ')
                                    : 'Non communiqués'
                                }
                            </span>
                        </div>

                        <div className="info-item">
                            <span className="info-label">Note:</span>
                            <span className="info-value">
                                {movie.vote_average ? `${(movie.vote_average).toFixed(1)}/10` : 'Non communiquée'}
                            </span>
                        </div>

                        <div className="info-item">
                            <span className="info-label">Budget:</span>
                            <span className="info-value">{formatCurrency(movie.budget)}</span>
                        </div>

                        <div className="info-item">
                            <span className="info-label">Recettes:</span>
                            <span className="info-value">{formatCurrency(movie.revenue)}</span>
                        </div>
                    </div>

                    <div className="movie-overview">
                        <h3>Synopsis</h3>
                        <p>{movie.overview || 'Aucun synopsis disponible'}</p>
                    </div>

                    <div className="add-to-list-section">
                        {userLists && userLists.length > 0 ? (
                            <>
                                <div className="list-selector">
                                    <select
                                        value={selectedListId}
                                        onChange={(e) => setSelectedListId(e.target.value)}
                                    >
                                        <option value="" disabled>Choisir une liste</option>
                                        {userLists.map(list => (
                                            <option key={list.id} value={list.id}>
                                                {list.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <button
                                    className="add-to-list-button"
                                    onClick={handleAddToList}
                                    disabled={!selectedListId}
                                >
                                    Ajouter à la liste
                                </button>
                            </>
                        ) : (
                            <p className="no-lists-message">Aucune liste disponible</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MoviePage; 