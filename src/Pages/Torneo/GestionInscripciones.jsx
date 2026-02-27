import React, { useState, useEffect } from 'react';
import { useAuth } from '../../Context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import {
    obtenerTorneo, listarInscripcionesPorTorneo,
    aprobarRechazarInscripcion, obtenerDetalleJugadores
} from '../../Funciones/TorneoService';
import Swal from 'sweetalert2';

const ESTADOS = {
    0: { texto: 'Pendiente', color: '#f39c12', bg: '#fef9e7' },
    1: { texto: 'Aprobada', color: '#27ae60', bg: '#eafaf1' },
    2: { texto: 'Rechazada', color: '#e74c3c', bg: '#fdedec' },
};

const GestionInscripciones = () => {
    const { Request } = useAuth();
    const { id } = useParams();
    const navigate = useNavigate();

    const [torneo, setTorneo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [categorias, setCategorias] = useState([]);
    const [categoriaActiva, setCategoriaActiva] = useState('');
    const [inscripciones, setInscripciones] = useState([]);
    const [loadingInsc, setLoadingInsc] = useState(false);
    const [filtroEstado, setFiltroEstado] = useState(-1);
    const [expandida, setExpandida] = useState(null);
    const [jugadoresDetalle, setJugadoresDetalle] = useState({});
    const [loadingDetalle, setLoadingDetalle] = useState(null);

    useEffect(() => {
        cargarTorneo();
    }, [id]);

    const cargarTorneo = async () => {
        setLoading(true);
        try {
            const res = await obtenerTorneo(Request, id);
            const data = res.data.data;
            if (data && data.length > 0) {
                const t = data[0];
                setTorneo(t);
                if (t.categorias) {
                    const cats = t.categorias.split(',').map(c => c.trim()).filter(c => c);
                    setCategorias(cats);
                    if (cats.length > 0) {
                        setCategoriaActiva(cats[0]);
                        cargarInscripciones(cats[0], -1);
                    }
                }
            }
        } catch (err) {
            console.error('Error cargando torneo:', err);
        }
        setLoading(false);
    };

    const cargarInscripciones = async (categoria, estadoFiltro) => {
        setLoadingInsc(true);
        try {
            const res = await listarInscripcionesPorTorneo(Request, id, categoria, estadoFiltro);
            setInscripciones(res.data.data || []);
        } catch (err) {
            console.error('Error cargando inscripciones:', err);
            setInscripciones([]);
        }
        setLoadingInsc(false);
    };

    const handleCambiarCategoria = (cat) => {
        setCategoriaActiva(cat);
        setExpandida(null);
        setJugadoresDetalle({});
        cargarInscripciones(cat, filtroEstado);
    };

    const handleCambiarFiltro = (estado) => {
        setFiltroEstado(estado);
        cargarInscripciones(categoriaActiva, estado);
    };

    const toggleDetalle = async (insc) => {
        const key = insc.vit_torneo_institucion_id;
        if (expandida === key) {
            setExpandida(null);
            return;
        }
        setExpandida(key);
        if (!jugadoresDetalle[key]) {
            setLoadingDetalle(key);
            try {
                const res = await obtenerDetalleJugadores(Request, id, insc.vit_institucion_id, categoriaActiva);
                setJugadoresDetalle(prev => ({ ...prev, [key]: res.data.data || [] }));
            } catch (err) {
                setJugadoresDetalle(prev => ({ ...prev, [key]: [] }));
            }
            setLoadingDetalle(null);
        }
    };

    const handleAprobar = async (insc) => {
        const result = await Swal.fire({
            title: `Aprobar inscripción de ${insc.nombre_club}?`,
            text: 'El club quedará inscrito oficialmente en el torneo.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Aprobar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#27ae60',
            background: '#0e3769',
            color: '#fff'
        });
        if (result.isConfirmed) {
            try {
                await aprobarRechazarInscripcion(Request, insc.vit_torneo_institucion_id, 1, '');
                Swal.fire({ icon: 'success', title: 'Inscripción aprobada', timer: 1500, showConfirmButton: false, background: '#0e3769', color: '#fff' });
                cargarInscripciones(categoriaActiva, filtroEstado);
            } catch (err) {
                Swal.fire({ icon: 'error', title: 'Error al aprobar', background: '#0e3769', color: '#fff' });
            }
        }
    };

    const handleRechazar = async (insc) => {
        const { value: observacion } = await Swal.fire({
            title: `Rechazar inscripción de ${insc.nombre_club}?`,
            input: 'textarea',
            inputLabel: 'Motivo del rechazo',
            inputPlaceholder: 'Escribe el motivo...',
            showCancelButton: true,
            confirmButtonText: 'Rechazar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#e74c3c',
            background: '#0e3769',
            color: '#fff',
            inputValidator: (value) => {
                if (!value) return 'Debes indicar un motivo';
            }
        });
        if (observacion) {
            try {
                await aprobarRechazarInscripcion(Request, insc.vit_torneo_institucion_id, 2, observacion);
                Swal.fire({ icon: 'success', title: 'Inscripción rechazada', timer: 1500, showConfirmButton: false, background: '#0e3769', color: '#fff' });
                cargarInscripciones(categoriaActiva, filtroEstado);
            } catch (err) {
                Swal.fire({ icon: 'error', title: 'Error al rechazar', background: '#0e3769', color: '#fff' });
            }
        }
    };

    const formatFecha = (f) => {
        if (!f) return '-';
        return new Date(f).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '40px', color: '#7f8c8d' }}>Cargando...</div>;
    if (!torneo) return <div style={{ textAlign: 'center', padding: '40px', color: '#e74c3c' }}>Torneo no encontrado</div>;

    return (
        <div style={{ maxWidth: '950px', margin: '0 auto', padding: '20px' }}>
            <button onClick={() => navigate(`/torneo/${id}`)} style={{
                padding: '8px 16px', background: 'transparent', color: '#3498db',
                border: '1px solid #3498db', borderRadius: '4px', cursor: 'pointer', marginBottom: '20px'
            }}>
                Volver al Torneo
            </button>

            <h2 style={{ color: '#2c3e50', marginBottom: '5px' }}>Gestión de Inscripciones</h2>
            <p style={{ color: '#7f8c8d', marginBottom: '20px' }}>{torneo.nombre}</p>

            {/* Tabs de categorías */}
            <div style={{ display: 'flex', gap: '4px', marginBottom: '15px', overflowX: 'auto' }}>
                {categorias.map(cat => (
                    <button key={cat} onClick={() => handleCambiarCategoria(cat)} style={{
                        padding: '8px 18px', borderRadius: '6px 6px 0 0', cursor: 'pointer',
                        fontWeight: '600', fontSize: '13px', border: 'none',
                        background: categoriaActiva === cat ? '#3498db' : '#ecf0f1',
                        color: categoriaActiva === cat ? '#fff' : '#555'
                    }}>
                        {cat}
                    </button>
                ))}
            </div>

            {/* Filtros de estado */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                {[{ val: -1, label: 'Todas' }, { val: 0, label: 'Pendientes' }, { val: 1, label: 'Aprobadas' }, { val: 2, label: 'Rechazadas' }].map(f => (
                    <button key={f.val} onClick={() => handleCambiarFiltro(f.val)} style={{
                        padding: '5px 14px', borderRadius: '20px', cursor: 'pointer', fontSize: '12px',
                        fontWeight: '600',
                        border: filtroEstado === f.val ? '2px solid #3498db' : '1px solid #e0e0e0',
                        background: filtroEstado === f.val ? '#ebf5fb' : '#fff',
                        color: filtroEstado === f.val ? '#3498db' : '#555'
                    }}>
                        {f.label}
                    </button>
                ))}
            </div>

            {loadingInsc && <p style={{ textAlign: 'center', color: '#7f8c8d' }}>Cargando inscripciones...</p>}

            {!loadingInsc && inscripciones.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: '#7f8c8d' }}>
                    <p>No hay inscripciones para esta categoría{filtroEstado !== -1 ? ' con este filtro' : ''}.</p>
                </div>
            )}

            {inscripciones.map((insc) => {
                const estado = ESTADOS[insc.estado] || ESTADOS[0];
                const isExpanded = expandida === insc.vit_torneo_institucion_id;
                const detalle = jugadoresDetalle[insc.vit_torneo_institucion_id];

                return (
                    <div key={insc.vit_torneo_institucion_id} style={{
                        border: '1px solid #e0e0e0', borderRadius: '10px', marginBottom: '12px',
                        overflow: 'hidden', background: '#fff'
                    }}>
                        <div onClick={() => toggleDetalle(insc)} style={{
                            padding: '14px 16px', cursor: 'pointer', display: 'flex',
                            justifyContent: 'space-between', alignItems: 'center'
                        }}>
                            <div>
                                <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#2c3e50' }}>
                                    {insc.nombre_club}
                                </div>
                                <div style={{ fontSize: '13px', color: '#7f8c8d', marginTop: '3px' }}>
                                    {insc.cant_jugadores || 0} jugadores — Contacto: {insc.nombre_contacto || '-'} — {formatFecha(insc.fecha_inscripcion)}
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                                {loadingDetalle === insc.vit_torneo_institucion_id ? (
                                    <p style={{ textAlign: 'center', color: '#7f8c8d', fontSize: '13px' }}>Cargando jugadores...</p>
                                ) : detalle && detalle.length > 0 ? (
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginTop: '10px' }}>
                                        <thead>
                                            <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #e0e0e0' }}>
                                                <th style={{ padding: '6px 8px', textAlign: 'left' }}>Jugador</th>
                                                <th style={{ padding: '6px 8px', textAlign: 'center' }}>Posición</th>
                                                <th style={{ padding: '6px 8px', textAlign: 'center' }}>Edad</th>
                                                <th style={{ padding: '6px 8px', textAlign: 'center' }}>Cumple Edad</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {detalle.map((j, i) => (
                                                <tr key={i} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                                    <td style={{ padding: '6px 8px' }}>
                                                        <div style={{ fontWeight: '600' }}>{j.nombres} {j.apellidos}</div>
                                                        <div style={{ fontSize: '11px', color: '#95a5a6' }}>{j.pais || ''}</div>
                                                    </td>
                                                    <td style={{ padding: '6px 8px', textAlign: 'center' }}>{j.posicion || '-'}</td>
                                                    <td style={{ padding: '6px 8px', textAlign: 'center' }}>{j.edad_al_inscribir || '-'}</td>
                                                    <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                                                        <span style={{
                                                            padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold',
                                                            color: j.cumple_edad === 1 || j.cumple_edad === '1' ? '#27ae60' : '#e74c3c',
                                                            background: j.cumple_edad === 1 || j.cumple_edad === '1' ? '#eafaf1' : '#fdedec'
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

                                {/* Botones de acción (solo si está pendiente) */}
                                {(insc.estado === 0 || insc.estado === '0') && (
                                    <div style={{ display: 'flex', gap: '10px', marginTop: '15px', justifyContent: 'flex-end' }}>
                                        <button onClick={(e) => { e.stopPropagation(); handleRechazar(insc); }} style={{
                                            padding: '8px 20px', background: '#e74c3c', color: '#fff',
                                            border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px'
                                        }}>
                                            Rechazar
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); handleAprobar(insc); }} style={{
                                            padding: '8px 20px', background: '#27ae60', color: '#fff',
                                            border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px'
                                        }}>
                                            Aprobar
                                        </button>
                                    </div>
                                )}

                                {insc.observacion_organizador && (
                                    <div style={{
                                        padding: '10px', marginTop: '10px', borderRadius: '6px',
                                        background: '#fdedec', border: '1px solid #e74c3c', fontSize: '13px'
                                    }}>
                                        <strong>Observación:</strong> {insc.observacion_organizador}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default GestionInscripciones;
