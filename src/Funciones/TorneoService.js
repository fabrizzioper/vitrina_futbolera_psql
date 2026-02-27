import axios from 'axios';

const getHeaders = (Request) => ({
    "userLogin": Request.userLogin,
    "userPassword": Request.userPassword,
    "systemRoot": Request.Empresa
});

export const crearTorneo = (Request, data) => {
    const formdata = new FormData();
    Object.keys(data).forEach(key => {
        if (data[key] !== null && data[key] !== undefined) {
            formdata.append(key, data[key]);
        }
    });
    return axios({
        method: "post",
        url: `${Request.Dominio}/torneo_crear`,
        headers: getHeaders(Request),
        data: formdata
    });
};

export const actualizarTorneo = (Request, data) => {
    const formdata = new FormData();
    Object.keys(data).forEach(key => {
        if (data[key] !== null && data[key] !== undefined) {
            formdata.append(key, data[key]);
        }
    });
    return axios({
        method: "post",
        url: `${Request.Dominio}/torneo_actualizar`,
        headers: getHeaders(Request),
        data: formdata
    });
};

export const obtenerTorneo = (Request, torneoId) => {
    const formdata = new FormData();
    formdata.append("vit_torneo_id", torneoId);
    return axios({
        method: "post",
        url: `${Request.Dominio}/torneo_obtener`,
        headers: getHeaders(Request),
        data: formdata
    });
};

export const listarMisTorneos = (Request, userId) => {
    const formdata = new FormData();
    if (userId) formdata.append("sc_user_id", userId);
    return axios({
        method: "post",
        url: `${Request.Dominio}/torneo_listar`,
        headers: getHeaders(Request),
        data: formdata
    });
};

export const publicarTorneo = (Request, torneoId) => {
    const formdata = new FormData();
    formdata.append("vit_torneo_id", torneoId);
    return axios({
        method: "post",
        url: `${Request.Dominio}/torneo_publicar`,
        headers: getHeaders(Request),
        data: formdata
    });
};

export const listarMarketplace = (Request) => {
    return axios({
        method: "post",
        url: `${Request.Dominio}/torneo_marketplace`,
        headers: getHeaders(Request)
    });
};

export const listarTodosTorneos = (Request) => {
    return axios({
        method: "post",
        url: `${Request.Dominio}/torneo_listar_todos`,
        headers: getHeaders(Request)
    });
};

export const uploadReglamento = (Request, torneoId, archivo) => {
    const formdata = new FormData();
    formdata.append("vit_torneo_id", torneoId);
    formdata.append("reglamento_pdf", archivo);
    return axios({
        method: "post",
        url: `${Request.Dominio}/torneo_upload_reglamento`,
        headers: getHeaders(Request),
        data: formdata
    });
};

export const uploadDocLegalizacion = (Request, torneoId, docLegalizacion, docPermiso) => {
    const formdata = new FormData();
    formdata.append("vit_torneo_id", torneoId);
    if (docLegalizacion) formdata.append("documento_legalizacion", docLegalizacion);
    if (docPermiso) formdata.append("documento_permiso", docPermiso);
    return axios({
        method: "post",
        url: `${Request.Dominio}/torneo_upload_legalizacion`,
        headers: getHeaders(Request),
        data: formdata
    });
};

// ============================================================
// Inscripción y Fixture
// ============================================================

export const obtenerJugadoresDisponibles = (Request, institucionId, torneoId, categoria) => {
    const formdata = new FormData();
    formdata.append("vit_institucion_id", institucionId);
    formdata.append("vit_torneo_id", torneoId);
    formdata.append("categoria", categoria);
    return axios({
        method: "post",
        url: `${Request.Dominio}/inscripcion_jugadores_disponibles`,
        headers: getHeaders(Request),
        data: formdata
    });
};

export const crearInscripcion = (Request, data) => {
    const formdata = new FormData();
    formdata.append("vit_torneo_id", data.vit_torneo_id);
    formdata.append("vit_institucion_id", data.vit_institucion_id);
    formdata.append("categoria", data.categoria);
    formdata.append("jugador_ids", data.jugador_ids);
    formdata.append("nombre_contacto", data.nombre_contacto);
    formdata.append("telefono_contacto", data.telefono_contacto);
    return axios({
        method: "post",
        url: `${Request.Dominio}/inscripcion_crear`,
        headers: getHeaders(Request),
        data: formdata
    });
};

export const listarMisInscripciones = (Request, institucionId) => {
    const formdata = new FormData();
    formdata.append("vit_institucion_id", institucionId);
    return axios({
        method: "post",
        url: `${Request.Dominio}/inscripcion_mis_inscripciones`,
        headers: getHeaders(Request),
        data: formdata
    });
};

export const obtenerDetalleJugadores = (Request, torneoId, institucionId, categoria) => {
    const formdata = new FormData();
    formdata.append("vit_torneo_id", torneoId);
    formdata.append("vit_institucion_id", institucionId);
    formdata.append("categoria", categoria);
    return axios({
        method: "post",
        url: `${Request.Dominio}/inscripcion_detalle_jugadores`,
        headers: getHeaders(Request),
        data: formdata
    });
};

