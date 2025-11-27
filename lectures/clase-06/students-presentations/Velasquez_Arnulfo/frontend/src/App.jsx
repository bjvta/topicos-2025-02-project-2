import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import CreatePost from './pages/CreatePost';
import PreviewAdaptations from './pages/PreviewAdaptations';
import Dashboard from './pages/Dashboard';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
    return (
        <Router>
            <div className="min-vh-100 bg-light">
                <Navbar />
                <Routes>
                    <Route path="/" element={<CreatePost />} />
                    <Route path="/preview" element={<PreviewAdaptations />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;