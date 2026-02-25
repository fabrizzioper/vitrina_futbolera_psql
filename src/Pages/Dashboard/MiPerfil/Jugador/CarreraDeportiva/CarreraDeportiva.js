import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../../../Context/AuthContext';
import { DarFormatoFecha, AvanzarModulo, VolverTab, fetchData } from '../../../../../Funciones/Funciones';
import { DEFAULT_IMAGES } from '../../../../../Funciones/DefaultImages';
import AgregarInstitucion from './AgregarInstitucion';
import EditarInstitucion from './EditarInstitucion';
import Swal from 'sweetalert2';

const CarreraDeportiva = ({ id, setFormulario }) => {
    const { Alerta, Request, currentUser } = useAuth();
    const [Paises, setPaises] = useState([]);
    const [Pais, setPais] = useState("");
    const [Nombre, setNombre] = useState("");
    const [NivelInstitucion, setNivelInstitucion] = useState("");
    const [FechaInicio, setFechaInicio] = useState("");
    const [FechaFin, setFechaFin] = useState("");
    const [Posición, setPosición] = useState("");
    const [Actualizar, setActualizar] = useState(false);
    const [isEnabledCheck, setisEnabledCheck] = useState(false);



    const [JugadorInstitucion_id, setJugadorInstitucion_id] = useState(0);
    const [Institucion_id, setInstitucion_id] = useState(0);
    const [InstitucionesJugador, setInstitucionesJugador] = useState([]);



    // AGREGAR NUEVA INSTITUCION O EDITAR VIEW
    const [ViewAgregar, setViewAgregar] = useState(0);


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
    function AddInstitucion(id, Institucion_id, Pais, Nombre, FechaInicio, FechaFin, NivelInstitucion, isEnabledCheck, Posición) {


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

        if (Pais && Nombre && FechaInicio) {
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
        } else {
            Alerta("error", "LLenar todos los campos")
        }
    }

    // FUNCION PARA EDITAR UNA INSTITUCION
    function UpdInstitucion(jugadorInstitucion_id, Nombre, FechaInicio, FechaFin, Pais, NivelInstitucion, isEnabledCheck, Posición) {

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
            console.log(res);
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
    function ModuloEditar(JugadorInstitucion_id, id_Institucion, pais, nombre, fecha_inicio, fecha_fin, NivelInstitucion, flag, posicion) {
        setJugadorInstitucion_id(JugadorInstitucion_id)
        setViewAgregar(2)
        setInstitucion_id(id_Institucion)
        setPais(pais)
        setNombre(nombre)
        setFechaInicio(DarFormatoFecha(fecha_inicio))
        setNivelInstitucion(NivelInstitucion)
        setPosición(posicion)
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
                            />
                            :
                            <>
                                <div className='Out-div-btn-agregar-institucion'>
                                    <button className='btn-agregar-institucion' onClick={() => { setViewAgregar(1); LimpiarCampos(); }}>
                                        <div className='d-flex'><div className='icon-plus'>+</div></div>
                                        <div>Agregar Institucion</div>
                                    </button>
                                </div>
                                {InstitucionesJugador.length !== 0 &&
                                    <div className='Container_Card_Institucion_Jugador'>
                                        {InstitucionesJugador.map(ji => {
                                            function FormatoFechaInstitucion(i, f, flag) {
                                                let AñoInicio = new Date(i).getFullYear()
                                                let AñoFin
                                                if (flag === 1 || !f) {
                                                    AñoFin = "Actualidad"

                                                } else {
                                                    AñoFin = new Date(f).getFullYear()
                                                }

                                                return AñoInicio + " - " + AñoFin
                                            }
                                            return (
                                                <div className='Card_Institucion_Jugador' key={ji.vit_jugador_institucion_id}>
                                                    <div className='Out_Info_Institucion_Jugador'>
                                                        <div className='logo_institucion'>
                                                            <img src={ji.logo ? ji.logo : DEFAULT_IMAGES.ESCUDO_CLUB} alt={ji.nombre_institucion}></img>
                                                        </div>
                                                        <div className='Info_Institucion_Jugador'>
                                                            <h5 className='Nombre_Institucion_Jugador_y_logro'>{ji.nombre_institucion}</h5>
                                                            <h5 className='Pais_Institucion_Jugador'>{ji.nombre_pais}</h5>
                                                            <p className='Fecha_Institucion_Jugador'>{FormatoFechaInstitucion(ji.fecha_inicio, ji.fecha_fin, ji.flag_actual)}</p>
                                                        </div>
                                                    </div>
                                                    <div className='Out_Actions_Institucion_Jugador'>
                                                        <div className='Actions_Institucion_Jugador'>
                                                            {/* Badge de verificacion */}
                                                            {ji.estado_verificacion === 2 || ji.flag_verificado === 1 ? (
                                                                <span className="badge bg-success" style={{ fontSize: '0.7rem', padding: '4px 8px' }} title="Verificado por el club">
                                                                    <i className="fa-solid fa-circle-check"></i> Verificado
                                                                </span>
                                                            ) : ji.estado_verificacion === 1 ? (
                                                                <span className="badge bg-warning text-dark" style={{ fontSize: '0.7rem', padding: '4px 8px' }} title="Esperando respuesta del club">
                                                                    <i className="fa-solid fa-clock"></i> Pendiente
                                                                </span>
                                                            ) : ji.estado_verificacion === 3 ? (
                                                                <span className="badge bg-danger" style={{ fontSize: '0.7rem', padding: '4px 8px', cursor: 'pointer' }} title="Solicitud rechazada - click para reintentar" onClick={() => SolicitarVerificacion(ji.vit_jugador_institucion_id, ji.vit_institucion_id)}>
                                                                    <i className="fa-solid fa-xmark"></i> Rechazado
                                                                </span>
                                                            ) : (
                                                                <span className="badge bg-secondary" style={{ fontSize: '0.7rem', padding: '4px 8px', cursor: ji.vit_institucion_id && ji.vit_institucion_id > 0 ? 'pointer' : 'default' }} title={ji.vit_institucion_id && ji.vit_institucion_id > 0 ? "Click para solicitar verificacion" : "No verificado"} onClick={() => ji.vit_institucion_id && ji.vit_institucion_id > 0 && SolicitarVerificacion(ji.vit_jugador_institucion_id, ji.vit_institucion_id)}>
                                                                    <i className="fa-solid fa-shield-halved"></i> No verificado
                                                                </span>
                                                            )}
                                                            <button className='btn_Institucion_Jugador' onClick={() => ModuloEditar(ji.vit_jugador_institucion_id, ji.vit_institucion_id, ji.id_pais, ji.nombre_institucion, ji.fecha_inicio, ji.fecha_fin, ji.nivel_institucion, ji.flag_actual, ji.posicion_juego_id)}><i className="fa-solid fa-pen"></i></button>
                                                            <button className='btn_Institucion_Jugador' onClick={() => SupInstitucion(ji.vit_jugador_institucion_id)}><i className="fa-solid fa-trash"></i></button>
                                                        </div>
                                                    </div>
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
                            <button className="btn btn-primary" onClick={() => AddInstitucion(id, Institucion_id, parseInt(Pais), Nombre, FechaInicio, FechaFin, NivelInstitucion, isEnabledCheck, Posición)}>Agregar</button>
                            <button className="btn btn-secondary" onClick={() => { setViewAgregar(0); AvanzarModulo(setFormulario, "Logros", "profile-tab"); }}>Siguiente</button>
                        </div>
                    </div>
                    :
                    ViewAgregar === 2 ?
                        <div className="card-footer one-btn">
                            <div className="d-flex justify-content-between">
                                <button className="btn btn-primary" onClick={() => UpdInstitucion(JugadorInstitucion_id, Nombre, FechaInicio, FechaFin, Pais, NivelInstitucion, isEnabledCheck, Posición)}>Guardar</button>
                            </div>
                        </div>
                        :
                        <></>
            }
        </>

    );
}

export default CarreraDeportiva;
