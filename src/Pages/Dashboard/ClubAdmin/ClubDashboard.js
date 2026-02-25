import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../Context/AuthContext';
import { fetchData } from '../../../Funciones/Funciones';
import { DEFAULT_IMAGES } from '../../../Funciones/DefaultImages';

const ClubDashboard = () => {
    const { Request, clubData, Alerta } = useAuth();
    const [resumen, setResumen] = useState(null);
    const [cargando, setCargando] = useState(true);

    const institucionId = clubData?.vit_institucion_id;

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
                    <small className="text-secondary">{clubData?.tipo_institucion}</small>
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
                <div className="col-12 col-md-6">
                    <Link to="/club/perfil" className="card p-3 text-decoration-none" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                        <div className="d-flex align-items-center gap-3">
                            <i className="fa-solid fa-building" style={{ fontSize: '1.5rem', color: '#17a2b8' }}></i>
                            <div>
                                <div className="fw-semibold" style={{ color: 'var(--text-primary)' }}>Perfil del Club</div>
                                <small className="text-secondary">Editar información de la institución</small>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ClubDashboard;
