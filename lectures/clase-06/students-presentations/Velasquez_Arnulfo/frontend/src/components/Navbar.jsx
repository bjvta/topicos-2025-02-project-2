import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaPlus, FaEye, FaChartLine } from 'react-icons/fa';

const Navbar = () => {
    const location = useLocation();
    
    const isActive = (path) => location.pathname === path;
    
    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
            <div className="container-fluid">
                <Link className="navbar-brand fw-bold" to="/">
                    🤖 Portal LLM Social Media
                </Link>
                
                <button 
                    className="navbar-toggler" 
                    type="button" 
                    data-bs-toggle="collapse" 
                    data-bs-target="#navbarNav"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>
                
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto">
                        <li className="nav-item">
                            <Link 
                                className={`nav-link ${isActive('/') ? 'active' : ''}`} 
                                to="/"
                            >
                                <FaPlus className="me-2" />
                                Crear Publicación
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link 
                                className={`nav-link ${isActive('/preview') ? 'active' : ''}`} 
                                to="/preview"
                            >
                                <FaEye className="me-2" />
                                Preview
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link 
                                className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`} 
                                to="/dashboard"
                            >
                                <FaChartLine className="me-2" />
                                Dashboard
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
