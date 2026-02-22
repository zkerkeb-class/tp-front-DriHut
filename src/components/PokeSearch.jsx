import { useState } from "react";
import { Link } from "react-router";
import PokeList from "./PokeList";

const PokeSearch = () => {
    const [ search, setSearch ] = useState("");
    return (
        <div>
            <div className="poke-list-header">
                <h2>Liste des Pokémon</h2>
                <div className="header-controls">
                    <input type="text" placeholder="Search Pokémon" className="input" value={search} onChange={(e) => setSearch(e.target.value)} />
                    <Link to="/create" className="btn btn-primary">
                        <span className="material-symbols-outlined">add</span>
                        Create New Pokémon
                    </Link>
                </div>
            </div>
            <hr/>
            <PokeList search={search} />
        </div>
    );
};

export default PokeSearch;
