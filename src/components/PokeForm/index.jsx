import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import useSWR, { preload } from "swr";
import { Autocomplete, Slider, TextField } from "@mui/material";
import { useExtractColors } from "react-extract-colors";
import PokeCard, { AttackCard, STAT_COLOR } from "../PokeCard";
import { useNavigate } from "react-router";
import "./styles.css";

const PokeForm = () => {
    const [ stage , setStage ] = useState('about');
    const id = useParams().id;
    const { data } = useSWR(id ? `http://localhost:3000/pokemon/${id}` : null);
    const navigate = useNavigate();

    const [ formData, setFormData ] = useState({
        name: "",
        lore: "",
        sprites: {
            front: null,
            back: null
        },
        types: [],
        attacks: [],
        evolutions: [],
        stats: {
            hp: 0,
            attack: 0,
            defense: 0,
            'special-attack': 0,
            'special-defense': 0,
            speed: 0
        }
    });
    const [ submitting, setSubmitting ] = useState(false);
    
    useEffect(() => {
        if (!data) return;

        console.log(data); // IGNORE
        const load = async () => {
            const evolutions = await Promise.all(data.evolutions.map(e => fetch(`http://localhost:3000${e}`).then(res => res.json())));

            setFormData({
                ...data,
                evolutions,
            });
        }

        load();
    }, [data]);

    useEffect(() => {
        const preloadData = async () => {
            const fetcher = (resource, init) => fetch(resource, init).then(res => res.json());
            preload('http://localhost:3000/form/types', fetcher);
            preload('http://localhost:3000/form/pokemons', fetcher);
            preload('http://localhost:3000/form/attacks', fetcher);
        }
        preloadData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const response = await fetch('http://localhost:3000/pokemon/' + (id ?? ''), {
                method: id ? 'PATCH' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Failed to create pokemon');
            }
            
            navigate('/');
        } catch (error) {
            console.error('Error creating pokemon:', error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="poke-form-container squada-one-regular">
            <div className="poke-page-header">
                <Link to="/" className="btn">
                    <span className="material-symbols-outlined">arrow_back</span>
                    Back
                </Link>
                <h1 className="poke-page-title">{id ? 'Edit' : 'Create New'} Pokemon</h1>
            </div>
            <hr/>
            <div className="poke-form-card">
                <PokeCard pokemon={{ ...formData, id: "" }} />
                <div className="poke-form">
                    <StageProgress stage={stage} setStage={setStage} />
                    <Stage stage={stage} formData={formData} onChange={handleChange} />
                    <StageNav stage={stage} setStage={setStage} onSubmit={handleSubmit} />
                </div>
            </div>
        </div>
    );
};

const Stage = ({ stage, formData, onChange }) => {
    switch(stage) {
        case 'about':
            return <AboutStage formData={formData} onChange={onChange} />
        case 'evolutions':
            return <EvolutionsStage formData={formData} onChange={onChange} />
        case 'attacks':
            return <AttacksStage formData={formData} onChange={onChange} />
        case 'stats':
            return <StatsStage formData={formData} onChange={onChange} />
        default:
            return <></>
    }
}

const StageProgress = ({ stage, setStage }) => {
    const stages = ['about', 'evolutions', 'attacks', 'stats'];
    const index = stages.indexOf(stage);

    return (
        <div className="stage-progress">
            {stages.map((name, i) => (
                <div key={i} onClick={i < index ? () => setStage(name) : null}>
                    <div className={"stage-indicator" + (i <= index ? " active": "")} />
                    <span>{name.charAt(0).toUpperCase() + name.slice(1)}</span>
                </div>
            ))}
        </div>
    );
}

const StageNav = ({ stage, setStage, onSubmit }) => {
    const stages = ['about', 'evolutions', 'attacks', 'stats'];
    const index = stages.indexOf(stage);

    return (
        <div className="poke-form-footer">
            <button className="btn" onClick={() => setStage(stages[index - 1])} disabled={index === 0}>
                <span className="material-symbols-outlined">arrow_back</span>
                Previous
            </button>
            {index === stages.length - 1 ? (
                <button className="btn btn-primary" onClick={onSubmit}>
                    Submit
                    <span className="material-symbols-outlined">check</span>
                </button>
            ) : (
                <button className="btn btn-primary" onClick={() => setStage(stages[index + 1])}>
                    Next
                    <span className="material-symbols-outlined">arrow_forward</span>
                </button>
            )}
        </div>
    );
}

const AboutStage = ({formData: { name, lore, sprites, types }, onChange}) => {
    return (
        <>
            <div className="form-group">
                <label htmlFor="name">Name*:</label>
                <input type="text" className="input" name="name" placeholder="Enter your new pokemon name" value={name} onChange={onChange} />
            </div>
            <div className="form-group">
                <label htmlFor="lore">About your pokemon:</label>
                <textarea rows={2} className="input input-area" name="lore" placeholder="Give some lore about your amazing new pokemon..." value={lore} onChange={onChange} />
            </div>
            <div className="form-group">
                <label htmlFor="image">Upload a photo of your pokemon*:</label>
                <div><input type="file" accept=".png,.jpg,.jpeg" className="input" name="image" placeholder="Give some lore about your amazing new pokemon..." onChange={
                    (e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            onChange({ target: { name: 'sprites', value: { ...sprites, front: reader.result } } });
                        };
                        reader.readAsDataURL(file);
                    }
                } /></div>
            </div>
            <TypeSelector name="types" value={types} onChange={onChange} />
        </>
    );
}

const TypeSelector = ({ name, value, onChange }) => {
    const { data: types, isLoading } = useSWR('http://localhost:3000/form/types');

    return (
        <div className="form-group">
            <label htmlFor={name}>Types (max 2)*:</label>
            {isLoading ? <p>Loading types...</p> : <Autocomplete
                multiple
                options={types}
                getOptionLabel={(option) => option.name}
                value={value}
                onChange={(event, newValue) => {
                    if (newValue.length > 2) return;
                    onChange({ target: { name, value: newValue } });
                }}
                renderInput={(params) => (
                    <TextField {...params} className="input" style={{backgroundColor: "field"}} placeholder="Search types" />
                )}
                renderValue={(values) => values.map(({image_url}) => <img src={image_url} alt="" className="pill" />)}
                renderOption={(params) => {
                    const image_url = types.find(t => t.name === params.key)?.image_url;
                    return (<li {...params} ><img src={image_url} alt="" style={{ width: '10rem' }} /></li>);
                }}
                sx={{ width: '500px' }}
            />}
        </div>
    );
}

const EvolutionsStage = ({formData: { evolutions }, onChange}) => {
    const { data: pokemons, isLoading } = useSWR('http://localhost:3000/form/pokemons');

    return (
        <div className="form-group">
            <label>Choose the evolutions of your pokemon:</label>
            {isLoading ? <p>Loading pokemons...</p> : <Autocomplete
                multiple
                options={pokemons}
                getOptionLabel={(option) => option.name}
                filterOptions={(options, state) => {
                    const filtered = options.filter(option => 
                        option.name.toLowerCase().includes(state.inputValue.toLowerCase())
                    );
                    return filtered.slice(0, 50);
                }}
                value={evolutions}
                onChange={(event, newValue) => {
                    onChange({ target: { name: "evolutions", value: newValue } });
                }}
                renderInput={(params) => (
                    <TextField {...params} className="input" style={{backgroundColor: "field"}} placeholder="Search pokemons" />
                )}
                renderValue={(values) => values.map((pokemon) => <PokemonCard className="pill" pokemon={pokemon} />)}
                renderOption={(params) =>
                    <li {...params} ><PokemonCard pokemon={pokemons.find(t => t.name === params.key)}/></li>
                }
                sx={{ width: '500px' }}
            />}
        </div>
    );
}

const PokemonCard = ({ pokemon, className }) => {
    const { dominantColor } = useExtractColors(pokemon.sprites.front, { colors: 3 });
        
    return (
        <div className={'poke-pill ' + className} style={{'--accent-color': dominantColor}}>
            <img src={pokemon.sprites.front} alt="" />
            {pokemon.name.charAt(0).toUpperCase()}{pokemon.name.slice(1).toLowerCase()}
        </div>
    );
}

const AttacksStage = ({formData: {attacks}, onChange}) => {
    const { data: all_attacks, isLoading } = useSWR('http://localhost:3000/form/attacks');

    return (
        <div className="form-group">
            <label>Choose the attacks of your pokemon:</label>
            {isLoading ? <p>Loading attacks...</p> : <Autocomplete
                multiple
                options={all_attacks}
                getOptionLabel={(option) => option.name}
                filterOptions={(options, state) => {
                    const filtered = options.filter(option => 
                        option.name.toLowerCase().includes(state.inputValue.toLowerCase())
                    );
                    return filtered.slice(0, 50);
                }}
                value={attacks}
                onChange={(event, newValue) => {
                    onChange({ target: { name: "attacks", value: newValue } });
                }}
                renderInput={(params) => (
                    <TextField {...params} className="input" style={{backgroundColor: "field"}} placeholder="Search attacks" />
                )}
                renderValue={(values) => values.map((attack) => <AttackCard {...attack} nodetails/>)}
                renderOption={(params) =>
                    <li {...params}><AttackCard {...all_attacks.find(t => t.name === params.key)} /></li>
                }
                sx={{ width: '500px' }}
            />}
        </div>
    );
}

const StatsStage = ({formData: { stats }, onChange}) => {
    return (
        <>
            <div className="form-row">
                <div className="form-group">
                    <div className="form-label-value">
                        <label htmlFor="hp">HP:</label>
                        <span>{stats.hp}</span>
                    </div>
                    <Slider
                        value={stats.hp}
                        style={{'--accent-color': STAT_COLOR.hp}}
                        onChange={(e, newValue) => onChange({ target: { name: "stats", value: { ...stats, hp: newValue } } })}
                        min={0}
                        max={255}
                    />
                </div>
                <div className="form-group">
                    <div className="form-label-value">
                        <label htmlFor="attack">Attack:</label>
                        <span>{stats.attack}</span>
                    </div>
                    <Slider
                        value={stats.attack}
                        style={{'--accent-color': STAT_COLOR.attack}}
                        onChange={(e, newValue) => onChange({ target: { name: "stats", value: { ...stats, attack: newValue } } })}
                        min={0}
                        max={255}
                    />
                </div>
            </div>
            <div className="form-row">
                <div className="form-group">
                    <div className="form-label-value">
                        <label htmlFor="defense">Defense:</label>
                        <span>{stats.defense}</span>
                    </div>
                    <Slider
                        value={stats.defense}
                        style={{'--accent-color': STAT_COLOR.defense}}
                        onChange={(e, newValue) => onChange({ target: { name: "stats", value: { ...stats, defense: newValue } } })}
                        min={0}
                        max={255}
                    />
                </div>
                <div className="form-group">
                    <div className="form-label-value">
                        <label htmlFor="special-attack">Special Attack:</label>
                        <span>{stats['special-attack']}</span>
                    </div>
                    <Slider
                        value={stats['special-attack']}
                        style={{'--accent-color': STAT_COLOR['special-attack']}}
                        onChange={(e, newValue) => onChange({ target: { name: "stats", value: { ...stats, 'special-attack': newValue } } })}
                        min={0}
                        max={255}
                    />
                </div>
            </div>
            <div className="form-row">
                <div className="form-group">
                    <div className="form-label-value">
                        <label htmlFor="special-defense">Special Defense:</label>
                        <span>{stats['special-defense']}</span>
                    </div>
                    <Slider
                        value={stats['special-defense']}
                        style={{'--accent-color': STAT_COLOR['special-defense']}}
                        onChange={(e, newValue) => onChange({ target: { name: "stats", value: { ...stats, 'special-defense': newValue } } })}
                        min={0}
                        max={255}
                    />
                </div>
                <div className="form-group">
                    <div className="form-label-value">
                        <label htmlFor="speed">Speed:</label>
                        <span>{stats.speed}</span>
                    </div>
                    <Slider
                        value={stats.speed}
                        style={{'--accent-color': STAT_COLOR.speed}}
                        onChange={(e, newValue) => onChange({ target: { name: "stats", value: { ...stats, speed: newValue } } })}
                        min={0}
                        max={255}
                    />
                </div>
            </div>
        </>
    );
}

export default PokeForm;
