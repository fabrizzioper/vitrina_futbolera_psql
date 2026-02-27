import React, { useState, useEffect } from 'react';
import { useAuth } from '../../Context/AuthContext';
import { obtenerTorneo } from '../../Funciones/TorneoService';
import { useParams, useNavigate } from 'react-router-dom';

const DetalleTorneo = () => {
    const { Request, isClub, isOrganizador } = useAuth();
    const { id } = useParams();
    const navigate = useNavigate();
    const [torneo, setTorneo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargarDetalle();
    }, [id]);

    const cargarDetalle = async () => {
        setLoading(true);
        try {
            const res = await obtenerTorneo(Request, id);
            const data = res.data.data;
            if (data && data.length > 0) {
                setTorneo(data[0]);
            }
        } catch (err) {
            console.error('Error cargando detalle:', err);
        }
        setLoading(false);
    };

    const getEstadoLegalizacion = (flag) => {
        switch (flag) {
            case 0: return { texto: 'Pendiente de Legalización', color: '#f39c12', bg: '#fef9e7' };
            case 1: return { texto: 'Legalizado', color: '#27ae60', bg: '#eafaf1' };
            case 2: return { texto: 'Rechazado', color: '#e74c3c', bg: '#fdedec' };
            default: return { texto: 'Desconocido', color: '#95a5a6', bg: '#f2f3f4' };
        }
    };

    const seccionStyle = { marginBottom: '25px' };
    const tituloSeccionStyle = { color: '#2c3e50', borderBottom: '1px solid #e0e0e0', paddingBottom: '8px', marginBottom: '12px' };
    const filaStyle = { display: 'flex', padding: '6px 0', borderBottom: '1px solid #f5f5f5' };
    const labelStyle = { fontWeight: 'bold', width: '200px', color: '#555' };
    const valorStyle = { flex: 1, color: '#333' };

    if (loading) return <div style={{ textAlign: 'center', padding: '40px', color: '#7f8c8d' }}>Cargando detalle...</div>;
    if (!torneo) return <div style={{ textAlign: 'center', padding: '40px', color: '#e74c3c' }}>Torneo no encontrado</div>;

    const estado = getEstadoLegalizacion(torneo.flag_legalizado);

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            <button onClick={() => navigate('/torneo/mis-torneos')} style={{
                padding: '8px 16px', background: 'transparent', color: '#3498db',
                border: '1px solid #3498db', borderRadius: '4px', cursor: 'pointer', marginBottom: '20px'
            }}>
                Volver a Mis Torneos
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ color: '#2c3e50', margin: 0 }}>{torneo.nombre}</h2>
                <span style={{
                    padding: '6px 16px', borderRadius: '16px', fontSize: '13px',
                    fontWeight: 'bold', color: estado.color, background: estado.bg
                }}>
                    {estado.texto}
                </span>
            </div>

            {torneo.observacion_admin && (
                <div style={{
                    padding: '12px', marginBottom: '20px', borderRadius: '6px',
                    background: '#fef9e7', border: '1px solid #f39c12'
                }}>
                    <strong>Observación del Admin:</strong> {torneo.observacion_admin}
                </div>
            )}

            <div style={seccionStyle}>
                <h3 style={tituloSeccionStyle}>Información del Torneo</h3>
                <div style={filaStyle}><span style={labelStyle}>Descripción</span><span style={valorStyle}>{torneo.descripcion || '-'}</span></div>
                <div style={filaStyle}><span style={labelStyle}>Lugar</span><span style={valorStyle}>{torneo.lugar || '-'}</span></div>
                <div style={filaStyle}><span style={labelStyle}>Sedes</span><span style={valorStyle}>{torneo.sedes || '-'}</span></div>
                <div style={filaStyle}><span style={labelStyle}>Categorías</span><span style={valorStyle}>{torneo.categorias || '-'}</span></div>
                <div style={filaStyle}><span style={labelStyle}>Costo Inscripción</span><span style={valorStyle}>{torneo.moneda || 'PEN'} {torneo.costo_inscripcion || '0'}</span></div>
                <div style={filaStyle}><span style={labelStyle}>Máx. Equipos</span><span style={valorStyle}>{torneo.max_equipos || 'Sin límite'}</span></div>
                <div style={filaStyle}><span style={labelStyle}>Inicio Inscripción</span><span style={valorStyle}>{torneo.fecha_inicio_inscripcion || '-'}</span></div>
                <div style={filaStyle}><span style={labelStyle}>Fin Inscripción</span><span style={valorStyle}>{torneo.fecha_fin_inscripcion || '-'}</span></div>
                <div style={filaStyle}><span style={labelStyle}>Inicio Torneo</span><span style={valorStyle}>{torneo.fecha_inicio_torneo || '-'}</span></div>
                <div style={filaStyle}><span style={labelStyle}>Fin Torneo</span><span style={valorStyle}>{torneo.fecha_fin_torneo || '-'}</span></div>
            </div>

            <div style={seccionStyle}>
                <h3 style={tituloSeccionStyle}>Entidad Organizadora</h3>
                <div style={filaStyle}><span style={labelStyle}>Organizadora</span><span style={valorStyle}>{torneo.entidad_organizadora || '-'}</span></div>
                <div style={filaStyle}><span style={labelStyle}>RUC</span><span style={valorStyle}>{torneo.ruc_organizadora || '-'}</span></div>
                <div style={filaStyle}><span style={labelStyle}>Responsable Legal</span><span style={valorStyle}>{torneo.responsable_legal || '-'}</span></div>
                <div style={filaStyle}><span style={labelStyle}>Teléfono</span><span style={valorStyle}>{torneo.telefono_contacto || '-'}</span></div>
                <div style={filaStyle}><span style={labelStyle}>Email</span><span style={valorStyle}>{torneo.email_contacto || '-'}</span></div>
            </div>

            <div style={seccionStyle}>
                <h3 style={tituloSeccionStyle}>Documentos</h3>
                <div style={filaStyle}>
                    <span style={labelStyle}>Reglamento PDF</span>
                    <span style={valorStyle}>
                        {torneo.reglamento_pdf
                            ? <span style={{ color: '#27ae60' }}>Subido</span>
                            : <span style={{ color: '#e74c3c' }}>Pendiente</span>}
                    </span>
                </div>
                <div style={filaStyle}>
                    <span style={labelStyle}>Doc. Legalización</span>
                    <span style={valorStyle}>
                        {torneo.documento_legalizacion
                            ? <span style={{ color: '#27ae60' }}>Subido</span>
                            : <span style={{ color: '#e74c3c' }}>Pendiente</span>}
                    </span>
                </div>
                <div style={filaStyle}>
                    <span style={labelStyle}>Doc. Permiso</span>
                    <span style={valorStyle}>
                        {torneo.documento_permiso
                            ? <span style={{ color: '#27ae60' }}>Subido</span>
                            : <span style={{ color: '#e74c3c' }}>Pendiente</span>}
                    </span>
                </div>
            </div>

            <div style={seccionStyle}>
                <h3 style={tituloSeccionStyle}>Estado de Publicación</h3>
                <div style={filaStyle}>
                    <span style={labelStyle}>Publicado en Marketplace</span>
                    <span style={valorStyle}>
                        {torneo.flag_publicado === 1
                            ? <span style={{ color: '#27ae60', fontWeight: 'bold' }}>Sí - Visible para clubes</span>
                            : <span style={{ color: '#7f8c8d' }}>No publicado</span>}
                    </span>
                </div>
            </div>

            {/* Botones de acción según rol */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
                {isClub && torneo.flag_publicado === 1 && (
                    <button onClick={() => navigate(`/inscribirse/${id}`)} style={{
                        padding: '12px 24px', background: '#27ae60', color: '#fff',
                        border: 'none', borderRadius: '6px', cursor: 'pointer',
                        fontWeight: 'bold', fontSize: '14px'
                    }}>
                        <i className="fa-solid fa-file-signature" style={{ marginRight: '6px' }}></i>
                        Inscribirse al Torneo
                    </button>
                )}
                {isOrganizador && (
                    <>
                        <button onClick={() => navigate(`/torneo/${id}/inscripciones`)} style={{
                            padding: '12px 24px', background: '#3498db', color: '#fff',
                            border: 'none', borderRadius: '6px', cursor: 'pointer',
                            fontWeight: 'bold', fontSize: '14px'
                        }}>
                            <i className="fa-solid fa-clipboard-list" style={{ marginRight: '6px' }}></i>
                            Gestionar Inscripciones
                        </button>
                        <button onClick={() => navigate(`/torneo/${id}/fixture`)} style={{
                            padding: '12px 24px', background: '#2c3e50', color: '#fff',
                            border: 'none', borderRadius: '6px', cursor: 'pointer',
                            fontWeight: 'bold', fontSize: '14px'
                        }}>
                            <i className="fa-solid fa-calendar-days" style={{ marginRight: '6px' }}></i>
                            Ver Fixture
                        </button>
                        <button onClick={() => navigate(`/torneo/${id}/posiciones`)} style={{
                            padding: '12px 24px', background: '#e67e22', color: '#fff',
                            border: 'none', borderRadius: '6px', cursor: 'pointer',
                            fontWeight: 'bold', fontSize: '14px'
                        }}>
                            <i className="fa-solid fa-ranking-star" style={{ marginRight: '6px' }}></i>
                            Tabla de Posiciones
                        </button>
                        <button onClick={() => navigate(`/torneo/${id}/veedores`)} style={{
                            padding: '12px 24px', background: '#8e44ad', color: '#fff',
                            border: 'none', borderRadius: '6px', cursor: 'pointer',
                            fontWeight: 'bold', fontSize: '14px'
                        }}>
                            <i className="fa-solid fa-user-tie" style={{ marginRight: '6px' }}></i>
                            Gestionar Veedores
                        </button>
                    </>
                )}
                {!isClub && !isOrganizador && torneo.flag_publicado === 1 && (
                    <>
                        <button onClick={() => navigate(`/torneo/${id}/fixture`)} style={{
                            padding: '12px 24px', background: '#2c3e50', color: '#fff',
                            border: 'none', borderRadius: '6px', cursor: 'pointer',
                            fontWeight: 'bold', fontSize: '14px'
                        }}>
                            <i className="fa-solid fa-calendar-days" style={{ marginRight: '6px' }}></i>
                            Ver Fixture
                        </button>
                        <button onClick={() => navigate(`/torneo/${id}/posiciones`)} style={{
                            padding: '12px 24px', background: '#e67e22', color: '#fff',
                            border: 'none', borderRadius: '6px', cursor: 'pointer',
                            fontWeight: 'bold', fontSize: '14px'
                        }}>
                            <i className="fa-solid fa-ranking-star" style={{ marginRight: '6px' }}></i>
                            Tabla de Posiciones
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default DetalleTorneo;
