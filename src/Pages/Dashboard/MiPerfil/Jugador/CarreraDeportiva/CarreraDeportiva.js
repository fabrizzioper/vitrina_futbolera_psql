import axios from 'axios';
import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../../../../Context/AuthContext';
import { DarFormatoFecha, AvanzarModulo, VolverTab, fetchData } from '../../../../../Funciones/Funciones';
import { DEFAULT_IMAGES } from '../../../../../Funciones/DefaultImages';
import AgregarInstitucion from './AgregarInstitucion';
import EditarInstitucion from './EditarInstitucion';
import Swal from 'sweetalert2';

const MESES_CORTO = ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'sep.', 'oct.', 'nov.', 'dic.'];

function formatFechaMes(fechaStr, flagActual) {
    if (flagActual === 1 || !fechaStr) return 'actualidad';
    const d = new Date(fechaStr);
    return `${MESES_CORTO[d.getMonth()]} ${d.getFullYear()}`;
}

function calcularDuracion(fechaInicioStr, fechaFinStr, flagActual) {
    const inicio = new Date(fechaInicioStr);
    const fin = flagActual === 1 || !fechaFinStr ? new Date() : new Date(fechaFinStr);
    let meses = (fin.getFullYear() - inicio.getFullYear()) * 12 + (fin.getMonth() - inicio.getMonth());
    if (meses < 0) meses = 0;
    const anios = Math.floor(meses / 12);
    const mesesRestantes = meses % 12;
    const partes = [];
    if (anios > 0) partes.push(`${anios} año${anios > 1 ? 's' : ''}`);
    if (mesesRestantes > 0) partes.push(`${mesesRestantes} mes${mesesRestantes > 1 ? 'es' : ''}`);
    return partes.length > 0 ? partes.join(' ') : '1 mes';
}

function calcularDuracionTotal(entradas) {
    let totalMeses = 0;
    entradas.forEach(ji => {
        const inicio = new Date(ji.fecha_inicio);
        const fin = ji.flag_actual === 1 || !ji.fecha_fin ? new Date() : new Date(ji.fecha_fin);
        let m = (fin.getFullYear() - inicio.getFullYear()) * 12 + (fin.getMonth() - inicio.getMonth());
        if (m < 0) m = 0;
        totalMeses += m;
    });
    const anios = Math.floor(totalMeses / 12);
    const mesesRestantes = totalMeses % 12;
    const partes = [];
    if (anios > 0) partes.push(`${anios} año${anios > 1 ? 's' : ''}`);
    if (mesesRestantes > 0) partes.push(`${mesesRestantes} mes${mesesRestantes > 1 ? 'es' : ''}`);
    return partes.length > 0 ? partes.join(' ') : '1 mes';
}

function fechasSeSolapan(inicio1, fin1, flagActual1, inicio2, fin2, flagActual2) {
    const d1i = new Date(inicio1);
    const d1f = flagActual1 ? new Date('2099-12-31') : fin1 ? new Date(fin1) : new Date('2099-12-31');
    const d2i = new Date(inicio2);
    const d2f = flagActual2 ? new Date('2099-12-31') : fin2 ? new Date(fin2) : new Date('2099-12-31');
    return d1i <= d2f && d2i <= d1f;
}

