import './App.css';
import { Routes, Route } from "react-router-dom";
import Home from './pages/Home';
import Chat from './pages/Chat';
import axios from 'axios'
axios.defaults.withCredentials = true

function App() {
  return (
    <div className="App">
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/chat' element={<Chat />} />
        </Routes>
    </div>
  );
}

export default App;
