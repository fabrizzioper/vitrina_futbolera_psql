import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../../Context/AuthContext';
import { fetchData } from '../../../Funciones/Funciones';
import Swal from 'sweetalert2';
import axios from 'axios';

const ClubUsuarios = () => {
    const { Request, clubData, currentUser, Alerta } = useAuth();
    const [tabActivo, setTabActivo] = useState('delegados');
    const [delegados, setDelegados] = useState([]);
    const [invitaciones, setInvitaciones] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [actualizar, setActualizar] = useState(false);
    const [enviando, setEnviando] = useState(false);
    const modalRef = useRef(null);

    // Form state
    const [formData, setFormData] = useState({
        nombres: '',
        apellidos: '',
        email: '',
        telefono: '',
        rol: '',
        envioEmail: true,
        envioWhatsapp: false
    });

    const institucionId = clubData?.vit_institucion_id;

    useEffect(() => {
        if (!Request || !institucionId) return;

        setCargando(true);
        Promise.all([
            fetchData(Request, "club_delegados_list", [
                { nombre: "vit_institucion_id", envio: institucionId }
            ]).catch(() => []),
            fetchData(Request, "club_invitacion_list", [
                { nombre: "vit_institucion_id", envio: institucionId }
            ]).catch(() => [])
        ]).then(([delegadosData, invitacionesData]) => {
            setDelegados(delegadosData || []);
            setInvitaciones(invitacionesData || []);
            setCargando(false);
        }).catch(() => {
            Alerta('error', 'Error al cargar datos');
            setCargando(false);
        });
    }, [Request, institucionId, actualizar]);

    const getRolBadge = (tipoUsuario) => {
        switch (Number(tipoUsuario)) {
            case 1: return <span className="badge bg-primary">Responsable</span>;
            case 2: return <span className="badge bg-info">Admin Delegado</span>;
            case 3: return <span className="badge bg-secondary">Registrador/DT</span>;
            default: return <span className="badge bg-secondary">-</span>;
        }
    };

    const getEstadoBadge = (estado) => {
        switch (estado?.toLowerCase?.()) {
            case 'pendiente': return <span className="badge bg-warning text-dark">Pendiente</span>;
            case 'aceptada': return <span className="badge bg-success">Aceptada</span>;
            case 'expirada': return <span className="badge bg-secondary">Expirada</span>;
            case 'cancelada': return <span className="badge bg-danger">Cancelada</span>;
            default: return <span className="badge bg-secondary">{estado || '-'}</span>;
        }
    };

    const formatFecha = (fecha) => {
        if (!fecha) return '-';
        return new Date(fecha).toLocaleDateString('es', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const handleEliminarDelegado = (delegado) => {
        Swal.fire({
            title: 'Eliminar Delegado',
            text: `¿Desea eliminar a ${delegado.jugador_nombres} ${delegado.jugador_apellidos} como delegado del club?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Eliminar',
            cancelButtonText: 'Cancelar',
            background: "#0e3769",
            color: "#fff"
        }).then((result) => {
            if (result.isConfirmed) {
                fetchData(Request, "club_delegado_eliminar", [
                    { nombre: "vit_institucion_id", envio: institucionId },
                    { nombre: "vit_jugador_id", envio: delegado.vit_jugador_id }
                ]).then(() => {
                    Alerta('success', 'Delegado eliminado correctamente');
                    setActualizar(!actualizar);
                }).catch(() => {
                    Alerta('error', 'Error al eliminar delegado');
                });
            }
        });
    };

    const handleCancelarInvitacion = (invitacion) => {
        Swal.fire({
            title: 'Cancelar Invitación',
            text: `¿Desea cancelar la invitación enviada a ${invitacion.invitado_nombres} ${invitacion.invitado_apellidos || ''}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Cancelar Invitación',
            cancelButtonText: 'Volver',
            background: "#0e3769",
            color: "#fff"
        }).then((result) => {
            if (result.isConfirmed) {
                fetchData(Request, "club_invitacion_cancelar", [
                    { nombre: "vit_invitacion_club_id", envio: invitacion.vit_invitacion_club_id }
                ]).then(() => {
                    Alerta('success', 'Invitación cancelada');
                    setActualizar(!actualizar);
                }).catch(() => {
                    Alerta('error', 'Error al cancelar invitación');
                });
            }
        });
    };

    const resetForm = () => {
        setFormData({
            nombres: '',
            apellidos: '',
            email: '',
            telefono: '',
            rol: '',
            envioEmail: true,
            envioWhatsapp: false
        });
    };

    const handleInvitar = async (e) => {
        e.preventDefault();

        if (!formData.nombres.trim() || !formData.email.trim() || !formData.rol) {
            Alerta('error', 'Complete los campos obligatorios');
            return;
        }

        if (!formData.envioEmail && !formData.envioWhatsapp) {
            Alerta('error', 'Seleccione al menos un método de envío');
            return;
        }

        setEnviando(true);

        try {
            // 1) Crear la invitación y obtener token
            const data = await fetchData(Request, "club_invitacion_ins", [
                { nombre: "vit_institucion_id", envio: institucionId },
                { nombre: "nombres", envio: formData.nombres.trim() },
                { nombre: "apellidos", envio: formData.apellidos.trim() },
                { nombre: "email", envio: formData.email.trim() },
                { nombre: "telefono", envio: formData.telefono.trim() },
                { nombre: "tipo_usuario", envio: formData.rol },
                { nombre: "usuario_invita", envio: currentUser?.usuario || '' }
            ]);

            const token = data?.[0]?.token;
            if (!token) {
                Alerta('error', 'Error al crear invitación');
                setEnviando(false);
                return;
            }

            // 2) Enviar por email si marcado
            if (formData.envioEmail) {
                try {
                    const formdataEmail = new FormData();
                    formdataEmail.append("token", token);
                    formdataEmail.append("email", formData.email.trim());
                    formdataEmail.append("nombres", formData.nombres.trim());

                    await axios({
                        method: "post",
                        url: `${Request.Dominio}/club_invitacion_enviar_email`,
                        headers: {
                            "userLogin": Request.userLogin,
                            "userPassword": Request.userPassword,
                            "systemRoot": Request.Empresa
                        },
                        data: formdataEmail
                    });
                } catch {
                    Alerta('error', 'Error al enviar email');
                }
            }

            // 3) Enviar por WhatsApp si marcado
            if (formData.envioWhatsapp) {
                try {
                    const formdataWA = new FormData();
                    formdataWA.append("token", token);
                    formdataWA.append("telefono", formData.telefono.trim());
                    formdataWA.append("nombres", formData.nombres.trim());

                    await axios({
                        method: "post",
                        url: `${Request.Dominio}/club_invitacion_enviar_whatsapp`,
                        headers: {
                            "userLogin": Request.userLogin,
                            "userPassword": Request.userPassword,
                            "systemRoot": Request.Empresa
                        },
                        data: formdataWA
                    });
                } catch {
                    Alerta('error', 'Error al enviar WhatsApp');
                }
            }

            Alerta('success', 'Invitación enviada correctamente');
            resetForm();
            setActualizar(!actualizar);

            // Cerrar modal
            if (modalRef.current) {
                const bsModal = window.bootstrap?.Modal?.getInstance(modalRef.current);
                if (bsModal) bsModal.hide();
            }
        } catch {
            Alerta('error', 'Error al crear invitación');
        } finally {
            setEnviando(false);
        }
    };

    return (
        <div className='out-div-seccion' data-aos="zoom-in">
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <h2 className="h4 fw-semibold mb-0">Usuarios del Club</h2>
                <button
                    className="btn btn-primary btn-sm"
                    data-bs-toggle="modal"
                    data-bs-target="#modalInvitar"
                    onClick={resetForm}
                >
                    <i className="fa-solid fa-user-plus me-1"></i> Invitar Usuario
                </button>
            </div>

            {/* Tabs */}
            <ul className="nav nav-tabs mb-3">
                <li className="nav-item">
                    <button
                        className={`nav-link ${tabActivo === 'delegados' ? 'active' : ''}`}
                        onClick={() => setTabActivo('delegados')}
                        style={{ color: tabActivo === 'delegados' ? 'var(--text-primary)' : 'var(--text-secondary)' }}
                    >
                        Delegados Activos
                        <span className="badge bg-primary ms-2">{delegados.length}</span>
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${tabActivo === 'invitaciones' ? 'active' : ''}`}
                        onClick={() => setTabActivo('invitaciones')}
                        style={{ color: tabActivo === 'invitaciones' ? 'var(--text-primary)' : 'var(--text-secondary)' }}
                    >
                        Invitaciones Enviadas
                        <span className="badge bg-warning text-dark ms-2">{invitaciones.length}</span>
                    </button>
                </li>
            </ul>

            {cargando ? (
                <div className="text-center py-5">
                    <div className="spinner-border" role="status"></div>
                </div>
            ) : tabActivo === 'delegados' ? (
                /* Tab Delegados */
                delegados.length === 0 ? (
                    <div className="text-center py-5 text-secondary">
                        <i className="fa-solid fa-users" style={{ fontSize: '2rem' }}></i>
                        <p className="mt-2">No hay delegados registrados</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="table align-middle">
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Email</th>
                                    <th>Rol</th>
                                    <th>Fecha</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {delegados.map((d, idx) => (
                                    <tr key={d.vit_jugador_id || idx}>
                                        <td className="fw-semibold">{d.jugador_nombres} {d.jugador_apellidos}</td>
                                        <td>{d.jugador_email || '-'}</td>
                                        <td>{getRolBadge(d.tipo_usuario)}</td>
                                        <td>{formatFecha(d.fecha_inicio)}</td>
                                        <td>
                                            {Number(d.tipo_usuario) !== 1 && (
                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => handleEliminarDelegado(d)}
                                                    title="Eliminar delegado"
                                                >
                                                    <i className="fa-solid fa-trash"></i>
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            ) : (
                /* Tab Invitaciones */
                invitaciones.length === 0 ? (
                    <div className="text-center py-5 text-secondary">
                        <i className="fa-solid fa-envelope" style={{ fontSize: '2rem' }}></i>
                        <p className="mt-2">No hay invitaciones enviadas</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="table align-middle">
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Email</th>
                                    <th>Rol</th>
                                    <th>Estado</th>
                                    <th>Tipo Envío</th>
                                    <th>Fecha</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invitaciones.map((inv, idx) => (
                                    <tr key={inv.vit_invitacion_club_id || idx}>
                                        <td className="fw-semibold">{inv.invitado_nombres} {inv.invitado_apellidos || ''}</td>
                                        <td>{inv.invitado_email || '-'}</td>
                                        <td>{getRolBadge(inv.rol_asignado)}</td>
                                        <td>{getEstadoBadge(inv.estado_nombre)}</td>
                                        <td>
                                            {inv.tipo_envio === 'email' || inv.tipo_envio === 'ambos' ? <span className="badge bg-light text-dark me-1"><i className="fa-solid fa-envelope me-1"></i>Email</span> : null}
                                            {inv.tipo_envio === 'whatsapp' || inv.tipo_envio === 'ambos' ? <span className="badge bg-light text-dark"><i className="fa-brands fa-whatsapp me-1"></i>WhatsApp</span> : null}
                                        </td>
                                        <td>{formatFecha(inv.fecha_expiracion)}</td>
                                        <td>
                                            {inv.estado_nombre?.toLowerCase?.() === 'pendiente' && (
                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => handleCancelarInvitacion(inv)}
                                                    title="Cancelar invitación"
                                                >
                                                    <i className="fa-solid fa-xmark"></i>
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            )}

            {/* Modal Invitar Usuario */}
            <div className="modal fade" id="modalInvitar" tabIndex="-1" aria-labelledby="modalInvitarLabel" aria-hidden="true" ref={modalRef}>
                <div className="modal-dialog">
                    <div className="modal-content" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>
                        <div className="modal-header" style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <h5 className="modal-title" id="modalInvitarLabel">Invitar Usuario</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                        </div>
                        <form onSubmit={handleInvitar}>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label">Nombres <span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={formData.nombres}
                                        onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Apellidos</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={formData.apellidos}
                                        onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Email <span className="text-danger">*</span></label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Teléfono (WhatsApp)</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={formData.telefono}
                                        onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                                        placeholder="+502 1234 5678"
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Rol <span className="text-danger">*</span></label>
                                    <select
                                        className="form-select"
                                        value={formData.rol}
                                        onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                                        required
                                        style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
                                    >
                                        <option value="">Seleccione un rol</option>
                                        <option value="2">Administrador Delegado</option>
                                        <option value="3">Registrador / DT</option>
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Método de envío</label>
                                    <div className="d-flex gap-3">
                                        <div className="form-check">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                id="envioEmail"
                                                checked={formData.envioEmail}
                                                onChange={(e) => setFormData({ ...formData, envioEmail: e.target.checked })}
                                            />
                                            <label className="form-check-label" htmlFor="envioEmail">
                                                <i className="fa-solid fa-envelope me-1"></i> Email
                                            </label>
                                        </div>
                                        <div className="form-check">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                id="envioWhatsapp"
                                                checked={formData.envioWhatsapp}
                                                onChange={(e) => setFormData({ ...formData, envioWhatsapp: e.target.checked })}
                                            />
                                            <label className="form-check-label" htmlFor="envioWhatsapp">
                                                <i className="fa-brands fa-whatsapp me-1"></i> WhatsApp
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer" style={{ borderTop: '1px solid var(--border-color)' }}>
                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                                <button type="submit" className="btn btn-primary" disabled={enviando}>
                                    {enviando ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                                            Enviando...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fa-solid fa-paper-plane me-1"></i> Enviar Invitación
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClubUsuarios;
