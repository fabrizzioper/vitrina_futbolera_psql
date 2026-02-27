import React, { useState, useEffect } from 'react';
import { useAuth } from '../../Context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { listarMisPartidosVeedor } from '../../Funciones/TorneoService';

const MisPartidosVeedor = () => {
    const { Request, currentUser } = useAuth();
    const navigate = useNavigate();
    const [partidos, setPartidos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargarPartidos();
    }, []);

    const cargarPartidos = async () => {
        setLoading(true);
        try {
            const res = await listarMisPartidosVeedor(Request, currentUser.vit_jugador_id);
            setPartidos(res.data.data || []);
        } catch (err) {
            console.error('Error cargando partidos:', err);
        }
        setLoading(false);
    };

    const getEstadoBadge = (estado) => {
        switch (estado) {
            case 0: return { texto: 'Pendiente', color: '#f39c12', bg: '#fef9e7' };
            case 1: return { texto: 'Alineado', color: '#3498db', bg: '#ebf5fb' };
            case 2: return { texto: 'En Curso', color: '#e67e22', bg: '#fef9e7' };
            case 3: return { texto: 'Jugado', color: '#27ae60', bg: '#eafaf1' };
            default: return { texto: 'Pendiente', color: '#95a5a6', bg: '#f2f3f4' };
        }
    };

    // Agrupar por torneo
    const partidosPorTorneo = partidos.reduce((acc, p) => {
        const key = p.torneo_nombre || 'Sin torneo';
        if (!acc[key]) acc[key] = { torneoId: p.vit_torneo_id, partidos: [] };
        acc[key].partidos.push(p);
        return acc;
    }, {});

    if (loading) return <div style={{ textAlign: 'center', padding: '40px', color: '#7f8c8d' }}>Cargando partidos...</div>;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            <h2 style={{ color: '#2c3e50', marginBottom: '5px' }}>
                <i className="fa-solid fa-clipboard-check" style={{ marginRight: '8px', color: '#8e44ad' }}></i>
                Mis Partidos Asignados
            </h2>
            <p style={{ color: '#7f8c8d', marginBottom: '25px' }}>
                Partidos donde has sido asignado como veedor/planillero
            </p>

            {partidos.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#7f8c8d' }}>
                    <i className="fa-solid fa-calendar-xmark" style={{ fontSize: '3rem', marginBottom: '15px', display: 'block', color: '#bdc3c7' }}></i>
                    <h3 style={{ color: '#95a5a6' }}>No tienes partidos asignados aún</h3>
                    <p style={{ fontSize: '14px' }}>El organizador del torneo te asignará partidos para que operes la planilla.</p>
                </div>
            ) : (
                Object.entries(partidosPorTorneo).map(([torneoNombre, { torneoId, partidos: pts }]) => (
                    <div key={torneoNombre} style={{ marginBottom: '30px' }}>
                        <h3 style={{ color: '#8e44ad', borderBottom: '2px solid #8e44ad', paddingBottom: '6px', marginBottom: '15px' }}>
                            <i className="fa-solid fa-trophy" style={{ marginRight: '8px' }}></i>
                            {torneoNombre}
                        </h3>

                        {pts.map(p => {
                            const badge = getEstadoBadge(p.estado_acta);
                            return (
                                <div key={p.vit_torneo_partido_id} style={{
                                    background: '#fff', borderRadius: '8px', padding: '15px',
                                    marginBottom: '10px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                                    border: '1px solid #f0f0f0'
                                }}>
                                    {/* Header: categoría, jornada, estado */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '6px' }}>
                                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                            {p.categoria && <span style={{ fontSize: '11px', background: '#ecf0f1', padding: '2px 8px', borderRadius: '10px', color: '#555' }}>{p.categoria}</span>}
                                            {p.jornada && <span style={{ fontSize: '11px', background: '#ecf0f1', padding: '2px 8px', borderRadius: '10px', color: '#555' }}>Jornada {p.jornada}</span>}
                                        </div>
                                        <span style={{
                                            padding: '3px 10px', borderRadius: '10px', fontSize: '11px',
                                            fontWeight: 'bold', color: badge.color, background: badge.bg
                                        }}>
                                            {badge.texto}
                                        </span>
                                    </div>

                                    {/* Fecha y sede */}
                                    {(p.fecha || p.sede) && (
                                        <div style={{ fontSize: '12px', color: '#7f8c8d', marginBottom: '10px' }}>
                                            {p.fecha && <span><i className="fa-solid fa-calendar" style={{ marginRight: '4px' }}></i>{p.fecha} {p.hora || ''}</span>}
                                            {p.sede && <span style={{ marginLeft: '12px' }}><i className="fa-solid fa-location-dot" style={{ marginRight: '4px' }}></i>{p.sede}</span>}
                                        </div>
                                    )}

                                    {/* Equipos */}
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', margin: '10px 0' }}>
                                        <div style={{ textAlign: 'center', flex: 1 }}>
                                            {p.logo_local && <img src={p.logo_local} alt="" style={{ width: 36, height: 36, borderRadius: '50%', marginBottom: '4px' }} onError={e => e.target.style.display = 'none'} />}
                                            <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#2c3e50' }}>{p.local_nombre || 'Local'}</div>
                                        </div>

                                        <div style={{ textAlign: 'center', minWidth: '80px' }}>
                                            {p.estado_acta >= 2 ? (
                                                <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#2c3e50' }}>
                                                    {p.goles_local} - {p.goles_visitante}
                                                </span>
                                            ) : (
                                                <span style={{ fontSize: '16px', color: '#bdc3c7' }}>vs</span>
                                            )}
                                        </div>

                                        <div style={{ textAlign: 'center', flex: 1 }}>
                                            {p.logo_visitante && <img src={p.logo_visitante} alt="" style={{ width: 36, height: 36, borderRadius: '50%', marginBottom: '4px' }} onError={e => e.target.style.display = 'none'} />}
                                            <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#2c3e50' }}>{p.visitante_nombre || 'Visitante'}</div>
                                        </div>
                                    </div>

                                    {/* Botones */}
                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '10px' }}>
                                        {p.estado_acta < 3 && (
                                            <button onClick={() => navigate(`/torneo/${p.vit_torneo_id}/partido/${p.vit_torneo_partido_id}/planilla`)} style={{
                                                padding: '8px 20px', background: '#8e44ad', color: '#fff',
                                                border: 'none', borderRadius: '6px', cursor: 'pointer',
                                                fontWeight: 'bold', fontSize: '13px'
                                            }}>
                                                <i className="fa-solid fa-clipboard" style={{ marginRight: '6px' }}></i>
                                                Planilla
                                            </button>
                                        )}
                                        {p.estado_acta === 3 && (
                                            <button onClick={() => navigate(`/torneo/${p.vit_torneo_id}/partido/${p.vit_torneo_partido_id}/acta`)} style={{
                                                padding: '8px 20px', background: '#27ae60', color: '#fff',
                                                border: 'none', borderRadius: '6px', cursor: 'pointer',
                                                fontWeight: 'bold', fontSize: '13px'
                                            }}>
                                                <i className="fa-solid fa-file-lines" style={{ marginRight: '6px' }}></i>
                                                Ver Acta
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ))
            )}
        </div>
    );
};

export default MisPartidosVeedor;
