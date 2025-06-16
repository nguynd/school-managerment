import { Routes, Route } from 'react-router-dom';
import Header from './components/Header.jsx';
import Sidebar from './components/Sidebar.jsx';
import Dashboard from './components/Dashboard.jsx'; // ✅ thêm dòng này
import './App.css';

function App() {
  return (
    <div>
      <Header />
      <Sidebar />
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} /> {/* ✅ thêm route Dashboard */}
      </Routes>
    </div>
  );
}

export default App;