const CarreraDeportiva = ({ id, setFormulario }) => {
    const { Alerta, Request } = useAuth();
    const [Paises, setPaises] = useState([]);
    const [Pais, setPais] = useState("");
    const [Nombre, setNombre] = useState("");
    const [NivelInstitucion, setNivelInstitucion] = useState("");
    const [FechaInicio, setFechaInicio] = useState("");
    const [FechaFin, setFechaFin] = useState("");
    const [Posición, setPosición] = useState("");
    const [Actualizar, setActualizar] = useState(false);
    const [isEnabledCheck, setisEnabledCheck] = useState(false);
    const [Categoria, setCategoria] = useState("");
    const [Comentarios, setComentarios] = useState("");


    const [JugadorInstitucion_id, setJugadorInstitucion_id] = useState(0);
    const [Institucion_id, setInstitucion_id] = useState(0);
    const [InstitucionesJugador, setInstitucionesJugador] = useState([]);



    // AGREGAR NUEVA INSTITUCION O EDITAR VIEW
    const [ViewAgregar, setViewAgregar] = useState(0);

    // Agrupar instituciones por club (estilo LinkedIn)
    const institucionesAgrupadas = useMemo(() => {
        if (!InstitucionesJugador || InstitucionesJugador.length === 0) return [];
        const grupos = {};
        InstitucionesJugador.forEach(ji => {
            const key = ji.vit_institucion_id > 0
                ? `id_${ji.vit_institucion_id}`
                : `name_${(ji.nombre_institucion || '').toLowerCase().trim()}`;
            if (!grupos[key]) {
                grupos[key] = {
                    nombre: ji.nombre_institucion,
                    logo: ji.logo,
                    nombre_pais: ji.nombre_pais,
                    codigo_pais: ji.codigo_pais,
                    vit_institucion_id: ji.vit_institucion_id,
                    es_club_creado_por_jugador: ji.es_club_creado_por_jugador,
                    entradas: []
                };
            }
            grupos[key].entradas.push(ji);
        });
        return Object.values(grupos);
    }, [InstitucionesJugador]);


    useEffect(() => {
        // Obtener el Array con los Paises
        function GetPaises() {

            const formdata = new FormData();
            formdata.append("dato", 1);


            axios({
                method: "post",
                url: `${Request.Dominio}/pais`,
                headers: {
                    "userLogin": Request.userLogin,
                    "userPassword": Request.userPassword,
                    "systemRoot": Request.Empresa
                },
                data: formdata

            }).then(res => {
                let arreglo = res.data.data
                setPaises(arreglo)

            }).catch(error => {
            });
        }


        // Obtener el Array con Las Instituciones a la que pertenecio el jugador
        function GetInstitucionesJugador(id) {

            const formdata = new FormData();
            formdata.append("vit_jugador_id", id);


            axios({
                method: "post",
                url: `${Request.Dominio}/jugador_institucion_lista`,
                headers: {
                    "userLogin": Request.userLogin,
                    "userPassword": Request.userPassword,
                    "systemRoot": Request.Empresa
                },
                data: formdata

            }).then(res => {
                let arreglo = res.data.data
                setInstitucionesJugador(arreglo);
                console.log(arreglo);

            }).catch(error => {
            });
        }





        GetPaises()
        GetInstitucionesJugador(id)
    }, [Request, id, Actualizar]);







    // FUNCION PARA AGREGAR UNA INSTITUCION
    function AddInstitucion(id, Institucion_id, Pais, Nombre, FechaInicio, FechaFin, NivelInstitucion, isEnabledCheck, Posición, Categoria, Comentarios) {

        if (!Pais || !Nombre || !FechaInicio) {
            Alerta("error", "LLenar todos los campos");
            return;
        }

        if (!isEnabledCheck && FechaFin && FechaFin < FechaInicio) {
            Alerta("error", "La fecha de finalización no puede ser menor a la fecha de inicio");
            return;
        }

        // Validar superposición de fechas con el mismo club
        const entradasMismoClub = InstitucionesJugador.filter(ji => {
            if (Institucion_id > 0) return ji.vit_institucion_id === Institucion_id;
            return (ji.nombre_institucion || '').toLowerCase().trim() === (Nombre || '').toLowerCase().trim();
        });
        const haySolape = entradasMismoClub.some(ji =>
            fechasSeSolapan(FechaInicio, FechaFin, isEnabledCheck, ji.fecha_inicio, ji.fecha_fin, ji.flag_actual === 1)
        );
        if (haySolape) {
            Alerta("error", "Ya tienes un registro en este club con fechas que se superponen");
            return;
        }

        const formdata2 = new FormData();
        formdata2.append('vit_jugador_id', id);
        formdata2.append('vit_institucion_id', Institucion_id);
        formdata2.append('nombre_institucion', Nombre);
        formdata2.append('fecha_inicio', FechaInicio);
        formdata2.append('fecha_fin', FechaFin);
        formdata2.append('fb_pais_id', Pais);
        formdata2.append('nivel_institucion', NivelInstitucion);
        formdata2.append('flag_actual', isEnabledCheck ? 1 : 0);
        formdata2.append('posicion_juego_id', Posición);
        formdata2.append('categoria', Categoria);
        formdata2.append('comentarios', Comentarios);

        axios({
            method: "post",
            url: `${Request.Dominio}/jugador_institucion_ins`,
            headers: {
                "userLogin": Request.userLogin,
                "userPassword": Request.userPassword,
                "systemRoot": Request.Empresa
            },
            data: formdata2

        }).then(res => {
            if (res.data.success !== false) {
                Alerta("success", "Se guardó Correctamente")
                setViewAgregar(0)
                setActualizar(!Actualizar)
            } else {
                Alerta("error", "Ocurrio un error")
            }
        }).catch(error => {
            console.log("error", error);
        });
    }

    // FUNCION PARA EDITAR UNA INSTITUCION
    function UpdInstitucion(jugadorInstitucion_id, Nombre, FechaInicio, FechaFin, Pais, NivelInstitucion, isEnabledCheck, Posición, Categoria, Comentarios) {

        if (!isEnabledCheck && FechaFin && FechaFin < FechaInicio) {
            Alerta("error", "La fecha de finalización no puede ser menor a la fecha de inicio");
            return;
        }

        const formdata2 = new FormData();
        formdata2.append('vit_jugador_id', id);
        formdata2.append('vit_jugador_institucion_id', jugadorInstitucion_id);
        formdata2.append('nombre_institucion', Nombre);
        formdata2.append('fecha_inicio', FechaInicio);
        formdata2.append('fecha_fin', FechaFin);
        formdata2.append('fb_pais_id', Pais);
        formdata2.append('nivel_institucion', NivelInstitucion);
        formdata2.append('flag_actual', isEnabledCheck ? 1 : 0);
        formdata2.append('posicion_juego_id', Posición);
        formdata2.append('categoria', Categoria);
        formdata2.append('comentarios', Comentarios);

        axios({
            method: "post",
            url: `${Request.Dominio}/jugador_institucion_upd`,
            headers: {
                "userLogin": Request.userLogin,
                "userPassword": Request.userPassword,
                "systemRoot": Request.Empresa
            },
            data: formdata2

        }).then(res => {
            if (res.data.success !== false) {
                Alerta("success", "Se guardó Correctamente")
                setViewAgregar(0)
                setActualizar(!Actualizar)
            } else {
                Alerta("error", "Ocurrio un error")
            }
        }).catch(error => {
            console.log("error", error);
        });
    }

    // FUNCION PARA ELIMINAR UNA INSTITUCION
    function SupInstitucion(Institucion_id) {

        // DECLARAR ALERTA CON CONFIRMACION y usarla   
        Swal.fire({
            title: "¿Estas seguro?",
            text: "¡No podrás revertir esto!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#017cb9',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Confirmar',
            background: "#0e3769",
            color: "#fff"
        }).then((result) => {
            if (result.isConfirmed) {

                const formdata2 = new FormData();
                formdata2.append('vit_jugador_id', id);
                formdata2.append('vit_jugador_institucion_id', Institucion_id);

                axios({
                    method: "post",
                    url: `${Request.Dominio}/jugador_institucion_sup`,
                    headers: {
                        "userLogin": Request.userLogin,
                        "userPassword": Request.userPassword,
                        "systemRoot": Request.Empresa
                    },
                    data: formdata2

                }).then(res => {
                    if (res.data.success !== false) {
                        Alerta("success", "Se eliminó Correctamente")
                        setViewAgregar(0)
                        setActualizar(!Actualizar)


                    } else {
                        Alerta("error", "Ocurrio un error")
                    }


                }).catch(error => {
                    console.log("error", error);
                });

            }
        })



    }


    //FUNCION PARA ABRIR MODULO eDITAR Y SETEAR LOS DATOS EN LOS INPUTS
    function ModuloEditar(JugadorInstitucion_id, id_Institucion, pais, nombre, fecha_inicio, fecha_fin, NivelInstitucion, flag, posicion, categoria, comentarios) {
        setJugadorInstitucion_id(JugadorInstitucion_id)
        setViewAgregar(2)
        setInstitucion_id(id_Institucion)
        setPais(pais)
        setNombre(nombre)
        setFechaInicio(DarFormatoFecha(fecha_inicio))
        setNivelInstitucion(NivelInstitucion)
        setPosición(posicion)
        setCategoria(categoria || "")
        setComentarios(comentarios || "")
        if (flag === 1) {
            setisEnabledCheck(true)
            setFechaFin("")
        } else {
            setisEnabledCheck(false)
            setFechaFin(DarFormatoFecha(fecha_fin))
        }
    }

    // FUNCION PARA SOLICITAR VERIFICACION INSTITUCIONAL
    function SolicitarVerificacion(jugadorInstitucionId, institucionId) {
        fetchData(Request, "verificacion_institucion_solicitar", [
            { nombre: "vit_jugador_institucion_id", envio: jugadorInstitucionId },
            { nombre: "vit_jugador_id", envio: id },
            { nombre: "vit_institucion_id", envio: institucionId }
        ]).then((data) => {
            if (data && data[0]?.resultado === 'Ya existe una solicitud pendiente') {
                Alerta("warning", data[0].resultado);
            } else {
                Alerta("success", "Solicitud enviada correctamente");
            }
            setActualizar(!Actualizar);
        }).catch(() => {
            Alerta("error", "Error al enviar solicitud");
        });
    }

    // FUNCION PARA LIMPIAR LOS CAMPOS
    function LimpiarCampos() {
        setJugadorInstitucion_id(0)
        setInstitucion_id(0)
        setPais("")
        setNombre("")
        setFechaInicio("")
        setFechaFin("")
        setNivelInstitucion("")
        setisEnabledCheck(false)
        setPosición("")
        setCategoria("")
        setComentarios("")
    }



    return (
        <>
            <div className='card-body' data-aos="zoom-in">
                <h2 className="h4 fw-semibold text-center mb-0">Carrera Deportiva</h2>
                <p className="text-secondary text-center mb-3">Algunos detalles sobre tu trayectoria</p>
                <div className='row gap-2'>
                    {ViewAgregar === 1 ?
                        <AgregarInstitucion
                            Paises={Paises}
                            Institucion_id={Institucion_id}
                            setInstitucion_id={setInstitucion_id}
                            Pais={Pais}
                            setPais={setPais}
                            Nombre={Nombre}
                            setNombre={setNombre}
                            FechaInicio={FechaInicio}
                            setFechaInicio={setFechaInicio}
                            FechaFin={FechaFin}
                            setFechaFin={setFechaFin}
                            setViewAgregar={setViewAgregar}
                            NivelInstitucion={NivelInstitucion}
                            setNivelInstitucion={setNivelInstitucion}
                            isEnabledCheck={isEnabledCheck}
                            setisEnabledCheck={setisEnabledCheck}
                            Posición={Posición}
                            setPosición={setPosición}
                            Categoria={Categoria}
                            setCategoria={setCategoria}
                            Comentarios={Comentarios}
                            setComentarios={setComentarios}
                        />
                        :
                        ViewAgregar === 2 ?
                            <EditarInstitucion
                                Paises={Paises}
                                Institucion_id={Institucion_id}
                                setInstitucion_id={setInstitucion_id}
                                Pais={Pais}
                                setPais={setPais}
                                Nombre={Nombre}
                                setNombre={setNombre}
                                FechaInicio={FechaInicio}
                                setFechaInicio={setFechaInicio}
                                FechaFin={FechaFin}
                                setFechaFin={setFechaFin}
                                setViewAgregar={setViewAgregar}
                                NivelInstitucion={NivelInstitucion}
                                setNivelInstitucion={setNivelInstitucion}
                                isEnabledCheck={isEnabledCheck}
                                setisEnabledCheck={setisEnabledCheck}
                                Posición={Posición}
                                setPosición={setPosición}
                                Categoria={Categoria}
                                setCategoria={setCategoria}
                                Comentarios={Comentarios}
                                setComentarios={setComentarios}
                            />
                            :
                            <>
                                <div className='Out-div-btn-agregar-institucion'>
                                    <button className='btn-agregar-institucion' onClick={() => { setViewAgregar(1); LimpiarCampos(); }}>
                                        <div className='d-flex'><div className='icon-plus'>+</div></div>
                                        <div>Agregar Institucion</div>
                                    </button>
                                </div>
                                {institucionesAgrupadas.length !== 0 &&
                                    <div className='Container_Card_Institucion_Jugador'>
                                        {institucionesAgrupadas.map((grupo, idx) => {
                                            const tieneMultiples = grupo.entradas.length > 1;
                                            return (
                                                <div className='Card_Institucion_Grupo' key={idx}>
                                                    {/* Cabecera del club */}
                                                    <div className='Grupo_Header'>
                                                        <div className='logo_institucion'>
                                                            <img src={grupo.logo ? grupo.logo : DEFAULT_IMAGES.ESCUDO_CLUB} alt={grupo.nombre}></img>
                                                        </div>
                                                        <div className='Grupo_Header_Info'>
                                                            <div className='Grupo_Header_Info_Top'>
                                                                <h5 className='Nombre_Institucion_Jugador_y_logro'>{grupo.nombre}</h5>
                                                                {!tieneMultiples && grupo.vit_institucion_id > 0 && !grupo.es_club_creado_por_jugador && (
                                                                    <span className="Grupo_Badge_Verificacion">
                                                                        {grupo.entradas[0].estado_verificacion === 2 || grupo.entradas[0].flag_verificado === 1 ? (
                                                                            <span className="badge bg-success" title="Verificado por el club">
                                                                                <i className="fa-solid fa-circle-check"></i> Verificado
                                                                            </span>
                                                                        ) : grupo.entradas[0].estado_verificacion === 1 ? (
                                                                            <span className="badge bg-warning text-dark" title="Esperando respuesta del club">
                                                                                <i className="fa-solid fa-clock"></i> Pendiente
                                                                            </span>
                                                                        ) : grupo.entradas[0].estado_verificacion === 3 ? (
                                                                            <span className="badge bg-danger" title="Solicitud rechazada">
                                                                                <i className="fa-solid fa-xmark"></i> Rechazado
                                                                            </span>
                                                                        ) : (
                                                                            <span className="badge bg-secondary" title="No verificado">
                                                                                <i className="fa-solid fa-shield-halved"></i> No verificado
                                                                            </span>
                                                                        )}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {tieneMultiples && (
                                                                <p className='Grupo_Duracion_Total'>{calcularDuracionTotal(grupo.entradas)}</p>
                                                            )}
                                                            {!tieneMultiples && (
                                                                <>
                                                                    {grupo.entradas[0].categoria && (
                                                                        <p className='Pais_Institucion_Jugador'>{grupo.entradas[0].categoria}</p>
                                                                    )}
                                                                    <p className='Fecha_Institucion_Jugador'>
                                                                        {formatFechaMes(grupo.entradas[0].fecha_inicio)} - {formatFechaMes(grupo.entradas[0].fecha_fin, grupo.entradas[0].flag_actual)} · {calcularDuracion(grupo.entradas[0].fecha_inicio, grupo.entradas[0].fecha_fin, grupo.entradas[0].flag_actual)}
                                                                    </p>
                                                                    <p className='Pais_Institucion_Jugador'>
                                                                        {grupo.codigo_pais && <img src={`https://flagcdn.com/w40/${grupo.codigo_pais.toLowerCase()}.png`} alt={grupo.nombre_pais} className='bandera_pais_carrera' />}
                                                                        {grupo.nombre_pais}
                                                                    </p>
                                                                    {grupo.entradas[0].comentarios && <p className='SubEntrada_Comentarios'>{grupo.entradas[0].comentarios}</p>}
                                                                </>
                                                            )}
                                                        </div>
                                                        {/* Acciones: Solicitar verificación + Editar + Eliminar */}
                                                        {!tieneMultiples && (
                                                            <div className='Out_Actions_Institucion_Jugador'>
                                                                <div className='Actions_Institucion_Jugador'>
                                                                    {grupo.vit_institucion_id > 0 && !grupo.es_club_creado_por_jugador && (grupo.entradas[0].estado_verificacion === 0 || grupo.entradas[0].estado_verificacion === 3) && (
                                                                        <button type="button" className="btn_Enviar_Solicitud_Verificacion" onClick={() => SolicitarVerificacion(grupo.entradas[0].vit_jugador_institucion_id, grupo.vit_institucion_id)} title="Se solicitará a la institución la veracidad de mi información registrada.">
                                                                            <i className="fa-solid fa-paper-plane"></i>
                                                                            <span>Solicitar verificación</span>
                                                                        </button>
                                                                    )}
                                                                    <button className='btn_Institucion_Jugador' onClick={() => ModuloEditar(grupo.entradas[0].vit_jugador_institucion_id, grupo.entradas[0].vit_institucion_id, grupo.entradas[0].id_pais, grupo.entradas[0].nombre_institucion, grupo.entradas[0].fecha_inicio, grupo.entradas[0].fecha_fin, grupo.entradas[0].nivel_institucion, grupo.entradas[0].flag_actual, grupo.entradas[0].posicion_juego_id, grupo.entradas[0].categoria, grupo.entradas[0].comentarios)} title="Editar"><i className="fa-solid fa-pen"></i></button>
                                                                    <button className='btn_Institucion_Jugador' onClick={() => SupInstitucion(grupo.entradas[0].vit_jugador_institucion_id)} title="Eliminar"><i className="fa-solid fa-trash"></i></button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {/* Sub-entradas si hay múltiples */}
                                                    {tieneMultiples && (
                                                        <div className='Grupo_SubEntradas'>
                                                            {grupo.entradas.map(ji => (
                                                                <div className='Grupo_SubEntrada' key={ji.vit_jugador_institucion_id}>
                                                                    <div className='SubEntrada_Linea'>
                                                                        <div className='SubEntrada_Dot'></div>
                                                                    </div>
                                                                    <div className='SubEntrada_Info'>
                                                                        <h6 className='SubEntrada_Categoria'>{ji.categoria || ji.nombre_nivel || 'Sin categoría'}</h6>
                                                                        <p className='Fecha_Institucion_Jugador'>
                                                                            {formatFechaMes(ji.fecha_inicio)} - {formatFechaMes(ji.fecha_fin, ji.flag_actual)} · {calcularDuracion(ji.fecha_inicio, ji.fecha_fin, ji.flag_actual)}
                                                                        </p>
                                                                        <p className='Pais_Institucion_Jugador'>
                                                                            {ji.codigo_pais && <img src={`https://flagcdn.com/w40/${ji.codigo_pais.toLowerCase()}.png`} alt={ji.nombre_pais} className='bandera_pais_carrera' />}
                                                                            {ji.nombre_pais}
                                                                        </p>
                                                                        {ji.comentarios && <p className='SubEntrada_Comentarios'>{ji.comentarios}</p>}
                                                                    </div>
                                                                    <div className='SubEntrada_Actions'>
                                                                        {grupo.vit_institucion_id > 0 && !grupo.es_club_creado_por_jugador && (<>
                                                                            {ji.estado_verificacion === 2 || ji.flag_verificado === 1 ? (
                                                                                <span className="badge bg-success" style={{ fontSize: '0.65rem', padding: '3px 6px' }} title="Verificado por el club">
                                                                                    <i className="fa-solid fa-circle-check"></i>
                                                                                </span>
                                                                            ) : ji.estado_verificacion === 1 ? (
                                                                                <span className="badge bg-warning text-dark" style={{ fontSize: '0.65rem', padding: '3px 6px' }} title="Pendiente">
                                                                                    <i className="fa-solid fa-clock"></i>
                                                                                </span>
                                                                            ) : ji.estado_verificacion === 3 ? (
                                                                                <span className="badge bg-danger" style={{ fontSize: '0.65rem', padding: '3px 6px' }} title="Rechazado">
                                                                                    <i className="fa-solid fa-xmark"></i>
                                                                                </span>
                                                                            ) : (
                                                                                <span className="badge bg-secondary" style={{ fontSize: '0.65rem', padding: '3px 6px' }} title="No verificado">
                                                                                    <i className="fa-solid fa-shield-halved"></i>
                                                                                </span>
                                                                            )}
                                                                            {(ji.estado_verificacion === 0 || ji.estado_verificacion === 3) && (
                                                                                <button type="button" className="btn_Enviar_Solicitud_Verificacion btn_verificacion_sm" onClick={() => SolicitarVerificacion(ji.vit_jugador_institucion_id, grupo.vit_institucion_id)} title="Se solicitará a la institución la veracidad de mi información registrada.">
                                                                                    <i className="fa-solid fa-paper-plane"></i>
                                                                                </button>
                                                                            )}
                                                                        </>)}
                                                                        <button className='btn_Institucion_Jugador btn_sm' onClick={() => ModuloEditar(ji.vit_jugador_institucion_id, ji.vit_institucion_id, ji.id_pais, ji.nombre_institucion, ji.fecha_inicio, ji.fecha_fin, ji.nivel_institucion, ji.flag_actual, ji.posicion_juego_id, ji.categoria, ji.comentarios)} title="Editar"><i className="fa-solid fa-pen"></i></button>
                                                                        <button className='btn_Institucion_Jugador btn_sm' onClick={() => SupInstitucion(ji.vit_jugador_institucion_id)} title="Eliminar"><i className="fa-solid fa-trash"></i></button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                }
                            </>
                    }
                </div>
            </div>
            {ViewAgregar === 0 ?
                <div className="card-footer">
                    <div className="d-flex justify-content-between">
                        <button type='button' className="btn btn-secondary" onClick={() => VolverTab(setFormulario, "Deportiva", "profile-tab")}>Anterior</button>
                    </div>
                    <div className="d-flex justify-content-between">
                        <button className="btn btn-primary" onClick={() => AvanzarModulo(setFormulario, "Logros", "profile-tab")}>Siguiente</button>
                    </div>
                </div>
                : ViewAgregar === 1 ?
                    <div className="card-footer">
                        <div className="d-flex justify-content-between gap-2">
                            <button className="btn btn-primary" onClick={() => AddInstitucion(id, Institucion_id, parseInt(Pais), Nombre, FechaInicio, FechaFin, NivelInstitucion, isEnabledCheck, Posición, Categoria, Comentarios)}>Agregar</button>
                            <button className="btn btn-secondary" onClick={() => { setViewAgregar(0); AvanzarModulo(setFormulario, "Logros", "profile-tab"); }}>Siguiente</button>
                        </div>
                    </div>
                    :
                    ViewAgregar === 2 ?
                        <div className="card-footer one-btn">
                            <div className="d-flex justify-content-between">
                                <button className="btn btn-primary" onClick={() => UpdInstitucion(JugadorInstitucion_id, Nombre, FechaInicio, FechaFin, Pais, NivelInstitucion, isEnabledCheck, Posición, Categoria, Comentarios)}>Guardar</button>
                            </div>
                        </div>
                        :
                        <></>
            }
        </>

    );
}

export default CarreraDeportiva;
