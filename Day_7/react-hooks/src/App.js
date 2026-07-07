import './App.css';
import MovieList from './Components/MovieList';
import Navbar from './Components/Navbar';
import Home from './Pages/Home';

function App() {
  return (
    <>
      <main>
        <Home />
        <MovieList />
      </main>
    </>
  );
}

export default App;
