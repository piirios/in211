import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import "./Movie.css"


function Movie(props) {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/movie/${props.movie.id}`);
    };

    return <div className="movie" onClick={handleClick}>
        <div className="thumbnail"><img src={"https://image.tmdb.org/t/p/w154" + props.movie.poster_path} /></div>
        <div className="title">{props.movie.title}</div>
    </div>
}

export default Movie;