import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../Context/AuthContext';
import { fetchData } from '../../../Funciones/Funciones';
import user_logo from '../../../imagenes/user_logo.png';
import './clubAprobacionPendiente.css';

const ClubAprobacionPendiente = () => {
    const { currentUser, Request, clubData, fetchClubData, Alerta, RandomNumberImg } = useAuth();

    const estado = clubData?.estado_aprobacion;
    const observacion = clubData?.observacion_admin;

    // --- Estado para formulario de reenvío (solo rechazado) ---
    const [nombreClub, setNombreClub] = useState('');
    const [tipoInstitucion, setTipoInstitucion] = useState('');
    const [pais, setPais] = useState('');
    const [ruc, setRuc] = useState('');
    const [historia, setHistoria] = useState('');
    const [colores, setColores] = useState(['#000000', '#FFFFFF', '#FF0000']);
    const [tiposInstitucion, setTiposInstitucion] = useState([]);
    const [paises, setPaises] = useState([]);
    const [guardando, setGuardando] = useState(false);

    // Vigencia de poderes
    const [fileVigencia, setFileVigencia] = useState(null);
    const [formatoVigencia, setFormatoVigencia] = useState('');
    const [nombreVigencia, setNombreVigencia] = useState('');

    // Logo
    const [fileLogo, setFileLogo] = useState(null);
    const [formatoLogo, setFormatoLogo] = useState('');

    // Cargar catálogos solo si es rechazado
    useEffect(() => {
        if (estado === 2 && Request) {
            fetchData(Request, "tipo_institucion_list", [{ nombre: "dato", envio: 1 }])
                .then(data => setTiposInstitucion(data || []))
                .catch(() => {});
            fetchData(Request, "pais", [{ nombre: "dato", envio: 1 }])
                .then(data => setPaises(data || []))
                .catch(() => {});
        }
    }, [estado, Request]);

    // Pre-llenar campos desde clubData cuando es rechazado
    useEffect(() => {
        if (estado === 2 && clubData) {
            setNombreClub(clubData.nombre_institucion || clubData.nombre || '');
            setTipoInstitucion(clubData.vit_tipo_institucion_id || '');
            setPais(clubData.fb_pais_id || '');
            setRuc(clubData.ruc || '');
            setHistoria(clubData.historia || '');
            if (clubData.colores_institucionales) {
                setColores(clubData.colores_institucionales.split(',').filter(Boolean));
            }
        }
    }, [estado, clubData]);

    // Color handlers
    const handleColorChange = (index, value) => {
        const updated = [...colores];
        updated[index] = value;
        setColores(updated);
    };
    const addColor = () => { if (colores.length < 5) setColores([...colores, '#000000']); };
    const removeColor = (index) => { if (colores.length > 1) setColores(colores.filter((_, i) => i !== index)); };

    // Vigencia handler
    const idInst = clubData?.vit_institucion_id || 0;
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
            setFormatoVigencia(`${idInst}-vigencia.${ext};${base64}`);
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    };
    const clearVigencia = () => { setFileVigencia(null); setFormatoVigencia(''); setNombreVigencia(''); };

    // Logo handler
    const handleLogoFile = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            Alerta('error', 'Formato no permitido. Use imagen (PNG, JPG, WebP).');
            e.target.value = '';
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            const dataUrl = reader.result;
            setFileLogo(dataUrl);
            const base64 = dataUrl.split(',')[1];
            const ext = file.type.split('/')[1];
            setFormatoLogo(`${idInst}-logo.${ext};${base64}`);
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    // Reenviar solicitud
    const handleReenviar = async () => {
        if (!nombreClub.trim()) { Alerta('error', 'Ingrese el nombre del club'); return; }
        if (!tipoInstitucion) { Alerta('error', 'Seleccione el tipo de institución'); return; }
        if (!pais) { Alerta('error', 'Seleccione el país'); return; }

        setGuardando(true);
        try {
            await fetchData(Request, "club_perfil_upd", [
                { nombre: "vit_institucion_id", envio: clubData?.vit_institucion_id || 0 },
                { nombre: "nombre", envio: nombreClub },
                { nombre: "vit_tipo_institucion_id", envio: tipoInstitucion },
                { nombre: "fb_pais_id", envio: pais },
                { nombre: "logo", envio: formatoLogo },
                { nombre: "vit_jugador_id", envio: currentUser?.vit_jugador_id || 0 },
                { nombre: "nombres_responsable", envio: currentUser?.jugador_nombres || '' },
                { nombre: "apellidos_responsable", envio: currentUser?.jugador_apellidos || '' }
            ]);

            await fetchData(Request, "club_sede_digital_upd", [
                { nombre: "vit_institucion_id", envio: clubData?.vit_institucion_id || 0 },
                { nombre: "ruc", envio: ruc },
                { nombre: "vigencia_poderes", envio: formatoVigencia },
                { nombre: "colores_institucionales", envio: colores.join(',') },
                { nombre: "historia", envio: historia }
            ]);

            // Refrescar clubData para que el estado cambie a pendiente (0)
            if (currentUser?.vit_jugador_id) {
                fetchClubData(currentUser.vit_jugador_id);
            }
            Alerta('success', 'Solicitud reenviada. Será revisada por nuestro equipo.');
        } catch {
            Alerta('error', 'Ocurrió un error al reenviar la solicitud');
        } finally {
            setGuardando(false);
        }
    };

    // Logo del club para mostrar
    const logoUrl = fileLogo || (clubData?.logo && clubData.logo !== '' ? clubData.logo : null);

    return (
        <div className="club-aprobacion-page">
            <div className="club-aprobacion-card">

                {/* ========== PENDIENTE (0) ========== */}
                {(estado === 0 || estado === null || estado === undefined) && (
                    <>
                        {logoUrl && (
                            <img src={logoUrl} alt="Logo" className="club-aprobacion-logo" />
                        )}
                        <div className="ap-icon ap-icon-pending">
                            <i className="fa-solid fa-clock"></i>
                        </div>
                        <h3 className="fw-semibold mt-3">Solicitud en Revisión</h3>
                        <p className="text-secondary mt-2">
                            Su solicitud para registrar <strong>{clubData?.nombre_institucion || 'su club'}</strong> está siendo
                            evaluada por nuestro equipo de revisión.
                        </p>
                        <div className="ap-info mt-3">
                            <i className="fa-solid fa-info-circle me-2"></i>
                            Este proceso puede tomar entre 24 a 72 horas hábiles. Le notificaremos cuando haya una resolución.
                        </div>
                    </>
                )}

                {/* ========== RECHAZADO (2) ========== */}
                {estado === 2 && (
                    <>
                        <div className="ap-icon ap-icon-rejected">
                            <i className="fa-solid fa-circle-xmark"></i>
                        </div>
                        <h3 className="fw-semibold mt-3">Solicitud Rechazada</h3>
                        {observacion && (
                            <div className="club-aprobacion-observacion mt-2">
                                <strong><i className="fa-solid fa-comment-dots me-1"></i> Observación del revisor:</strong>
                                <p>{observacion}</p>
                            </div>
                        )}
                        <p className="text-secondary mt-2">
                            Puede corregir los datos y reenviar su solicitud de aprobación.
                        </p>

                        {/* Formulario editable */}
                        <form className="club-aprobacion-form mt-3" onSubmit={e => { e.preventDefault(); handleReenviar(); }}>

                            {/* Logo */}
                            <div className="club-aprobacion-form__logo-section">
                                <img
                                    src={logoUrl || user_logo}
                                    alt="Logo del club"
                                    className="club-aprobacion-form__logo-img"
                                />
                                <div>
                                    <input
                                        type="file"
                                        id="reenvio-logo"
                                        className="completar-perfil-club__file-input"
                                        accept="image/png,image/jpeg,image/jpg,image/webp"
                                        onChange={handleLogoFile}
                                    />
                                    <label htmlFor="reenvio-logo" className="completar-perfil-club__upload-btn">
                                        <i className="fa-solid fa-camera"></i> Cambiar logo
                                    </label>
                                </div>
                            </div>

                            <div className="club-aprobacion-form__field">
                                <label className="completar-perfil-club__label">Nombre del Club *</label>
                                <input
                                    type="text"
                                    className="completar-perfil-club__input"
                                    value={nombreClub}
                                    onChange={e => setNombreClub(e.target.value)}
                                />
                            </div>

                            <div className="completar-perfil-club__row">
                                <div className="completar-perfil-club__field completar-perfil-club__field--half">
                                    <label className="completar-perfil-club__label">Tipo de Institución *</label>
                                    <select
                                        className="completar-perfil-club__select"
                                        value={tipoInstitucion}
                                        onChange={e => setTipoInstitucion(e.target.value)}
                                    >
                                        <option value="">Seleccionar...</option>
                                        {tiposInstitucion.map(ti => (
                                            <option key={ti.vit_tipo_institucion_id} value={ti.vit_tipo_institucion_id}>
                                                {ti.vit_tipo_institucion_nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="completar-perfil-club__field completar-perfil-club__field--half">
                                    <label className="completar-perfil-club__label">País *</label>
                                    <select
                                        className="completar-perfil-club__select"
                                        value={pais}
                                        onChange={e => setPais(e.target.value)}
                                    >
                                        <option value="">Seleccionar...</option>
                                        {paises.map(p => (
                                            <option key={p.pais_id ?? p.fb_pais_id} value={p.pais_id ?? p.fb_pais_id}>
                                                {p.pais_nombre ?? p.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="club-aprobacion-form__field">
                                <label className="completar-perfil-club__label">RUC</label>
                                <input
                                    type="text"
                                    className="completar-perfil-club__input"
                                    value={ruc}
                                    onChange={e => setRuc(e.target.value)}
                                    maxLength={20}
                                />
                            </div>

                            <div className="club-aprobacion-form__field">
                                <label className="completar-perfil-club__label">Vigencia de Poderes</label>
                                <div className="completar-perfil-club__upload-row">
                                    <input
                                        type="file"
                                        id="reenvio-vigencia"
                                        className="completar-perfil-club__file-input"
                                        accept=".pdf,image/png,image/jpeg,image/jpg,image/webp"
                                        onChange={handleVigenciaFile}
                                    />
                                    <label htmlFor="reenvio-vigencia" className="completar-perfil-club__upload-btn">
                                        <i className="fa-solid fa-upload"></i>
                                        {fileVigencia ? 'Cambiar documento' : 'Subir PDF o imagen'}
                                    </label>
                                    {fileVigencia && (
                                        <span className="completar-perfil-club__upload-info">
                                            {fileVigencia.startsWith('data:image/') ? (
                                                <img src={fileVigencia} alt="Vigencia" className="completar-perfil-club__upload-preview" />
                                            ) : (
                                                <span className="completar-perfil-club__upload-pdf">
                                                    <i className="fa-solid fa-file-pdf"></i> {nombreVigencia || 'PDF'}
                                                </span>
                                            )}
                                            <button type="button" className="completar-perfil-club__upload-remove" onClick={clearVigencia}>
                                                <i className="fa-solid fa-times"></i>
                                            </button>
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="club-aprobacion-form__field">
                                <label className="completar-perfil-club__label">Colores Institucionales</label>
                                <div className="completar-perfil-club__colors-row">
                                    {colores.map((color, i) => (
                                        <div key={i} className="completar-perfil-club__color-item">
                                            <input
                                                type="color"
                                                value={color}
                                                onChange={e => handleColorChange(i, e.target.value)}
                                                className="completar-perfil-club__color-input"
                                            />
                                            {colores.length > 1 && (
                                                <button type="button" className="completar-perfil-club__color-remove" onClick={() => removeColor(i)}>
                                                    <i className="fa-solid fa-times"></i>
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    {colores.length < 5 && (
                                        <button type="button" className="completar-perfil-club__color-add" onClick={addColor}>
                                            <i className="fa-solid fa-plus"></i>
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="club-aprobacion-form__field">
                                <label className="completar-perfil-club__label">Historia del Club</label>
                                <textarea
                                    className="completar-perfil-club__textarea"
                                    rows={4}
                                    value={historia}
                                    onChange={e => setHistoria(e.target.value)}
                                />
                            </div>

                            <button
                                type="submit"
                                className="completar-perfil-club__submit mt-3"
                                disabled={guardando}
                            >
                                {guardando ? (
                                    <><i className="fa-solid fa-circle-notch fa-spin"></i> Reenviando...</>
                                ) : (
                                    <><i className="fa-solid fa-paper-plane"></i> Reenviar Solicitud</>
                                )}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default ClubAprobacionPendiente;
