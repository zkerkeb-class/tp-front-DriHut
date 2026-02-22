import { useExtractColors } from "react-extract-colors";
import useSWR from "swr";
import { Link } from "react-router";
import "./style.css";
import { useState } from "react";
import useSound from "use-sound";

const STAT_COLOR = {
    hp: '#EC5D5D',
    attack: '#9db7f5',
    defense: '#a7db8c',
    'special-attack': '#f5b7b0',
    'special-defense': '#a08cdb',
    speed: '#f5d142'
}

const PokeCard = ({ pokemon }) => {
    // const { isLoading, name, image, evolutions, color, types } = usePokeInfo(pokemon.url)
    const [ item, setItem ] = useState('evol');
    
    const { id, name, evolutions, attacks, types, stats, sprites: { front }, lore, sound } = pokemon;
    const { dominantColor: color } = useExtractColors(front ?? '/missing_image.png', { colors: 5 });

    return (
        <div className="poke-card" style={{'--accent-color': color}}>
            <Link to={{ pathname: `/pokemon/${id}` }} className="poke-title">
                <h3 className="squada-one-regular">#{id} {name.substring(0, 1).toUpperCase() + name.substring(1)}</h3>
            </Link>
            <div className="poke-body">
                <div className="poke-types">
                    {types.map(({ image_url }, i) => <img src={image_url} key={i} alt="" />)}
                </div>
                <div className="poke-main-image">
                    <SoundPlayer url={sound} />
                    <img src={front ?? '/missing_image.png'} alt=""/>
                </div>
                <div className="poke-menu-wrapper">
                    <div className="poke-menu-bar">
                        <button className={"poke-menu-item" + (item === 'lore' ? ' active' : '')} onClick={() => setItem('lore')}><h5>Lore</h5></button>
                        <button className={"poke-menu-item" + (item === 'evol' ? ' active' : '')} onClick={() => setItem('evol')}><h5>Evolutions</h5></button>
                        <button className={"poke-menu-item" + (item === 'atks' ? ' active' : '')} onClick={() => setItem('atks')}><h5>Attacks</h5></button>
                        <button className={"poke-menu-item" + (item === 'stat' ? ' active' : '')} onClick={() => setItem('stat')}><h5>Stats</h5></button>
                    </div>
                </div>
            </div>
            <div className="poke-bottom-container squada-one-regular">
                {item === 'lore' ? <>
                    <h3>Lore</h3>
                    <p className="poke-lore">{lore}</p>
                </> : <></>}

                {item === 'evol' ? <>
                    <h3>Evolutions</h3>
                    {evolutions.map((url, i) => <EvolImage url={url} key={i}/>)}
                </> : <></>}
                
                {item === 'atks' ? <>
                    <h3>Attacks</h3>
                    <ul>
                        {attacks.map((atk, i) => (
                            <AttackCard key={i} {...atk} />
                        ))}
                    </ul>
                </> : <></>}

                {item === 'stat' ? <>
                    <h3>Stats</h3>
                    <ul>
                        {Object.entries(stats).map(([name, value], i) => (
                            <li key={i} className="poke-stat" style={{'--stat-value': value / 255, '--stat-color': STAT_COLOR[name]}}>
                                <p>{name}</p>
                                <p>{value}</p>
                                <div className="progress-bar"> </div>
                            </li>
                        ))}
                    </ul>
                </> : <></>}
            </div>
            {/* <ul>
                {areas.map((area, i) => <li key={i}>{area}</li>)}
            </ul> */}
        </div>
    );
}

const SoundPlayer = ({ url }) => {
    const [ play ] = useSound(url);

    if (!url) return <></>
    return <span className="poke-sound-player material-symbols-outlined" onClick={play}>music_note</span>
}

const AttackCard = ({ name, description, attack_type: { image_url }, power_points, nodetails }) => {
    const { colors } = useExtractColors(image_url, { colors: 3 });

    return (
        <div className="poke-attack-card squada-one-regular" style={{'--accent-color': colors[2], 'color': '#fff'}}>
            {nodetails && <img src={image_url} alt="" style={{ width: '5rem', marginRight: '.25rem' }} />}
            <p>{name}</p>
            {!nodetails && <img src={image_url} alt="" />}
            {!nodetails && <>
                <p>{description}</p>
                <p>PP: {power_points}</p>
            </>}
        </div>
    );
}

const EvolImage = ({ url }) => {
    const { data, isLoading } = useSWR('http://localhost:3000' + url);
    const pokemon = Object.keys(url).includes('sprites') ? url : data;
    if (isLoading) return (<></>)

    return (
        <Link to={{ pathname: `/pokemon/${pokemon.id}` }} className="poke-evol-item"><p><img src={pokemon?.sprites.front} alt=""/></p></Link>
    );
}


export { AttackCard, STAT_COLOR };
export default PokeCard;