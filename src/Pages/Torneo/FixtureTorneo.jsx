import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../Context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import { obtenerTorneo, generarFixture, listarFixture, programarPartido, asignarDelegado, listarDelegados } from '../../Funciones/TorneoService';
import Swal from 'sweetalert2';

const FixtureTorneo = () => {
    const { Request, isOrganizador } = useAuth();
    const { id } = useParams();
    const navigate = useNavigate();

    const [torneo, setTorneo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [categorias, setCategorias] = useState([]);
    const [categoriaActiva, setCategoriaActiva] = useState('');
    const [partidos, setPartidos] = useState([]);
    const [loadingFixture, setLoadingFixture] = useState(false);
    const [generando, setGenerando] = useState(false);
    const [delegados, setDelegados] = useState([]);

    const cargarFixture = useCallback(async (categoria) => {
        setLoadingFixture(true);
        try {
            const res = await listarFixture(Request, id, categoria);
            setPartidos(res.data.data || []);
        } catch (err) {
            console.error('Error cargando fixture:', err);
            setPartidos([]);
        }
        setLoadingFixture(false);
    }, [Request, id]);

    const cargarTorneo = useCallback(async () => {
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
                        cargarFixture(cats[0]);
                    }
                }
                if (isOrganizador) {
                    try {
                        const resDel = await listarDelegados(Request, t.vit_torneo_id);
                        setDelegados(resDel.data.data || []);
                    } catch (e) { /* sin delegados */ }
                }
            }
        } catch (err) {
            console.error('Error cargando torneo:', err);
        }
        setLoading(false);
    }, [Request, id, isOrganizador, cargarFixture]);

    useEffect(() => {
        cargarTorneo();
    }, [cargarTorneo]);

    const handleCambiarCategoria = (cat) => {
        setCategoriaActiva(cat);
        cargarFixture(cat);
    };

    const handleGenerarFixture = async () => {
        const result = await Swal.fire({
            title: 'Generar Fixture',
            text: `Se generará el fixture round-robin para la categoría ${categoriaActiva}. ¿Continuar?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Generar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#3498db',
            background: '#0e3769',
            color: '#fff'
        });
        if (result.isConfirmed) {
            setGenerando(true);
            try {
                const res = await generarFixture(Request, id, categoriaActiva);
                const data = res.data.data?.[0];
                if (data?.resultado === 'OK') {
                    Swal.fire({
                        icon: 'success', title: 'Fixture generado',
                        text: `Se generaron ${data.total_partidos || ''} partidos en ${data.total_jornadas || ''} jornadas.`,
                        background: '#0e3769', color: '#fff', confirmButtonColor: '#27ae60'
                    });
                    cargarFixture(categoriaActiva);
                } else {
                    Swal.fire({ icon: 'error', title: 'Error', text: data?.mensaje || 'No se pudo generar el fixture', background: '#0e3769', color: '#fff' });
                }
            } catch (err) {
                Swal.fire({ icon: 'error', title: 'Error', text: 'Ocurrió un error al generar el fixture', background: '#0e3769', color: '#fff' });
            }
            setGenerando(false);
        }
    };

    const handleProgramar = async (partido) => {
        const { value: formValues } = await Swal.fire({
            title: 'Programar Partido',
            html: `
                <div style="text-align:left">
                    <label style="display:block;margin-bottom:4px;font-weight:bold;color:#ccc">Fecha</label>
                    <input id="swal-fecha" type="date" class="swal2-input" value="${partido.fecha ? partido.fecha.substring(0, 10) : ''}" style="width:100%">
                    <label style="display:block;margin-top:10px;margin-bottom:4px;font-weight:bold;color:#ccc">Hora</label>
                    <input id="swal-hora" type="time" class="swal2-input" value="${partido.hora || ''}" style="width:100%">
                    <label style="display:block;margin-top:10px;margin-bottom:4px;font-weight:bold;color:#ccc">Sede / Campo</label>
                    <input id="swal-sede" type="text" class="swal2-input" placeholder="Ej: Cancha Municipal" value="${partido.sede || ''}" style="width:100%">
                </div>`,
            showCancelButton: true,
            confirmButtonText: 'Guardar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#3498db',
            background: '#0e3769',
            color: '#fff',
            preConfirm: () => ({
                fecha: document.getElementById('swal-fecha').value,
                hora: document.getElementById('swal-hora').value,
                sede: document.getElementById('swal-sede').value
            })
        });

        if (formValues) {
            try {
                await programarPartido(Request, partido.vit_torneo_partido_id, formValues.fecha, formValues.hora, formValues.sede);
                Swal.fire({ icon: 'success', title: 'Programado', timer: 1500, showConfirmButton: false, background: '#0e3769', color: '#fff' });
                cargarFixture(categoriaActiva);
            } catch (err) {
                Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo programar', background: '#0e3769', color: '#fff' });
            }
        }
    };

    const handleAsignarDelegado = async (partido) => {
        const options = delegados.reduce((acc, d) => {
            acc[d.vit_jugador_id] = `${d.jugador_nombres} ${d.jugador_apellidos} (${d.tipo_responsable})`;
            return acc;
        }, {});

        const { value: delegadoId } = await Swal.fire({
            title: 'Asignar Delegado',
            input: 'select',
            inputOptions: options,
            inputPlaceholder: 'Seleccionar delegado',
            showCancelButton: true,
            confirmButtonText: 'Asignar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#3498db',
            background: '#0e3769',
            color: '#fff'
        });

        if (delegadoId) {
            try {
                await asignarDelegado(Request, partido.vit_torneo_partido_id, delegadoId);
                Swal.fire({ icon: 'success', title: 'Delegado asignado', timer: 1500, showConfirmButton: false, background: '#0e3769', color: '#fff' });
                cargarFixture(categoriaActiva);
            } catch (err) {
                Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo asignar', background: '#0e3769', color: '#fff' });
            }
        }
    };

    const getEstadoBadge = (partido) => {
        if (partido.estado_acta === 3) return { texto: 'Jugado', color: '#fff', bg: '#27ae60' };
        if (partido.estado_acta === 2) return { texto: 'En Curso', color: '#fff', bg: '#e67e22' };
        if (partido.estado_acta === 1) return { texto: 'Alineado', color: '#fff', bg: '#3498db' };
        return { texto: 'Pendiente', color: '#fff', bg: '#95a5a6' };
    };

    const formatFecha = (fecha) => {
        if (!fecha) return '';
        const d = new Date(fecha);
        return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });
    };

    // Agrupar partidos por jornada
    const partidosPorJornada = {};
    partidos.forEach(p => {
        const j = p.jornada || 0;
        if (!partidosPorJornada[j]) partidosPorJornada[j] = [];
        partidosPorJornada[j].push(p);
    });
    const jornadas = Object.keys(partidosPorJornada).sort((a, b) => Number(a) - Number(b));

    if (loading) return <div style={{ textAlign: 'center', padding: '40px', color: '#7f8c8d' }}>Cargando...</div>;
    if (!torneo) return <div style={{ textAlign: 'center', padding: '40px', color: '#e74c3c' }}>Torneo no encontrado</div>;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <button onClick={() => navigate(`/torneo/${id}`)} style={{
                    padding: '8px 16px', background: 'transparent', color: '#3498db',
                    border: '1px solid #3498db', borderRadius: '4px', cursor: 'pointer'
                }}>
                    Volver al Torneo
                </button>
                <button onClick={() => navigate(`/torneo/${id}/posiciones`)} style={{
                    padding: '8px 16px', background: '#e67e22', color: '#fff',
                    border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'
                }}>
                    <i className="fa-solid fa-ranking-star" style={{ marginRight: '4px' }}></i>
                    Tabla de Posiciones
                </button>
            </div>

            <h2 style={{ color: '#2c3e50', marginBottom: '5px' }}>Fixture del Torneo</h2>
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

            {/* Botón generar fixture (solo organizador) */}
            {isOrganizador && partidos.length === 0 && !loadingFixture && (
                <div style={{
                    textAlign: 'center', padding: '20px', marginBottom: '20px',
                    background: '#ebf5fb', borderRadius: '8px', border: '1px dashed #3498db'
                }}>
                    <p style={{ color: '#2c3e50', marginBottom: '10px' }}>
                        No hay fixture generado para esta categoría.
                    </p>
                    <button onClick={handleGenerarFixture} disabled={generando} style={{
                        padding: '10px 24px', background: '#3498db', color: '#fff',
                        border: 'none', borderRadius: '6px', cursor: generando ? 'not-allowed' : 'pointer',
                        fontWeight: 'bold', fontSize: '14px'
                    }}>
                        {generando ? 'Generando...' : 'Generar Fixture Round-Robin'}
                    </button>
                </div>
            )}

            {loadingFixture && <p style={{ textAlign: 'center', color: '#7f8c8d' }}>Cargando fixture...</p>}

            {!loadingFixture && partidos.length > 0 && (
                <div>
                    {jornadas.map(j => (
                        <div key={j} style={{ marginBottom: '20px' }}>
                            <h4 style={{
                                color: '#2c3e50', fontSize: '15px', padding: '8px 12px',
                                background: '#f8f9fa', borderRadius: '6px', borderLeft: '4px solid #3498db'
                            }}>
                                Jornada {j}
                            </h4>
                            {partidosPorJornada[j].map((p, idx) => {
                                const estado = getEstadoBadge(p);
                                return (
                                    <div key={idx} style={{
                                        padding: '12px 16px', margin: '6px 0', borderRadius: '8px',
                                        background: '#fff', border: '1px solid #e0e0e0'
                                    }}>
                                        {/* Info línea superior */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '12px' }}>
                                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                                <span style={{
                                                    padding: '2px 8px', borderRadius: '10px', fontSize: '11px',
                                                    fontWeight: 'bold', color: estado.color, background: estado.bg
                                                }}>
                                                    {estado.texto}
                                                </span>
                                                {p.fecha && <span style={{ color: '#7f8c8d' }}>{formatFecha(p.fecha)}</span>}
                                                {p.hora && <span style={{ color: '#7f8c8d' }}>{p.hora}</span>}
                                            </div>
                                            {p.sede && <span style={{ color: '#95a5a6', fontSize: '11px' }}>{p.sede}</span>}
                                        </div>

                                        {/* Resultado / VS */}
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                                            <div style={{ flex: 1, textAlign: 'right' }}>
                                                {p.logo_local && <img src={p.logo_local} alt="" style={{ width: 24, height: 24, borderRadius: '50%', marginRight: 6, verticalAlign: 'middle' }} />}
                                                <span style={{ fontWeight: 'bold', color: '#2c3e50', fontSize: '14px' }}>
                                                    {p.nombre_local}
                                                </span>
                                            </div>
                                            <div style={{
                                                padding: '4px 12px', borderRadius: '4px', fontWeight: 'bold', fontSize: '14px',
                                                minWidth: '50px', textAlign: 'center',
                                                background: p.estado_acta === 3 ? '#27ae60' : '#2c3e50',
                                                color: '#fff'
                                            }}>
                                                {p.estado_acta === 3 || p.estado_acta === 2
                                                    ? `${p.goles_local ?? 0} - ${p.goles_visitante ?? 0}`
                                                    : 'VS'}
                                            </div>
                                            <div style={{ flex: 1, textAlign: 'left' }}>
                                                <span style={{ fontWeight: 'bold', color: '#2c3e50', fontSize: '14px' }}>
                                                    {p.nombre_visitante}
                                                </span>
                                                {p.logo_visitante && <img src={p.logo_visitante} alt="" style={{ width: 24, height: 24, borderRadius: '50%', marginLeft: 6, verticalAlign: 'middle' }} />}
                                            </div>
                                        </div>

                                        {/* Delegado */}
                                        {p.delegado_nombres && (
                                            <div style={{ textAlign: 'center', fontSize: '11px', color: '#95a5a6', marginTop: '4px' }}>
                                                Delegado: {p.delegado_nombres} {p.delegado_apellidos}
                                            </div>
                                        )}

                                        {/* Botones de acción */}
                                        <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                                            {isOrganizador && p.estado_acta < 3 && (
                                                <>
                                                    <button onClick={() => handleProgramar(p)} style={{
                                                        padding: '5px 10px', background: '#f39c12', color: '#fff',
                                                        border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px'
                                                    }}>
                                                        <i className="fa-solid fa-calendar-plus" style={{ marginRight: '3px' }}></i>Programar
                                                    </button>
                                                    <button onClick={() => handleAsignarDelegado(p)} style={{
                                                        padding: '5px 10px', background: '#8e44ad', color: '#fff',
                                                        border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px'
                                                    }}>
                                                        <i className="fa-solid fa-user-tie" style={{ marginRight: '3px' }}></i>Delegado
                                                    </button>
                                                </>
                                            )}
                                            {isOrganizador && p.estado_acta < 3 && (
                                                <button onClick={() => navigate(`/torneo/${id}/partido/${p.vit_torneo_partido_id}/planilla`)} style={{
                                                    padding: '5px 10px', background: '#2c3e50', color: '#fff',
                                                    border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px'
                                                }}>
                                                    <i className="fa-solid fa-clipboard" style={{ marginRight: '3px' }}></i>Planilla
                                                </button>
                                            )}
                                            {p.estado_acta === 3 && (
                                                <button onClick={() => navigate(`/torneo/${id}/partido/${p.vit_torneo_partido_id}/acta`)} style={{
                                                    padding: '5px 10px', background: '#27ae60', color: '#fff',
                                                    border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px'
                                                }}>
                                                    <i className="fa-solid fa-file-lines" style={{ marginRight: '3px' }}></i>Ver Acta
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            )}

            {!loadingFixture && partidos.length === 0 && !isOrganizador && (
                <div style={{ textAlign: 'center', padding: '40px', color: '#7f8c8d' }}>
                    <p>El fixture aún no ha sido generado para esta categoría.</p>
                </div>
            )}
        </div>
    );
};

export default FixtureTorneo;
