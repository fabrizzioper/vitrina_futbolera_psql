import React, { useState, useEffect } from 'react';
import { useAuth } from '../../Context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import { obtenerDetallePartido, obtenerAlineacion, listarIncidencias } from '../../Funciones/TorneoService';

const ActaPartido = () => {
    const { Request } = useAuth();
    const { torneoId, partidoId } = useParams();
    const navigate = useNavigate();

    const [partido, setPartido] = useState(null);
    const [alineacionLocal, setAlineacionLocal] = useState([]);
    const [alineacionVisitante, setAlineacionVisitante] = useState([]);
    const [incidencias, setIncidencias] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargarActa();
    }, [partidoId]);

    const cargarActa = async () => {
        setLoading(true);
        try {
            const res = await obtenerDetallePartido(Request, partidoId);
            const data = res.data.data;
            if (data && data.length > 0) {
                const p = data[0];
                setPartido(p);

                const [resAL, resAV, resInc] = await Promise.all([
                    obtenerAlineacion(Request, partidoId, p.vit_institucion_1_id),
                    obtenerAlineacion(Request, partidoId, p.vit_institucion_2_id),
                    listarIncidencias(Request, partidoId)
                ]);
                setAlineacionLocal(resAL.data.data || []);
                setAlineacionVisitante(resAV.data.data || []);
                setIncidencias(resInc.data.data || []);
            }
        } catch (err) {
            console.error('Error cargando acta:', err);
        }
        setLoading(false);
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

    const formatFecha = (fecha) => {
        if (!fecha) return '-';
        const d = new Date(fecha);
        return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' });
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '40px', color: '#7f8c8d' }}>Cargando acta...</div>;
    if (!partido) return <div style={{ textAlign: 'center', padding: '40px', color: '#e74c3c' }}>Partido no encontrado</div>;

    const renderJugador = (j) => (
        <div key={j.vit_jugador_id} style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '6px 8px', fontSize: '13px',
            borderBottom: '1px solid #f5f5f5'
        }}>
            {j.foto_perfil && <img src={j.foto_perfil} alt="" style={{ width: 24, height: 24, borderRadius: '50%' }} />}
            <span style={{ flex: 1, color: '#2c3e50' }}>
                {j.jugador_apellidos} {j.jugador_nombres}
            </span>
            <div style={{ display: 'flex', gap: '3px', fontSize: '11px' }}>
                {j.goles_anotados > 0 && <span>⚽{j.goles_anotados > 1 ? `×${j.goles_anotados}` : ''}</span>}
                {j.flag_tarjeta_amarilla > 0 && <span>🟨{j.flag_tarjeta_amarilla > 1 ? `×${j.flag_tarjeta_amarilla}` : ''}</span>}
                {j.flag_tarjeta_roja > 0 && <span>🟥</span>}
                {j.minuto_ingreso && <span style={{ color: '#27ae60' }}>↑{j.minuto_ingreso}'</span>}
                {j.minuto_salida && <span style={{ color: '#e74c3c' }}>↓{j.minuto_salida}'</span>}
            </div>
        </div>
    );

    const titularesLocal = alineacionLocal.filter(j => j.tipo_alineacion === 1);
    const suplentesLocal = alineacionLocal.filter(j => j.tipo_alineacion === 2);
    const titularesVisitante = alineacionVisitante.filter(j => j.tipo_alineacion === 1);
    const suplentesVisitante = alineacionVisitante.filter(j => j.tipo_alineacion === 2);

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            <button onClick={() => navigate(`/torneo/${torneoId}/fixture`)} style={{
                padding: '8px 16px', background: 'transparent', color: '#3498db',
                border: '1px solid #3498db', borderRadius: '4px', cursor: 'pointer', marginBottom: '20px'
            }}>
                Volver al Fixture
            </button>

            {/* Header con resultado */}
            <div style={{
                background: 'linear-gradient(135deg, #2c3e50, #3498db)', color: '#fff',
                borderRadius: '12px', padding: '25px', textAlign: 'center', marginBottom: '20px'
            }}>
                <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '10px' }}>
                    {partido.torneo_nombre} • Jornada {partido.jornada} • {partido.categoria}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
                    <div style={{ textAlign: 'center' }}>
                        {partido.logo_local && <img src={partido.logo_local} alt="" style={{ width: 50, height: 50, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)' }} />}
                        <div style={{ fontWeight: 'bold', fontSize: '14px', marginTop: '6px' }}>{partido.nombre_local}</div>
                    </div>
                    <div style={{
                        fontSize: '32px', fontWeight: 'bold',
                        padding: '8px 24px', background: 'rgba(255,255,255,0.15)', borderRadius: '10px'
                    }}>
                        {partido.goles_local ?? 0} - {partido.goles_visitante ?? 0}
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        {partido.logo_visitante && <img src={partido.logo_visitante} alt="" style={{ width: 50, height: 50, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)' }} />}
                        <div style={{ fontWeight: 'bold', fontSize: '14px', marginTop: '6px' }}>{partido.nombre_visitante}</div>
                    </div>
                </div>
                <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '10px' }}>
                    {formatFecha(partido.fecha)} {partido.hora ? `• ${partido.hora}` : ''} {partido.sede ? `• ${partido.sede}` : ''}
                </div>
                {partido.delegado_nombres && (
                    <div style={{ fontSize: '11px', opacity: 0.6, marginTop: '4px' }}>
                        Delegado: {partido.delegado_nombres} {partido.delegado_apellidos}
                    </div>
                )}
            </div>

            {/* Alineaciones */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e0e0e0', overflow: 'hidden' }}>
                    <div style={{ background: '#2c3e50', color: '#fff', padding: '8px 12px', fontWeight: 'bold', fontSize: '13px' }}>
                        {partido.nombre_local} - Titulares
                    </div>
                    {titularesLocal.map(renderJugador)}
                    {suplentesLocal.length > 0 && (
                        <>
                            <div style={{ background: '#f8f9fa', padding: '4px 12px', fontSize: '12px', color: '#7f8c8d', fontWeight: 'bold' }}>Suplentes</div>
                            {suplentesLocal.map(renderJugador)}
                        </>
                    )}
                </div>
                <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e0e0e0', overflow: 'hidden' }}>
                    <div style={{ background: '#3498db', color: '#fff', padding: '8px 12px', fontWeight: 'bold', fontSize: '13px' }}>
                        {partido.nombre_visitante} - Titulares
                    </div>
                    {titularesVisitante.map(renderJugador)}
                    {suplentesVisitante.length > 0 && (
                        <>
                            <div style={{ background: '#f8f9fa', padding: '4px 12px', fontSize: '12px', color: '#7f8c8d', fontWeight: 'bold' }}>Suplentes</div>
                            {suplentesVisitante.map(renderJugador)}
                        </>
                    )}
                </div>
            </div>

            {/* Timeline de incidencias */}
            {incidencias.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                    <h3 style={{ color: '#2c3e50', borderBottom: '2px solid #3498db', paddingBottom: '8px', marginBottom: '12px' }}>
                        Incidencias del Partido
                    </h3>
                    {incidencias.map((inc) => (
                        <div key={inc.vit_torneo_partido_incidencia_id} style={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                            padding: '10px 12px', margin: '4px 0', borderRadius: '8px',
                            background: '#fff', border: '1px solid #e0e0e0'
                        }}>
                            <div style={{ fontSize: '18px', minWidth: '28px', textAlign: 'center' }}>
                                {getIcono(inc.tipo_incidencia)}
                            </div>
                            <div style={{
                                background: '#2c3e50', color: '#fff', borderRadius: '50%',
                                width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '11px', fontWeight: 'bold', flexShrink: 0
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
                        </div>
                    ))}
                </div>
            )}

            {/* Observaciones */}
            {partido.observaciones_delegado && (
                <div style={{
                    padding: '15px', borderRadius: '8px',
                    background: '#fef9e7', border: '1px solid #f39c12', marginBottom: '20px'
                }}>
                    <h4 style={{ color: '#2c3e50', margin: '0 0 8px' }}>Observaciones del Delegado</h4>
                    <p style={{ color: '#555', margin: 0, fontSize: '14px' }}>{partido.observaciones_delegado}</p>
                </div>
            )}
        </div>
    );
};

export default ActaPartido;
