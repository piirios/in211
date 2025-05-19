import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import WelcomeUserModal from '../components/WelcomeUserModal/WelcomeUserModal';
import { v4 as uuidv4 } from 'uuid';

// Création du contexte
const MovieContext = createContext();

// Hook personnalisé pour utiliser le contexte
export const useMovieContext = () => useContext(MovieContext);

// Provider du contexte
export const MovieProvider = ({ children }) => {
    const [myMovieList, setMyMovieList] = useState([]);
    const [userLists, setUserLists] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [userId, setUserId] = useState(null);
    const [showWelcome, setShowWelcome] = useState(false);
    const [pendingUser, setPendingUser] = useState(null);
    const [userUuid, setUserUuid] = useState(null);

    // Configuration d'axios pour le backend
    const apiClient = axios.create({
        baseURL: `${import.meta.env.VITE_BACKEND_URL}/api`,
        headers: {
            'Content-Type': 'application/json'
        }
    });

    // Au démarrage, vérifier si l'utilisateur existe ou en créer un nouveau
    useEffect(() => {
        // On cherche l'uuid dans le localStorage ou on le crée
        let uuid = localStorage.getItem('user_uuid');
        if (!uuid) {
            uuid = uuidv4();
            localStorage.setItem('user_uuid', uuid);
        }
        setUserUuid(uuid);

        // Vérifier si l'utilisateur existe déjà côté backend
        const checkUserExists = async () => {
            try {
                const res = await apiClient.get(`/users/exists/${uuid}`);
                if (res.data.exists) {
                    // L'utilisateur existe, on récupère ses infos
                    setShowWelcome(false);
                    // On peut aller chercher les listes, etc.
                    setUserId(uuid);
                    await fetchUserLists(uuid);
                } else {
                    // L'utilisateur n'existe pas, on affiche la popup
                    setShowWelcome(true);
                }
            } catch (err) {
                setError("Erreur lors de la vérification de l'utilisateur");
                setShowWelcome(true);
            }
        };
        checkUserExists();
    }, []);

    // Nouvelle fonction pour enregistrer l'utilisateur avec uuid
    const registerUser = async (firstname, lastname, email) => {
        if (!userUuid || !firstname || !lastname || !email) return;
        try {
            setLoading(true);
            await apiClient.post('/users/register', {
                uuid: userUuid,
                firstname,
                lastname,
                email
            });
            setUserId(userUuid);
            localStorage.setItem('user_firstname', firstname);
            localStorage.setItem('user_lastname', lastname);
            localStorage.setItem('user_email', email);
            setShowWelcome(false);
            await fetchUserLists(userUuid);
            setError(null);
        } catch (err) {
            setError("Impossible d'enregistrer l'utilisateur");
        } finally {
            setLoading(false);
        }
    };

    // Fonction pour récupérer les listes de l'utilisateur
    const fetchUserLists = async (userIdToFetch = null) => {
        const id = userIdToFetch || userId;
        if (!id) {
            console.error("Aucun ID utilisateur disponible");
            return;
        }

        try {
            setLoading(true);
            const response = await apiClient.get(`/lists/${id}`);
            setUserLists(response.data.lists);

            // Pour la compatibilité existante, on met tous les films de la première liste dans myMovieList
            if (response.data.lists.length > 0 && response.data.lists[0].movies.length > 0) {
                setMyMovieList(response.data.lists[0].movies);
            }

            setError(null);
        } catch (err) {
            console.error("Erreur lors du chargement des listes:", err);
            setError("Impossible de charger les listes");
        } finally {
            setLoading(false);
        }
    };

    // Ajouter un film à une liste
    const addMovie = async (movie, listId = null) => {
        if (!movie || !userId) return;

        try {
            if (listId) {
                // Ajouter le film à une liste spécifique via l'API
                await apiClient.post(`/movies/list/${listId}/movie/${movie.id}`);

                // Mettre à jour l'état local après l'ajout
                setUserLists(prevLists =>
                    prevLists.map(list =>
                        list.id === listId
                            ? {
                                ...list,
                                movies: list.movies.some(m => m.id === movie.id)
                                    ? list.movies
                                    : [...list.movies, movie]
                            }
                            : list
                    )
                );
            }

            // Pour la compatibilité existante
            if (movie && !Array.isArray(myMovieList) || !myMovieList.some(item => item && item.id === movie.id)) {
                setMyMovieList(prevList => Array.isArray(prevList) ? [...prevList, movie] : [movie]);
            }
        } catch (err) {
            console.error("Erreur lors de l'ajout du film:", err);
            setError("Impossible d'ajouter le film à la liste");
        }
    };

    // Retirer un film d'une liste
    const removeMovie = async (movieId, listId = null) => {
        if (!movieId || !userId) return;

        try {
            if (listId) {
                // Supprimer le film d'une liste spécifique via l'API
                await apiClient.delete(`/movies/list/${listId}/movie/${movieId}`);

                // Mettre à jour l'état local après la suppression
                setUserLists(prevLists =>
                    prevLists.map(list =>
                        list.id === listId
                            ? { ...list, movies: list.movies.filter(movie => movie.id !== movieId) }
                            : list
                    )
                );
            }

            // Pour la compatibilité existante
            setMyMovieList(prevList => Array.isArray(prevList)
                ? prevList.filter(movie => movie && movie.id !== movieId)
                : []);
        } catch (err) {
            console.error("Erreur lors de la suppression du film:", err);
            setError("Impossible de retirer le film de la liste");
        }
    };

    // Créer une nouvelle liste
    const createList = async (name) => {
        if (!name || !name.trim() || !userId) return null;

        try {
            const response = await apiClient.post(`/lists/${userId}`, { name: name.trim() });
            const newList = response.data;

            // Mettre à jour l'état local avec la nouvelle liste
            setUserLists(prevLists => [...prevLists, { ...newList, movies: [] }]);
            return newList.id;
        } catch (err) {
            console.error("Erreur lors de la création de la liste:", err);
            setError("Impossible de créer la liste");
            return null;
        }
    };

    // Supprimer une liste
    const deleteList = async (listId) => {
        if (!listId) return;

        try {
            await apiClient.delete(`/lists/${listId}`);
            setUserLists(prevLists => prevLists.filter(list => list.id !== listId));
        } catch (err) {
            console.error("Erreur lors de la suppression de la liste:", err);
            setError("Impossible de supprimer la liste");
        }
    };

    // Mettre à jour le nom d'une liste
    const updateListName = async (listId, newName) => {
        if (!listId || !newName || !newName.trim()) return;

        try {
            await apiClient.put(`/lists/${listId}`, { name: newName.trim() });
            setUserLists(prevLists =>
                prevLists.map(list =>
                    list.id === listId
                        ? { ...list, name: newName.trim() }
                        : list
                )
            );
        } catch (err) {
            console.error("Erreur lors de la mise à jour du nom de la liste:", err);
            setError("Impossible de mettre à jour le nom de la liste");
        }
    };

    const handleWelcomeSubmit = ({ firstname, lastname, email }) => {
        registerUser(firstname, lastname, email);
    };

    return (
        <MovieContext.Provider value={{
            myMovieList,
            setMyMovieList,
            addMovie,
            removeMovie,
            userLists,
            setUserLists,
            createList,
            deleteList,
            updateListName,
            loading,
            error,
            refreshLists: () => fetchUserLists(),
            userId,
            userUuid,
        }}>
            {showWelcome && <WelcomeUserModal onSubmit={handleWelcomeSubmit} />}
            {children}
        </MovieContext.Provider>
    );
};