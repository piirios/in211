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
    const { myMovieList, userLists, userId, addMovie, removeMovie, createList } = useMovieContext();
    const [showListsMenu, setShowListsMenu] = useState(false);
    const [listsLoading, setListsLoading] = useState(false);

    // État pour les commentaires
    const [comments, setComments] = useState([]);
    const [commentsLoading, setCommentsLoading] = useState(true);
    const [userComment, setUserComment] = useState(null);
    const [newComment, setNewComment] = useState('');
    const [rating, setRating] = useState(5);
    const [commentError, setCommentError] = useState(null);

    // Configuration d'axios pour le backend
    const apiClient = axios.create({
        baseURL: `${import.meta.env.VITE_BACKEND_URL}/api`,
        headers: {
            'Content-Type': 'application/json'
        }
    });

    // Récupérer les détails du film depuis l'API TMDB
    useEffect(() => {
        const fetchMovieDetails = async () => {
            try {
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

                // Sauvegarder les informations du film dans notre base de données
                try {
                    await apiClient.post('/movies/save', {
                        id: response.data.id,
                        title: response.data.title,
                        poster_path: response.data.poster_path
                    });
                } catch (err) {
                    console.error("Erreur lors de la sauvegarde du film:", err);
                }

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

    // Charger les commentaires depuis le backend
    useEffect(() => {
        if (id) {
            setCommentsLoading(true);

            const fetchComments = async () => {
                try {
                    const response = await apiClient.get(`/comment/movie/${id}`);
                    setComments(response.data.comments || []);

                    // Vérifier si l'utilisateur actuel a déjà un commentaire
                    if (userId && response.data.comments) {
                        const userExistingComment = response.data.comments.find(
                            comment => comment.user && comment.user.id === userId
                        );

                        if (userExistingComment) {
                            setUserComment(userExistingComment);
                            setNewComment(userExistingComment.content);
                            setRating(userExistingComment.score);
                        }
                    }

                    setCommentError(null);
                } catch (err) {
                    console.error("Erreur lors du chargement des commentaires:", err);
                    setCommentError("Impossible de charger les commentaires");
                } finally {
                    setCommentsLoading(false);
                }
            };

            fetchComments();
        }
    }, [id, userId]);

    const handleAddToList = () => {
        if (!movie) return;
        setShowListsMenu(!showListsMenu);
    };

    const handleAddToSpecificList = async (listId) => {
        try {
            await addMovie(movie, listId);
            setShowListsMenu(false);
            alert(`Film ajouté à la liste avec succès`);
        } catch (err) {
            console.error("Erreur lors de l'ajout du film à la liste:", err);
        }
    };

    const handleCreateNewList = async () => {
        const listName = prompt('Nom de la nouvelle liste:');

        if (listName && listName.trim()) {
            try {
                const newListId = await createList(listName.trim());
                if (newListId) {
                    await addMovie(movie, newListId);
                    alert(`Film ajouté à la nouvelle liste "${listName.trim()}"`);
                }
                setShowListsMenu(false);
            } catch (err) {
                console.error("Erreur lors de la création de la liste:", err);
            }
        }
    };

    // Fonction utilitaire pour recharger les commentaires
    const reloadComments = async () => {
        setCommentsLoading(true);
        try {
            const response = await apiClient.get(`/comment/movie/${id}`);
            setComments(response.data.comments || []);
            setCommentError(null);
        } catch (err) {
            setCommentError("Impossible de charger les commentaires");
        } finally {
            setCommentsLoading(false);
        }
    };

    const handleSubmitComment = async (e) => {
        e.preventDefault();

        if (!newComment.trim()) {
            setCommentError('Le commentaire ne peut pas être vide');
            return;
        }

        try {
            if (userComment) {
                // Mise à jour d'un commentaire existant
                await apiClient.put(`/comment/${userComment.id}`, {
                    content: newComment,
                    score: rating
                });
            } else {
                // Création d'un nouveau commentaire
                await apiClient.post('/comment', {
                    content: newComment,
                    score: rating,
                    userId: userId,
                    movieId: parseInt(id)
                });
            }
            // Recharge la liste complète pour avoir le nom/prénom
            await reloadComments();
            // Met à jour le commentaire utilisateur local
            if (userId) {
                const userExistingComment = comments.find(
                    comment => comment.user && comment.user.id === userId
                );
                setUserComment(userExistingComment || null);
            }
            setCommentError(null);
        } catch (err) {
            setCommentError("Impossible d'enregistrer le commentaire");
        }
    };

    const handleDeleteComment = async () => {
        if (!userComment) return;

        if (!window.confirm('Êtes-vous sûr de vouloir supprimer votre commentaire ?')) return;

        try {
            await apiClient.delete(`/comment/${userComment.id}`);

            // Mettre à jour l'état local
            setComments(comments.filter(comment => comment.id !== userComment.id));
            setUserComment(null);
            setNewComment('');
            setRating(5);
            setCommentError(null);
        } catch (err) {
            console.error("Erreur lors de la suppression du commentaire:", err);
            setCommentError("Impossible de supprimer le commentaire");
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

    const isInList = movie ? Array.isArray(myMovieList) && myMovieList.some(m => m && m.id === movie.id) : false;

    // Choix de l'image de fond
    const bgImage = movie?.backdrop_path || movie?.poster_path
        ? `https://image.tmdb.org/t/p/original${movie.backdrop_path || movie.poster_path}`
        : null;

    return (
        <div className="movie-hero" style={bgImage ? { backgroundImage: `url(${bgImage})` } : {}}>
            <div className="movie-hero-overlay">
                <button className="back-to-home" onClick={handleBackToHome}>
                    <span className="back-arrow">&#8592;</span> Retour
                </button>
                <div className="movie-main-content">
                    <div className="movie-main-left">
                        {movie?.poster_path ? (
                            <img
                                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                                alt={movie.title}
                                className="movie-main-poster"
                            />
                        ) : (
                            <div className="no-poster movie-main-poster">Pas d'affiche disponible</div>
                        )}
                    </div>
                    <div className="movie-main-right">
                        <h1 className="movie-title-main">{movie?.title || "Titre inconnu"}</h1>
                        {movie?.tagline && <div className="tagline">{movie.tagline}</div>}
                        <div className="movie-meta">
                            {movie?.release_date && (
                                <span>{movie.release_date.substring(0, 4)}</span>
                            )}
                            {movie?.runtime && (
                                <span>{movie.runtime} min</span>
                            )}
                            {movie?.vote_average !== undefined && (
                                <span className="rating">★ {parseFloat(movie.vote_average).toFixed(1)}/10</span>
                            )}
                        </div>
                        {movie?.genres && movie.genres.length > 0 && (
                            <div className="genres">
                                {movie.genres.map(genre => (
                                    <span key={genre.id} className="genre-tag">{genre.name}</span>
                                ))}
                            </div>
                        )}
                        <div className="add-to-list-section">
                            <button
                                className="btn-add-to-list"
                                onClick={handleAddToList}
                            >
                                Ajouter à une liste
                            </button>
                            {showListsMenu && (
                                <div className="lists-dropdown movie-detail-dropdown">
                                    {listsLoading ? (
                                        <div className="dropdown-loading">Chargement...</div>
                                    ) : (
                                        <>
                                            <div className="dropdown-title">Choisir une liste:</div>
                                            {Array.isArray(userLists) && userLists.length > 0 ? (
                                                userLists.map(list => (
                                                    <button
                                                        key={list.id}
                                                        className="list-option"
                                                        onClick={() => handleAddToSpecificList(list.id)}
                                                    >
                                                        {list.name}
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
                        {movie?.overview && (
                            <div className="overview">
                                {movie.overview}
                            </div>
                        )}
                    </div>
                </div>
                <div className="comments-section">
                    <h2>Commentaires</h2>
                    <div className="comment-form-container">
                        <form className="comment-form" onSubmit={handleSubmitComment}>
                            <div className="rating-container">
                                <label>Votre note :</label>
                                <div className="rating-input">
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                        <button
                                            type="button"
                                            key={num}
                                            className={`rating-btn${rating === num ? ' active' : ''}`}
                                            onClick={() => setRating(num)}
                                        >
                                            {num}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Votre commentaire..."
                                required
                            ></textarea>
                            {commentError && <div className="comment-error">{commentError}</div>}
                            <div className="comment-actions">
                                <button type="submit" className="btn-submit">
                                    {userComment ? 'Mettre à jour' : 'Commenter'}
                                </button>
                                {userComment && (
                                    <button
                                        type="button"
                                        className="btn-delete"
                                        onClick={handleDeleteComment}
                                    >
                                        Supprimer
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                    <div className="comments-list">
                        {commentsLoading ? (
                            <div className="comments-loading">Chargement des commentaires...</div>
                        ) : comments.length === 0 ? (
                            <div className="no-comments">Soyez le premier à commenter ce film</div>
                        ) : (
                            comments.map(comment => (
                                <div key={comment.id} className="comment-card">
                                    <div className="comment-header">
                                        <span className="comment-author">
                                            {(comment.user && comment.user.firstname && comment.user.lastname)
                                                ? `${comment.user.firstname} ${comment.user.lastname}`
                                                : <span className="anonymous-badge">(anonyme)</span>
                                            }
                                        </span>
                                        <span className="comment-score">
                                            Note: {comment.score}/10
                                        </span>
                                    </div>
                                    <div className="comment-content">{comment.content}</div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MoviePage;