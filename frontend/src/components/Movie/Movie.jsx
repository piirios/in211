import { useState } from "react";


function Movie(props) {
    //const [movieName, SetmovieName] = useState("Macbeth")

    return <div className="movie">
        <div className="thumbnail"></div>
        <div className="title">{props.movieName}</div>
    </div>
}

export default Movie;