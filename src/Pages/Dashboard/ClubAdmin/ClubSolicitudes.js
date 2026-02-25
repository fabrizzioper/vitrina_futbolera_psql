import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../Context/AuthContext';
import { fetchData } from '../../../Funciones/Funciones';
import { DEFAULT_IMAGES } from '../../../Funciones/DefaultImages';
import Swal from 'sweetalert2';

const ClubSolicitudes = () => {
    const { Request, clubData, currentUser, Alerta } = useAuth();
    const [solicitudes, setSolicitudes] = useState([]);
    const [filtro, setFiltro] = useState(-1);
    const [cargando, setCargando] = useState(true);
    const [actualizar, setActualizar] = useState(false);

    const institucionId = clubData?.vit_institucion_id;

    useEffect(() => {
        if (institucionId) {
            setCargando(true);
            fetchData(Request, "verificacion_institucion_club_list", [
                { nombre: "vit_institucion_id", envio: institucionId },
                { nombre: "estado_filtro", envio: filtro }
            ]).then(data => {
                setSolicitudes(data || []);
                setCargando(false);
            }).catch(() => {
                Alerta('error', 'Error al cargar solicitudes');
                setCargando(false);
            });
        }
    }, [institucionId, filtro, actualizar]);

    const handleResponder = (verificacionId, estado, nombreJugador) => {
        const accion = estado === 1 ? 'aprobar' : 'rechazar';
        const titulo = estado === 1 ? 'Aprobar Verificación' : 'Rechazar Verificación';

        Swal.fire({
            title: titulo,
            text: `¿Desea ${accion} la solicitud de ${nombreJugador}?`,
            input: 'textarea',
            inputLabel: 'Observación (opcional)',
            inputPlaceholder: 'Escriba una observación...',
            icon: estado === 1 ? 'question' : 'warning',
            showCancelButton: true,
            confirmButtonColor: estado === 1 ? '#28a745' : '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: estado === 1 ? 'Aprobar' : 'Rechazar',
            cancelButtonText: 'Cancelar',
            background: "#0e3769",
            color: "#fff"
        }).then((result) => {
            if (result.isConfirmed) {
                fetchData(Request, "verificacion_institucion_responder", [
                    { nombre: "vit_verificacion_institucion_id", envio: verificacionId },
                    { nombre: "estado", envio: estado },
                    { nombre: "observacion", envio: result.value || '' },
                    { nombre: "usuario_respuesta", envio: currentUser?.usuario || '' }
                ]).then(() => {
                    Alerta('success', estado === 1 ? 'Solicitud aprobada' : 'Solicitud rechazada');
                    setActualizar(!actualizar);
                }).catch(() => {
                    Alerta('error', 'Error al procesar solicitud');
                });
            }
        });
    };

    const getBadge = (estado) => {
        switch (estado) {
            case 0: return <span className="badge bg-warning text-dark">Pendiente</span>;
            case 1: return <span className="badge bg-success">Aprobado</span>;
            case 2: return <span className="badge bg-danger">Rechazado</span>;
            default: return <span className="badge bg-secondary">-</span>;
        }
    };

    const formatFecha = (fecha) => {
        if (!fecha) return '-';
        return new Date(fecha).toLocaleDateString('es', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    return (
        <div className='out-div-seccion' data-aos="zoom-in">
            <h2 className="h4 fw-semibold mb-3">Solicitudes de Verificación</h2>

            <div className="d-flex gap-2 mb-3 flex-wrap">
                <button className={`btn btn-sm ${filtro === -1 ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setFiltro(-1)}>Todas</button>
                <button className={`btn btn-sm ${filtro === 0 ? 'btn-warning' : 'btn-outline-secondary'}`} onClick={() => setFiltro(0)}>Pendientes</button>
                <button className={`btn btn-sm ${filtro === 1 ? 'btn-success' : 'btn-outline-secondary'}`} onClick={() => setFiltro(1)}>Aprobadas</button>
                <button className={`btn btn-sm ${filtro === 2 ? 'btn-danger' : 'btn-outline-secondary'}`} onClick={() => setFiltro(2)}>Rechazadas</button>
            </div>

            {cargando ? (
                <div className="text-center py-5"><div className="spinner-border" role="status"></div></div>
            ) : solicitudes.length === 0 ? (
                <div className="text-center py-5 text-secondary">
                    <i className="fa-solid fa-inbox" style={{ fontSize: '2rem' }}></i>
                    <p className="mt-2">No hay solicitudes</p>
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="table align-middle">
                        <thead>
                            <tr>
                                <th>Jugador</th>
                                <th>Posición</th>
                                <th>Período</th>
                                <th>Nivel</th>
                                <th>Fecha Solicitud</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {solicitudes.map(s => (
                                <tr key={s.vit_verificacion_institucion_id}>
                                    <td>
                                        <div className="d-flex align-items-center gap-2">
                                            <img
                                                src={s.foto_jugador || DEFAULT_IMAGES.CARA_USUARIO}
                                                alt=""
                                                style={{ width: 35, height: 35, borderRadius: '50%', objectFit: 'cover' }}
                                            />
                                            <div>
                                                <div className="fw-semibold">{s.jugador_nombres} {s.jugador_apellidos}</div>
                                                {s.dni && <small className="text-secondary">DNI: {s.dni}</small>}
                                            </div>
                                        </div>
                                    </td>
                                    <td>{s.posicion || '-'}</td>
                                    <td>
                                        {s.fecha_inicio ? new Date(s.fecha_inicio).getFullYear() : '?'}
                                        {' - '}
                                        {s.flag_actual === 1 ? 'Actualidad' : s.fecha_fin ? new Date(s.fecha_fin).getFullYear() : '?'}
                                    </td>
                                    <td>
                                        {s.nivel_institucion === 1 ? 'Aficionado' : s.nivel_institucion === 2 ? 'Profesional' : '-'}
                                    </td>
                                    <td>{formatFecha(s.fecha_solicitud)}</td>
                                    <td>{getBadge(s.estado)}</td>
                                    <td>
                                        {s.estado === 0 ? (
                                            <div className="d-flex gap-1">
                                                <button
                                                    className="btn btn-sm btn-success"
                                                    onClick={() => handleResponder(s.vit_verificacion_institucion_id, 1, `${s.jugador_nombres} ${s.jugador_apellidos}`)}
                                                    title="Aprobar"
                                                >
                                                    <i className="fa-solid fa-check"></i>
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-danger"
                                                    onClick={() => handleResponder(s.vit_verificacion_institucion_id, 2, `${s.jugador_nombres} ${s.jugador_apellidos}`)}
                                                    title="Rechazar"
                                                >
                                                    <i className="fa-solid fa-xmark"></i>
                                                </button>
                                            </div>
                                        ) : (
                                            <small className="text-secondary">
                                                {s.observacion_club && <span title={s.observacion_club}><i className="fa-solid fa-comment"></i> </span>}
                                                {formatFecha(s.fecha_respuesta)}
                                            </small>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ClubSolicitudes;
