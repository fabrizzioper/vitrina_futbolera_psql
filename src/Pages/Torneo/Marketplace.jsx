import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../Context/AuthContext';
import { listarMarketplace } from '../../Funciones/TorneoService';
import { useNavigate } from 'react-router-dom';

const TORNEO_IMAGES = [
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=250&fit=crop',
    'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=400&h=250&fit=crop',
    'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=400&h=250&fit=crop',
    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=400&h=250&fit=crop',
    'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=400&h=250&fit=crop',
    'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400&h=250&fit=crop',
    'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=400&h=250&fit=crop',
    'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=400&h=250&fit=crop',
];

const Marketplace = () => {
    const { Request, isClub } = useAuth();
    const navigate = useNavigate();
    const [torneos, setTorneos] = useState([]);
    const [loading, setLoading] = useState(true);

    const cargarMarketplace = useCallback(async () => {
        setLoading(true);
        try {
            const res = await listarMarketplace(Request);
            setTorneos(res.data.data || []);
        } catch (err) {
            console.error('Error cargando marketplace:', err);
        }
        setLoading(false);
    }, [Request]);

    useEffect(() => {
        cargarMarketplace();
    }, [cargarMarketplace]);

    const formatFecha = (fecha) => {
        if (!fecha) return '-';
        const d = new Date(fecha);
        return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
            <h2 style={{ color: 'var(--text-primary, #2c3e50)', textAlign: 'center', marginBottom: '10px' }}>
                Marketplace de Torneos
            </h2>
            <p style={{ textAlign: 'center', color: 'var(--text-secondary, #7f8c8d)', marginBottom: '30px' }}>
                Encuentra torneos abiertos para inscribir a tu club
            </p>

            {loading && <p style={{ textAlign: 'center', color: 'var(--text-secondary, #7f8c8d)' }}>Cargando torneos disponibles...</p>}

            {!loading && torneos.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary, #7f8c8d)' }}>
                    <p style={{ fontSize: '18px' }}>No hay torneos disponibles en este momento</p>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {torneos.map((torneo, index) => (
                    <div key={torneo.vit_torneo_id} style={{
                        border: '1px solid var(--border-color, #e0e0e0)', borderRadius: '12px', overflow: 'hidden',
                        background: 'var(--bg-card, #fff)', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', transition: 'transform 0.2s',
                    }}>
                        {/* Imagen del torneo */}
                        <div style={{ position: 'relative', height: '160px', overflow: 'hidden' }}>
                            <img
                                src={TORNEO_IMAGES[index % TORNEO_IMAGES.length]}
                                alt={torneo.nombre}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                loading="lazy"
                            />
                            <div style={{
                                position: 'absolute', bottom: 0, left: 0, right: 0,
                                background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                                padding: '30px 16px 12px', color: '#fff'
                            }}>
                                <h3 style={{ margin: '0 0 4px 0', fontSize: '17px', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>{torneo.nombre}</h3>
                                <p style={{ margin: 0, opacity: 0.9, fontSize: '12px' }}>
                                    {torneo.entidad_organizadora || 'Organizador'}
                                </p>
                            </div>
                            {torneo.costo_inscripcion ? (
                                <span style={{
                                    position: 'absolute', top: 10, right: 10,
                                    background: '#ef8700', color: '#fff', padding: '3px 10px',
                                    borderRadius: 20, fontSize: '12px', fontWeight: 'bold'
                                }}>
                                    {torneo.moneda || 'PEN'} {torneo.costo_inscripcion}
                                </span>
                            ) : (
                                <span style={{
                                    position: 'absolute', top: 10, right: 10,
                                    background: '#27ae60', color: '#fff', padding: '3px 10px',
                                    borderRadius: 20, fontSize: '12px', fontWeight: 'bold'
                                }}>
                                    Gratis
                                </span>
                            )}
                        </div>

                        {/* Body del card */}
                        <div style={{ padding: '14px 16px' }}>
                            {torneo.descripcion && (
                                <p style={{ color: 'var(--text-secondary, #555)', fontSize: '13px', marginTop: 0, marginBottom: 10 }}>{torneo.descripcion}</p>
                            )}

                            <div style={{ fontSize: '12px', color: 'var(--text-secondary, #666)', lineHeight: '1.8' }}>
                                {torneo.lugar && <div><i className="fa-solid fa-location-dot" style={{ width: 16, color: '#ef8700' }}></i> {torneo.lugar}</div>}
                                {torneo.categorias && <div><i className="fa-solid fa-layer-group" style={{ width: 16, color: '#ef8700' }}></i> {torneo.categorias}</div>}
                                <div><i className="fa-regular fa-calendar" style={{ width: 16, color: '#ef8700' }}></i> {formatFecha(torneo.fecha_inicio_torneo)} - {formatFecha(torneo.fecha_fin_torneo)}</div>
                            </div>

                            <div style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--border-color, #f0f0f0)'
                            }}>
                                <div style={{ fontSize: '12px', color: 'var(--text-secondary, #7f8c8d)' }}>
                                    {torneo.total_inscritos || 0}{torneo.max_equipos ? '/' + torneo.max_equipos : ''} equipos
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                                <button onClick={() => navigate(`/torneo/${torneo.vit_torneo_id}`)} style={{
                                    flex: 1, padding: '9px',
                                    background: '#3498db', color: '#fff', border: 'none',
                                    borderRadius: '6px', fontSize: '13px', cursor: 'pointer', fontWeight: 'bold'
                                }}>
                                    Ver Detalles
                                </button>
                                {isClub && (
                                    <button onClick={() => navigate(`/inscribirse/${torneo.vit_torneo_id}`)} style={{
                                        flex: 1, padding: '9px',
                                        background: '#27ae60', color: '#fff', border: 'none',
                                        borderRadius: '6px', fontSize: '13px', cursor: 'pointer', fontWeight: 'bold'
                                    }}>
                                        Inscribirse
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Marketplace;
