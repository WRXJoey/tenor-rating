import { Routes, Route } from 'react-router-dom';
import Homepage from './pages/homepage'
import "./styles/Homepage.css";

function App() {
  return (
    <Routes>
      <Route path='/' element={<Homepage />}/>
    </Routes>
  );
}

export default App

