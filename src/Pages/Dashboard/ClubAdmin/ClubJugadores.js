import React, { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useAuth } from '../../../Context/AuthContext';
import { fetchData } from '../../../Funciones/Funciones';
import { DEFAULT_IMAGES } from '../../../Funciones/DefaultImages';
import Swal from 'sweetalert2';
import axios from 'axios';

const ClubJugadores = () => {
    const { Request, clubData, currentUser, Alerta } = useAuth();
    const [jugadores, setJugadores] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [actualizar, setActualizar] = useState(false);
    const [enviando, setEnviando] = useState(false);
    const [mostrarCargaMasiva, setMostrarCargaMasiva] = useState(false);

    // Comentarios del perfil del jugador
    const [jugadorExpandido, setJugadorExpandido] = useState(null);
    const [comentarios, setComentarios] = useState([]);
    const [cargandoComentarios, setCargandoComentarios] = useState(false);
    const [nuevoComentario, setNuevoComentario] = useState('');
    const [enviandoComentario, setEnviandoComentario] = useState(false);
    const [archivoCarga, setArchivoCarga] = useState(null);
    const [resultadosCarga, setResultadosCarga] = useState([]);
    const [cargandoMasiva, setCargandoMasiva] = useState(false);
    const modalRef = useRef(null);
    const fileInputRef = useRef(null);

    // Form state
    const [formData, setFormData] = useState({
        nombres: '',
        apellidos: '',
        email: '',
        fecha_nacimiento: '',
        tipo_documento: 'DNI',
        documento: '',
        celular: '',
        posicion: '',
        nivel_institucion: '1',
        fecha_inicio: new Date().toISOString().split('T')[0]
    });

    const posiciones = [
        { value: '1', label: 'Portero' },
        { value: '2', label: 'Lateral Derecho' },
        { value: '3', label: 'Central Derecho' },
        { value: '4', label: 'Central Izquierdo' },
        { value: '5', label: 'Lateral Izquierdo' },
        { value: '6', label: 'MedioCampo Defensivo' },
        { value: '7', label: 'Mediocampo Derecho' },
        { value: '8', label: 'Mediocampo Izquierda' },
        { value: '9', label: 'MedioCampo Ofensivo' },
        { value: '10', label: 'Extremo Derecho' },
        { value: '11', label: 'Segundo Delantero' },
        { value: '12', label: 'Extremo Izquierdo' },
        { value: '13', label: 'Central Delantero' }
    ];

    const institucionId = clubData?.vit_institucion_id;
    const jugadorId = currentUser?.vit_jugador_id;

    useEffect(() => {
        if (!Request || !institucionId) return;

        setCargando(true);
        fetchData(Request, "club_jugadores_registrados_list", [
            { nombre: "vit_institucion_id", envio: institucionId }
        ]).then(data => {
            setJugadores(data || []);
            setCargando(false);
        }).catch(() => {
            Alerta('error', 'Error al cargar jugadores');
            setCargando(false);
        });
    }, [Request, institucionId, actualizar]);

    const formatFecha = (fecha) => {
        if (!fecha) return '-';
        return new Date(fecha).toLocaleDateString('es', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const getVerificacionBadge = (verificado, estado) => {
        if (Number(verificado) === 1) return <span className="badge bg-success">Verificado</span>;
        switch (Number(estado)) {
            case 0: return <span className="badge bg-warning text-dark">Pendiente</span>;
            case 2: return <span className="badge bg-success">Aprobado</span>;
            case 3: return <span className="badge bg-danger">Rechazado</span>;
            default: return <span className="badge bg-secondary">Sin verificar</span>;
        }
    };

    // --- Funciones de comentarios ---
    const toggleComentarios = (jugId) => {
        if (jugadorExpandido === jugId) {
            setJugadorExpandido(null);
            setComentarios([]);
            setNuevoComentario('');
            return;
        }
        setJugadorExpandido(jugId);
        cargarComentarios(jugId);
    };

    const cargarComentarios = (jugId) => {
        setCargandoComentarios(true);
        fetchData(Request, "club_jugador_comentario_list", [
            { nombre: "vit_jugador_id", envio: jugId },
            { nombre: "vit_institucion_id", envio: institucionId }
        ]).then(data => {
            setComentarios(data || []);
            setCargandoComentarios(false);
        }).catch(() => {
            setComentarios([]);
            setCargandoComentarios(false);
        });
    };

    const handleAgregarComentario = (jugId) => {
        if (!nuevoComentario.trim()) return;
        setEnviandoComentario(true);

        fetchData(Request, "club_jugador_comentario_ins", [
            { nombre: "vit_jugador_id", envio: jugId },
            { nombre: "vit_institucion_id", envio: institucionId },
            { nombre: "autor_jugador_id", envio: jugadorId },
            { nombre: "comentario", envio: nuevoComentario.trim() }
        ]).then(() => {
            setNuevoComentario('');
            cargarComentarios(jugId);
            Alerta('success', 'Comentario agregado');
        }).catch(() => {
            Alerta('error', 'Error al agregar comentario');
        }).finally(() => {
            setEnviandoComentario(false);
        });
    };

    const handleEliminarComentario = (comentarioId, jugId) => {
        fetchData(Request, "club_jugador_comentario_del", [
            { nombre: "vit_jugador_comentario_club_id", envio: comentarioId },
            { nombre: "autor_jugador_id", envio: jugadorId }
        ]).then(() => {
            cargarComentarios(jugId);
            Alerta('success', 'Comentario eliminado');
        }).catch(() => {
            Alerta('error', 'Error al eliminar comentario');
        });
    };

    const formatFechaComentario = (fecha) => {
        if (!fecha) return '';
        const d = new Date(fecha);
        return d.toLocaleDateString('es', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
            ' ' + d.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
    };

    const resetForm = () => {
        setFormData({
            nombres: '',
            apellidos: '',
            email: '',
            fecha_nacimiento: '',
            tipo_documento: 'DNI',
            documento: '',
            celular: '',
            posicion: '',
            nivel_institucion: '1',
            fecha_inicio: new Date().toISOString().split('T')[0]
        });
    };

    const handleRegistrarJugador = async (e) => {
        e.preventDefault();

        if (!formData.nombres.trim() || !formData.apellidos.trim() || !formData.email.trim() ||
            !formData.fecha_nacimiento || !formData.documento.trim() || !formData.celular.trim() ||
            !formData.posicion || !formData.fecha_inicio) {
            Alerta('error', 'Complete todos los campos obligatorios');
            return;
        }

        setEnviando(true);

        try {
            const data = await fetchData(Request, "club_jugador_registrar", [
                { nombre: "vit_institucion_id", envio: institucionId },
                { nombre: "registrado_por_jugador_id", envio: jugadorId },
                { nombre: "nombres", envio: formData.nombres.trim() },
                { nombre: "apellidos", envio: formData.apellidos.trim() },
                { nombre: "email", envio: formData.email.trim() },
                { nombre: "fecha_nacimiento", envio: formData.fecha_nacimiento || '' },
                { nombre: "tipo_documento", envio: formData.tipo_documento || 'DNI' },
                { nombre: "documento_codigo", envio: formData.documento.trim() },
                { nombre: "celular_numero", envio: formData.celular.trim() },
                { nombre: "vit_posicion_juego_id", envio: formData.posicion || '0' },
                { nombre: "nivel_institucion", envio: formData.nivel_institucion || '1' },
                { nombre: "fecha_inicio", envio: formData.fecha_inicio || '' }
            ]);

            const resultado = data?.[0];

            // Cerrar modal
            if (modalRef.current) {
                const bsModal = window.bootstrap?.Modal?.getInstance(modalRef.current);
                if (bsModal) bsModal.hide();
            }

            if (resultado?.success === 1 || resultado?.success === '1') {
                const isModoDia = document.documentElement.getAttribute('data-theme') === 'light';
                Swal.fire({
                    title: 'Jugador Registrado',
                    html: `
                        <div style="text-align:left">
                            <p><strong>Nombre:</strong> ${resultado.jugador_nombres || formData.nombres} ${resultado.jugador_apellidos || formData.apellidos}</p>
                            <p><strong>Email:</strong> ${resultado.jugador_email || formData.email}</p>
                            <hr/>
                            <small class="text-muted">Se ha enviado un correo al jugador con las instrucciones para establecer su contraseña.</small>
                        </div>
                    `,
                    icon: 'success',
                    confirmButtonColor: '#ef8700',
                    confirmButtonText: 'Entendido',
                    background: isModoDia ? '#ebf7fb' : '#0e3769',
                    color: isModoDia ? '#1a1a1a' : '#fff'
                });
            } else {
                Alerta('error', resultado?.resultado || 'Error al registrar jugador');
            }

            resetForm();
            setActualizar(!actualizar);
        } catch {
            Alerta('error', 'Error al registrar jugador');
        } finally {
            setEnviando(false);
        }
    };

    const handleDescargarPlantilla = async () => {
        try {
            const response = await axios({
                method: "get",
                url: `${Request.Dominio}/club_jugadores_plantilla_excel`,
                headers: {
                    "systemRoot": Request.Empresa
                },
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'plantilla_jugadores.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch {
            Alerta('error', 'Error al descargar plantilla');
        }
    };

    const handleDescargarEjemplo = async () => {
        try {
            const response = await axios({
                method: "get",
                url: `${Request.Dominio}/club_jugadores_ejemplo_excel`,
                headers: {
                    "systemRoot": Request.Empresa
                },
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'ejemplo_jugadores.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch {
            Alerta('error', 'Error al descargar ejemplo');
        }
    };

    const handleCargaMasiva = async () => {
        if (!archivoCarga) {
            Alerta('error', 'Seleccione un archivo Excel');
            return;
        }

        setCargandoMasiva(true);
        setResultadosCarga([]);

        try {
            const formdata = new FormData();
            formdata.append("excel_file", archivoCarga);
            formdata.append("vit_institucion_id", institucionId);
            formdata.append("registrado_por_jugador_id", jugadorId);

            const response = await axios({
                method: "post",
                url: `${Request.Dominio}/club_jugadores_carga_masiva`,
                headers: {
                    "systemRoot": Request.Empresa
                },
                data: formdata
            });

            const resultados = response.data?.data || [];
            setResultadosCarga(resultados);

            const exitosos = resultados.filter(r => r.estado === 'ok').length;
            const errores = resultados.filter(r => r.estado === 'error').length;

            if (errores === 0) {
                Alerta('success', `${exitosos} jugadores registrados correctamente`);
            } else {
                Alerta('warning', `${exitosos} registrados, ${errores} con error`);
            }

            setActualizar(!actualizar);
            setArchivoCarga(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch {
            Alerta('error', 'Error en la carga masiva');
        } finally {
            setCargandoMasiva(false);
        }
    };

    return (
        <div className='out-div-seccion' data-aos="zoom-in">
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <h2 className="h4 fw-semibold mb-0">Jugadores del Club</h2>
                <div className="d-flex gap-2">
                    <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => setMostrarCargaMasiva(!mostrarCargaMasiva)}
                    >
                        <i className="fa-solid fa-file-excel me-1"></i> Carga Masiva
                    </button>
                    <button
                        className="btn btn-primary btn-sm"
                        data-bs-toggle="modal"
                        data-bs-target="#modalRegistrarJugador"
                        onClick={resetForm}
                    >
                        <i className="fa-solid fa-user-plus me-1"></i> Registrar Jugador
                    </button>
                </div>
            </div>

            {/* Sección Carga Masiva */}
            {mostrarCargaMasiva && (
                <div className="card mb-3 p-3" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                    <h6 className="fw-semibold mb-3">
                        <i className="fa-solid fa-file-excel me-2" style={{ color: '#28a745' }}></i>
                        Carga Masiva de Jugadores
                    </h6>
                    <p className="text-secondary small mb-3">
                        Descargue la plantilla, complete los datos de los jugadores y suba el archivo.
                        Los jugadores creados recibirán credenciales para ingresar al sistema y completar su perfil.
                    </p>
                    <div className="d-flex align-items-center gap-2 flex-wrap mb-3">
                        <button className="btn btn-sm btn-outline-success" onClick={handleDescargarPlantilla}>
                            <i className="fa-solid fa-download me-1"></i> Descargar Plantilla
                        </button>
                        <button className="btn btn-sm btn-outline-info" onClick={handleDescargarEjemplo}>
                            <i className="fa-solid fa-file-excel me-1"></i> Descargar Ejemplo con Data
                        </button>
                    </div>
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                        <input
                            type="file"
                            className="form-control form-control-sm"
                            accept=".xlsx,.xls"
                            ref={fileInputRef}
                            onChange={(e) => setArchivoCarga(e.target.files[0])}
                            style={{ maxWidth: 300 }}
                        />
                        <button
                            className="btn btn-sm btn-primary"
                            onClick={handleCargaMasiva}
                            disabled={!archivoCarga || cargandoMasiva}
                        >
                            {cargandoMasiva ? (
                                <span className="spinner-border spinner-border-sm" role="status"></span>
                            ) : (
                                <><i className="fa-solid fa-upload me-1"></i> Subir y Registrar</>
                            )}
                        </button>
                    </div>

                    {/* Resultados de carga masiva */}
                    {resultadosCarga.length > 0 && (
                        <div className="mt-3">
                            <h6 className="fw-semibold">Resultados de la carga:</h6>
                            <div className="table-responsive" style={{ maxHeight: 400, overflowY: 'auto' }}>
                                <table className="table table-sm align-middle">
                                    <thead>
                                        <tr>
                                            <th>Fila</th>
                                            <th>Nombre</th>
                                            <th>Email</th>
                                            <th>Estado</th>
                                            <th>Detalle</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {resultadosCarga.map((r, idx) => (
                                            <tr key={idx}>
                                                <td>{r.fila || idx + 1}</td>
                                                <td>{r.nombres || '-'}</td>
                                                <td>{r.email || '-'}</td>
                                                <td>
                                                    {r.estado === 'ok' ? (
                                                        <span className="badge bg-success">OK</span>
                                                    ) : (
                                                        <span className="badge bg-danger">Error</span>
                                                    )}
                                                </td>
                                                <td><small>{r.mensaje || '-'}</small></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <p className="text-secondary small mt-2">
                                <i className="fa-solid fa-circle-info me-1"></i>
                                Cada jugador registrado recibirá un correo con sus credenciales de acceso.
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Tabla de jugadores */}
            {cargando ? (
                <div className="text-center py-5">
                    <div className="spinner-border" role="status"></div>
                </div>
            ) : jugadores.length === 0 ? (
                <div className="text-center py-5 text-secondary">
                    <i className="fa-solid fa-futbol" style={{ fontSize: '2rem' }}></i>
                    <p className="mt-2">No hay jugadores registrados</p>
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="table align-middle">
                        <thead>
                            <tr>
                                <th>Jugador</th>
                                <th>Email</th>
                                <th>Documento</th>
                                <th>Fecha Registro</th>
                                <th>Estado</th>
                                <th>Notas</th>
                            </tr>
                        </thead>
                        <tbody>
                            {jugadores.map((j, idx) => (
                                <React.Fragment key={j.vit_jugador_id || idx}>
                                    <tr>
                                        <td>
                                            <div className="d-flex align-items-center gap-2">
                                                <img
                                                    src={j.foto_perfil || DEFAULT_IMAGES.CARA_USUARIO}
                                                    alt=""
                                                    style={{ width: 35, height: 35, borderRadius: '50%', objectFit: 'cover' }}
                                                    onError={(e) => { if (e.target.src !== DEFAULT_IMAGES.CARA_USUARIO) e.target.src = DEFAULT_IMAGES.CARA_USUARIO; }}
                                                />
                                                <div className="fw-semibold">{j.jugador_nombres} {j.jugador_apellidos}</div>
                                            </div>
                                        </td>
                                        <td><small>{j.jugador_email || '-'}</small></td>
                                        <td>{j.documento_codigo || '-'}</td>
                                        <td>{formatFecha(j.fecha_inicio)}</td>
                                        <td>{getVerificacionBadge(j.flag_verificado, j.estado_verificacion)}</td>
                                        <td>
                                            <button
                                                className={`btn btn-sm ${jugadorExpandido === j.vit_jugador_id ? 'btn-primary' : 'btn-outline-secondary'}`}
                                                onClick={() => toggleComentarios(j.vit_jugador_id)}
                                                title="Ver notas del jugador"
                                            >
                                                <i className="fa-solid fa-comment-dots"></i>
                                            </button>
                                        </td>
                                    </tr>
                                    {/* Panel de comentarios expandible */}
                                    {jugadorExpandido === j.vit_jugador_id && (
                                        <tr>
                                            <td colSpan="6" style={{ background: 'var(--bg-card)', borderLeft: '3px solid #ef8700' }}>
                                                <div className="p-2">
                                                    <div className="d-flex align-items-center justify-content-between mb-2">
                                                        <strong className="small">
                                                            <i className="fa-solid fa-sticky-note me-1" style={{ color: '#ef8700' }}></i>
                                                            Notas sobre {j.jugador_nombres}
                                                        </strong>
                                                    </div>

                                                    {/* Input para nuevo comentario */}
                                                    <div className="d-flex gap-2 mb-2">
                                                        <input
                                                            type="text"
                                                            className="form-control form-control-sm"
                                                            placeholder="Escribir una nota..."
                                                            value={nuevoComentario}
                                                            onChange={(e) => setNuevoComentario(e.target.value)}
                                                            onKeyDown={(e) => { if (e.key === 'Enter') handleAgregarComentario(j.vit_jugador_id); }}
                                                            maxLength={1000}
                                                            disabled={enviandoComentario}
                                                        />
                                                        <button
                                                            className="btn btn-sm btn-primary"
                                                            onClick={() => handleAgregarComentario(j.vit_jugador_id)}
                                                            disabled={!nuevoComentario.trim() || enviandoComentario}
                                                        >
                                                            {enviandoComentario ? (
                                                                <span className="spinner-border spinner-border-sm" role="status"></span>
                                                            ) : (
                                                                <i className="fa-solid fa-paper-plane"></i>
                                                            )}
                                                        </button>
                                                    </div>

                                                    {/* Lista de comentarios */}
                                                    {cargandoComentarios ? (
                                                        <div className="text-center py-2">
                                                            <span className="spinner-border spinner-border-sm" role="status"></span>
                                                        </div>
                                                    ) : comentarios.length === 0 ? (
                                                        <p className="text-secondary small mb-0 text-center py-2">Sin notas todav&iacute;a</p>
                                                    ) : (
                                                        <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                                                            {comentarios.map((c) => (
                                                                <div key={c.vit_jugador_comentario_club_id} className="d-flex justify-content-between align-items-start mb-2 p-2 rounded" style={{ background: 'var(--bg-secondary, rgba(255,255,255,0.05))' }}>
                                                                    <div>
                                                                        <div className="small">{c.comentario}</div>
                                                                        <div className="text-secondary" style={{ fontSize: '0.7rem' }}>
                                                                            {c.autor_nombres} {c.autor_apellidos} &middot; {formatFechaComentario(c.fecha)}
                                                                        </div>
                                                                    </div>
                                                                    {String(c.autor_jugador_id) === String(jugadorId) && (
                                                                        <button
                                                                            className="btn btn-sm btn-outline-danger ms-2"
                                                                            onClick={() => handleEliminarComentario(c.vit_jugador_comentario_club_id, j.vit_jugador_id)}
                                                                            title="Eliminar nota"
                                                                            style={{ fontSize: '0.7rem', padding: '2px 6px' }}
                                                                        >
                                                                            <i className="fa-solid fa-trash"></i>
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal Registrar Jugador - renderizado en body para que el backdrop cubra toda la ventana */}
            {ReactDOM.createPortal(
                <div className="modal fade" id="modalRegistrarJugador" tabIndex="-1" aria-labelledby="modalRegistrarJugadorLabel" ref={modalRef}>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>
                        <div className="modal-header" style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <h5 className="modal-title" id="modalRegistrarJugadorLabel">Registrar Jugador</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                        </div>
                        <form onSubmit={handleRegistrarJugador}>
                            <div className="modal-body">
                                <p className="text-secondary small mb-3">
                                    Se creará una cuenta para el jugador y recibirá un correo con las instrucciones para establecer su contraseña.
                                </p>
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Nombres <span className="text-danger">*</span></label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={formData.nombres}
                                            onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Apellidos <span className="text-danger">*</span></label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={formData.apellidos}
                                            onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                                            required
                                        />
                                    </div>
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
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Fecha de Nacimiento <span className="text-danger">*</span></label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            value={formData.fecha_nacimiento}
                                            onChange={(e) => setFormData({ ...formData, fecha_nacimiento: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Celular <span className="text-danger">*</span></label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={formData.celular}
                                            onChange={(e) => setFormData({ ...formData, celular: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-4 mb-3">
                                        <label className="form-label">Tipo Documento <span className="text-danger">*</span></label>
                                        <select
                                            className="form-select"
                                            value={formData.tipo_documento}
                                            onChange={(e) => setFormData({ ...formData, tipo_documento: e.target.value })}
                                            style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
                                        >
                                            <option value="DNI">DNI</option>
                                            <option value="PASA">Pasaporte</option>
                                            <option value="CAR_EX">Carné de Extranjería</option>
                                        </select>
                                    </div>
                                    <div className="col-md-8 mb-3">
                                        <label className="form-label">Número de Documento <span className="text-danger">*</span></label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={formData.documento}
                                            onChange={(e) => setFormData({ ...formData, documento: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <hr className="my-2" style={{ borderColor: 'var(--border-color)' }} />
                                <p className="text-secondary small mb-3 fw-semibold">Carrera Deportiva en el Club</p>

                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Posición <span className="text-danger">*</span></label>
                                        <select
                                            className="form-select"
                                            value={formData.posicion}
                                            onChange={(e) => setFormData({ ...formData, posicion: e.target.value })}
                                            style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
                                            required
                                        >
                                            <option value="">Seleccione posición</option>
                                            {posiciones.map(p => (
                                                <option key={p.value} value={p.value}>{p.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Nivel <span className="text-danger">*</span></label>
                                        <select
                                            className="form-select"
                                            value={formData.nivel_institucion}
                                            onChange={(e) => setFormData({ ...formData, nivel_institucion: e.target.value })}
                                            style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
                                        >
                                            <option value="1">Aficionado</option>
                                            <option value="2">Profesional</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Fecha de Inicio <span className="text-danger">*</span></label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            value={formData.fecha_inicio}
                                            onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer" style={{ borderTop: '1px solid var(--border-color)' }}>
                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                                <button type="submit" className="btn btn-primary" disabled={enviando}>
                                    {enviando ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                                            Registrando...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fa-solid fa-user-plus me-1"></i> Registrar
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>,
            document.body
            )}
        </div>
    );
};

export default ClubJugadores;
