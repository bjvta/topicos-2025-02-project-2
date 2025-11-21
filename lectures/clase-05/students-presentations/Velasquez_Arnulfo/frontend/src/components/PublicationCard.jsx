import React, { useState } from 'react';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const PublicationCard = ({ data, platform, imageURL }) => {
    const { id, texto, image_prompt, video_hook } = data;
    const [status, setStatus] = useState('draft'); // draft, publishing, success, failed, manual
    const [message, setMessage] = useState('');
    const [inputDestinatario, setInputDestinatario] = useState('');

    const colorMap = {
        facebook: 'bg-primary',
        instagram: 'bg-danger', // Usamos el rojo de Instagram
        linkedin: 'bg-info',
        whatsapp: 'bg-success',
        tiktok: 'bg-dark'
    };

    const handlePublish = async () => {
        let body = { publication_id: id };
        let urlFinal = imageURL; // Usamos la URL maestra del formulario

        if (platform === 'instagram') {
            if (!urlFinal) {
                alert('Instagram requiere una URL de imagen para publicar.');
                return;
            }
            body.image_url = urlFinal;
        }

        if (platform === 'whatsapp') {
            if (!inputDestinatario) {
                alert('WhatsApp requiere un número de destino.');
                return;
            }
            body.whatsapp_number = inputDestinatario;
        }

        // Si es TikTok o LinkedIn sin URN, lo marcamos como manual/skip. (Backend ya lo maneja)
        if (platform === 'tiktok') {
            setStatus('manual');
            setMessage('Listo para copiar.');
            return;
        }

        setStatus('publishing');
        setMessage(platform === 'instagram' ? 'Subiendo imagen (Espera 30s)...' : 'Publicando...');

        try {
            const response = await fetch(`${API_BASE_URL}/publicar/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const res = await response.json();

            if (response.ok && res.status === 'success') {
                setStatus('success');
                setMessage(` Publicado! ID: ${res.id || res.sid}`);
            } else if (res.status === 'manual_action_required') {
                setStatus('manual');
                setMessage(' Acción Manual Requerida. Copia el texto.');
            }
            else {
                setStatus('failed');
                // Intentamos extraer el error del JSON de respuesta de Django
                const errMsg = res.message?.error?.message || JSON.stringify(res.message);
                setMessage(` Error: ${errMsg.substring(0, 80)}...`);
            }
        } catch (error) {
            setStatus('failed');
            setMessage(` Error de conexión: ${error.message}`);
        }
    };

    return (
        <div className="card h-100 shadow-sm border-0">
            <div className={`card-header ${colorMap[platform]} text-white fw-bold`}>
                {platform.toUpperCase()}
            </div>
            <div className="card-body">
                <textarea 
                    className="form-control mb-3" 
                    rows={platform === 'instagram' ? 4 : 6} 
                    value={texto} 
                    readOnly
                />
                
                {platform === 'whatsapp' && (
                    <input 
                        type="text" 
                        placeholder="Número de destino (+Cód. País)" 
                        className="form-control mb-3" 
                        value={inputDestinatario}
                        onChange={(e) => setInputDestinatario(e.target.value)}
                    />
                )}

                {platform === 'tiktok' && (
                    <p className="small text-muted mb-1">
                        **HOOK:** <span className="fw-bold">{video_hook}</span>
                        <br/>(Prompt de Imagen: <span className="text-info">{image_prompt}</span>)
                    </p>
                )}

                <div className={`alert mt-3 p-2 text-center 
                    ${status === 'draft' ? 'alert-secondary' : 
                      status === 'success' ? 'alert-success' : 
                      status === 'failed' ? 'alert-danger' : 
                      status === 'publishing' ? 'alert-warning' : 'alert-info'}`
                }>
                    {status === 'publishing' ? '⏳ ' + message : 
                     status === 'draft' ? '⚪ Borrador Listo' : 
                     message || status.toUpperCase()}
                </div>

                <button 
                    onClick={handlePublish} 
                    className={`btn ${colorMap[platform]} text-white w-100`}
                    disabled={status === 'publishing' || status === 'success' || platform === 'tiktok'}
                >
                    {platform === 'tiktok' ? 'Acción Manual Requerida' : 'Publicar Ahora'}
                </button>
            </div>
        </div>
    );
};

export default PublicationCard;