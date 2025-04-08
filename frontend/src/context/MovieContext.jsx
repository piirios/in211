import { createContext, useState, useContext } from 'react';

// Création du contexte
const MovieContext = createContext();

// Hook personnalisé pour utiliser le contexte
export const useMovieContext = () => useContext(MovieContext);

// Provider du contexte
export const MovieProvider = ({ children }) => {
    const [myMovieList, setMyMovieList] = useState([]);

    // Vous pouvez ajouter d'autres fonctions utiles ici
    const addMovie = (movie) => {
        setMyMovieList(prevList => [...prevList, movie]);
    };

    const removeMovie = (movieId) => {
        setMyMovieList(prevList => prevList.filter(movie => movie.id !== movieId));
    };

    return (
        <MovieContext.Provider value={{ myMovieList, setMyMovieList, addMovie, removeMovie }}>
            {children}
        </MovieContext.Provider>
    );
};