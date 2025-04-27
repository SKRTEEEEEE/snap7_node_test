import http from "http"
import { debounceHandler } from "./debounce";

let offset = 0;
const limit = 10;
const POKEAPI_URL = 'https://pokeapi.co/api/v2/pokemon';

export const fetchPokemonData = async (offset: number, limit: number) => {
  try {
    const response = await fetch(`${POKEAPI_URL}?offset=${offset}&limit=${limit}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error fetching Pokémon data:', error);
    throw error;
  }
};

const handleFetch = async (req:http.IncomingMessage, res:http.ServerResponse ) => {
    try {
        const data = await fetchPokemonData(offset, limit);
        const response = {
          from: offset + 1,
          to: offset + data.length,
          data
        };
        offset += limit;
  
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(response));
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to fetch Pokémon data' }));
      }
}

export const debouncedFetch = debounceHandler(handleFetch, 2000);





