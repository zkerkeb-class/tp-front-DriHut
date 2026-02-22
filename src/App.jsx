import './App.css'
import PokeSearch from './components/PokeSearch';
import PokePage from './components/PokePage';
import PokeForm from './components/PokeForm';
import { SWRConfig } from 'swr';
import 'material-symbols/outlined.css';
import { RouterProvider, createBrowserRouter } from 'react-router';


const options = {
    fetcher: (resource, init) => fetch(resource, init).then(res => res.json())
}

const router = createBrowserRouter([
    {
      path: "/",
      element: <PokeSearch />,
    },
    {
      path: "/pokemon/:id",
      element: <PokePage />,
    },
    {
      path: "/pokemon/:id/edit",
      element: <PokeForm />,
    },
    {
      path: "/create",
      element: <PokeForm />,
    }
  ]);

function App() {

  return (
    <SWRConfig value={options}>
        <RouterProvider router={router} />
    </SWRConfig> 
  )

}

export default App