export const listarInscripcionesPorTorneo = (Request, torneoId, categoria, estadoFiltro) => {
    const formdata = new FormData();
    formdata.append("vit_torneo_id", torneoId);
    formdata.append("categoria", categoria);
    formdata.append("estado_filtro", estadoFiltro);
    return axios({
        method: "post",
        url: `${Request.Dominio}/inscripcion_listar_por_torneo`,
        headers: getHeaders(Request),
        data: formdata
    });
};

export const aprobarRechazarInscripcion = (Request, inscripcionId, estado, observacion) => {
    const formdata = new FormData();
    formdata.append("vit_torneo_institucion_id", inscripcionId);
    formdata.append("estado", estado);
    formdata.append("observacion", observacion || '');
    return axios({
        method: "post",
        url: `${Request.Dominio}/inscripcion_aprobar_rechazar`,
        headers: getHeaders(Request),
        data: formdata
    });
};

export const generarFixture = (Request, torneoId, categoria) => {
    const formdata = new FormData();
    formdata.append("vit_torneo_id", torneoId);
    formdata.append("categoria", categoria);
    return axios({
        method: "post",
        url: `${Request.Dominio}/fixture_generar`,
        headers: getHeaders(Request),
        data: formdata
    });
};

export const listarFixture = (Request, torneoId, categoria) => {
    const formdata = new FormData();
    formdata.append("vit_torneo_id", torneoId);
    formdata.append("categoria", categoria);
    return axios({
        method: "post",
        url: `${Request.Dominio}/fixture_listar`,
        headers: getHeaders(Request),
        data: formdata
    });
};

// ============================================================
// Planilla Digital - Operación de Campo
// ============================================================

export const programarPartido = (Request, partidoId, fecha, hora, sede) => {
    const formdata = new FormData();
    formdata.append("vit_torneo_partido_id", partidoId);
    if (fecha) formdata.append("fecha", fecha);
    if (hora) formdata.append("hora", hora);
    if (sede) formdata.append("sede", sede);
    return axios({
        method: "post",
        url: `${Request.Dominio}/partido_programar`,
        headers: getHeaders(Request),
        data: formdata
    });
};

export const asignarDelegado = (Request, partidoId, delegadoUserId) => {
    const formdata = new FormData();
    formdata.append("vit_torneo_partido_id", partidoId);
    formdata.append("delegado_user_id", delegadoUserId);
    return axios({
        method: "post",
        url: `${Request.Dominio}/partido_asignar_delegado`,
        headers: getHeaders(Request),
        data: formdata
    });
};

export const listarDelegados = (Request, torneoId) => {
    const formdata = new FormData();
    formdata.append("vit_torneo_id", torneoId);
    return axios({
        method: "post",
        url: `${Request.Dominio}/partido_listar_delegados`,
        headers: getHeaders(Request),
        data: formdata
    });
};

export const obtenerJugadoresBuenaFe = (Request, partidoId, institucionId) => {
    const formdata = new FormData();
    formdata.append("vit_torneo_partido_id", partidoId);
    formdata.append("vit_institucion_id", institucionId);
    return axios({
        method: "post",
        url: `${Request.Dominio}/partido_jugadores_buenafe`,
        headers: getHeaders(Request),
        data: formdata
    });
};

export const registrarAlineacion = (Request, partidoId, institucionId, titularesIds, suplentesIds) => {
    const formdata = new FormData();
    formdata.append("vit_torneo_partido_id", partidoId);
    formdata.append("vit_institucion_id", institucionId);
    formdata.append("titulares_ids", titularesIds);
    formdata.append("suplentes_ids", suplentesIds);
    return axios({
        method: "post",
        url: `${Request.Dominio}/partido_registrar_alineacion`,
        headers: getHeaders(Request),
        data: formdata
    });
};

export const registrarIncidencia = (Request, partidoId, tipo, minuto, jugadorId, jugadorSaleId, institucionId, tipoGol, observacion) => {
    const formdata = new FormData();
    formdata.append("vit_torneo_partido_id", partidoId);
    formdata.append("tipo_incidencia", tipo);
    formdata.append("minuto", minuto);
    formdata.append("vit_jugador_id", jugadorId);
    if (jugadorSaleId) formdata.append("vit_jugador_sale_id", jugadorSaleId);
    formdata.append("vit_institucion_id", institucionId);
    if (tipoGol) formdata.append("tipo_gol", tipoGol);
    if (observacion) formdata.append("observacion", observacion);
    return axios({
        method: "post",
        url: `${Request.Dominio}/partido_registrar_incidencia`,
        headers: getHeaders(Request),
        data: formdata
    });
};

export const eliminarIncidencia = (Request, incidenciaId) => {
    const formdata = new FormData();
    formdata.append("vit_torneo_partido_incidencia_id", incidenciaId);
    return axios({
        method: "post",
        url: `${Request.Dominio}/partido_eliminar_incidencia`,
        headers: getHeaders(Request),
        data: formdata
    });
};

