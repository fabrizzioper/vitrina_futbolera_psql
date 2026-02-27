import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../Context/AuthContext'
import { listarTodosTorneos } from '../../../Funciones/TorneoService'
import './Torneos.css'

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

const ESTADO_BADGE = {
    'Finalizado': { bg: '#95a5a6', label: 'Finalizado' },
    'En curso': { bg: '#27ae60', label: 'En curso' },
    'Inscripciones abiertas': { bg: '#ef8700', label: 'Inscripciones abiertas' },
    'Proximamente': { bg: '#3498db', label: 'Próximamente' },
    'Activo': { bg: '#27ae60', label: 'Activo' },
};

const Torneos = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { Request, isClub } = useAuth();
    let previusURL = location.state?.from.pathname || "/"

    const [torneos, setTorneos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtro, setFiltro] = useState('todos'); // todos, activos, finalizados

    useEffect(() => {
        cargarTorneos();
    }, [Request]);

    const cargarTorneos = async () => {
        if (!Request?.Dominio) { setLoading(false); return; }
        setLoading(true);
        try {
            const res = await listarTodosTorneos(Request);
            setTorneos(res.data.data || []);
        } catch (err) {
            console.error('Error cargando torneos:', err);
        }
        setLoading(false);
    };

    const formatFecha = (fecha) => {
        if (!fecha) return '-';
        const d = new Date(fecha);
        return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const torneosFiltrados = torneos.filter(t => {
        if (filtro === 'activos') return t.estado_nombre !== 'Finalizado';
        if (filtro === 'finalizados') return t.estado_nombre === 'Finalizado';
        return true;
    });

    return (
        <div className='out-div-seccion'>
            <div className='header-seccion row gap-3'>
                <div className='col'>
                    <Link className='Volver-link' to={previusURL}>
                        <span className='icon-flecha2'></span>
                        <h5 className='d-flex'>Torneos & Campeonatos <span className='cant-Jugadores'>({torneos.length})</span></h5>
                    </Link>
                </div>
            </div>

            {/* Filtros */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                {[
                    { key: 'todos', label: 'Todos' },
                    { key: 'activos', label: 'Activos / Próximos' },
                    { key: 'finalizados', label: 'Finalizados' },
                ].map(f => (
                    <button
                        key={f.key}
                        onClick={() => setFiltro(f.key)}
                        style={{
                            padding: '6px 16px',
                            borderRadius: '20px',
                            border: filtro === f.key ? '2px solid #ef8700' : '1px solid var(--border-color, #ddd)',
                            background: filtro === f.key ? '#ef8700' : 'var(--bg-card, #fff)',
                            color: filtro === f.key ? '#fff' : 'var(--text-primary, #333)',
                            fontSize: '13px',
                            fontWeight: filtro === f.key ? 'bold' : 'normal',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Loading */}
            {loading && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginTop: '16px' }}>
                    {[...Array(6)].map((_, i) => (
                        <div key={i} style={{
                            borderRadius: '12px', overflow: 'hidden', background: 'var(--card-section-bg, #f5f5f5)',
                            height: '300px', opacity: 0.6
                        }}>
                            <div style={{ height: '160px', background: 'var(--card-section-bg, #e0e0e0)' }}></div>
                            <div style={{ padding: '14px' }}>
                                <div style={{ width: '80%', height: 14, background: 'var(--border-color, #ddd)', borderRadius: 4, marginBottom: 8 }}></div>
                                <div style={{ width: '60%', height: 10, background: 'var(--border-color, #ddd)', borderRadius: 4 }}></div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Sin resultados */}
            {!loading && torneosFiltrados.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary, #7f8c8d)' }}>
                    <i className="fa-solid fa-trophy" style={{ fontSize: '2.5rem', marginBottom: '12px', display: 'block', opacity: 0.4 }}></i>
                    <p style={{ fontSize: '16px', margin: 0 }}>
                        {filtro === 'finalizados' ? 'No hay torneos finalizados aún' : 'No hay torneos disponibles'}
                    </p>
                </div>
            )}

            {/* Grid de torneos */}
            {!loading && torneosFiltrados.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginTop: '16px' }}>
                    {torneosFiltrados.map((torneo, index) => {
                        const badge = ESTADO_BADGE[torneo.estado_nombre] || ESTADO_BADGE['Activo'];
                        const esFinalizado = torneo.estado_nombre === 'Finalizado';

                        return (
                            <div key={torneo.vit_torneo_id} style={{
                                borderRadius: '12px', overflow: 'hidden',
                                background: 'var(--bg-card, #fff)',
                                border: '1px solid var(--border-color, #e0e0e0)',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                opacity: esFinalizado ? 0.8 : 1,
                                transition: 'transform 0.2s',
                            }}>
                                {/* Imagen */}
                                <div style={{ position: 'relative', height: '160px', overflow: 'hidden' }}>
                                    <img
                                        src={TORNEO_IMAGES[index % TORNEO_IMAGES.length]}
                                        alt={torneo.nombre}
                                        style={{
                                            width: '100%', height: '100%', objectFit: 'cover',
                                            filter: esFinalizado ? 'grayscale(40%)' : 'none'
                                        }}
                                        loading="lazy"
                                    />
                                    <div style={{
                                        position: 'absolute', bottom: 0, left: 0, right: 0,
                                        background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                                        padding: '30px 14px 10px', color: '#fff'
                                    }}>
                                        <h3 style={{ margin: '0 0 2px 0', fontSize: '16px', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
                                            {torneo.nombre}
                                        </h3>
                                        <p style={{ margin: 0, opacity: 0.9, fontSize: '12px' }}>
                                            {torneo.entidad_organizadora || 'Organizador'}
                                        </p>
                                    </div>
                                    {/* Badge estado */}
                                    <span style={{
                                        position: 'absolute', top: 10, left: 10,
                                        background: badge.bg, color: '#fff', padding: '3px 10px',
                                        borderRadius: 20, fontSize: '11px', fontWeight: 'bold'
                                    }}>
                                        {badge.label}
                                    </span>
                                    {/* Badge precio */}
                                    {torneo.costo_inscripcion ? (
                                        <span style={{
                                            position: 'absolute', top: 10, right: 10,
                                            background: '#ef8700', color: '#fff', padding: '3px 10px',
                                            borderRadius: 20, fontSize: '11px', fontWeight: 'bold'
                                        }}>
                                            {torneo.moneda || 'PEN'} {torneo.costo_inscripcion}
                                        </span>
                                    ) : (
                                        <span style={{
                                            position: 'absolute', top: 10, right: 10,
                                            background: '#27ae60', color: '#fff', padding: '3px 10px',
                                            borderRadius: 20, fontSize: '11px', fontWeight: 'bold'
                                        }}>
                                            Gratis
                                        </span>
                                    )}
                                </div>

                                {/* Body */}
                                <div style={{ padding: '12px 14px' }}>
                                    {torneo.descripcion && (
                                        <p style={{
                                            color: 'var(--text-secondary, #555)', fontSize: '12px',
                                            marginTop: 0, marginBottom: 10,
                                            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                                        }}>
                                            {torneo.descripcion}
                                        </p>
                                    )}

                                    <div style={{ fontSize: '12px', color: 'var(--text-secondary, #666)', lineHeight: '1.8' }}>
                                        {torneo.lugar && (
                                            <div><i className="fa-solid fa-location-dot" style={{ width: 16, color: '#ef8700' }}></i> {torneo.lugar}</div>
                                        )}
                                        {torneo.categorias && (
                                            <div><i className="fa-solid fa-layer-group" style={{ width: 16, color: '#ef8700' }}></i> {torneo.categorias}</div>
                                        )}
                                        <div>
                                            <i className="fa-regular fa-calendar" style={{ width: 16, color: '#ef8700' }}></i>{' '}
                                            {formatFecha(torneo.fecha_inicio_torneo)} - {formatFecha(torneo.fecha_fin_torneo)}
                                        </div>
                                    </div>

                                    <div style={{
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        marginTop: '10px', paddingTop: '8px', borderTop: '1px solid var(--border-color, #f0f0f0)'
                                    }}>
                                        <div style={{ fontSize: '12px', color: 'var(--text-secondary, #7f8c8d)' }}>
                                            {torneo.total_inscritos || 0}{torneo.max_equipos ? '/' + torneo.max_equipos : ''} equipos
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                                        <button onClick={() => navigate(`/torneo/${torneo.vit_torneo_id}`)} style={{
                                            flex: 1, padding: '8px',
                                            background: '#3498db', color: '#fff', border: 'none',
                                            borderRadius: '6px', fontSize: '13px', cursor: 'pointer', fontWeight: 'bold'
                                        }}>
                                            Ver Detalles
                                        </button>
                                        {isClub && !esFinalizado && (
                                            <button onClick={() => navigate(`/inscribirse/${torneo.vit_torneo_id}`)} style={{
                                                flex: 1, padding: '8px',
                                                background: '#27ae60', color: '#fff', border: 'none',
                                                borderRadius: '6px', fontSize: '13px', cursor: 'pointer', fontWeight: 'bold'
                                            }}>
                                                Inscribirse
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    )
}

export default Torneos
