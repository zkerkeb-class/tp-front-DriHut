import useSWR from "swr"
import PokeCard from "./PokeCard"
import { Link, useParams, useNavigate } from "react-router";
import { useState } from "react";

const PokePage = () => {
    const id = useParams().id;
    const navigate = useNavigate();
    const { data: pokemon, isLoading } = useSWR(`http://localhost:3000/pokemon/${id}`);
    const [ show, setShow ] = useState(false);
    const [ deleting, setDeleting ] = useState(false);

    const handleDelete = async () => {
        setDeleting(true);
        try {
            const response = await fetch(`http://localhost:3000/pokemon/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete pokemon');
            }
            
            // Navigate to home page
            navigate('/');
        } catch (error) {
            console.error('Error deleting pokemon:', error);
            setDeleting(false);
        }
    };

    if (isLoading) return <p>Chargement...</p>


    return (
        <div className="poke-page">
            <div className="poke-page-header squada-one-regular">
                <Link to="/" className="btn">
                    <span className="material-symbols-outlined">arrow_back</span>
                    Back Home
                </Link>
                <h1 className="poke-page-title">#{pokemon.id} {pokemon.name.substring(0, 1).toUpperCase() + pokemon.name.substring(1)}</h1>
                <div>
                    <button className="btn" style={{lineHeight: '30px'}} onClick={() => setShow(true)}>
                        <span className="material-symbols-outlined">delete</span>
                        Delete
                    </button>
                    <Link to={'/pokemon/' + pokemon.id + "/edit"} className="btn btn-primary">
                        <span className="material-symbols-outlined">edit</span>
                        Edit
                    </Link>
                </div>
            </div>
            <hr/>
            <div className="poke-page-container">
                <PokeCard pokemon={pokemon}/>
            </div>

            {show && (
                <div className="modal-overlay squada-one-regular" onClick={() => setShow(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>Delete "{pokemon.name.charAt(0).toUpperCase()}{pokemon.name.slice(1).toLowerCase()}" ?</h2>
                        <p>Are you sure you want get rid of this pokemon ?</p>
                        <p>This action cannot be undone.</p>
                        <div className="modal-actions">
                            <button 
                                className="btn" 
                                onClick={() => setShow(false)}
                                disabled={deleting}
                            >
                                <span className="material-symbols-outlined">close</span>
                                Cancel
                            </button>
                            <button 
                                className="btn btn-primary" 
                                onClick={handleDelete}
                                disabled={deleting}
                            >
                                <span className="material-symbols-outlined">delete</span>
                                {deleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default PokePage