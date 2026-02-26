import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../Context/AuthContext';
import { fetchData } from '../../../Funciones/Funciones';
import { DEFAULT_IMAGES } from '../../../Funciones/DefaultImages';

const getRolNombre = (tipoUsuario) => {
    switch (Number(tipoUsuario)) {
        case 1: return { label: 'Responsable (Due\u00f1o)', color: '#ef8700', icon: 'fa-crown' };
        case 2: return { label: 'Administrador Delegado', color: '#17a2b8', icon: 'fa-user-tie' };
        case 3: return { label: 'Registrador / DT', color: '#6c757d', icon: 'fa-clipboard-user' };
        default: return { label: 'Usuario', color: '#6c757d', icon: 'fa-user' };
    }
};

const ClubDashboard = () => {
    const { Request, clubData, Alerta, currentUser } = useAuth();
    const [resumen, setResumen] = useState(null);
    const [cargando, setCargando] = useState(true);

    const institucionId = clubData?.vit_institucion_id;
    const tipoUsuario = Number(clubData?.tipo_usuario || 0);
    const rolInfo = getRolNombre(tipoUsuario);

    useEffect(() => {
        if (!Request) return;

        if (institucionId) {
            fetchData(Request, "club_dashboard_resumen", [
                { nombre: "vit_institucion_id", envio: institucionId }
            ]).then(data => {
                if (data && data[0]) {
                    setResumen(data[0]);
                }
                setCargando(false);
            }).catch(() => {
                Alerta('error', 'Error al cargar dashboard');
                setCargando(false);
            });
        } else {
            setCargando(false);
        }
    }, [Request, institucionId, Alerta]);

    if (cargando) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status" aria-label="Cargando">
                    <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="mt-2 mb-0 text-secondary small">Cargando dashboard...</p>
            </div>
        );
    }

    return (
        <div className='out-div-seccion'>
            <div className="d-flex align-items-center gap-3 mb-4">
                <img
                    src={clubData?.logo || DEFAULT_IMAGES.ESCUDO_CLUB}
                    alt={clubData?.nombre_institucion}
                    style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover' }}
                />
                <div>
                    <h2 className="h4 fw-semibold mb-0">{clubData?.nombre_institucion || 'Mi Club'}</h2>
                    <div className="d-flex align-items-center gap-2 mt-1">
                        <small className="text-secondary">{clubData?.tipo_institucion}</small>
                        <span className="badge" style={{ background: rolInfo.color, fontSize: '0.7rem' }}>
                            <i className={`fa-solid ${rolInfo.icon} me-1`}></i>
                            {rolInfo.label}
                        </span>
                    </div>
                </div>
            </div>

            <div className="row g-3 mb-4">
                <div className="col-6 col-md-3">
                    <div className="card text-center p-3" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                        <div className="h2 fw-bold mb-1" style={{ color: '#17a2b8' }}>{resumen?.total_jugadores || 0}</div>
                        <small className="text-secondary">Jugadores registrados</small>
                    </div>
                </div>
                <div className="col-6 col-md-3">
                    <div className="card text-center p-3" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                        <div className="h2 fw-bold mb-1" style={{ color: '#ffc107' }}>{resumen?.solicitudes_pendientes || 0}</div>
                        <small className="text-secondary">Pendientes</small>
                    </div>
                </div>
                <div className="col-6 col-md-3">
                    <div className="card text-center p-3" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                        <div className="h2 fw-bold mb-1" style={{ color: '#28a745' }}>{resumen?.solicitudes_aprobadas || 0}</div>
                        <small className="text-secondary">Aprobadas</small>
                    </div>
                </div>
                <div className="col-6 col-md-3">
                    <div className="card text-center p-3" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                        <div className="h2 fw-bold mb-1" style={{ color: '#dc3545' }}>{resumen?.solicitudes_rechazadas || 0}</div>
                        <small className="text-secondary">Rechazadas</small>
                    </div>
                </div>
                <div className="col-6 col-md-3">
                    <div className="card text-center p-3" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                        <div className="h2 fw-bold mb-1" style={{ color: '#6f42c1' }}>{resumen?.total_delegados || 0}</div>
                        <small className="text-secondary">Delegados</small>
                    </div>
                </div>
                <div className="col-6 col-md-3">
                    <div className="card text-center p-3" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                        <div className="h2 fw-bold mb-1" style={{ color: '#fd7e14' }}>{resumen?.invitaciones_pendientes || 0}</div>
                        <small className="text-secondary">Invitaciones pendientes</small>
                    </div>
                </div>
            </div>

            <div className="row g-3">
                <div className="col-12 col-md-6">
                    <Link to="/club/solicitudes" className="card p-3 text-decoration-none" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                        <div className="d-flex align-items-center gap-3">
                            <i className="fa-solid fa-clipboard-list" style={{ fontSize: '1.5rem', color: '#ffc107' }}></i>
                            <div>
                                <div className="fw-semibold" style={{ color: 'var(--text-primary)' }}>Solicitudes de Verificación</div>
                                <small className="text-secondary">Revisar solicitudes de jugadores</small>
                            </div>
                        </div>
                    </Link>
                </div>
                {tipoUsuario === 1 && (
                    <div className="col-12 col-md-6">
                        <Link to="/club/perfil" className="card p-3 text-decoration-none" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                            <div className="d-flex align-items-center gap-3">
                                <i className="fa-solid fa-building" style={{ fontSize: '1.5rem', color: '#17a2b8' }}></i>
                                <div>
                                    <div className="fw-semibold" style={{ color: 'var(--text-primary)' }}>Perfil del Club</div>
                                    <small className="text-secondary">Editar datos legales / RUC</small>
                                </div>
                            </div>
                        </Link>
                    </div>
                )}
                {tipoUsuario <= 2 && (
                    <div className="col-12 col-md-6">
                        <Link to="/club/usuarios" className="card p-3 text-decoration-none" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                            <div className="d-flex align-items-center gap-3">
                                <i className="fa-solid fa-users" style={{ fontSize: '1.5rem', color: '#6f42c1' }}></i>
                                <div>
                                    <div className="fw-semibold" style={{ color: 'var(--text-primary)' }}>Usuarios del Club</div>
                                    <small className="text-secondary">Gestionar delegados e invitaciones</small>
                                </div>
                            </div>
                        </Link>
                    </div>
                )}
                <div className="col-12 col-md-6">
                    <Link to="/club/jugadores" className="card p-3 text-decoration-none" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                        <div className="d-flex align-items-center gap-3">
                            <i className="fa-solid fa-futbol" style={{ fontSize: '1.5rem', color: '#28a745' }}></i>
                            <div>
                                <div className="fw-semibold" style={{ color: 'var(--text-primary)' }}>Registrar Jugadores</div>
                                <small className="text-secondary">Agregar jugadores al club</small>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ClubDashboard;
