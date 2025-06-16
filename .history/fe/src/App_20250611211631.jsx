import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header.jsx';
import Sidebar from './components/Sidebar.jsx';
import Dashboard from './components/Dashboard.jsx';
import './App.css';

function App() {
  return (
    <div>
      <Header />
      <Sidebar />
      <Routes>
        {/* ✅ Route gốc chuyển hướng về Dashboard tab homeroom */}
        <Route path="/" element={<Navigate to="/dashboard?tab=homeroom" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </div>
  );
}

export default App;
