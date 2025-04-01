import Movie from "../Movie/Movie"
import './MovieTable.css';

function MovieTable(props) {
    console.log("into MovieTable")
    console.log(props.MovieList)
    return <div className="movie-table">
        {props.MovieList.map((movie) => (
            <Movie movieName={movie.title} key={movie.title} />
        ))}
    </div>
}

export default MovieTable;