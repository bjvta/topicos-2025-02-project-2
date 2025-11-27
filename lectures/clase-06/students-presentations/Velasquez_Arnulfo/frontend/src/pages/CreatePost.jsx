import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../config';

const API_BASE_URL = config.API_BASE_URL;

const CreatePost = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        titulo: '',
        contenido: '',
        imagenURL: ''
    });
    const [videoFile, setVideoFile] = useState(null);
    const [uploadingVideo, setUploadingVideo] = useState(false);
    const [selectedPlatforms, setSelectedPlatforms] = useState({
        facebook: true,
        instagram: true,
        linkedin: true,
        whatsapp: true,
        tiktok: true
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setVideoFile(e.target.files[0]);
    };

    const handlePlatformToggle = (platform) => {
        setSelectedPlatforms(prev => ({ ...prev, [platform]: !prev[platform] }));
    };

    const handleGeneratePreview = async () => {
        if (!formData.titulo || !formData.contenido) {
            alert('Por favor, ingresa un título y contenido.');
            return;
        }

        setIsLoading(true);
        console.log('Using API URL:', API_BASE_URL); // DEBUG
        try {
            let uploadedVideoUrl = '';

            // 1. Subir video si existe
            if (videoFile) {
                setUploadingVideo(true);
                const formDataVideo = new FormData();
                formDataVideo.append('file', videoFile);

                const uploadResponse = await axios.post(`${API_BASE_URL}/upload/`, formDataVideo, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                uploadedVideoUrl = uploadResponse.data.url;
                setUploadingVideo(false);
            }

            // 2. Generar adaptaciones
            const response = await axios.post(`${API_BASE_URL}/adaptar/`, {
                titulo: formData.titulo,
                contenido: formData.contenido
            });

            if (response.status === 201) {
                // Guardar datos en sessionStorage para la página de preview
                sessionStorage.setItem('currentAdaptations', JSON.stringify(response.data));
                sessionStorage.setItem('imageURL', formData.imagenURL);
                sessionStorage.setItem('videoURL', uploadedVideoUrl);
                sessionStorage.setItem('selectedPlatforms', JSON.stringify(selectedPlatforms));

                // Navegar a la página de preview
                navigate('/preview');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al generar adaptaciones: ' + (error.response?.data?.error || error.message));
        } finally {
            setIsLoading(false);
        }
    };

    const platformIcons = {
        facebook: '📘',
        instagram: '📸',
        linkedin: '💼',
        whatsapp: '💬',
        tiktok: '🎵'
    };

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-lg-8">
                    <div className="card shadow-lg border-0">
                        <div className="card-header bg-primary text-white py-3">
                            <h4 className="m-0">📝 Crear Nueva Publicación</h4>
                        </div>
                        <div className="card-body p-4">
                            {/* Título */}
                            <div className="mb-4">
                                <label className="form-label fw-bold">Título del Post</label>
                                <input
                                    type="text"
                                    name="titulo"
                                    className="form-control form-control-lg"
                                    placeholder="Ej: Lanzamiento de Nuevo Producto"
                                    value={formData.titulo}
                                    onChange={handleInputChange}
                                />
                            </div>

                            {/* Contenido */}
                            <div className="mb-4">
                                <label className="form-label fw-bold">Contenido Base</label>
                                <textarea
                                    name="contenido"
                                    className="form-control"
                                    rows="6"
                                    placeholder="Escribe el contenido principal que será adaptado para cada red social..."
                                    value={formData.contenido}
                                    onChange={handleInputChange}
                                ></textarea>
                                <small className="text-muted">
                                    Este contenido será adaptado automáticamente para cada plataforma seleccionada.
                                </small>
                            </div>

                            {/* URL de Imagen */}
                            <div className="mb-4">
                                <label className="form-label fw-bold">URL de Imagen (Opcional)</label>
                                <input
                                    type="url"
                                    name="imagenURL"
                                    className="form-control"
                                    placeholder="https://ejemplo.com/imagen.jpg"
                                    value={formData.imagenURL}
                                    onChange={handleInputChange}
                                />
                                <small className="text-muted">
                                    Requerido para Instagram. Opcional para Facebook.
                                </small>
                            </div>

                            {/* Subida de Video (TikTok) */}
                            <div className="mb-4">
                                <label className="form-label fw-bold">Subir Video (Para TikTok)</label>
                                <input
                                    type="file"
                                    accept="video/*"
                                    className="form-control"
                                    onChange={handleFileChange}
                                />
                                <small className="text-muted">
                                    Sube un video .mp4 para publicar en TikTok.
                                </small>
                            </div>

                            {/* Selección de Plataformas */}
                            <div className="mb-4">
                                <label className="form-label fw-bold">Redes Destino</label>
                                <div className="row g-3">
                                    {Object.keys(selectedPlatforms).map(platform => (
                                        <div key={platform} className="col-md-6">
                                            <div className="form-check form-switch">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    id={platform}
                                                    checked={selectedPlatforms[platform]}
                                                    onChange={() => handlePlatformToggle(platform)}
                                                />
                                                <label className="form-check-label" htmlFor={platform}>
                                                    {platformIcons[platform]} {platform.charAt(0).toUpperCase() + platform.slice(1)}
                                                </label>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Botones */}
                            <div className="d-grid gap-2">
                                <button
                                    className="btn btn-primary btn-lg"
                                    onClick={handleGeneratePreview}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            {uploadingVideo ? 'Subiendo Video...' : 'Generando Adaptaciones...'}
                                        </>
                                    ) : (
                                        '✨ Generar Preview'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Info Card */}
                    <div className="card mt-4 border-info">
                        <div className="card-body">
                            <h6 className="card-title text-info">ℹ️ Cómo funciona</h6>
                            <ol className="mb-0 small">
                                <li>Ingresa el título y contenido de tu publicación</li>
                                <li>Selecciona las redes sociales donde quieres publicar</li>
                                <li>Haz clic en "Generar Preview" para crear adaptaciones con IA</li>
                                <li>Revisa y edita las adaptaciones antes de publicar</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreatePost;
