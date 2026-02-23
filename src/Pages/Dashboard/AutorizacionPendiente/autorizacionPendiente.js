import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../Context/AuthContext';
import { fetchData } from '../../../Funciones/Funciones';
import './autorizacionPendiente.css';

const AutorizacionPendiente = () => {
    const { currentUser, Request } = useAuth();
    const [Autorizacion, setAutorizacion] = useState(null);

    useEffect(() => {
        function ObtenerAutorizacion() {
            fetchData(Request, "autorizacion_menor_get", [
                { nombre: "vit_jugador_id", envio: currentUser.vit_jugador_id }
            ]).then(res => {
                if (res && res.length > 0) {
                    setAutorizacion(res[0]);
                }
            }).catch(error => {
                console.log("Error obteniendo autorización:", error);
            });
        }
        if (currentUser && currentUser.vit_jugador_id) {
            ObtenerAutorizacion();
        }
    }, [Request, currentUser]);

    const estado = currentUser?.autorizacion_menor_estado || Autorizacion?.estado_revision;

    return (
        <div className="autorizacion-pendiente-page">
            <div className="autorizacion-pendiente-card">
                {/* Pendiente */}
                {(estado === 1 || estado === 0) && (
                    <>
                        <div className="ap-icon ap-icon-pending">
                            <i className="fa-solid fa-clock"></i>
                        </div>
                        <h3 className="fw-semibold mt-3">Autorización en Revisión</h3>
                        <p className="text-secondary mt-2">
                            Su documentación de autorización como menor de edad está siendo evaluada por nuestro equipo.
                            Le notificaremos cuando haya una resolución.
                        </p>
                        <div className="ap-info mt-3">
                            <i className="fa-solid fa-info-circle me-2"></i>
                            Este proceso puede tomar entre 24 a 48 horas hábiles.
                        </div>
                    </>
                )}

                {/* Aprobado */}
                {estado === 2 && (
                    <>
                        <div className="ap-icon ap-icon-approved">
                            <i className="fa-solid fa-circle-check"></i>
                        </div>
                        <h3 className="fw-semibold mt-3">Autorización Aprobada</h3>
                        <p className="text-secondary mt-2">
                            Su documentación ha sido verificada y aprobada correctamente.
                            Ya puede acceder a todas las funcionalidades de la plataforma.
                        </p>
                    </>
                )}

                {/* Rechazado */}
                {estado === 3 && (
                    <>
                        <div className="ap-icon ap-icon-rejected">
                            <i className="fa-solid fa-circle-xmark"></i>
                        </div>
                        <h3 className="fw-semibold mt-3">Autorización Rechazada</h3>
                        <p className="text-secondary mt-2">
                            Su documentación ha sido rechazada.
                            {Autorizacion?.revision_observacion && (
                                <><br /><strong>Motivo:</strong> {Autorizacion.revision_observacion}</>
                            )}
                        </p>
                        <p className="text-secondary">
                            Por favor, corrija los documentos y vuelva a subirlos desde su perfil.
                        </p>
                        <a href="#/editar/perfil" className="btn btn-primary mt-2">
                            <i className="fa-solid fa-pen me-1"></i> Ir a Mi Perfil
                        </a>
                    </>
                )}

                {/* Info del documento subido */}
                {Autorizacion && (
                    <div className="ap-details mt-4">
                        <small className="text-muted">
                            {Autorizacion.doc_escaneado_nombre && <span>Documento: {Autorizacion.doc_escaneado_nombre}</span>}
                            {Autorizacion.video_nombre && <span> | Video: {Autorizacion.video_nombre}</span>}
                        </small>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AutorizacionPendiente;
