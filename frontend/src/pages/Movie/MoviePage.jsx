import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useMovieContext } from '../../context/MovieContext';
import './MoviePage.css';

function MoviePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { myMovieList, addMovie, removeMovie } = useMovieContext();

    useEffect(() => {
        const fetchMovieDetails = async () => {
            try {
                console.log(`https://api.themoviedb.org/3/movie/${id}`)
                const response = await axios.get(`https://api.themoviedb.org/3/movie/${id}`, {
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
            } catch (error) {
                console.error('Erreur:', error);
                setError('Impossible de charger les détails du film');
            } finally {
                setLoading(false);
            }
        };

        fetchMovieDetails();
    }, [id]);

    const handleAddToList = () => {
        if (!movie) return;

        const isInList = myMovieList.some(m => m.id === movie.id);

        if (isInList) {
            removeMovie(movie.id);
        } else {
            addMovie(movie);
        }
    };

    const handleBackToHome = () => {
        navigate('/');
    };

    if (loading) {
        return <div className="loading">Chargement...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    const isInList = movie ? myMovieList.some(m => m.id === movie.id) : false;

    return (
        <div className="movie-details-container">
            <button className="back-to-home" onClick={handleBackToHome}>
                <span className="back-arrow">&#8592;</span> Retour
            </button>

            <div className="movie-details-content">
                <div className="movie-poster-section">
                    {movie?.poster_path ? (
                        <img
                            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                            alt={movie.title}
                            className="movie-details-poster"
                        />
                    ) : (
                        <div className="no-poster">Pas d'affiche disponible</div>
                    )}
                </div>

                <div className="movie-info-section">
                    <h1 className="movie-title">{movie?.title || "Titre inconnu"}</h1>

                    <div className="movie-meta">
                        {movie?.release_date && (
                            <div className="meta-item">
                                <span className="meta-label">Année:</span>
                                <span className="meta-value">{movie.release_date.substring(0, 4)}</span>
                            </div>
                        )}

                        {(movie?.runtime && movie.runtime > 0) && (
                            <div className="meta-item">
                                <span className="meta-label">Durée:</span>
                                <span className="meta-value">{movie.runtime} min</span>
                            </div>
                        )}

                        {(movie?.vote_average !== undefined) && (
                            <div className="meta-item">
                                <span className="meta-label">Note:</span>
                                <span className="meta-value">{parseFloat(movie.vote_average).toFixed(1)}/10</span>
                            </div>
                        )}
                    </div>

                    <button
                        className={`btn-list ${isInList ? 'in-list' : 'add-to-list'}`}
                        onClick={handleAddToList}
                    >
                        {isInList ? 'Retirer de ma liste' : 'Ajouter à ma liste'}
                    </button>

                    {movie?.genres && movie.genres.length > 0 && (
                        <div className="movie-genres">
                            <h3>Genres</h3>
                            <div className="genres-list">
                                {movie.genres.map(genre => (
                                    <span key={genre.id} className="genre-tag">{genre.name}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="movie-synopsis">
                        <h2>Synopsis</h2>
                        <p>{movie?.overview || 'Aucun synopsis disponible.'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MoviePage;