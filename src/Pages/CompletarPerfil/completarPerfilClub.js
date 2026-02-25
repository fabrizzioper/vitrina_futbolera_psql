import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import { fetchData } from '../../Funciones/Funciones';
import user_logo from '../../imagenes/user_logo.png';
import CompletarPerfilHeader from './CompletarPerfilHeader';
import ModalCrop from '../Dashboard/MiPerfil/Componentes/ModalCrop';
import '../Dashboard/MiPerfil/Jugador/miPerfil.css';
import './completarPerfil.css';

const CompletarPerfilClub = () => {
    const navigate = useNavigate();
    const { Alerta, Request, currentUser, clubData, fetchClubData, logOut, marcarPerfilCompletado, RandomNumberImg } = useAuth();

    // Estado de aprobación
    const estadoAprobacion = clubData?.estado_aprobacion;
    const esPendiente = estadoAprobacion === 0 || estadoAprobacion === '0';
    const esRechazado = estadoAprobacion === 2 || estadoAprobacion === '2';
    const perfilCompletado = currentUser?.flag_perfil_completado === 1 || currentUser?.flag_perfil_completado === true;

    // Campos editables: primera vez o rechazado
    const camposEditables = !perfilCompletado || esRechazado;

    // Datos basicos
    const [nombreClub, setNombreClub] = useState('');
    const [tipoInstitucion, setTipoInstitucion] = useState('');
    const [pais, setPais] = useState('');
    const [nombresResponsable, setNombresResponsable] = useState('');
    const [apellidosResponsable, setApellidosResponsable] = useState('');
    const [tiposInstitucion, setTiposInstitucion] = useState([]);
    const [paises, setPaises] = useState([]);
    const [guardando, setGuardando] = useState(false);
    const [cargando, setCargando] = useState(true);
    const [institucionId, setInstitucionId] = useState(null);

    // Logo
    const [logoBase64, setLogoBase64] = useState(null);
    const [fileLogo, setFileLogo] = useState(null);
    const [formatoLogo, setFormatoLogo] = useState('');

    // Sede Digital
    const [ruc, setRuc] = useState('');
    const [colores, setColores] = useState(['#000000', '#FFFFFF', '#FF0000']);
    const [historia, setHistoria] = useState('');

    // Color picker: abrir al añadir o al hacer clic en un cuadrado
    const colorPickerRef = useRef(null);
    const [openPickerForIndex, setOpenPickerForIndex] = useState(null);

    // Vigencia de poderes
    const [fileVigencia, setFileVigencia] = useState(null);
    const [formatoVigencia, setFormatoVigencia] = useState('');
    const [nombreVigencia, setNombreVigencia] = useState('');

    useEffect(() => {
        if (!Request) return;
        if (!perfilCompletado) {
            Alerta('info', 'Complete el perfil de su club para enviar la solicitud.');
        }
        fetchData(Request, "tipo_institucion_list", [{ nombre: "dato", envio: 1 }])
            .then(data => setTiposInstitucion(data || []))
            .catch(() => {});
        fetchData(Request, "pais", [{ nombre: "dato", envio: 1 }])
            .then(data => setPaises(data || []))
            .catch(() => {});
    }, [Request]);

    // Pre-llenar responsable
    useEffect(() => {
        if (currentUser && currentUser.vit_jugador_id) {
            setNombresResponsable(currentUser.jugador_nombres || currentUser.nombre_jugador || '');
            setApellidosResponsable(currentUser.jugador_apellidos || '');
        }
    }, [currentUser]);

    // Pre-llenar desde clubData
    useEffect(() => {
        if (clubData) {
            setNombreClub(clubData.nombre_institucion || clubData.nombre || '');
            setTipoInstitucion(clubData.vit_tipo_institucion_id || '');
            setPais(clubData.fb_pais_id || '');
            setInstitucionId(clubData.vit_institucion_id);
            if (clubData.ruc) setRuc(clubData.ruc);
            if (clubData.historia) setHistoria(clubData.historia);
            if (clubData.colores_institucionales) {
                setColores(clubData.colores_institucionales.split(',').filter(Boolean));
            }
            if (clubData.nombres_responsable) setNombresResponsable(clubData.nombres_responsable);
            if (clubData.apellidos_responsable) setApellidosResponsable(clubData.apellidos_responsable);
            setCargando(false);
        }
    }, [clubData]);

    // Si clubData no llega, buscar directamente
    useEffect(() => {
        if (!clubData && currentUser?.vit_jugador_id) {
            const timer = setTimeout(() => {
                fetchData(Request, "institucion_usuario_get", [
                    { nombre: "vit_jugador_id", envio: currentUser.vit_jugador_id }
                ]).then(data => {
                    if (data && data[0]) {
                        setInstitucionId(data[0].vit_institucion_id);
                        setNombreClub(data[0].nombre_institucion || data[0].nombre || '');
                        setTipoInstitucion(data[0].vit_tipo_institucion_id || '');
                        setPais(data[0].fb_pais_id || '');
                    }
                }).catch(() => {}).finally(() => setCargando(false));
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [clubData, currentUser, Request]);

    // Abrir el selector de color al añadir uno nuevo
    useEffect(() => {
        if (openPickerForIndex === null) return;
        const t = setTimeout(() => {
            colorPickerRef.current?.click();
            setOpenPickerForIndex(null);
        }, 50);
        return () => clearTimeout(t);
    }, [openPickerForIndex]);

    // Color handlers
    const handleColorChange = (index, value) => {
        const updated = [...colores];
        updated[index] = value;
        setColores(updated);
    };
    const addColor = () => {
        if (colores.length >= 5) return;
        const newIndex = colores.length;
        setColores([...colores, '#000000']);
        setOpenPickerForIndex(newIndex);
    };
    const removeColor = (index) => { if (colores.length > 1) setColores(colores.filter((_, i) => i !== index)); };

    // Vigencia handler
    const idVigencia = institucionId || clubData?.vit_institucion_id || 0;
    const handleVigenciaFile = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.type.startsWith('video/')) {
            Alerta('error', 'No se permiten vídeos. Suba PDF o imagen (PNG, JPG, WebP).');
            e.target.value = '';
            return;
        }
        const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            Alerta('error', 'Formato no permitido. Use PDF o imagen (PNG, JPG, WebP).');
            e.target.value = '';
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            const dataUrl = reader.result;
            setFileVigencia(dataUrl);
            setNombreVigencia(file.name);
            const base64 = dataUrl.split(',')[1];
            const ext = file.type === 'application/pdf' ? 'pdf' : file.type.split('/')[1];
            setFormatoVigencia(`${idVigencia}-vigencia.${ext};${base64}`);
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    };
    const clearVigencia = () => { setFileVigencia(null); setFormatoVigencia(''); setNombreVigencia(''); };

    const handleGuardar = async () => {
        if (!nombreClub.trim()) { Alerta('error', 'Ingrese el nombre del club'); return; }
        if (!tipoInstitucion) { Alerta('error', 'Seleccione el tipo de institución'); return; }
        if (!pais) { Alerta('error', 'Seleccione el país'); return; }
        const tieneLogo = (formatoLogo && String(formatoLogo).trim() !== '') || (clubData?.logo && String(clubData.logo).trim() !== '');
        if (!tieneLogo) { Alerta('error', 'El logo del club es obligatorio'); return; }
        if (!nombresResponsable.trim()) { Alerta('error', 'Ingrese los nombres del responsable'); return; }
        if (!apellidosResponsable.trim()) { Alerta('error', 'Ingrese los apellidos del responsable'); return; }

        setGuardando(true);
        try {
            await fetchData(Request, "club_perfil_upd", [
                { nombre: "vit_institucion_id", envio: institucionId || clubData?.vit_institucion_id || 0 },
                { nombre: "nombre", envio: nombreClub },
                { nombre: "vit_tipo_institucion_id", envio: tipoInstitucion },
                { nombre: "fb_pais_id", envio: pais },
                { nombre: "logo", envio: formatoLogo },
                { nombre: "vit_jugador_id", envio: currentUser?.vit_jugador_id || 0 },
                { nombre: "nombres_responsable", envio: nombresResponsable },
                { nombre: "apellidos_responsable", envio: apellidosResponsable }
            ]);
            await fetchData(Request, "club_sede_digital_upd", [
                { nombre: "vit_institucion_id", envio: institucionId || clubData?.vit_institucion_id || 0 },
                { nombre: "ruc", envio: ruc },
                { nombre: "vigencia_poderes", envio: formatoVigencia },
                { nombre: "colores_institucionales", envio: colores.join(',') },
                { nombre: "historia", envio: historia }
            ]);
            if (!perfilCompletado) marcarPerfilCompletado();
            if (currentUser?.vit_jugador_id) fetchClubData(currentUser.vit_jugador_id);
            Alerta('success', esRechazado
                ? 'Solicitud reenviada. Será revisada por nuestro equipo.'
                : 'Solicitud enviada. Será revisada por nuestro equipo.'
            );
        } catch {
            Alerta('error', 'Ocurrió un error al guardar');
        } finally {
            setGuardando(false);
        }
    };

    const handleCerrarSesion = () => { logOut(); navigate('/login'); };

    const headerAction = currentUser ? (
        <div className="dropdown completar-perfil-dropdown">
            <button type="button" className="div-avatar completar-perfil-avatar" data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-haspopup="true" aria-expanded="false" data-bs-offset="0,8">
                <div className="avatar avatar-circle avatar-sm avatar-online">
                    <img src={currentUser.foto_perfil ? currentUser.foto_perfil + "?random=" + RandomNumberImg : user_logo} alt="" className="rounded-circle" width="40" height="40" />
                </div>
            </button>
            <div className="dropdown-menu dropdown-menu-end bg-dark" data-popper-placement="bottom-end">
                <div className="dropdown-item-text">
                    <div className="d-flex align-items-center">
                        <div className="avatar">
                            <img src={currentUser.foto_perfil ? currentUser.foto_perfil + "?random=" + RandomNumberImg : user_logo} alt="" className="rounded-circle" width="40" height="40" />
                        </div>
                        <div className="flex-grow-1 ms-3">
                            <h4 className="mb-0 card-name text-truncate">{currentUser.nombre_jugador}</h4>
                            <p className="card-text text-truncate">{currentUser.usuario}</p>
                        </div>
                    </div>
                </div>
                <hr className="dropdown-divider" />
                <button type="button" className="dropdown-item" onClick={handleCerrarSesion}><i className="fa-solid icon-cerrar1"></i> Cerrar sesión</button>
            </div>
        </div>
    ) : null;

    const logoUrl = fileLogo || (clubData?.logo && clubData.logo !== '' ? clubData.logo : null);

    // Nombre del tipo de institución para mostrar en readonly
    const nombreTipoInstitucion = tiposInstitucion.find(
        ti => String(ti.vit_tipo_institucion_id) === String(tipoInstitucion)
    )?.vit_tipo_institucion_nombre || clubData?.tipo_institucion || '';

    const nombrePais = paises.find(
        p => String(p.pais_id ?? p.fb_pais_id) === String(pais)
    )?.pais_nombre || paises.find(
        p => String(p.pais_id ?? p.fb_pais_id) === String(pais)
    )?.nombre || clubData?.nombre_pais || '';

    return (
        <div className='div-main div-completar-perfil'>
            <header className="completar-perfil-club__header">
                <CompletarPerfilHeader
                    titulo={esPendiente ? "Solicitud Enviada" : esRechazado ? "Solicitud Rechazada" : "Completa tu Perfil"}
                    headerAction={headerAction}
                />
            </header>
            <div className="completar-perfil-club__wrap">
                {!esRechazado && !esPendiente && (
                    <p className="completar-perfil-club__subtitle">Complete los datos de su institución para enviar la solicitud de aprobación</p>
                )}

                <div className="completar-perfil-club__card">
                    {cargando ? (
                        <div className="completar-perfil-club__loading">
                            <div className="completar-perfil-club__spinner" role="status" aria-label="Cargando">
                                <i className="fa-solid fa-circle-notch fa-spin"></i>
                            </div>
                            <p className="completar-perfil-club__loading-text">Cargando datos del club...</p>
                        </div>
                    ) : (
                        <form className="completar-perfil-club__form" onSubmit={(e) => { e.preventDefault(); if (camposEditables) handleGuardar(); }}>
                            <div className="completar-perfil-club__form-cols">
                                {/* Columna 1: Datos del Club */}
                                <div className="completar-perfil-club__form-col">
                                    <div className="completar-perfil-club__section-title">
                                        <i className="fa-solid fa-building"></i> Datos del Club
                                    </div>

                                    {/* Logo */}
                                    <div className="completar-perfil-club__logo-section">
                                        <div className="completar-perfil-club__logo-container">
                                            <img
                                                src={fileLogo || logoUrl || user_logo}
                                                alt="Logo del club"
                                                className="completar-perfil-club__logo-img"
                                            />
                                            {camposEditables && (
                                                <button type="button" className="completar-perfil-club__logo-btn" data-bs-toggle="modal" data-bs-target="#FLogo" title="Subir logo">
                                                    <i className="fa-solid fa-camera"></i>
                                                </button>
                                            )}
                                        </div>
                                        <span className="completar-perfil-club__logo-label">Logo del Club *</span>
                                    </div>

                                    <div className="completar-perfil-club__field">
                                        <label className="completar-perfil-club__label">Nombre del Club / Academia *</label>
                                        <input type="text" className="completar-perfil-club__input" value={nombreClub}
                                            onChange={e => setNombreClub(e.target.value)} disabled={!camposEditables}
                                            placeholder="Ej: Club Deportivo Los Halcones" autoComplete="organization" />
                                    </div>

                                    <div className="completar-perfil-club__row">
                                        <div className="completar-perfil-club__field completar-perfil-club__field--half">
                                            <label className="completar-perfil-club__label">Tipo de Institución *</label>
                                            {camposEditables ? (
                                                <select className="completar-perfil-club__select" value={tipoInstitucion}
                                                    onChange={e => setTipoInstitucion(e.target.value)}>
                                                    <option value="">Seleccionar...</option>
                                                    {tiposInstitucion.map(ti => (
                                                        <option key={ti.vit_tipo_institucion_id} value={ti.vit_tipo_institucion_id}>
                                                            {ti.vit_tipo_institucion_nombre}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <input type="text" className="completar-perfil-club__input" value={nombreTipoInstitucion} disabled />
                                            )}
                                        </div>
                                        <div className="completar-perfil-club__field completar-perfil-club__field--half">
                                            <label className="completar-perfil-club__label">País *</label>
                                            {camposEditables ? (
                                                <select className="completar-perfil-club__select" value={pais}
                                                    onChange={e => setPais(e.target.value)}>
                                                    <option value="">Seleccionar...</option>
                                                    {paises.map(p => (
                                                        <option key={p.pais_id ?? p.fb_pais_id} value={p.pais_id ?? p.fb_pais_id}>
                                                            {p.pais_nombre ?? p.nombre}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <input type="text" className="completar-perfil-club__input" value={nombrePais} disabled />
                                            )}
                                        </div>
                                    </div>

                                    <div className="completar-perfil-club__row">
                                        <div className="completar-perfil-club__field completar-perfil-club__field--half">
                                            <label className="completar-perfil-club__label">Nombres del Responsable *</label>
                                            <input type="text" className="completar-perfil-club__input" value={nombresResponsable}
                                                onChange={e => setNombresResponsable(e.target.value)} disabled={!camposEditables}
                                                placeholder="Nombres del responsable" />
                                        </div>
                                        <div className="completar-perfil-club__field completar-perfil-club__field--half">
                                            <label className="completar-perfil-club__label">Apellidos del Responsable *</label>
                                            <input type="text" className="completar-perfil-club__input" value={apellidosResponsable}
                                                onChange={e => setApellidosResponsable(e.target.value)} disabled={!camposEditables}
                                                placeholder="Apellidos del responsable" />
                                        </div>
                                    </div>
                                </div>

                                {/* Columna 2: Sede Digital + Identidad */}
                                <div className="completar-perfil-club__form-col">
                                    <div className="completar-perfil-club__divider"></div>

                                    <div className="completar-perfil-club__section-title">
                                        <i className="fa-solid fa-file-certificate"></i> Sede Digital - Acreditación
                                    </div>

                                    <div className="completar-perfil-club__row completar-perfil-club__row--stacked">
                                        <div className="completar-perfil-club__field completar-perfil-club__field--full">
                                            <label className="completar-perfil-club__label">RUC</label>
                                            <input type="text" className="completar-perfil-club__input" value={ruc}
                                                onChange={e => setRuc(e.target.value)} disabled={!camposEditables}
                                                placeholder="Ej: 20123456789" maxLength={20} />
                                        </div>
                                        <div className="completar-perfil-club__field completar-perfil-club__field--full">
                                            <label className="completar-perfil-club__label">Vigencia de Poderes</label>
                                            {camposEditables ? (
                                                <div className="completar-perfil-club__upload-row">
                                                    <input type="file" id="vigencia-poderes"
                                                        className="completar-perfil-club__file-input"
                                                        accept=".pdf,image/png,image/jpeg,image/jpg,image/webp"
                                                        onChange={handleVigenciaFile} />
                                                    <div className="completar-perfil-club__upload-actions">
                                                        <label htmlFor="vigencia-poderes" className="completar-perfil-club__upload-btn">
                                                            <i className="fa-solid fa-upload"></i>
                                                            {fileVigencia ? 'Cambiar documento' : 'Subir PDF o imagen'}
                                                        </label>
                                                        {fileVigencia && (
                                                            <span className="completar-perfil-club__upload-info">
                                                                {fileVigencia.startsWith('data:image/') ? (
                                                                    <img src={fileVigencia} alt="Vigencia" className="completar-perfil-club__upload-preview" />
                                                                ) : (
                                                                    <span className="completar-perfil-club__upload-pdf" title={nombreVigencia || 'PDF'}>
                                                                        <i className="fa-solid fa-file-pdf"></i>
                                                                        <span className="completar-perfil-club__upload-filename">{nombreVigencia || 'PDF'}</span>
                                                                    </span>
                                                                )}
                                                                <button type="button" className="completar-perfil-club__upload-remove" onClick={clearVigencia} title="Quitar documento">
                                                                    <i className="fa-solid fa-times"></i>
                                                                </button>
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="completar-perfil-club__upload-hint">PDF o imagen (PNG, JPG). No vídeos.</span>
                                                </div>
                                            ) : (
                                                <input type="text" className="completar-perfil-club__input"
                                                    value={clubData?.vigencia_poderes ? 'Documento enviado' : 'No enviado'} disabled />
                                            )}
                                        </div>
                                    </div>

                                    <div className="completar-perfil-club__divider"></div>
                                    <div className="completar-perfil-club__section-title">
                                        <i className="fa-solid fa-palette"></i> Identidad Visual
                                    </div>

                                    <div className="completar-perfil-club__field">
                                        <label className="completar-perfil-club__label">Colores Institucionales</label>
                                        <div className="completar-perfil-club__colors-row">
                                            {colores.map((color, i) => (
                                                <div key={i} className="completar-perfil-club__color-item">
                                                    <label className="completar-perfil-club__color-swatch-wrap" title="Clic para cambiar color">
                                                        <input
                                                            type="color"
                                                            value={color}
                                                            onChange={e => handleColorChange(i, e.target.value)}
                                                            className="completar-perfil-club__color-input"
                                                            disabled={!camposEditables}
                                                            ref={openPickerForIndex === i ? colorPickerRef : undefined}
                                                            aria-label={`Color ${i + 1}`}
                                                        />
                                                        <span className="completar-perfil-club__color-swatch" style={{ backgroundColor: color }} />
                                                    </label>
                                                    {camposEditables && colores.length > 1 && (
                                                        <button type="button" className="completar-perfil-club__color-remove" onClick={() => removeColor(i)} title="Quitar color">
                                                            <i className="fa-solid fa-times"></i>
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                            {camposEditables && colores.length < 5 && (
                                                <button type="button" className="completar-perfil-club__color-add" onClick={addColor} title="Añadir color">
                                                    <i className="fa-solid fa-plus"></i>
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="completar-perfil-club__field">
                                        <label className="completar-perfil-club__label">Historia del Club</label>
                                        <textarea className="completar-perfil-club__textarea" rows={4} value={historia}
                                            onChange={e => setHistoria(e.target.value)} disabled={!camposEditables}
                                            placeholder="Describe la historia, logros y trayectoria del club..." />
                                    </div>
                                </div>
                            </div>

                            {/* ====== SECCION DE ESTADO ====== */}
                            <div className="completar-perfil-club__divider"></div>

                            {/* Estado: Pendiente */}
                            {perfilCompletado && esPendiente && (
                                <div className="completar-perfil-club__estado-section completar-perfil-club__estado--pendiente">
                                    <div className="completar-perfil-club__estado-icon">
                                        <i className="fa-solid fa-clock"></i>
                                    </div>
                                    <div className="completar-perfil-club__estado-content">
                                        <h4>Solicitud en Revisión</h4>
                                        <p>Su solicitud está siendo evaluada por nuestro equipo. Este proceso puede tomar entre 24 a 72 horas hábiles.</p>
                                    </div>
                                </div>
                            )}

                            {/* Estado: Rechazado */}
                            {perfilCompletado && esRechazado && (
                                <>
                                    <div className="completar-perfil-club__estado-section completar-perfil-club__estado--rechazado">
                                        <div className="completar-perfil-club__estado-icon">
                                            <i className="fa-solid fa-circle-xmark"></i>
                                        </div>
                                        <div className="completar-perfil-club__estado-content">
                                            <h4>Solicitud Rechazada</h4>
                                            {clubData?.observacion_admin && (
                                                <p><strong>Observación:</strong> {clubData.observacion_admin}</p>
                                            )}
                                            <p>Corrija los datos y reenvíe su solicitud.</p>
                                        </div>
                                    </div>
                                    <div className="completar-perfil-club__actions">
                                        <button type="submit" className="completar-perfil-club__submit" disabled={guardando}>
                                            {guardando ? (
                                                <><i className="fa-solid fa-circle-notch fa-spin" aria-hidden></i> Reenviando...</>
                                            ) : (
                                                <><i className="fa-solid fa-paper-plane" aria-hidden></i> Reenviar Solicitud</>
                                            )}
                                        </button>
                                    </div>
                                </>
                            )}

                            {/* Primera vez: botón enviar */}
                            {!perfilCompletado && (
                                <div className="completar-perfil-club__actions">
                                    <button type="submit" className="completar-perfil-club__submit" disabled={guardando}>
                                        {guardando ? (
                                            <><i className="fa-solid fa-circle-notch fa-spin" aria-hidden></i> Guardando...</>
                                        ) : (
                                            <><i className="fa-solid fa-paper-plane" aria-hidden></i> Enviar Solicitud</>
                                        )}
                                    </button>
                                </div>
                            )}
                        </form>
                    )}
                </div>
            </div>

            <ModalCrop
                NombreModal="FLogo"
                Base64={logoBase64}
                setBase64={setLogoBase64}
                setFile={setFileLogo}
                setFormato={setFormatoLogo}
                AspectRatio={1 / 1}
                id_jugador={institucionId || clubData?.vit_institucion_id || 0}
            />
        </div>
    );
};

export default CompletarPerfilClub;
