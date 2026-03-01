import React, { useState, useEffect } from 'react';
import { useAuth } from '../../Context/AuthContext';
import { obtenerTorneo } from '../../Funciones/TorneoService';
import { useParams, useNavigate } from 'react-router-dom';
import './DetalleTorneo.css';

const formatFecha = (fecha) => {
    if (!fecha) return '-';
    try {
        const d = new Date(fecha);
        return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
        return fecha;
    }
};

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

    if (loading) return <div className="detalle-torneo"><div className="detalle-torneo-loading">Cargando detalle...</div></div>;
    if (!torneo) return <div className="detalle-torneo"><div className="detalle-torneo-error">Torneo no encontrado</div></div>;

    const estado = getEstadoLegalizacion(torneo.flag_legalizado);

    const Fila = ({ label, value, valorClassName }) => (
        <div className="detalle-torneo-fila">
            <span className="detalle-torneo-label">{label}</span>
            <span className={`detalle-torneo-valor ${valorClassName || ''}`}>{value ?? '-'}</span>
        </div>
    );

    return (
        <div className="detalle-torneo">
            <button type="button" className="detalle-torneo-back" onClick={() => navigate('/torneo/mis-torneos')}>
                <i className="fa-solid fa-arrow-left" aria-hidden></i>
                Volver a Mis Torneos
            </button>

            <header className="detalle-torneo-header">
                <h1 className="detalle-torneo-titulo">{torneo.nombre}</h1>
                <span
                    className="detalle-torneo-estado"
                    style={{ color: estado.color, background: estado.bg }}
                >
                    {estado.texto}
                </span>
            </header>

            {torneo.observacion_admin && (
                <div className="detalle-torneo-alerta">
                    <strong>Observación del Admin</strong>
                    {torneo.observacion_admin}
                </div>
            )}

            <section className="detalle-torneo-card">
                <h2 className="detalle-torneo-card-titulo">
                    <i className="fa-solid fa-circle-info" aria-hidden></i>
                    Información del Torneo
                </h2>
                <div className="detalle-torneo-grid detalle-torneo-grid--2">
                    <Fila label="Descripción" value={torneo.descripcion} valorClassName="detalle-torneo-valor--descripcion" />
                    <Fila label="Lugar" value={torneo.lugar} />
                    <Fila label="Sedes" value={torneo.sedes} />
                    <Fila label="Categorías" value={torneo.categorias} />
                    <Fila label="Costo Inscripción" value={torneo.costo_inscripcion != null ? `${torneo.moneda || 'PEN'} ${torneo.costo_inscripcion}` : null} />
                    <Fila label="Máx. Equipos" value={torneo.max_equipos || 'Sin límite'} />
                    <Fila label="Inicio Inscripción" value={formatFecha(torneo.fecha_inicio_inscripcion)} />
                    <Fila label="Fin Inscripción" value={formatFecha(torneo.fecha_fin_inscripcion)} />
                    <Fila label="Inicio Torneo" value={formatFecha(torneo.fecha_inicio_torneo)} />
                    <Fila label="Fin Torneo" value={formatFecha(torneo.fecha_fin_torneo)} />
                </div>
            </section>

            <section className="detalle-torneo-card">
                <h2 className="detalle-torneo-card-titulo">
                    <i className="fa-solid fa-building" aria-hidden></i>
                    Entidad Organizadora
                </h2>
                <div className="detalle-torneo-grid detalle-torneo-grid--2">
                    <Fila label="Organizadora" value={torneo.entidad_organizadora} />
                    <Fila label="RUC" value={torneo.ruc_organizadora} />
                    <Fila label="Responsable Legal" value={torneo.responsable_legal} />
                    <Fila label="Teléfono" value={torneo.telefono_contacto} />
                    <Fila label="Email" value={torneo.email_contacto} />
                </div>
            </section>

            <section className="detalle-torneo-card">
                <h2 className="detalle-torneo-card-titulo">
                    <i className="fa-solid fa-file-lines" aria-hidden></i>
                    Documentos
                </h2>
                <div className="detalle-torneo-grid">
                    <Fila
                        label="Reglamento PDF"
                        value={torneo.reglamento_pdf ? <span className="detalle-torneo-valor--ok">Subido</span> : <span className="detalle-torneo-valor--pendiente">Pendiente</span>}
                    />
                    <Fila
                        label="Doc. Legalización"
                        value={torneo.documento_legalizacion ? <span className="detalle-torneo-valor--ok">Subido</span> : <span className="detalle-torneo-valor--pendiente">Pendiente</span>}
                    />
                    <Fila
                        label="Doc. Permiso"
                        value={torneo.documento_permiso ? <span className="detalle-torneo-valor--ok">Subido</span> : <span className="detalle-torneo-valor--pendiente">Pendiente</span>}
                    />
                </div>
            </section>

            <section className="detalle-torneo-card">
                <h2 className="detalle-torneo-card-titulo">
                    <i className="fa-solid fa-globe" aria-hidden></i>
                    Estado de Publicación
                </h2>
                <Fila
                    label="Publicado en Marketplace"
                    value={torneo.flag_publicado === 1 ? <span className="detalle-torneo-valor--publicado">Sí - Visible para clubes</span> : <span>No publicado</span>}
                />
            </section>

            <div className="detalle-torneo-acciones">
                {isClub && torneo.flag_publicado === 1 && (
                    <button type="button" className="detalle-torneo-btn detalle-torneo-btn--inscribir" onClick={() => navigate(`/inscribirse/${id}`)}>
                        <i className="fa-solid fa-file-signature" aria-hidden></i>
                        Inscribirse al Torneo
                    </button>
                )}
                {isOrganizador && (
                    <>
                        <button type="button" className="detalle-torneo-btn detalle-torneo-btn--gestionar" onClick={() => navigate(`/torneo/${id}/inscripciones`)}>
                            <i className="fa-solid fa-clipboard-list" aria-hidden></i>
                            Gestionar Inscripciones
                        </button>
                        <button type="button" className="detalle-torneo-btn detalle-torneo-btn--fixture" onClick={() => navigate(`/torneo/${id}/fixture`)}>
                            <i className="fa-solid fa-calendar-days" aria-hidden></i>
                            Ver Fixture
                        </button>
                        <button type="button" className="detalle-torneo-btn detalle-torneo-btn--posiciones" onClick={() => navigate(`/torneo/${id}/posiciones`)}>
                            <i className="fa-solid fa-ranking-star" aria-hidden></i>
                            Tabla de Posiciones
                        </button>
                        <button type="button" className="detalle-torneo-btn detalle-torneo-btn--veedores" onClick={() => navigate(`/torneo/${id}/veedores`)}>
                            <i className="fa-solid fa-user-tie" aria-hidden></i>
                            Gestionar Veedores
                        </button>
                    </>
                )}
                {!isClub && !isOrganizador && torneo.flag_publicado === 1 && (
                    <>
                        <button type="button" className="detalle-torneo-btn detalle-torneo-btn--fixture" onClick={() => navigate(`/torneo/${id}/fixture`)}>
                            <i className="fa-solid fa-calendar-days" aria-hidden></i>
                            Ver Fixture
                        </button>
                        <button type="button" className="detalle-torneo-btn detalle-torneo-btn--posiciones" onClick={() => navigate(`/torneo/${id}/posiciones`)}>
                            <i className="fa-solid fa-ranking-star" aria-hidden></i>
                            Tabla de Posiciones
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default DetalleTorneo;
