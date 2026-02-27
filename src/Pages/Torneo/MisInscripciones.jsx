import React, { useState, useEffect } from 'react';
import { useAuth } from '../../Context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { listarMisInscripciones, obtenerDetalleJugadores } from '../../Funciones/TorneoService';

const ESTADOS = {
    0: { texto: 'Pendiente', color: '#f39c12', bg: '#fef9e7' },
    1: { texto: 'Aprobada', color: '#27ae60', bg: '#eafaf1' },
    2: { texto: 'Rechazada', color: '#e74c3c', bg: '#fdedec' },
};

const MisInscripciones = () => {
    const { Request, clubData } = useAuth();
    const navigate = useNavigate();
    const [inscripciones, setInscripciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtro, setFiltro] = useState(-1); // -1 = Todas
    const [expandida, setExpandida] = useState(null);
    const [jugadoresDetalle, setJugadoresDetalle] = useState({});
    const [loadingDetalle, setLoadingDetalle] = useState(null);

    useEffect(() => {
        if (clubData?.vit_institucion_id) {
            cargarInscripciones();
        }
    }, [clubData]);

    const cargarInscripciones = async () => {
        setLoading(true);
        try {
            const res = await listarMisInscripciones(Request, clubData.vit_institucion_id);
            setInscripciones(res.data.data || []);
        } catch (err) {
            console.error('Error cargando inscripciones:', err);
        }
        setLoading(false);
    };

    const toggleDetalle = async (insc) => {
        const key = `${insc.vit_torneo_id}_${insc.categoria}`;
        if (expandida === key) {
            setExpandida(null);
            return;
        }
        setExpandida(key);
        if (!jugadoresDetalle[key]) {
            setLoadingDetalle(key);
            try {
                const res = await obtenerDetalleJugadores(Request, insc.vit_torneo_id, clubData.vit_institucion_id, insc.categoria);
                setJugadoresDetalle(prev => ({ ...prev, [key]: res.data.data || [] }));
            } catch (err) {
                console.error('Error cargando detalle:', err);
                setJugadoresDetalle(prev => ({ ...prev, [key]: [] }));
            }
            setLoadingDetalle(null);
        }
    };

    const formatFecha = (f) => {
        if (!f) return '-';
        return new Date(f).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const inscripcionesFiltradas = filtro === -1
        ? inscripciones
        : inscripciones.filter(i => i.estado === filtro || i.estado === String(filtro));

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
            <h2 style={{ color: '#2c3e50', marginBottom: '5px' }}>Mis Inscripciones</h2>
            <p style={{ color: '#7f8c8d', marginBottom: '20px' }}>
                Seguimiento de las inscripciones enviadas a torneos
            </p>

            {/* Filtros */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                {[{ val: -1, label: 'Todas' }, { val: 0, label: 'Pendientes' }, { val: 1, label: 'Aprobadas' }, { val: 2, label: 'Rechazadas' }].map(f => (
                    <button key={f.val} onClick={() => setFiltro(f.val)} style={{
                        padding: '6px 16px', borderRadius: '20px', cursor: 'pointer', fontWeight: '600', fontSize: '13px',
                        border: filtro === f.val ? '2px solid #3498db' : '1px solid #e0e0e0',
                        background: filtro === f.val ? '#ebf5fb' : '#fff',
                        color: filtro === f.val ? '#3498db' : '#555'
                    }}>
                        {f.label}
                    </button>
                ))}
            </div>

            {loading && <p style={{ textAlign: 'center', color: '#7f8c8d' }}>Cargando inscripciones...</p>}

            {!loading && inscripcionesFiltradas.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: '#7f8c8d' }}>
                    <i className="fa-solid fa-clipboard-list" style={{ fontSize: '40px', marginBottom: '10px', display: 'block' }}></i>
                    <p>No tienes inscripciones {filtro !== -1 ? 'con este filtro' : 'aún'}</p>
                    <button onClick={() => navigate('/marketplace')} style={{
                        padding: '10px 20px', background: '#3498db', color: '#fff',
                        border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'
                    }}>
                        Ver Torneos Disponibles
                    </button>
                </div>
            )}

            {inscripcionesFiltradas.map((insc, idx) => {
                const key = `${insc.vit_torneo_id}_${insc.categoria}`;
                const estado = ESTADOS[insc.estado] || ESTADOS[0];
                const isExpanded = expandida === key;
                const detalle = jugadoresDetalle[key];

                return (
                    <div key={idx} style={{
                        border: '1px solid #e0e0e0', borderRadius: '10px', marginBottom: '12px',
                        overflow: 'hidden', background: '#fff'
                    }}>
                        <div onClick={() => toggleDetalle(insc)} style={{
                            padding: '16px', cursor: 'pointer', display: 'flex',
                            justifyContent: 'space-between', alignItems: 'center'
                        }}>
                            <div>
                                <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#2c3e50' }}>
                                    {insc.nombre_torneo}
                                </div>
                                <div style={{ fontSize: '13px', color: '#7f8c8d', marginTop: '4px' }}>
                                    Categoría: <strong>{insc.categoria}</strong> — {insc.cant_jugadores || 0} jugadores — {formatFecha(insc.fecha_inscripcion)}
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{
                                    padding: '4px 12px', borderRadius: '12px', fontSize: '12px',
                                    fontWeight: 'bold', color: estado.color, background: estado.bg
                                }}>
                                    {estado.texto}
                                </span>
                                <i className={`fa-solid fa-chevron-${isExpanded ? 'up' : 'down'}`} style={{ color: '#bdc3c7' }}></i>
                            </div>
                        </div>

                        {isExpanded && (
                            <div style={{ padding: '0 16px 16px', borderTop: '1px solid #f0f0f0' }}>
                                {insc.observacion_organizador && (
                                    <div style={{
                                        padding: '10px', margin: '10px 0', borderRadius: '6px',
                                        background: insc.estado === 2 || insc.estado === '2' ? '#fdedec' : '#fef9e7',
                                        border: `1px solid ${insc.estado === 2 || insc.estado === '2' ? '#e74c3c' : '#f39c12'}`,
                                        fontSize: '13px'
                                    }}>
                                        <strong>Observación del organizador:</strong> {insc.observacion_organizador}
                                    </div>
                                )}
                                {loadingDetalle === key ? (
                                    <p style={{ textAlign: 'center', color: '#7f8c8d', fontSize: '13px' }}>Cargando jugadores...</p>
                                ) : detalle && detalle.length > 0 ? (
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginTop: '10px' }}>
                                        <thead>
                                            <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #e0e0e0' }}>
                                                <th style={{ padding: '6px 8px', textAlign: 'left' }}>Jugador</th>
                                                <th style={{ padding: '6px 8px', textAlign: 'center' }}>Posición</th>
                                                <th style={{ padding: '6px 8px', textAlign: 'center' }}>Edad</th>
                                                <th style={{ padding: '6px 8px', textAlign: 'center' }}>Cumple</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {detalle.map((j, i) => (
                                                <tr key={i} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                                    <td style={{ padding: '6px 8px' }}>{j.nombres} {j.apellidos}</td>
                                                    <td style={{ padding: '6px 8px', textAlign: 'center' }}>{j.posicion || '-'}</td>
                                                    <td style={{ padding: '6px 8px', textAlign: 'center' }}>{j.edad_al_inscribir || '-'}</td>
                                                    <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                                                        <span style={{
                                                            color: j.cumple_edad === 1 || j.cumple_edad === '1' ? '#27ae60' : '#e74c3c',
                                                            fontWeight: 'bold'
                                                        }}>
                                                            {j.cumple_edad === 1 || j.cumple_edad === '1' ? 'Sí' : 'No'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p style={{ color: '#7f8c8d', fontSize: '13px', margin: '10px 0' }}>Sin detalle de jugadores.</p>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default MisInscripciones;
