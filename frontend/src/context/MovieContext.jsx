import { createContext, useState, useContext, useEffect } from 'react';

// Création du contexte
const MovieContext = createContext();

// Hook personnalisé pour utiliser le contexte
export const useMovieContext = () => useContext(MovieContext);

// Provider du contexte
export const MovieProvider = ({ children }) => {
    const [myMovieList, setMyMovieList] = useState([]);
    const [userLists, setUserLists] = useState([]);

    // Données mock pour le développement
    const mockLists = [
        {
            id: 1, name: "Films à voir", movies: [
                { id: 11, title: "The Matrix", poster_path: "/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg" },
                { id: 12, title: "Inception", poster_path: "/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg" }
            ]
        },
        {
            id: 2, name: "Films favoris", movies: [
                { id: 13, title: "The Dark Knight", poster_path: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg" }
            ]
        },
        {
            id: 3, name: "Films d'action", movies: [
                { id: 14, title: "Die Hard", poster_path: "/yFihWxQcmqcaBR31QM6Y8gT6aYV.jpg" },
                { id: 15, title: "John Wick", poster_path: "/wXqWR7dHncNRbxoEGybEy7QTe9h.jpg" },
                { id: 18, title: "Mad Max: Fury Road", poster_path: "/8tZYtuWezp8JbcsvHYO0O46tFbo.jpg" }
            ]
        },
        {
            id: 4, name: "Comédies", movies: [
                { id: 16, title: "The Hangover", poster_path: "/uH1cuq2hmQKZzMjAZx0oiewF9zT.jpg" }
            ]
        },
        {
            id: 5, name: "Science-fiction", movies: [
                { id: 17, title: "Blade Runner", poster_path: "/63N9uy8nd9j7Eog2axPQ8lbr3Wj.jpg" },
                { id: 19, title: "Interstellar", poster_path: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg" }
            ]
        },
        { id: 6, name: "Thrillers", movies: [] }
    ];

    // Initialiser les listes au chargement
    useEffect(() => {
        setUserLists(mockLists);
        // Pour la compatibilité existante, on met tous les films de la première liste dans myMovieList
        if (mockLists.length > 0 && mockLists[0].movies.length > 0) {
            setMyMovieList(mockLists[0].movies);
        }
    }, []);

    // Ajouter un film à la liste
    const addMovie = (movie, listId = null) => {
        if (!movie) return;

        // Si listId est spécifié, ajouter le film à cette liste spécifique
        if (listId) {
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

        // Pour la compatibilité existante, on continue d'utiliser myMovieList
        setMyMovieList(prevList => {
            // Vérifier si prevList est un tableau
            if (!Array.isArray(prevList)) return [movie];

            // Vérifier si le film est déjà dans la liste
            if (prevList.some(item => item && item.id === movie.id)) {
                return prevList;
            }

            return [...prevList, movie];
        });
    };

    // Retirer un film d'une liste
    const removeMovie = (movieId, listId = null) => {
        if (!movieId) return;

        // Si listId est spécifié, retirer le film de cette liste spécifique
        if (listId) {
            setUserLists(prevLists =>
                prevLists.map(list =>
                    list.id === listId
                        ? { ...list, movies: list.movies.filter(movie => movie.id !== movieId) }
                        : list
                )
            );
        }

        // Pour la compatibilité existante
        setMyMovieList(prevList => {
            // Vérifier si prevList est un tableau
            if (!Array.isArray(prevList)) return [];

            return prevList.filter(movie => movie && movie.id !== movieId);
        });
    };

    // Créer une nouvelle liste
    const createList = (name) => {
        if (!name || !name.trim()) return null;

        const newListId = userLists.length > 0
            ? Math.max(...userLists.map(list => list.id)) + 1
            : 1;

        const newList = { id: newListId, name: name.trim(), movies: [] };

        setUserLists(prevLists => [...prevLists, newList]);

        return newListId;
    };

    // Supprimer une liste
    const deleteList = (listId) => {
        if (!listId) return;

        setUserLists(prevLists => prevLists.filter(list => list.id !== listId));
    };

    // Mettre à jour le nom d'une liste
    const updateListName = (listId, newName) => {
        if (!listId || !newName || !newName.trim()) return;

        setUserLists(prevLists =>
            prevLists.map(list =>
                list.id === listId
                    ? { ...list, name: newName.trim() }
                    : list
            )
        );
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
            updateListName
        }}>
            {children}
        </MovieContext.Provider>
    );
};