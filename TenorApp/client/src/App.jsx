import { Routes, Route } from 'react-router-dom';
import Homepage from './pages/Homepage'
import UserDetail from './pages/UserDetail'
import "./App.css";

function App() {
  return (
    <Routes>
      <Route path='/' element={<Homepage />}/>
      <Route path='/user/:username' element={<UserDetail />}/>
    </Routes>
  );
}

export default App

