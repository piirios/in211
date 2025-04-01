import { useState } from "react"


function AddMovieForm(props) {
    const [FormEntry, SetFormEntry] = useState("")
    const handleChange = (e) => SetFormEntry(e.target.value);
    function OnSubmit(e) {
        e.preventDefault();
        console.log(props.MovieList)
        props.SetMovieList([...props.MovieList, { title: FormEntry }])
        SetFormEntry("")
        console.log(props.MovieList)
    }
    return <form onSubmit={OnSubmit}>
        <input type="text" name="" id="movieTitle" value={FormEntry} onChange={handleChange} />
        <button type="submit">Ajouter</button>
    </form>
}

export default AddMovieForm