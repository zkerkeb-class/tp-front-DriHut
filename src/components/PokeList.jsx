import PokeCard from "./PokeCard";
import useSWRInfinite from "swr/infinite";
import { useInView } from "react-intersection-observer";


const PokeList = ({search}) => {
    const { data, isLoading, size, setSize } = useSWRInfinite((_, previous) => previous ? previous.next : "http://localhost:3000/pokemons" + (search ? `?q=${search}` : ""));
    const { ref } = useInView({
        onChange: (inView) => { if (inView) setSize(prev => prev + 1); },
        threshold: 0.5
    });

    if (isLoading) return <p>Chargement...</p>

    const count = data[0].count;
    const pokemons = data.flat().filter(page => page.results).map(page => page.results).flat();
    return (
        <>
            <ul className="poke-list">
                {pokemons.map((pokemon, index) => (
                    <PokeCard key={index} pokemon={pokemon} />
                ))}
            </ul>
            {pokemons.length < count && <button ref={ref} onClick={() => setSize(size + 1)}>Load more</button>}
        </>
    );
};

export default PokeList;
