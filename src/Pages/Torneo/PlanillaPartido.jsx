import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../Context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import {
    obtenerDetallePartido, obtenerJugadoresBuenaFe, registrarAlineacion,
    registrarIncidencia, eliminarIncidencia, listarIncidencias,
    obtenerAlineacion, cerrarActa
} from '../../Funciones/TorneoService';
import Swal from 'sweetalert2';

const PlanillaPartido = () => {
    const { Request, isOrganizador, currentUser } = useAuth();
    const { torneoId, partidoId } = useParams();
    const navigate = useNavigate();

    const [partido, setPartido] = useState(null);
    const [loading, setLoading] = useState(true);
    const [accesoDenegado, setAccesoDenegado] = useState(false);
    const [tabActiva, setTabActiva] = useState(0);

    // Alineación
    const [jugadoresLocal, setJugadoresLocal] = useState([]);
    const [jugadoresVisitante, setJugadoresVisitante] = useState([]);
    const [titularesLocal, setTitularesLocal] = useState([]);
    const [suplentesLocal, setSuplentesLocal] = useState([]);
    const [titularesVisitante, setTitularesVisitante] = useState([]);
    const [suplentesVisitante, setSuplentesVisitante] = useState([]);

    // Incidencias
    const [incidencias, setIncidencias] = useState([]);
    const [alineacionLocal, setAlineacionLocal] = useState([]);
    const [alineacionVisitante, setAlineacionVisitante] = useState([]);
    const [equipoActivo, setEquipoActivo] = useState('local');

    // Cerrar acta
    const [observaciones, setObservaciones] = useState('');

    const cargarDatosAuxiliares = useCallback(async (p) => {
        try {
            const [resJL, resJV] = await Promise.all([
                obtenerJugadoresBuenaFe(Request, partidoId, p.vit_institucion_1_id),
                obtenerJugadoresBuenaFe(Request, partidoId, p.vit_institucion_2_id)
            ]);
            setJugadoresLocal(resJL.data.data || []);
            setJugadoresVisitante(resJV.data.data || []);

            // Pre-seleccionar si ya hay alineación
            const jLocal = resJL.data.data || [];
            const jVisitante = resJV.data.data || [];
            setTitularesLocal(jLocal.filter(j => j.ya_convocado && j.tipo_alineacion === 1).map(j => j.vit_jugador_id));
            setSuplentesLocal(jLocal.filter(j => j.ya_convocado && j.tipo_alineacion === 2).map(j => j.vit_jugador_id));
            setTitularesVisitante(jVisitante.filter(j => j.ya_convocado && j.tipo_alineacion === 1).map(j => j.vit_jugador_id));
            setSuplentesVisitante(jVisitante.filter(j => j.ya_convocado && j.tipo_alineacion === 2).map(j => j.vit_jugador_id));
        } catch (err) { console.error(err); }

        try {
            const resInc = await listarIncidencias(Request, partidoId);
            setIncidencias(resInc.data.data || []);
        } catch (err) { /* sin incidencias */ }

        try {
            const [resAL, resAV] = await Promise.all([
                obtenerAlineacion(Request, partidoId, p.vit_institucion_1_id),
                obtenerAlineacion(Request, partidoId, p.vit_institucion_2_id)
            ]);
            setAlineacionLocal(resAL.data.data || []);
            setAlineacionVisitante(resAV.data.data || []);
        } catch (err) { /* sin alineación */ }
    }, [Request, partidoId]);

    const cargarPartido = useCallback(async () => {
        setLoading(true);
        try {
            const res = await obtenerDetallePartido(Request, partidoId);
            const data = res.data.data;
            if (data && data.length > 0) {
                const p = data[0];
                setPartido(p);

                if (!isOrganizador) {
                    const jugadorId = currentUser?.vit_jugador_id;
                    const esDelegado = p.delegado_user_id && String(p.delegado_user_id) === String(jugadorId);
                    if (!esDelegado) {
                        setAccesoDenegado(true);
                        setLoading(false);
                        return;
                    }
                }

                cargarDatosAuxiliares(p);
            }
        } catch (err) {
            console.error('Error cargando partido:', err);
        }
        setLoading(false);
    }, [Request, partidoId, isOrganizador, currentUser, cargarDatosAuxiliares]);

    useEffect(() => {
        cargarPartido();
    }, [cargarPartido]);

    const toggleJugador = (jugadorId, lista, setLista, otraLista, setOtraLista) => {
        if (lista.includes(jugadorId)) {
            setLista(lista.filter(id => id !== jugadorId));
        } else {
            setOtraLista(otraLista.filter(id => id !== jugadorId));
            setLista([...lista, jugadorId]);
        }
    };

    const handleGuardarAlineacion = async (esLocal) => {
        const instId = esLocal ? partido.vit_institucion_1_id : partido.vit_institucion_2_id;
        const tit = esLocal ? titularesLocal : titularesVisitante;
        const sup = esLocal ? suplentesLocal : suplentesVisitante;

        if (tit.length === 0) {
            Swal.fire({ icon: 'warning', title: 'Sin titulares', text: 'Selecciona al menos un titular', background: '#0e3769', color: '#fff' });
            return;
        }

        try {
            await registrarAlineacion(Request, partidoId, instId, tit.join(','), sup.join(','));
            Swal.fire({ icon: 'success', title: 'Alineación guardada', timer: 1500, showConfirmButton: false, background: '#0e3769', color: '#fff' });
            cargarPartido();
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo guardar la alineación', background: '#0e3769', color: '#fff' });
        }
    };

    const handleIncidencia = async (tipo) => {
        const esLocal = equipoActivo === 'local';
        const alineacion = esLocal ? alineacionLocal : alineacionVisitante;
        const instId = esLocal ? partido.vit_institucion_1_id : partido.vit_institucion_2_id;
        const jugadoresActivos = alineacion.filter(j => j.flag_jugado === 1 || j.tipo_alineacion === 1);

        if (jugadoresActivos.length === 0) {
            Swal.fire({ icon: 'warning', title: 'Sin jugadores', text: 'Registra la alineación primero', background: '#0e3769', color: '#fff' });
            return;
        }

        const jugadorOptions = jugadoresActivos.reduce((acc, j) => {
            acc[j.vit_jugador_id] = `${j.jugador_apellidos} ${j.jugador_nombres}`;
            return acc;
        }, {});

        if (tipo === 'CAMBIO') {
            const suplentes = alineacion.filter(j => j.tipo_alineacion === 2 && j.flag_jugado === 0);
            if (suplentes.length === 0) {
                Swal.fire({ icon: 'warning', title: 'Sin suplentes', text: 'No hay suplentes disponibles', background: '#0e3769', color: '#fff' });
                return;
            }
            const supOptions = suplentes.reduce((acc, j) => {
                acc[j.vit_jugador_id] = `${j.jugador_apellidos} ${j.jugador_nombres}`;
                return acc;
            }, {});

            const { value: formValues } = await Swal.fire({
                title: 'Registrar Cambio',
                html: `
                    <div style="text-align:left">
                        <label style="display:block;margin-bottom:4px;font-weight:bold;color:#ccc">Minuto</label>
                        <input id="swal-minuto" type="number" inputMode="numeric" min="0" max="120" class="swal2-input" placeholder="Minuto" style="width:100%">
                        <label style="display:block;margin-top:10px;margin-bottom:4px;font-weight:bold;color:#ccc">Sale</label>
                        <select id="swal-sale" class="swal2-select" style="width:100%">
                            <option value="">Seleccionar...</option>
                            ${Object.entries(jugadorOptions).map(([id, n]) => `<option value="${id}">${n}</option>`).join('')}
                        </select>
                        <label style="display:block;margin-top:10px;margin-bottom:4px;font-weight:bold;color:#ccc">Entra</label>
                        <select id="swal-entra" class="swal2-select" style="width:100%">
                            <option value="">Seleccionar...</option>
                            ${Object.entries(supOptions).map(([id, n]) => `<option value="${id}">${n}</option>`).join('')}
                        </select>
                    </div>`,
                showCancelButton: true, confirmButtonText: 'Registrar', cancelButtonText: 'Cancelar',
                confirmButtonColor: '#3498db', background: '#0e3769', color: '#fff',
                preConfirm: () => {
                    const minuto = document.getElementById('swal-minuto').value;
                    const sale = document.getElementById('swal-sale').value;
                    const entra = document.getElementById('swal-entra').value;
                    if (!minuto || !sale || !entra) { Swal.showValidationMessage('Completa todos los campos'); return false; }
                    return { minuto, sale, entra };
                }
            });

            if (formValues) {
                try {
                    await registrarIncidencia(Request, partidoId, 'CAMBIO', formValues.minuto, formValues.entra, formValues.sale, instId, null, null);
                    Swal.fire({ icon: 'success', title: 'Cambio registrado', timer: 1200, showConfirmButton: false, background: '#0e3769', color: '#fff' });
                    cargarPartido();
                } catch (err) {
                    Swal.fire({ icon: 'error', title: 'Error', background: '#0e3769', color: '#fff' });
                }
            }
            return;
        }

        // GOL, AUTOGOL, TARJETA_AMARILLA, TARJETA_ROJA
        let htmlExtra = '';
        if (tipo === 'GOL' || tipo === 'AUTOGOL') {
            htmlExtra = `
                <label style="display:block;margin-top:10px;margin-bottom:4px;font-weight:bold;color:#ccc">Tipo de Gol</label>
                <select id="swal-tipogol" class="swal2-select" style="width:100%">
                    <option value="Jugada">Jugada</option>
                    <option value="Penal">Penal</option>
                    <option value="Tiro libre">Tiro libre</option>
                    <option value="Cabeza">Cabeza</option>
                </select>`;
        }

        const { value: formValues } = await Swal.fire({
            title: `Registrar ${tipo === 'TARJETA_AMARILLA' ? 'Tarjeta Amarilla' : tipo === 'TARJETA_ROJA' ? 'Tarjeta Roja' : tipo === 'AUTOGOL' ? 'Autogol' : 'Gol'}`,
            html: `
                <div style="text-align:left">
                    <label style="display:block;margin-bottom:4px;font-weight:bold;color:#ccc">Minuto</label>
                    <input id="swal-minuto" type="number" inputMode="numeric" min="0" max="120" class="swal2-input" placeholder="Minuto" style="width:100%">
                    <label style="display:block;margin-top:10px;margin-bottom:4px;font-weight:bold;color:#ccc">Jugador</label>
                    <select id="swal-jugador" class="swal2-select" style="width:100%">
                        <option value="">Seleccionar...</option>
                        ${Object.entries(jugadorOptions).map(([id, n]) => `<option value="${id}">${n}</option>`).join('')}
                    </select>
                    ${htmlExtra}
                </div>`,
            showCancelButton: true, confirmButtonText: 'Registrar', cancelButtonText: 'Cancelar',
            confirmButtonColor: tipo === 'GOL' || tipo === 'AUTOGOL' ? '#27ae60' : tipo === 'TARJETA_AMARILLA' ? '#f1c40f' : '#e74c3c',
            background: '#0e3769', color: '#fff',
            preConfirm: () => {
                const minuto = document.getElementById('swal-minuto').value;
                const jugador = document.getElementById('swal-jugador').value;
                if (!minuto || !jugador) { Swal.showValidationMessage('Completa minuto y jugador'); return false; }
                const tipoGol = document.getElementById('swal-tipogol')?.value || null;
                return { minuto, jugador, tipoGol };
            }
        });

        if (formValues) {
            try {
                await registrarIncidencia(Request, partidoId, tipo, formValues.minuto, formValues.jugador, null, instId, formValues.tipoGol, null);
                Swal.fire({ icon: 'success', title: 'Registrado', timer: 1200, showConfirmButton: false, background: '#0e3769', color: '#fff' });
                cargarPartido();
            } catch (err) {
                Swal.fire({ icon: 'error', title: 'Error', background: '#0e3769', color: '#fff' });
            }
        }
    };

    const handleEliminarIncidencia = async (inc) => {
        const result = await Swal.fire({
            title: 'Eliminar incidencia',
            text: `¿Eliminar ${inc.tipo_incidencia} min ${inc.minuto}?`,
            icon: 'warning', showCancelButton: true, confirmButtonText: 'Eliminar', cancelButtonText: 'Cancelar',
            confirmButtonColor: '#e74c3c', background: '#0e3769', color: '#fff'
        });
        if (result.isConfirmed) {
            try {
                await eliminarIncidencia(Request, inc.vit_torneo_partido_incidencia_id);
                Swal.fire({ icon: 'success', title: 'Eliminada', timer: 1200, showConfirmButton: false, background: '#0e3769', color: '#fff' });
                cargarPartido();
            } catch (err) {
                Swal.fire({ icon: 'error', title: 'Error', background: '#0e3769', color: '#fff' });
            }
        }
    };

    const handleCerrarActa = async () => {
        const result = await Swal.fire({
            title: 'Cerrar Acta del Partido',
            html: '<p style="color:#f39c12;font-weight:bold">Esta acción es irreversible.</p><p>Escribe CERRAR para confirmar:</p>',
            input: 'text', inputPlaceholder: 'CERRAR',
            showCancelButton: true, confirmButtonText: 'Cerrar Acta', cancelButtonText: 'Cancelar',
            confirmButtonColor: '#e74c3c', background: '#0e3769', color: '#fff',
            preConfirm: (val) => {
                if (val !== 'CERRAR') { Swal.showValidationMessage('Escribe CERRAR exactamente'); return false; }
                return true;
            }
        });

        if (result.isConfirmed) {
            try {
                const res = await cerrarActa(Request, partidoId, observaciones);
                const data = res.data.data?.[0];
                if (data?.resultado === 'OK') {
                    Swal.fire({
                        icon: 'success', title: 'Acta Cerrada',
                        text: `Resultado final: ${data.goles_local} - ${data.goles_visitante}`,
                        background: '#0e3769', color: '#fff', confirmButtonColor: '#27ae60'
                    });
                    cargarPartido();
                } else {
                    Swal.fire({ icon: 'error', title: 'Error', text: data?.mensaje, background: '#0e3769', color: '#fff' });
                }
            } catch (err) {
                Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo cerrar el acta', background: '#0e3769', color: '#fff' });
            }
        }
    };

    const getIcono = (tipo) => {
        switch (tipo) {
            case 'GOL': return '⚽';
            case 'AUTOGOL': return '🔴⚽';
            case 'TARJETA_AMARILLA': return '🟨';
            case 'TARJETA_ROJA': return '🟥';
            case 'CAMBIO': return '🔄';
            default: return '📋';
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '40px', color: '#7f8c8d' }}>Cargando planilla...</div>;
    if (accesoDenegado) return (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <i className="fa-solid fa-lock" style={{ fontSize: '3rem', color: '#e74c3c', marginBottom: '15px' }}></i>
            <h3 style={{ color: '#2c3e50' }}>Acceso Denegado</h3>
            <p style={{ color: '#7f8c8d' }}>No tienes permisos para operar la planilla de este partido.</p>
            <button onClick={() => navigate(-1)} style={{
                padding: '10px 24px', background: '#3498db', color: '#fff',
                border: 'none', borderRadius: '6px', cursor: 'pointer', marginTop: '10px'
            }}>Volver</button>
        </div>
    );
    if (!partido) return <div style={{ textAlign: 'center', padding: '40px', color: '#e74c3c' }}>Partido no encontrado</div>;

    const acerrada = partido.estado_acta === 3;

    const tabs = [
        { label: 'Alineación Local', icon: 'fa-shirt' },
        { label: 'Alineación Visitante', icon: 'fa-shirt' },
        { label: 'Incidencias', icon: 'fa-futbol' },
        { label: 'Cerrar Acta', icon: 'fa-file-signature' }
    ];

    const renderAlineacion = (esLocal) => {
        const jugadores = esLocal ? jugadoresLocal : jugadoresVisitante;
        const titulares = esLocal ? titularesLocal : titularesVisitante;
        const setTit = esLocal ? setTitularesLocal : setTitularesVisitante;
        const suplentes = esLocal ? suplentesLocal : suplentesVisitante;
        const setSup = esLocal ? setSuplentesLocal : setSuplentesVisitante;
        const nombre = esLocal ? partido.nombre_local : partido.nombre_visitante;

        return (
            <div>
                <h3 style={{ color: '#2c3e50', marginBottom: '10px' }}>{nombre}</h3>
                <p style={{ color: '#7f8c8d', fontSize: '13px', marginBottom: '15px' }}>
                    Titulares: {titulares.length} | Suplentes: {suplentes.length}
                </p>

                {jugadores.length === 0 && (
                    <p style={{ color: '#e74c3c', textAlign: 'center' }}>No hay jugadores en la lista de buena fe para este equipo.</p>
                )}

                {jugadores.map(j => {
                    const esTitular = titulares.includes(j.vit_jugador_id);
                    const esSuplente = suplentes.includes(j.vit_jugador_id);
                    return (
                        <div key={j.vit_jugador_id} style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '10px 12px', margin: '4px 0', borderRadius: '8px',
                            background: esTitular ? '#eafaf1' : esSuplente ? '#ebf5fb' : '#fff',
                            border: `1px solid ${esTitular ? '#27ae60' : esSuplente ? '#3498db' : '#e0e0e0'}`
                        }}>
                            {j.foto_perfil && <img src={j.foto_perfil} alt="" style={{ width: 32, height: 32, borderRadius: '50%' }} />}
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 'bold', color: '#2c3e50', fontSize: '14px' }}>
                                    {j.jugador_apellidos} {j.jugador_nombres}
                                </div>
                            </div>
                            <button
                                onClick={() => toggleJugador(j.vit_jugador_id, titulares, setTit, suplentes, setSup)}
                                disabled={acerrada}
                                style={{
                                    padding: '6px 12px', borderRadius: '4px', cursor: acerrada ? 'not-allowed' : 'pointer',
                                    border: 'none', fontWeight: 'bold', fontSize: '12px', minHeight: '36px',
                                    background: esTitular ? '#27ae60' : '#ecf0f1',
                                    color: esTitular ? '#fff' : '#555'
                                }}>
                                TIT
                            </button>
                            <button
                                onClick={() => toggleJugador(j.vit_jugador_id, suplentes, setSup, titulares, setTit)}
                                disabled={acerrada}
                                style={{
                                    padding: '6px 12px', borderRadius: '4px', cursor: acerrada ? 'not-allowed' : 'pointer',
                                    border: 'none', fontWeight: 'bold', fontSize: '12px', minHeight: '36px',
                                    background: esSuplente ? '#3498db' : '#ecf0f1',
                                    color: esSuplente ? '#fff' : '#555'
                                }}>
                                SUP
                            </button>
                        </div>
                    );
                })}

                {!acerrada && jugadores.length > 0 && (
                    <button onClick={() => handleGuardarAlineacion(esLocal)} style={{
                        width: '100%', padding: '14px', marginTop: '15px',
                        background: '#27ae60', color: '#fff', border: 'none',
                        borderRadius: '8px', fontSize: '16px', fontWeight: 'bold',
                        cursor: 'pointer', minHeight: '56px'
                    }}>
                        Guardar Alineación
                    </button>
                )}
            </div>
        );
    };

    const renderIncidencias = () => (
        <div>
            {/* Selector equipo activo */}
            <div style={{ display: 'flex', gap: '4px', marginBottom: '15px' }}>
                <button onClick={() => setEquipoActivo('local')} style={{
                    flex: 1, padding: '12px', borderRadius: '8px', fontWeight: 'bold',
                    border: 'none', cursor: 'pointer', minHeight: '48px',
                    background: equipoActivo === 'local' ? '#2c3e50' : '#ecf0f1',
                    color: equipoActivo === 'local' ? '#fff' : '#555'
                }}>
                    {partido.nombre_local}
                </button>
                <button onClick={() => setEquipoActivo('visitante')} style={{
                    flex: 1, padding: '12px', borderRadius: '8px', fontWeight: 'bold',
                    border: 'none', cursor: 'pointer', minHeight: '48px',
                    background: equipoActivo === 'visitante' ? '#2c3e50' : '#ecf0f1',
                    color: equipoActivo === 'visitante' ? '#fff' : '#555'
                }}>
                    {partido.nombre_visitante}
                </button>
            </div>

            {/* Botones de acción grandes */}
            {!acerrada && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '20px' }}>
                    <button onClick={() => handleIncidencia('GOL')} style={{
                        padding: '16px', background: '#27ae60', color: '#fff', border: 'none',
                        borderRadius: '10px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', minHeight: '56px'
                    }}>
                        ⚽ GOL
                    </button>
                    <button onClick={() => handleIncidencia('AUTOGOL')} style={{
                        padding: '16px', background: '#e67e22', color: '#fff', border: 'none',
                        borderRadius: '10px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', minHeight: '56px'
                    }}>
                        ⚽ AUTOGOL
                    </button>
                    <button onClick={() => handleIncidencia('TARJETA_AMARILLA')} style={{
                        padding: '16px', background: '#f1c40f', color: '#000', border: 'none',
                        borderRadius: '10px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', minHeight: '56px'
                    }}>
                        🟨 AMARILLA
                    </button>
                    <button onClick={() => handleIncidencia('TARJETA_ROJA')} style={{
                        padding: '16px', background: '#e74c3c', color: '#fff', border: 'none',
                        borderRadius: '10px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', minHeight: '56px'
                    }}>
                        🟥 ROJA
                    </button>
                    <button onClick={() => handleIncidencia('CAMBIO')} style={{
                        padding: '16px', background: '#3498db', color: '#fff', border: 'none',
                        borderRadius: '10px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer',
                        minHeight: '56px', gridColumn: '1 / -1'
                    }}>
                        🔄 CAMBIO
                    </button>
                </div>
            )}

            {/* Timeline de incidencias */}
            <h4 style={{ color: '#2c3e50', marginBottom: '10px' }}>Timeline de Incidencias</h4>
            {incidencias.length === 0 && <p style={{ color: '#7f8c8d', textAlign: 'center' }}>Sin incidencias registradas</p>}
            {incidencias.map((inc) => (
                <div key={inc.vit_torneo_partido_incidencia_id} style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '10px 12px', margin: '4px 0', borderRadius: '8px',
                    background: '#fff', border: '1px solid #e0e0e0'
                }}>
                    <div style={{ fontSize: '20px', minWidth: '30px', textAlign: 'center' }}>{getIcono(inc.tipo_incidencia)}</div>
                    <div style={{
                        background: '#2c3e50', color: '#fff', borderRadius: '50%',
                        width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '12px', fontWeight: 'bold', flexShrink: 0
                    }}>
                        {inc.minuto}'
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 'bold', color: '#2c3e50', fontSize: '13px' }}>
                            {inc.jugador_apellidos} {inc.jugador_nombres}
                            {inc.tipo_incidencia === 'CAMBIO' && (
                                <span style={{ color: '#7f8c8d', fontWeight: 'normal' }}>
                                    {' '}(sale: {inc.sale_apellidos} {inc.sale_nombres})
                                </span>
                            )}
                        </div>
                        <div style={{ fontSize: '11px', color: '#95a5a6' }}>
                            {inc.nombre_equipo} {inc.tipo_gol ? `• ${inc.tipo_gol}` : ''}
                        </div>
                    </div>
                    {!acerrada && (
                        <button onClick={() => handleEliminarIncidencia(inc)} style={{
                            padding: '4px 8px', background: '#e74c3c', color: '#fff',
                            border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px'
                        }}>
                            <i className="fa-solid fa-trash"></i>
                        </button>
                    )}
                </div>
            ))}
        </div>
    );

    const renderCerrarActa = () => (
        <div>
            <h3 style={{ color: '#2c3e50', marginBottom: '15px' }}>Resumen del Partido</h3>

            <div style={{
                padding: '20px', borderRadius: '12px', background: '#f8f9fa',
                textAlign: 'center', marginBottom: '20px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
                    <div>
                        {partido.logo_local && <img src={partido.logo_local} alt="" style={{ width: 40, height: 40, borderRadius: '50%' }} />}
                        <div style={{ fontWeight: 'bold', fontSize: '13px', marginTop: '4px' }}>{partido.nombre_local}</div>
                    </div>
                    <div style={{
                        fontSize: '28px', fontWeight: 'bold', color: '#2c3e50',
                        padding: '8px 20px', background: '#fff', borderRadius: '8px', border: '2px solid #2c3e50'
                    }}>
                        {partido.goles_local ?? 0} - {partido.goles_visitante ?? 0}
                    </div>
                    <div>
                        {partido.logo_visitante && <img src={partido.logo_visitante} alt="" style={{ width: 40, height: 40, borderRadius: '50%' }} />}
                        <div style={{ fontWeight: 'bold', fontSize: '13px', marginTop: '4px' }}>{partido.nombre_visitante}</div>
                    </div>
                </div>
            </div>

            <div style={{ marginBottom: '15px' }}>
                <p style={{ color: '#555', fontSize: '14px' }}>Incidencias registradas: <strong>{incidencias.length}</strong></p>
                <p style={{ color: '#555', fontSize: '14px' }}>Jornada: <strong>{partido.jornada}</strong> | Categoría: <strong>{partido.categoria}</strong></p>
            </div>

            {!acerrada && (
                <>
                    <label style={{ display: 'block', fontWeight: 'bold', color: '#2c3e50', marginBottom: '6px' }}>
                        Observaciones del Delegado
                    </label>
                    <textarea
                        value={observaciones}
                        onChange={(e) => setObservaciones(e.target.value)}
                        placeholder="Observaciones opcionales sobre el partido..."
                        rows={4}
                        style={{
                            width: '100%', padding: '12px', borderRadius: '8px',
                            border: '1px solid #ddd', fontSize: '14px', resize: 'vertical',
                            boxSizing: 'border-box'
                        }}
                    />
                    <button onClick={handleCerrarActa} style={{
                        width: '100%', padding: '16px', marginTop: '15px',
                        background: '#e74c3c', color: '#fff', border: 'none',
                        borderRadius: '8px', fontSize: '18px', fontWeight: 'bold',
                        cursor: 'pointer', minHeight: '56px'
                    }}>
                        <i className="fa-solid fa-lock" style={{ marginRight: '8px' }}></i>
                        CERRAR ACTA
                    </button>
                </>
            )}

            {acerrada && (
                <div style={{
                    padding: '15px', borderRadius: '8px', background: '#eafaf1',
                    border: '1px solid #27ae60', textAlign: 'center'
                }}>
                    <i className="fa-solid fa-check-circle" style={{ color: '#27ae60', fontSize: '24px' }}></i>
                    <p style={{ color: '#27ae60', fontWeight: 'bold', margin: '8px 0 0' }}>Acta cerrada</p>
                    {partido.observaciones_delegado && (
                        <p style={{ color: '#555', fontSize: '13px', marginTop: '8px' }}>{partido.observaciones_delegado}</p>
                    )}
                </div>
            )}
        </div>
    );

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '10px' }}>
            <button onClick={() => navigate(`/torneo/${torneoId}/fixture`)} style={{
                padding: '8px 16px', background: 'transparent', color: '#3498db',
                border: '1px solid #3498db', borderRadius: '4px', cursor: 'pointer', marginBottom: '10px'
            }}>
                Volver al Fixture
            </button>

            {/* Scoreboard sticky */}
            <div style={{
                position: 'sticky', top: 0, zIndex: 10,
                background: 'linear-gradient(135deg, #2c3e50, #3498db)', color: '#fff',
                borderRadius: '12px', padding: '15px', marginBottom: '15px', textAlign: 'center'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
                    <div style={{ flex: 1, textAlign: 'right' }}>
                        {partido.logo_local && <img src={partido.logo_local} alt="" style={{ width: 30, height: 30, borderRadius: '50%', marginRight: 4, verticalAlign: 'middle' }} />}
                        <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{partido.nombre_local}</span>
                    </div>
                    <div style={{
                        fontSize: '24px', fontWeight: 'bold',
                        padding: '4px 16px', background: 'rgba(255,255,255,0.2)', borderRadius: '8px'
                    }}>
                        {partido.goles_local ?? 0} - {partido.goles_visitante ?? 0}
                    </div>
                    <div style={{ flex: 1, textAlign: 'left' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{partido.nombre_visitante}</span>
                        {partido.logo_visitante && <img src={partido.logo_visitante} alt="" style={{ width: 30, height: 30, borderRadius: '50%', marginLeft: 4, verticalAlign: 'middle' }} />}
                    </div>
                </div>
                <div style={{ fontSize: '11px', opacity: 0.8, marginTop: '4px' }}>
                    Jornada {partido.jornada} | {partido.categoria} {partido.sede ? `| ${partido.sede}` : ''}
                    {acerrada && <span style={{ marginLeft: '8px', background: '#27ae60', padding: '2px 8px', borderRadius: '10px' }}>ACTA CERRADA</span>}
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '2px', marginBottom: '15px', overflowX: 'auto' }}>
                {tabs.map((tab, idx) => (
                    <button key={idx} onClick={() => setTabActiva(idx)} style={{
                        flex: 1, padding: '10px 6px', borderRadius: '8px 8px 0 0',
                        border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '12px',
                        background: tabActiva === idx ? '#3498db' : '#ecf0f1',
                        color: tabActiva === idx ? '#fff' : '#555',
                        minHeight: '44px'
                    }}>
                        <i className={`fa-solid ${tab.icon}`} style={{ marginRight: '3px' }}></i>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Contenido de tabs */}
            {tabActiva === 0 && renderAlineacion(true)}
            {tabActiva === 1 && renderAlineacion(false)}
            {tabActiva === 2 && renderIncidencias()}
            {tabActiva === 3 && renderCerrarActa()}
        </div>
    );
};

export default PlanillaPartido;
