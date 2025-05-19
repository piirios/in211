import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ListDetail.css';
import { useMovieContext } from '../../context/MovieContext';
import axios from 'axios';
import MovieTable from '../../components/MovieTable/MovieTable';

function ListDetail() {
    const { listId } = useParams();
    const navigate = useNavigate();
    const { userLists, removeMovie, loading: contextLoading, error: contextError } = useMovieContext();

    const [list, setList] = useState(null);
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEnriching, setIsEnriching] = useState(false);

    // Récupérer les détails de la liste et les films
    useEffect(() => {
        const fetchAndEnrichListDetails = async () => {
            if (!listId) return;
            setLoading(true);
            setIsEnriching(true);
            try {
                // Configurer axios pour le backend
                const apiClient = axios.create({
                    baseURL: `${import.meta.env.VITE_BACKEND_URL}/api`,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                // Récupérer les films de la liste
                const response = await apiClient.get(`/movies/list/${listId}`);

                let listData = null;
                let moviesData = [];
                if (response.data && response.data.list) {
                    listData = response.data.list;
                    moviesData = response.data.movies || [];
                } else {
                    // Fallback contexte
                    const listFromContext = userLists.find(l => l.id === parseInt(listId));
                    if (listFromContext) {
                        listData = listFromContext;
                        moviesData = listFromContext.movies || [];
                    } else {
                        throw new Error("Impossible de charger les détails de la liste");
                    }
                }

                // Enrichir tous les films qui n'ont pas d'affiche
                const enriched = await Promise.all(
                    moviesData.map(async (movie) => {
                        if (movie.poster_path) return movie;
                        try {
                            const response = await fetch(
                                `https://api.themoviedb.org/3/movie/${movie.id}?language=fr-FR`,
                                {
                                    headers: {
                                        'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`,
                                        'accept': 'application/json'
                                    }
                                }
                            );
                            if (!response.ok) throw new Error('Erreur TMDB');
                            const data = await response.json();
                            if (data.poster_path) {
                                return { ...movie, ...data };
                            } else {
                                return { ...movie, ...data, poster_path: null };
                            }
                        } catch (err) {
                            return { ...movie, poster_path: null };
                        }
                    })
                );
                setList(listData);
                setMovies(enriched);
                setError(null);
            } catch (err) {
                setError("Impossible de charger les détails de la liste");
            } finally {
                setLoading(false);
                setIsEnriching(false);
            }
        };
        fetchAndEnrichListDetails();
    }, [listId, userLists]);

    // Gérer le retrait d'un film de la liste
    const handleRemoveMovie = async (movieId) => {
        try {
            await removeMovie(movieId, parseInt(listId));
            setMovies(prevMovies => prevMovies.filter(movie => movie.id !== movieId));
        } catch (err) {
            console.error("Erreur lors de la suppression du film:", err);
            alert("Impossible de retirer le film de la liste");
        }
    };

    // Naviguer vers la page détaillée d'un film
    const handleViewMovie = (movieId) => {
        navigate(`/movie/${movieId}`);
    };

    // Retourner à la page d'accueil
    const goBack = () => {
        navigate('/');
    };

    // Afficher un état de chargement
    if (loading || contextLoading) {
        return (
            <div className="list-detail-container">
                <div className="loading">Chargement...</div>
            </div>
        );
    }

    // Afficher un message d'erreur
    if (error || contextError) {
        return (
            <div className="list-detail-container">
                <div className="error-message">{error || contextError}</div>
                <button onClick={goBack} className="back-button">Retour à l'accueil</button>
            </div>
        );
    }

    // Afficher un message si la liste n'existe pas
    if (!list) {
        return (
            <div className="list-detail-container">
                <div className="error-message">Liste non trouvée</div>
                <button onClick={goBack} className="back-button">Retour à l'accueil</button>
            </div>
        );
    }

    return (
        <div className="list-detail-container">
            <div className="list-header">
                <button onClick={goBack} className="back-button">
                    ← Retour
                </button>
                <h1>{list.name}</h1>
            </div>

            {movies.length === 0 ? (
                <div className="empty-list">
                    <p>Cette liste ne contient aucun film.</p>
                    <button onClick={goBack} className="back-to-home">
                        Retour à l'accueil pour ajouter des films
                    </button>
                </div>
            ) : (
                <>
                    <MovieTable MovieList={movies} listId={list.id} />
                    {isEnriching && (
                        <div className="enriching-movies">
                            <div className="loading-spinner"></div>
                            <span>Chargement des affiches...</span>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default ListDetail; 