export const listarIncidencias = (Request, partidoId) => {
    const formdata = new FormData();
    formdata.append("vit_torneo_partido_id", partidoId);
    return axios({
        method: "post",
        url: `${Request.Dominio}/partido_listar_incidencias`,
        headers: getHeaders(Request),
        data: formdata
    });
};

export const obtenerDetallePartido = (Request, partidoId) => {
    const formdata = new FormData();
    formdata.append("vit_torneo_partido_id", partidoId);
    return axios({
        method: "post",
        url: `${Request.Dominio}/partido_detalle`,
        headers: getHeaders(Request),
        data: formdata
    });
};

export const obtenerAlineacion = (Request, partidoId, institucionId) => {
    const formdata = new FormData();
    formdata.append("vit_torneo_partido_id", partidoId);
    formdata.append("vit_institucion_id", institucionId);
    return axios({
        method: "post",
        url: `${Request.Dominio}/partido_obtener_alineacion`,
        headers: getHeaders(Request),
        data: formdata
    });
};

export const cerrarActa = (Request, partidoId, observaciones) => {
    const formdata = new FormData();
    formdata.append("vit_torneo_partido_id", partidoId);
    if (observaciones) formdata.append("observaciones_delegado", observaciones);
    return axios({
        method: "post",
        url: `${Request.Dominio}/partido_cerrar_acta`,
        headers: getHeaders(Request),
        data: formdata
    });
};

export const obtenerTablaPosiciones = (Request, torneoId, categoria) => {
    const formdata = new FormData();
    formdata.append("vit_torneo_id", torneoId);
    formdata.append("categoria", categoria);
    return axios({
        method: "post",
        url: `${Request.Dominio}/torneo_tabla_posiciones`,
        headers: getHeaders(Request),
        data: formdata
    });
};

export const obtenerEstadisticasJugador = (Request, jugadorId) => {
    const formdata = new FormData();
    formdata.append("vit_jugador_id", jugadorId);
    return axios({
        method: "post",
        url: `${Request.Dominio}/jugador_estadisticas_torneos`,
        headers: getHeaders(Request),
        data: formdata
    });
};

export const obtenerEstadisticasClub = (Request, institucionId) => {
    const formdata = new FormData();
    formdata.append("vit_institucion_id", institucionId);
    return axios({
        method: "post",
        url: `${Request.Dominio}/institucion_estadisticas_torneos`,
        headers: getHeaders(Request),
        data: formdata
    });
};

// ============================================================
// Caso D: Gestión de Veedores / Planilleros
// ============================================================

export const crearInvitacionTorneo = (Request, data) => {
    const formdata = new FormData();
    formdata.append("vit_torneo_id", data.vit_torneo_id);
    formdata.append("invitado_por_jugador_id", data.invitado_por_jugador_id);
    formdata.append("invitado_nombres", data.invitado_nombres);
    formdata.append("invitado_apellidos", data.invitado_apellidos || '');
    formdata.append("invitado_email", data.invitado_email);
    formdata.append("invitado_telefono", data.invitado_telefono || '');
    return axios({
        method: "post",
        url: `${Request.Dominio}/torneo_invitacion_ins`,
        headers: getHeaders(Request),
        data: formdata
    });
};

export const listarInvitacionesTorneo = (Request, torneoId) => {
    const formdata = new FormData();
    formdata.append("vit_torneo_id", torneoId);
    return axios({
        method: "post",
        url: `${Request.Dominio}/torneo_invitacion_list`,
        headers: getHeaders(Request),
        data: formdata
    });
};

export const cancelarInvitacionTorneo = (Request, invitacionId) => {
    const formdata = new FormData();
    formdata.append("vit_invitacion_torneo_id", invitacionId);
    return axios({
        method: "post",
        url: `${Request.Dominio}/torneo_invitacion_cancelar`,
        headers: getHeaders(Request),
        data: formdata
    });
};

export const listarVeedoresTorneo = (Request, torneoId) => {
    const formdata = new FormData();
    formdata.append("vit_torneo_id", torneoId);
    return axios({
        method: "post",
        url: `${Request.Dominio}/torneo_veedores_list`,
        headers: getHeaders(Request),
        data: formdata
    });
};

export const eliminarVeedorTorneo = (Request, responsableId) => {
    const formdata = new FormData();
    formdata.append("vit_torneo_responsable_id", responsableId);
    return axios({
        method: "post",
        url: `${Request.Dominio}/torneo_veedor_eliminar`,
        headers: getHeaders(Request),
        data: formdata
    });
};

export const listarMisPartidosVeedor = (Request, jugadorId) => {
    const formdata = new FormData();
    formdata.append("vit_jugador_id", jugadorId);
    return axios({
        method: "post",
        url: `${Request.Dominio}/torneo_veedor_mis_partidos`,
        headers: getHeaders(Request),
        data: formdata
    });
};
