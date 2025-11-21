import React, { useState } from 'react';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const GeneratorForm = ({ onAdaptationSuccess }) => {
    // Usaremos un único estado para todos los inputs
    const [inputs, setInputs] = useState({
        titulo: 'Lanzamiento App Móvil',
        contenido: 'Estamos felices de lanzar la nueva aplicación móvil. Incluye modo oscuro y notificaciones push. Descárgala ahora.',
        imagenURL: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1000&auto=format&fit=crop'
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setInputs(prev => ({ ...prev, [id]: value }));
    };

    const handleGenerate = async () => {
        if (!inputs.titulo || !inputs.contenido) {
            alert('Por favor, ingresa un título y contenido base.');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/adaptar/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    titulo: inputs.titulo, 
                    contenido: inputs.contenido 
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Llama a la función de la app principal, pasando el ID del Post
                onAdaptationSuccess(data, inputs.imagenURL);
            } else {
                alert(`Error al generar contenido: ${data.error || JSON.stringify(data)}`);
            }
        } catch (error) {
            alert('Error de conexión con el backend de Django.');
            console.error('Error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="card shadow-lg mb-5 border-0">
            <div className="card-header bg-dark text-white py-3">
                <h5 className="m-0">1. Semilla de Contenido (Texto + Imagen)</h5>
            </div>
            <div className="card-body p-4">
                <div className="row">
                    <div className="col-md-12 mb-3">
                        <label className="form-label fw-bold">Título del Post:</label>
                        <input type="text" id="titulo" className="form-control" value={inputs.titulo} onChange={handleChange} />
                    </div>
                    
                    <div className="col-md-12 mb-3">
                        <label className="form-label fw-bold">Contenido Base:</label>
                        <textarea id="contenido" className="form-control" rows="4" value={inputs.contenido} onChange={handleChange}></textarea>
                    </div>

                    <div className="col-md-12 mb-4">
                        <label className="form-label fw-bold">URL de la Imagen (Para Instagram/Facebook):</label>
                        <div className="input-group">
                            <span className="input-group-text">🔗</span>
                            <input type="text" id="imagenURL" className="form-control" value={inputs.imagenURL} onChange={handleChange} />
                        </div>
                    </div>
                </div>

                <button onClick={handleGenerate} className="btn btn-primary w-100 btn-lg py-3 fw-bold" disabled={isLoading}>
                    {isLoading ? '✨ IA PENSANDO...' : '✨ Generar Adaptaciones con IA'}
                </button>
            </div>
        </div>
    );
};

export default GeneratorForm;