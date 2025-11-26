import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaTrash, FaExternalLinkAlt, FaFilter } from 'react-icons/fa';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const Dashboard = () => {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [filteredPosts, setFilteredPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: 'all',
        dateFrom: '',
        dateTo: '',
        platform: 'all'
    });

    const platformIcons = {
        facebook: '📘',
        instagram: '📸',
        linkedin: '💼',
        whatsapp: '💬',
        tiktok: '🎵'
    };

    const statusIcons = {
        published: '✅',
        draft: '⚪',
        failed: '❌',
        manual: '📋'
    };

    useEffect(() => {
        loadPosts();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [posts, filters]);

    const loadPosts = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/posts/`);
            setPosts(response.data);
        } catch (error) {
            console.error('Error cargando posts:', error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...posts];

        // Filtro por fecha
        if (filters.dateFrom) {
            filtered = filtered.filter(post =>
                new Date(post.fecha_creacion) >= new Date(filters.dateFrom)
            );
        }
        if (filters.dateTo) {
            filtered = filtered.filter(post =>
                new Date(post.fecha_creacion) <= new Date(filters.dateTo)
            );
        }

        // Filtro por estado
        if (filters.status !== 'all') {
            filtered = filtered.filter(post =>
                post.publications.some(pub => pub.estado === filters.status)
            );
        }

        // Filtro por plataforma
        if (filters.platform !== 'all') {
            filtered = filtered.filter(post =>
                post.publications.some(pub => pub.plataforma === filters.platform)
            );
        }

        setFilteredPosts(filtered);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleDelete = async (postId) => {
        if (!confirm('¿Estás seguro de eliminar este post y todas sus publicaciones?')) {
            return;
        }

        try {
            await axios.delete(`${API_BASE_URL}/posts/${postId}/`);
            loadPosts();
        } catch (error) {
            console.error('Error eliminando post:', error);
            alert('Error al eliminar el post');
        }
    };

    const getPublicationStats = (publications) => {
        const stats = {
            published: 0,
            draft: 0,
            failed: 0,
            manual: 0
        };

        publications.forEach(pub => {
            stats[pub.estado]++;
        });

        return stats;
    };

    if (loading) {
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
                    <h2 className="fw-bold">📊 Dashboard de Publicaciones</h2>
                    <p className="text-muted">
                        Historial completo de publicaciones con filtros y estadísticas
                    </p>
                </div>
                <div className="col-auto">
                    <button
                        className="btn btn-primary"
                        onClick={() => navigate('/')}
                    >
                        + Nueva Publicación
                    </button>
                </div>
            </div>

            {/* Filtros */}
            <div className="card mb-4 shadow-sm">
                <div className="card-header bg-light">
                    <h6 className="m-0"><FaFilter className="me-2" />Filtros</h6>
                </div>
                <div className="card-body">
                    <div className="row g-3">
                        <div className="col-md-3">
                            <label className="form-label small fw-bold">Estado</label>
                            <select
                                name="status"
                                className="form-select"
                                value={filters.status}
                                onChange={handleFilterChange}
                            >
                                <option value="all">Todos</option>
                                <option value="published">Publicados</option>
                                <option value="draft">Borradores</option>
                                <option value="failed">Fallidos</option>
                                <option value="manual">Manuales</option>
                            </select>
                        </div>
                        <div className="col-md-3">
                            <label className="form-label small fw-bold">Plataforma</label>
                            <select
                                name="platform"
                                className="form-select"
                                value={filters.platform}
                                onChange={handleFilterChange}
                            >
                                <option value="all">Todas</option>
                                <option value="facebook">Facebook</option>
                                <option value="instagram">Instagram</option>
                                <option value="linkedin">LinkedIn</option>
                                <option value="whatsapp">WhatsApp</option>
                                <option value="tiktok">TikTok</option>
                            </select>
                        </div>
                        <div className="col-md-3">
                            <label className="form-label small fw-bold">Desde</label>
                            <input
                                type="date"
                                name="dateFrom"
                                className="form-control"
                                value={filters.dateFrom}
                                onChange={handleFilterChange}
                            />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label small fw-bold">Hasta</label>
                            <input
                                type="date"
                                name="dateTo"
                                className="form-control"
                                value={filters.dateTo}
                                onChange={handleFilterChange}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Estadísticas Generales */}
            <div className="row mb-4">
                <div className="col-md-3">
                    <div className="card text-center shadow-sm">
                        <div className="card-body">
                            <h3 className="fw-bold text-primary">{posts.length}</h3>
                            <small className="text-muted">Total Posts</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card text-center shadow-sm">
                        <div className="card-body">
                            <h3 className="fw-bold text-success">
                                {posts.reduce((acc, post) =>
                                    acc + post.publications.filter(p => p.estado === 'published').length, 0
                                )}
                            </h3>
                            <small className="text-muted">Publicados</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card text-center shadow-sm">
                        <div className="card-body">
                            <h3 className="fw-bold text-warning">
                                {posts.reduce((acc, post) =>
                                    acc + post.publications.filter(p => p.estado === 'draft').length, 0
                                )}
                            </h3>
                            <small className="text-muted">Borradores</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card text-center shadow-sm">
                        <div className="card-body">
                            <h3 className="fw-bold text-danger">
                                {posts.reduce((acc, post) =>
                                    acc + post.publications.filter(p => p.estado === 'failed').length, 0
                                )}
                            </h3>
                            <small className="text-muted">Fallidos</small>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lista de Posts */}
            <div className="card shadow-sm">
                <div className="card-header bg-dark text-white">
                    <h6 className="m-0">Publicaciones ({filteredPosts.length})</h6>
                </div>
                <div className="card-body p-0">
                    {filteredPosts.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            <p>No hay publicaciones que coincidan con los filtros.</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>ID</th>
                                        <th>Título</th>
                                        <th>Fecha</th>
                                        <th>Plataformas</th>
                                        <th>Estado</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPosts.map(post => {
                                        const stats = getPublicationStats(post.publications);
                                        return (
                                            <tr key={post.id}>
                                                <td className="fw-bold">#{post.id}</td>
                                                <td>
                                                    <div className="fw-bold">{post.titulo}</div>
                                                    <small className="text-muted">
                                                        {post.contenido_original.substring(0, 50)}...
                                                    </small>
                                                </td>
                                                <td>
                                                    <small>
                                                        {new Date(post.fecha_creacion).toLocaleDateString('es-ES')}
                                                        <br />
                                                        {new Date(post.fecha_creacion).toLocaleTimeString('es-ES')}
                                                    </small>
                                                </td>
                                                <td>
                                                    {post.publications.map(pub => (
                                                        <span
                                                            key={pub.id}
                                                            className="me-1"
                                                            title={pub.plataforma}
                                                        >
                                                            {platformIcons[pub.plataforma]}
                                                        </span>
                                                    ))}
                                                </td>
                                                <td>
                                                    <div className="d-flex gap-1 flex-wrap">
                                                        {stats.published > 0 && (
                                                            <span className="badge bg-success">
                                                                ✅ {stats.published}
                                                            </span>
                                                        )}
                                                        {stats.draft > 0 && (
                                                            <span className="badge bg-secondary">
                                                                ⚪ {stats.draft}
                                                            </span>
                                                        )}
                                                        {stats.failed > 0 && (
                                                            <span className="badge bg-danger">
                                                                ❌ {stats.failed}
                                                            </span>
                                                        )}
                                                        {stats.manual > 0 && (
                                                            <span className="badge bg-info">
                                                                📋 {stats.manual}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>
                                                    <button
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() => handleDelete(post.id)}
                                                        title="Eliminar"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
