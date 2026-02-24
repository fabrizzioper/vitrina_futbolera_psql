import React, { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../../../../Context/AuthContext';
import { fetchData } from '../../../../../Funciones/Funciones';
import { descargarCartaPDF, obtenerCartaPDFBlob } from './generarCartaPDF';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import './AutorizacionMenor.css';

const AutorizacionMenor = ({ id, NombreApoderado, DocApoderado, TipoDocApoderado, ParentescoApoderado, NombreJugador, ApellidoJugador, TipoDocJugador, DocJugador, FechaNacimiento, AutorizacionEstado, setAutorizacionEstado }) => {
    const { Alerta, Request, setloading } = useAuth();

    const [Autorizacion, setAutorizacion] = useState(null);
    const [TipoEnvio, setTipoEnvio] = useState("");
    const [EmailDestino, setEmailDestino] = useState("");
    const [TelefonoDestino, setTelefonoDestino] = useState("");
    const [DocFile, setDocFile] = useState(null);
    const [VideoFile, setVideoFile] = useState(null);
    const [Cooldown, setCooldown] = useState(0);
    const cooldownRef = useRef(null);

    useEffect(() => {
        if (id) {
            fetchData(Request, "autorizacion_menor_get", [
                { nombre: "vit_jugador_id", envio: id }
            ]).then(res => {
                if (res && res.length > 0) {
                    setAutorizacion(res[0]);
                }
            }).catch(error => {
                console.log("Error obteniendo autorización:", error);
            });
        }
    }, [Request, id]);

    useEffect(() => {
        return () => {
            if (cooldownRef.current) clearInterval(cooldownRef.current);
        };
    }, []);

    const iniciarCooldown = useCallback(() => {
        setCooldown(60);
        if (cooldownRef.current) clearInterval(cooldownRef.current);
        cooldownRef.current = setInterval(() => {
            setCooldown(prev => {
                if (prev <= 1) {
                    clearInterval(cooldownRef.current);
                    cooldownRef.current = null;
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, []);

    function getDatosPDF() {
        return {
            nombreApoderado: NombreApoderado,
            tipoDocApoderado: TipoDocApoderado || 'DNI',
            docApoderado: DocApoderado,
            parentescoApoderado: ParentescoApoderado,
            nombreJugador: NombreJugador,
            apellidoJugador: ApellidoJugador,
            tipoDocJugador: TipoDocJugador || 'DNI',
            docJugador: DocJugador,
            fechaNacimiento: FechaNacimiento,
        };
    }

    function DescargarFicha() {
        descargarCartaPDF(getDatosPDF());
    }

    async function EnviarPorEmail() {
        if (!EmailDestino || EmailDestino.trim().length === 0) {
            Alerta("error", "Ingrese un correo electrónico válido");
            return;
        }
        setloading(true);
        try {
            const pdfBlob = obtenerCartaPDFBlob(getDatosPDF());

            const formdata = new FormData();
            formdata.append("vit_jugador_id", id);
            formdata.append("email_destino", EmailDestino);
            formdata.append("carta_pdf", pdfBlob, "Carta_Autorizacion_Menor.pdf");

            const res = await axios({
                method: "post",
                url: `${Request.Dominio}/autorizacion_menor_enviar_email`,
                headers: { "userLogin": Request.userLogin, "userPassword": Request.userPassword, "systemRoot": Request.Empresa },
                data: formdata
            });
            const data = res.data?.data;
            if (data && data[0]?.success !== false) {
                Alerta("success", "Carta enviada por correo electrónico");
                iniciarCooldown();
            } else {
                Alerta("error", data?.[0]?.message || "Error al enviar el correo");
            }
        } catch (error) {
            console.log(error);
            Alerta("error", "Error al enviar el correo");
        } finally {
            setloading(false);
        }
    }

    async function EnviarPorWhatsApp() {
        if (!TelefonoDestino || TelefonoDestino.trim().length === 0) {
            Alerta("error", "Ingrese un número de teléfono válido");
            return;
        }
        setloading(true);
        try {
            const numeroLimpio = TelefonoDestino.replace('+', '');
            const pdfBlob = obtenerCartaPDFBlob(getDatosPDF());

            const formdata = new FormData();
            formdata.append("vit_jugador_id", id);
            formdata.append("codigo_pais_numero", numeroLimpio);
            formdata.append("carta_pdf", pdfBlob, "Carta_Autorizacion_Menor.pdf");

            const res = await axios({
                method: "post",
                url: `${Request.Dominio}/autorizacion_menor_enviar_whatsapp`,
                headers: { "userLogin": Request.userLogin, "userPassword": Request.userPassword, "systemRoot": Request.Empresa },
                data: formdata
            });
            const data = res.data?.data;
            if (data && data[0]?.success !== false) {
                Alerta("success", "Carta enviada por WhatsApp");
                iniciarCooldown();
            } else {
                Alerta("error", data?.[0]?.message || "Error al enviar por WhatsApp");
            }
        } catch (error) {
            console.log(error);
            Alerta("error", "Error al enviar por WhatsApp");
        } finally {
            setloading(false);
        }
    }

    function SubirDocumentos() {
        if (!DocFile) {
            Alerta("error", "Por favor seleccione el documento escaneado");
            return;
        }
        setloading(true);

        const formdata = new FormData();
        formdata.append("vit_jugador_id", id);
        formdata.append("documento_escaneado", DocFile);
        if (VideoFile) {
            formdata.append("video_autorizacion", VideoFile);
        }

        axios({
            method: "post",
            url: `${Request.Dominio}/autorizacion_menor_subir_docs`,
            headers: { "userLogin": Request.userLogin, "userPassword": Request.userPassword, "systemRoot": Request.Empresa },
            data: formdata
        }).then(res => {
            const data = res.data?.data;
            if (data && data[0]?.success !== false) {
                Alerta("success", "Documentos enviados. Su solicitud está en revisión.");
                setAutorizacionEstado(1);
                fetchData(Request, "autorizacion_menor_get", [
                    { nombre: "vit_jugador_id", envio: id }
                ]).then(res => {
                    if (res && res.length > 0) setAutorizacion(res[0]);
                });
            } else {
                Alerta("error", data?.[0]?.message || "Error al subir documentos");
            }
        }).catch(error => {
            console.log(error);
            Alerta("error", "Error al subir los documentos");
        }).finally(() => {
            setloading(false);
        });
    }

    if (!NombreApoderado || NombreApoderado.trim().length === 0) {
        return null;
    }

    const pendiente = AutorizacionEstado === 1 || (Autorizacion && Autorizacion.estado_revision === 0 && Autorizacion.doc_escaneado_nombre);
    const aprobado = AutorizacionEstado === 2 || (Autorizacion && Autorizacion.estado_revision === 1);
    const rechazado = AutorizacionEstado === 3 || (Autorizacion && Autorizacion.estado_revision === 2);
    const bloqueado = pendiente || aprobado;
    const puedeEditar = !bloqueado || rechazado;

    const formatCooldown = (s) => {
        const min = Math.floor(s / 60);
        const sec = s % 60;
        return `${min}:${sec.toString().padStart(2, '0')}`;
    };

    return (
        <div className='autorizacion-menor-container mt-4'>
            <div className="col-12">
                <h5 className="fw-semibold">Autorización del Menor</h5>
                <hr />
            </div>

            {pendiente && (
                <div className="autorizacion-estado-banner pendiente mt-2 mb-3">
                    <i className="fa-solid fa-clock"></i>
                    <div className="estado-texto">
                        <strong>Solicitud en revisión</strong><br />
                        <span>Su documentación está siendo evaluada. Le notificaremos cuando haya una resolución.</span>
                    </div>
                </div>
            )}

            {aprobado && (
                <div className="autorizacion-estado-banner aprobado mt-2 mb-3">
                    <i className="fa-solid fa-circle-check"></i>
                    <div className="estado-texto">
                        <strong>Autorización aprobada</strong><br />
                        <span>Su documentación ha sido verificada correctamente.</span>
                    </div>
                </div>
            )}

            {rechazado && (
                <div className="autorizacion-estado-banner rechazado mt-2 mb-3">
                    <i className="fa-solid fa-circle-xmark"></i>
                    <div className="estado-texto">
                        <strong>Autorización rechazada</strong>
                        {Autorizacion?.revision_observacion && <><br /><span>Motivo: {Autorizacion.revision_observacion}</span></>}
                        <br /><small>Puede volver a subir los documentos corregidos.</small>
                    </div>
                </div>
            )}

            {bloqueado && Autorizacion && (
                <div className="autorizacion-info-enviado mb-3">
                    <i className="fa-solid fa-file-lines me-2"></i>
                    Documento: {Autorizacion.doc_escaneado_nombre || "Enviado"}
                    {Autorizacion.video_nombre && <span> | Video: {Autorizacion.video_nombre}</span>}
                </div>
            )}

            {puedeEditar && (
                <div className="row">
                    {/* Paso 1: Descargar ficha */}
                    <div className="col-12 mt-2">
                        <label className="form-label"><span className="autorizacion-step-badge">1</span> Descargar ficha de autorización</label>
                        <p className="text-secondary small mb-2">Descargue la ficha, imprímala, complete los datos y fírmela.</p>
                        <button className="btn btn-primary btn-sm" onClick={DescargarFicha}>
                            <i className="fa-solid fa-download me-1"></i> Descargar Ficha PDF
                        </button>
                    </div>

                    {/* Paso 2: Enviar ficha */}
                    <div className="col-12 mt-4">
                        <label className="form-label"><span className="autorizacion-step-badge">2</span> Enviar ficha al apoderado <span className="text-secondary fw-normal">(opcional)</span></label>
                        <p className="text-secondary small mb-2">Envíe la ficha directamente al apoderado por correo o WhatsApp.</p>
                    </div>
                    <div className="col-md-4 mt-2 centrar-input">
                        <select
                            className="form-select"
                            value={TipoEnvio}
                            onChange={(e) => setTipoEnvio(e.target.value)}
                            disabled={Cooldown > 0}
                        >
                            <option value="">Seleccione método</option>
                            <option value="email">Correo electrónico</option>
                            <option value="whatsapp">WhatsApp</option>
                        </select>
                    </div>
                    {TipoEnvio === "email" && (
                        <>
                            <div className="col-md-5 mt-2 centrar-input">
                                <input
                                    type="email"
                                    className="form-control"
                                    placeholder="correo@ejemplo.com"
                                    value={EmailDestino}
                                    onChange={(e) => setEmailDestino(e.target.value)}
                                    disabled={Cooldown > 0}
                                />
                            </div>
                            <div className="col-md-3 mt-2 centrar-input">
                                <button
                                    className="btn btn-primary btn-sm w-100"
                                    onClick={EnviarPorEmail}
                                    disabled={Cooldown > 0}
                                >
                                    {Cooldown > 0 ? (
                                        <><i className="fa-solid fa-clock me-1"></i> {formatCooldown(Cooldown)}</>
                                    ) : (
                                        <><i className="fa-solid fa-envelope me-1"></i> Enviar</>
                                    )}
                                </button>
                            </div>
                        </>
                    )}
                    {TipoEnvio === "whatsapp" && (
                        <>
                            <div className="col-md-5 mt-2 centrar-input">
                                <PhoneInput
                                    international
                                    defaultCountry="PE"
                                    value={TelefonoDestino}
                                    onChange={setTelefonoDestino}
                                    className="form-control phone-input-container"
                                    disabled={Cooldown > 0}
                                />
                            </div>
                            <div className="col-md-3 mt-2 centrar-input">
                                <button
                                    className="btn btn-whatsapp btn-sm w-100"
                                    onClick={EnviarPorWhatsApp}
                                    disabled={Cooldown > 0}
                                >
                                    {Cooldown > 0 ? (
                                        <><i className="fa-solid fa-clock me-1"></i> {formatCooldown(Cooldown)}</>
                                    ) : (
                                        <><i className="fa-brands fa-whatsapp me-1"></i> Enviar</>
                                    )}
                                </button>
                            </div>
                        </>
                    )}
                    {Cooldown > 0 && (
                        <div className="col-12 mt-1">
                            <small className="text-secondary">Podrá reenviar en {formatCooldown(Cooldown)}</small>
                        </div>
                    )}

                    {/* Paso 3: Subir documentos */}
                    <div className="col-12 mt-4">
                        <label className="form-label"><span className="autorizacion-step-badge">3</span> Subir documentos firmados</label>
                        <p className="text-secondary small mb-2">Suba el documento escaneado con la firma del apoderado y un video de autorización (opcional).</p>
                    </div>
                    <div className="col-md-6 mt-2">
                        <label className="form-label">Documento escaneado *</label>
                        <label className={`autorizacion-file-upload ${DocFile ? 'has-file' : ''}`}>
                            <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => { if (e.target.files?.[0]) setDocFile(e.target.files[0]); }}
                            />
                            <div className="file-upload-content">
                                {DocFile ? (
                                    <>
                                        <i className="fa-solid fa-file-circle-check"></i>
                                        <span className="file-name">{DocFile.name}</span>
                                        <small>Click para cambiar</small>
                                    </>
                                ) : (
                                    <>
                                        <i className="fa-solid fa-cloud-arrow-up"></i>
                                        <span>Seleccionar archivo</span>
                                        <small>PDF, JPG o PNG</small>
                                    </>
                                )}
                            </div>
                        </label>
                    </div>
                    <div className="col-md-6 mt-2">
                        <label className="form-label">Video de autorización (opcional)</label>
                        <label className={`autorizacion-file-upload ${VideoFile ? 'has-file' : ''}`}>
                            <input
                                type="file"
                                accept="video/*"
                                onChange={(e) => { if (e.target.files?.[0]) setVideoFile(e.target.files[0]); }}
                            />
                            <div className="file-upload-content">
                                {VideoFile ? (
                                    <>
                                        <i className="fa-solid fa-file-circle-check"></i>
                                        <span className="file-name">{VideoFile.name}</span>
                                        <small>Click para cambiar</small>
                                    </>
                                ) : (
                                    <>
                                        <i className="fa-solid fa-video"></i>
                                        <span>Seleccionar video</span>
                                        <small>MP4, MOV, etc.</small>
                                    </>
                                )}
                            </div>
                        </label>
                    </div>
                    <div className="col-12 mt-3">
                        <button className="btn btn-primary" onClick={SubirDocumentos}>
                            <i className="fa-solid fa-paper-plane me-1"></i> Enviar Documentos
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AutorizacionMenor;
