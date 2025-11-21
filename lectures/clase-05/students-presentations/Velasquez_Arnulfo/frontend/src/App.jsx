import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Asegúrate de instalarlo: npm install axios
import GeneratorForm from './components/GeneratorForm';
import PublicationCard from './components/PublicationCard';
import 'bootstrap/dist/css/bootstrap.min.css';

const API_BASE_URL = 'http://localhost:8000/api';
//const API_BASE_URL = 'http://127.0.0.1:8000/api';
//const API_BASE_URL = 'http://52.14.224.136/api';

function App() {
    // Estado para las adaptaciones actuales (lo que acabas de generar)
    const [currentAdaptations, setCurrentAdaptations] = useState(null);
    const [masterImageURL, setMasterImageURL] = useState('');
    
    // Estado para la lista del historial (base de datos)
    const [historial, setHistorial] = useState([]);

    // Cargar el historial automáticamente al abrir la página
    useEffect(() => {
        cargarHistorial();
    }, []);

    // Función para pedir la lista de posts al Backend
    const cargarHistorial = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/posts/`);
            setHistorial(res.data);
        } catch (error) {
            console.error("Error cargando historial:", error);
        }
    };

    // Esta función se pasa al GeneratorForm para que nos avise cuando termine
    const handleAdaptationSuccess = (data, imageURL) => {
        setCurrentAdaptations(data.adaptaciones);
        setMasterImageURL(imageURL);
        console.log("Adaptaciones recibidas:", data);
        
        // Actualizamos el historial para que aparezca el nuevo post inmediatamente
        cargarHistorial();
    };

    const platforms = ['facebook', 'instagram', 'linkedin', 'whatsapp', 'tiktok'];

    return (
        <div className="container-fluid bg-light min-vh-100">
            <div className="row">
                
                {/* BARRA LATERAL IZQUIERDA (HISTORIAL) */}
                <div className="col-md-3 bg-dark text-white p-4 min-vh-100 d-none d-md-block">
                    <h4 className="mb-4 text-info">📜 Historial</h4>
                    <div className="list-group">
                        {historial.map(post => (
                            <div key={post.id} className="list-group-item list-group-item-action bg-secondary text-white border-dark mb-2 rounded">
                                <div className="d-flex w-100 justify-content-between">
                                    <small className="text-warning">{new Date(post.fecha_creacion).toLocaleDateString()}</small>
                                    <small className="badge bg-dark">ID: {post.id}</small>
                                </div>
                                <div className="fw-bold text-truncate mt-1">{post.titulo}</div>
                            </div>
                        ))}
                        {historial.length === 0 && <p className="text-muted small mt-3">No hay posts guardados aún.</p>}
                    </div>
                </div>

                {/* ÁREA PRINCIPAL DERECHA */}
                <div className="col-md-9 p-5">
                    <h1 className="text-center fw-bold text-primary mb-2">🤖 Portal de Publicación LLM</h1>
                    <p className="text-center text-muted mb-5">Backend Django + Gemini + Base de Datos</p>
                    
                    {/* 1. Formulario de Generación */}
                    <GeneratorForm onAdaptationSuccess={handleAdaptationSuccess} />

                    {/* 2. Sección de Resultados (Tarjetas) - Solo visible si hay datos */}
                    {currentAdaptations && (
                        <div id="publication-area" className="mt-5 animate__animated animate__fadeIn">
                            <h2 className="mb-4 border-bottom pb-2 text-success">🚀 Borradores Listos para Publicar</h2>
                            
                            <div className="row g-4">
                                {platforms.map(platform => (
                                    <div key={platform} className="col-lg-6 col-md-12">
                                        <PublicationCard 
                                            data={currentAdaptations[platform]} 
                                            platform={platform} 
                                            imageURL={masterImageURL}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default App;