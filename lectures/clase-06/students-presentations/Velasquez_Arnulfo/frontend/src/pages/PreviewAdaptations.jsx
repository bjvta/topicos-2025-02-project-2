import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CharacterCounter from '../components/CharacterCounter';
import config from '../config';

const API_BASE_URL = config.API_BASE_URL;

const PreviewAdaptations = () => {
    const navigate = useNavigate();
    const [adaptations, setAdaptations] = useState(null);
    const [imageURL, setImageURL] = useState('');
    const [videoURL, setVideoURL] = useState('');
    const [selectedPlatforms, setSelectedPlatforms] = useState({});
    const [editedContent, setEditedContent] = useState({});
    const [publishingStatus, setPublishingStatus] = useState({});
    const [whatsappNumber, setWhatsappNumber] = useState('');
    const [includeImage, setIncludeImage] = useState({}); // Nuevo estado para checkbox de imagen

    // Límites de caracteres por plataforma
    const characterLimits = {
        facebook: 500,
        instagram: 2200,
        linkedin: 3000,
        whatsapp: 300,
        tiktok: 2200
    };

    const platformColors = {
        facebook: 'primary',
        instagram: 'danger',
        linkedin: 'info',
        whatsapp: 'success',
        tiktok: 'dark'
    };

    const platformIcons = {
        facebook: '📘',
        instagram: '📸',
        linkedin: '💼',
        whatsapp: '💬',
        tiktok: '🎵'
    };

    useEffect(() => {
        // Cargar datos del sessionStorage
        const storedAdaptations = sessionStorage.getItem('currentAdaptations');
        const storedImageURL = sessionStorage.getItem('imageURL');
        const storedVideoURL = sessionStorage.getItem('videoURL');
        const storedPlatforms = sessionStorage.getItem('selectedPlatforms');

        if (!storedAdaptations) {
            navigate('/');
            return;
        }

        const adaptationsData = JSON.parse(storedAdaptations);
        const platforms = JSON.parse(storedPlatforms || '{}');

        setAdaptations(adaptationsData);
        setImageURL(storedImageURL || '');
        setVideoURL(storedVideoURL || '');
        setSelectedPlatforms(platforms);

        // Inicializar contenido editable y checkboxes
        const initialContent = {};
        const initialIncludeImage = {};

        Object.keys(adaptationsData.adaptaciones).forEach(platform => {
            if (platforms[platform]) {
                initialContent[platform] = adaptationsData.adaptaciones[platform].texto;
                // Por defecto, incluir imagen en Facebook si existe
                if (platform === 'facebook' && adaptationsData.adaptaciones[platform].generated_image_url) {
                    initialIncludeImage[platform] = true;
                }
            }
        });
        setEditedContent(initialContent);
        setIncludeImage(initialIncludeImage);
    }, [navigate]);

    const handleContentEdit = (platform, value) => {
        setEditedContent(prev => ({ ...prev, [platform]: value }));
    };

    const handlePublish = async (platform, publicationId) => {
        setPublishingStatus(prev => ({ ...prev, [platform]: 'publishing' }));

        try {
            const body = { publication_id: publicationId };

            if (platform === 'instagram') {
                // Instagram SIEMPRE usa la imagen generada si existe
                const generatedImage = adaptations.adaptaciones[platform].generated_image_url;
                if (!generatedImage) {
                    alert('Instagram requiere una imagen generada.');
                    setPublishingStatus(prev => ({ ...prev, [platform]: 'error' }));
                    return;
                }
                body.image_url = generatedImage;
            }

            if (platform === 'facebook') {
                // Facebook usa imagen SOLO si el checkbox está marcado
                if (includeImage[platform]) {
                    const generatedImage = adaptations.adaptaciones[platform].generated_image_url;
                    if (generatedImage) {
                        body.image_url = generatedImage;
                    }
                }
            }

            if (platform === 'whatsapp') {
                if (!whatsappNumber) {
                    alert('WhatsApp requiere un número de destino.');
                    setPublishingStatus(prev => ({ ...prev, [platform]: 'error' }));
                    return;
                }
                body.whatsapp_number = whatsappNumber;
            }

            if (platform === 'tiktok') {
                if (!videoURL) {
                    alert('TikTok requiere un video subido.');
                    setPublishingStatus(prev => ({ ...prev, [platform]: 'error' }));
                    return;
                }
                body.video_url = videoURL;
            }

            const response = await axios.post(`${API_BASE_URL}/publicar/`, body);

            if (response.data.status === 'success') {
                setPublishingStatus(prev => ({ ...prev, [platform]: 'success' }));
            } else if (response.data.status === 'manual_action_required') {
                setPublishingStatus(prev => ({ ...prev, [platform]: 'manual' }));
            } else {
                setPublishingStatus(prev => ({ ...prev, [platform]: 'error' }));
            }
        } catch (error) {
            console.error('Error:', error);
            setPublishingStatus(prev => ({ ...prev, [platform]: 'error' }));
        }
    };

    const handlePublishAll = () => {
        Object.keys(editedContent).forEach(platform => {
            if (selectedPlatforms[platform] && !publishingStatus[platform]) {
                const publicationId = adaptations.adaptaciones[platform].id;
                handlePublish(platform, publicationId);
            }
        });
    };

    const getStatusBadge = (platform) => {
        const status = publishingStatus[platform];
        if (!status) return <span className="badge bg-secondary">⚪ Borrador</span>;
        if (status === 'publishing') return <span className="badge bg-warning">⏳ Publicando...</span>;
        if (status === 'success') return <span className="badge bg-success">✅ Publicado</span>;
        if (status === 'manual') return <span className="badge bg-info">📋 Manual</span>;
        if (status === 'error') return <span className="badge bg-danger">❌ Error</span>;
    };

    if (!adaptations) {
        return (
            <div className="container py-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <div className="row mb-4">
                <div className="col">
                    <h2 className="fw-bold">👁️ Preview y Edición de Adaptaciones</h2>
                    <p className="text-muted">
                        Revisa y edita el contenido adaptado para cada plataforma antes de publicar.
                    </p>
                </div>
                <div className="col-auto">
                    <button
                        className="btn btn-success btn-lg"
                        onClick={handlePublishAll}
                    >
                        🚀 Publicar Todo
                    </button>
                </div>
            </div>

            {/* Grid de Adaptaciones */}
            <div className="row g-4">
                {Object.keys(editedContent).map(platform => {
                    const adaptation = adaptations.adaptaciones[platform];
                    const currentLength = editedContent[platform]?.length || 0;
                    const maxLength = characterLimits[platform];

                    return (
                        <div key={platform} className="col-lg-6">
                            <div className="card h-100 shadow-sm border-0">
                                <div className={`card-header bg-${platformColors[platform]} text-white d-flex justify-content-between align-items-center`}>
                                    <span className="fw-bold">
                                        {platformIcons[platform]} {platform.toUpperCase()}
                                    </span>
                                    {getStatusBadge(platform)}
                                </div>
                                <div className="card-body">
                                    <label className="form-label fw-bold small">Contenido Adaptado</label>
                                    <textarea
                                        className="form-control mb-2"
                                        rows="6"
                                        value={editedContent[platform]}
                                        onChange={(e) => handleContentEdit(platform, e.target.value)}
                                        disabled={publishingStatus[platform] === 'success'}
                                    />

                                    <CharacterCounter
                                        current={currentLength}
                                        max={maxLength}
                                        platform={platform}
                                    />

                                    {/* Campo de número para WhatsApp */}
                                    {platform === 'whatsapp' && (
                                        <div className="mt-3">
                                            <label className="form-label fw-bold small">Número de Destino</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="+1234567890 (con código de país)"
                                                value={whatsappNumber}
                                                onChange={(e) => setWhatsappNumber(e.target.value)}
                                            />
                                            <small className="text-muted">
                                                Ejemplo: +14155238886 (USA), +521234567890 (México)
                                            </small>
                                        </div>
                                    )}

                                    {/* Hashtags */}
                                    {adaptation.hashtags && adaptation.hashtags.length > 0 && (
                                        <div className="mt-3">
                                            <small className="text-muted fw-bold">Hashtags sugeridos:</small>
                                            <div className="mt-1">
                                                {adaptation.hashtags.map((tag, idx) => (
                                                    <span key={idx} className="badge bg-light text-dark me-1">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Info adicional para TikTok */}
                                    {platform === 'tiktok' && adaptation.video_hook && (
                                        <div className="alert alert-warning mt-3 small">
                                            <strong>Video Hook:</strong> {adaptation.video_hook}
                                        </div>
                                    )}

                                    {/* Info adicional para Facebook */}
                                    {platform === 'facebook' && adaptation.generated_image_url && (
                                        <div className="mt-3">
                                            <div className="form-check form-switch">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    id={`check-image-${platform}`}
                                                    checked={includeImage[platform] || false}
                                                    onChange={(e) => setIncludeImage(prev => ({ ...prev, [platform]: e.target.checked }))}
                                                />
                                                <label className="form-check-label small fw-bold" htmlFor={`check-image-${platform}`}>
                                                    Incluir imagen generada en la publicación
                                                </label>
                                            </div>

                                            {includeImage[platform] && (
                                                <div className="mt-2">
                                                    <img
                                                        src={adaptation.generated_image_url.startsWith('http')
                                                            ? adaptation.generated_image_url
                                                            : `${API_BASE_URL.replace('/api', '')}${adaptation.generated_image_url}`}
                                                        alt="Generated by Pollinations"
                                                        className="img-fluid rounded shadow-sm"
                                                        style={{ maxHeight: '200px', objectFit: 'cover' }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Info adicional para Instagram */}
                                    {platform === 'instagram' && (
                                        <div className="mt-3">
                                            {adaptation.generated_image_url ? (
                                                <div className="mb-2">
                                                    <label className="form-label fw-bold small">Imagen Generada (Se publicará automáticamente):</label>
                                                    <img
                                                        src={adaptation.generated_image_url.startsWith('http')
                                                            ? adaptation.generated_image_url
                                                            : `${API_BASE_URL.replace('/api', '')}${adaptation.generated_image_url}`}
                                                        alt="Generated by Pollinations"
                                                        className="img-fluid rounded shadow-sm"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="alert alert-danger small">
                                                    No se generó imagen. Instagram requiere imagen.
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Botón de publicar */}
                                    <button
                                        className={`btn btn-${platformColors[platform]} w-100 mt-3`}
                                        onClick={() => handlePublish(platform, adaptation.id)}
                                        disabled={
                                            publishingStatus[platform] === 'publishing' ||
                                            publishingStatus[platform] === 'success'
                                        }
                                    >
                                        {publishingStatus[platform] === 'publishing' ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Publicando...
                                            </>
                                        ) : publishingStatus[platform] === 'success' ? (
                                            '✅ Publicado'
                                        ) : (
                                            `Publicar en ${platform}`
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Botones de navegación */}
            <div className="row mt-4">
                <div className="col">
                    <button
                        className="btn btn-outline-secondary"
                        onClick={() => navigate('/')}
                    >
                        ← Volver a Crear
                    </button>
                </div>
                <div className="col text-end">
                    <button
                        className="btn btn-outline-primary"
                        onClick={() => navigate('/dashboard')}
                    >
                        Ver Dashboard →
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PreviewAdaptations;
