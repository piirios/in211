import React from 'react';
import Movie from '../Movie/Movie';
import './MovieTable.css';

function MovieTable({ MovieList, listId = null }) {
    return <div className="movie-table">
        {Array.isArray(MovieList) && MovieList.map((movie, index) => (
            <Movie key={`${movie.id}-${index}`} movie={movie} listId={listId} />
        ))}
    </div>
}

export default MovieTable;