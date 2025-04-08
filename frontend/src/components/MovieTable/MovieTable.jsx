import Movie from "../Movie/Movie"
import './MovieTable.css';

function MovieTable(props) {
    return <div className="movie-table">
        {props.MovieList.map((movie) => (
            <Movie movie={movie} key={movie.title} />
        ))}
    </div>
}

export default MovieTable;