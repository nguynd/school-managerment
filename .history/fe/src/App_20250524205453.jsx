import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header.jsx';
import Sidebar from './components/Sidebar.jsx';
import ClassList from './components/ClassList.jsx';
import StudentsInClass from './components/StudentsInClass.jsx'; // thêm dòng này
import './App.css';

function App() {
  return (
    <div>
      <Header />
      <Sidebar />
      <Routes>
        <Route path="/" element={<ClassList />} />
        <Route path="/class/:id/students" element={<StudentsInClass />} />
      </Routes>
    </div>
  );
}

export default App;
