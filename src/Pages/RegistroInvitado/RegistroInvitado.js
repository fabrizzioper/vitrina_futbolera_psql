import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import { fetchData, icon, type } from '../../Funciones/Funciones';
import logo from "../../imagenes/logo-vitrina.png";

const RegistroInvitado = () => {
    const { token } = useParams();
    const { login, Request } = useAuth();

    const [cargando, setCargando] = useState(true);
    const [tokenValido, setTokenValido] = useState(false);
    const [invitacion, setInvitacion] = useState(null);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [viewPass, setViewPass] = useState(false);
    const [viewConfirm, setViewConfirm] = useState(false);
    const [enviando, setEnviando] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!token) {
            setCargando(false);
            return;
        }

        fetchData(Request, "club_invitacion_validar_token", [
            { nombre: "token", envio: token }
        ]).then(data => {
            const info = data?.[0];
            if (info && info.valido) {
                setInvitacion(info);
                setTokenValido(true);
            } else {
                setTokenValido(false);
                setError(info?.mensaje || 'Invitación inválida o expirada');
            }
            setCargando(false);
        }).catch(() => {
            setTokenValido(false);
            setError('Error al validar la invitación');
            setCargando(false);
        });
    }, [token, Request]);

    const getRolLabel = (tipoUsuario) => {
        switch (Number(tipoUsuario)) {
            case 1: return 'Responsable';
            case 2: return 'Administrador Delegado';
            case 3: return 'Registrador / DT';
            default: return 'Usuario';
        }
    };

    const getRolBadgeClass = (tipoUsuario) => {
        switch (Number(tipoUsuario)) {
            case 1: return 'bg-primary';
            case 2: return 'bg-info';
            case 3: return 'bg-secondary';
            default: return 'bg-secondary';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!password || !confirmPassword) {
            setError('Complete ambos campos de contraseña');
            return;
        }

        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        setEnviando(true);

        try {
            const data = await fetchData(Request, "club_invitacion_aceptar", [
                { nombre: "token", envio: token },
                { nombre: "jugador_contrasena", envio: password }
            ]);

            const resultado = data?.[0];
            if (resultado?.success === 1 || resultado?.jugador_email) {
                const emailLogin = resultado.jugador_email || invitacion.invitado_email;
                login(emailLogin, password);
            } else {
                setError(resultado?.resultado || 'Error al aceptar la invitación');
            }
        } catch {
            setError('Error al procesar la solicitud');
        } finally {
            setEnviando(false);
        }
    };

    if (cargando) {
        return (
            <div className='d-flex w-100 justify-content-center align-items-center' style={{ minHeight: '100vh', background: 'var(--login-bg)' }}>
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </div>
                    <p className="mt-2 text-secondary small">Validando invitación...</p>
                </div>
            </div>
        );
    }

    return (
        <div className='d-flex w-100 justify-content-center align-items-center' style={{ minHeight: '100vh', background: 'var(--login-bg)', padding: '1rem' }}>
            <div className="card shadow-sm" style={{ maxWidth: 480, width: '100%', background: 'var(--login-card-bg)', border: '1px solid var(--border-color)' }}>
                <div className="card-body p-4">
                    {/* Logo */}
                    <div className="text-center mb-3">
                        <img src={logo} alt="Vitrina Futbolera" style={{ height: '3.5rem', objectFit: 'contain' }} />
                    </div>

                    {!tokenValido ? (
                        /* Token inválido */
                        <div className="text-center">
                            <i className="fa-solid fa-circle-exclamation" style={{ fontSize: '3rem', color: '#dc3545' }}></i>
                            <h4 className="mt-3 fw-semibold" style={{ color: 'var(--text-primary)' }}>Invitación no válida</h4>
                            <p className="text-secondary">{error || 'El enlace de invitación es inválido o ha expirado.'}</p>
                            <Link to="/login" className="btn btn-primary mt-2">
                                <i className="fa-solid fa-arrow-right-to-bracket me-1"></i> Ir a Iniciar Sesión
                            </Link>
                        </div>
                    ) : (
                        /* Formulario de aceptación */
                        <>
                            <h4 className="text-center fw-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                                Aceptar Invitación
                            </h4>
                            <p className="text-center text-secondary mb-4">
                                Has sido invitado a unirte a un club
                            </p>

                            {/* Info de la invitación */}
                            <div className="p-3 rounded mb-4" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
                                <div className="mb-2">
                                    <small className="text-secondary">Club</small>
                                    <div className="fw-semibold" style={{ color: 'var(--text-primary)' }}>
                                        <i className="fa-solid fa-building me-1"></i>
                                        {invitacion.nombre_club || 'Club'}
                                    </div>
                                </div>
                                <div className="mb-2">
                                    <small className="text-secondary">Invitado</small>
                                    <div className="fw-semibold" style={{ color: 'var(--text-primary)' }}>
                                        {invitacion.invitado_nombres} {invitacion.invitado_apellidos || ''}
                                    </div>
                                </div>
                                <div className="mb-2">
                                    <small className="text-secondary">Email</small>
                                    <div style={{ color: 'var(--text-primary)' }}>{invitacion.invitado_email}</div>
                                </div>
                                <div>
                                    <small className="text-secondary">Rol asignado</small>
                                    <div>
                                        <span className={`badge ${getRolBadgeClass(invitacion.rol_asignado)}`}>
                                            {invitacion.rol_nombre || getRolLabel(invitacion.rol_asignado)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="alert alert-danger py-2 small">{error}</div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label fw-semibold" style={{ color: 'var(--text-primary)' }}>
                                        Contraseña <span className="text-danger">*</span>
                                    </label>
                                    <div className="input-group input-group-merge">
                                        <input
                                            type={type(viewPass)}
                                            className="form-control"
                                            placeholder="Crea tu contraseña"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            minLength={6}
                                        />
                                        <span
                                            className="view-btn input-group-text px-4 text-secondary link-primary text-decoration-none"
                                            onClick={() => setViewPass(!viewPass)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <i className={`view-icon fa-solid ${icon(viewPass)}`}></i>
                                        </span>
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <label className="form-label fw-semibold" style={{ color: 'var(--text-primary)' }}>
                                        Confirmar Contraseña <span className="text-danger">*</span>
                                    </label>
                                    <div className="input-group input-group-merge">
                                        <input
                                            type={type(viewConfirm)}
                                            className="form-control"
                                            placeholder="Confirma tu contraseña"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            minLength={6}
                                        />
                                        <span
                                            className="view-btn input-group-text px-4 text-secondary link-primary text-decoration-none"
                                            onClick={() => setViewConfirm(!viewConfirm)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <i className={`view-icon fa-solid ${icon(viewConfirm)}`}></i>
                                        </span>
                                    </div>
                                </div>
                                <button type="submit" className="btn btn-primary w-100" disabled={enviando}>
                                    {enviando ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                                            Procesando...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fa-solid fa-check me-1"></i> Aceptar Invitación
                                        </>
                                    )}
                                </button>
                            </form>

                            <div className="text-center mt-3">
                                <small className="text-secondary">
                                    ¿Ya tienes una cuenta? <Link to="/login" className="link-primary fw-semibold">Iniciar Sesión</Link>
                                </small>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RegistroInvitado;
