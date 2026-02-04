import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { useAuth } from '../../../../../Context/AuthContext';
import { AvanzarModulo, DarFormatoFecha, VolverTab } from '../../../../../Funciones/Funciones';
import AgregarLogros from './AgregarLogros';
import EditarLogros from './EditarLogros';

const LogrosDeportivos = ({ id, setFormulario }) => {
    const { Alerta, Request } = useAuth();

    const [LogrosJugador, setLogrosJugador] = useState([]);
    const [Paises, setPaises] = useState([]);
    const [Tipo_instituciones, setTipo_instituciones] = useState([]);
    const [Categorias, setCategorias] = useState([]);
    const [Pais, setPais] = useState("");
    const [Tipo_institucion, setTipo_institucion] = useState("");
    const [Categoria, setCategoria] = useState("");
    const [NombreTorneo, setNombreTorneo] = useState("");
    const [NombreLogro, setNombreLogro] = useState("");
    const [Fecha, setFecha] = useState("");

    const [Logro_id, setLogro_id] = useState("");


    // AGREGAR NUEVO LOGRO O EDITAR LOGRO VIEW
    const [ViewAgregar, setViewAgregar] = useState(0);

    const [Actualizar, setActualizar] = useState(false);

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

        // Obtener el Array con los Tipos de Institucion
        function GetTipoInstitucion() {

            const formdata = new FormData();
            formdata.append("dato", 1);


            axios({
                method: "post",
                url: `${Request.Dominio}/tipo_institucion_list`,
                headers: {
                    "userLogin": Request.userLogin,
                    "userPassword": Request.userPassword,
                    "systemRoot": Request.Empresa
                },
                data: formdata

            }).then(res => {
                let arreglo = res.data.data
                setTipo_instituciones(arreglo)

            }).catch(error => {
            });
        }

        // Obtener el Array con los Tipos de Institucion
        function GetCategoria() {

            const formdata = new FormData();
            formdata.append("dato", 1);


            axios({
                method: "post",
                url: `${Request.Dominio}/categoria`,
                headers: {
                    "userLogin": Request.userLogin,
                    "userPassword": Request.userPassword,
                    "systemRoot": Request.Empresa
                },
                data: formdata

            }).then(res => {
                let arreglo = res.data.data
                setCategorias(arreglo)

            }).catch(error => {
            });
        }

        // Obtener el Array con los logros del jugador
        function GetLogrosJugador(id) {

            const formdata = new FormData();
            formdata.append("vit_jugador_id", id);


            axios({
                method: "post",
                url: `${Request.Dominio}/jugador_logros_lista`,
                headers: {
                    "userLogin": Request.userLogin,
                    "userPassword": Request.userPassword,
                    "systemRoot": Request.Empresa
                },
                data: formdata

            }).then(res => {
                let arreglo = res.data.data
                setLogrosJugador(arreglo);

            }).catch(error => {
            });
        }


        GetPaises()
        GetTipoInstitucion()
        GetCategoria()
        GetLogrosJugador(id)

    }, [Request, id, Actualizar]);

    // FUNCION PARA AGREGAR LOGRO
    function AddLogro(id, Tipo_institucion, NombreTorneo, Fecha, Categoria, NombreLogro, Pais) {

        const formdata2 = new FormData();
        formdata2.append('vit_jugador_id', id);
        formdata2.append('vit_tipo_institucion_id', Tipo_institucion);
        formdata2.append('torneo', NombreTorneo);
        formdata2.append('anno', new Date(Fecha).getFullYear());
        formdata2.append('vit_categoria_id', Categoria);
        formdata2.append('logro ', NombreLogro);
        formdata2.append('fb_pais_id ', Pais);
        formdata2.append('fecha ', Fecha);

        if (Tipo_institucion && NombreTorneo && Categoria && NombreLogro && Pais && Fecha) {
            axios({
                method: "post",
                url: `${Request.Dominio}/jugador_logros_ins`,
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


    // FUNCION PARA ACTUALIZAR LOGRO
    function UpdLogro(id, id_logro, NombreTorneo, Categoria, Tipo_institucion, Pais, NombreLogro, Fecha) {
        const formdata2 = new FormData();
        formdata2.append('vit_jugador_id', id);
        formdata2.append('vit_palmares_id', id_logro);
        formdata2.append('nombre_torneo', NombreTorneo);
        formdata2.append('categoria_id', Categoria);
        formdata2.append('tipo_institucion_id', Tipo_institucion);
        formdata2.append('fb_pais_id ', Pais);
        formdata2.append('nombre_logro ', NombreLogro);
        formdata2.append('fecha ', Fecha);
        formdata2.append('anno ', new Date(Fecha).getFullYear());

        if (NombreTorneo && Categoria && Tipo_institucion && Pais && NombreLogro && Fecha) {
            axios({
                method: "post",
                url: `${Request.Dominio}/jugador_logros_upd`,
                headers: {
                    "userLogin": Request.userLogin,
                    "userPassword": Request.userPassword,
                    "systemRoot": Request.Empresa
                },
                data: formdata2

            }).then(res => {
                console.log(res)
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

    // FUNCION PARA ELIMINAR UN LOGRO
    function SupInstitucion(Logro_id) {

        // DECLARAR ALERTA CON CONFIRMACION y USARLA   
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
                formdata2.append('vit_logro_id', Logro_id);

                axios({
                    method: "post",
                    url: `${Request.Dominio}/jugador_logros_sup`,
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
                        Alerta("error", "Ocurrio un error al eliminar")
                    }


                }).catch(error => {
                    console.log("error", error);
                });

            }
        })



    }



    //FUNCION PARA ABRIR MODULO eDITAR Y SETEAR LOS DATOS EN LOS INPUTS
    function ModuloEditar(logro_id, torneo, categoria, Tipo_institucion, pais, logro, fecha) {
        setViewAgregar(2)
        setLogro_id(logro_id)
        setNombreTorneo(torneo)
        setCategoria(categoria)
        setTipo_institucion(Tipo_institucion)
        setPais(pais)
        setNombreLogro(logro)
        setFecha(DarFormatoFecha(fecha))
    }

    // FUNCION PARA LIMPIAR LOS CAMPOS
    function LimpiarCampos() {
        setLogro_id("")
        setNombreTorneo("")
        setCategoria("")
        setTipo_institucion("")
        setPais("")
        setNombreLogro("")
        setFecha("")
    }

    return (
        <>
            <div className='card-body' data-aos="zoom-in">
                <h2 className="h4 fw-semibold text-center mb-0">Logros Deportivos</h2>
                <p className="text-secondary text-center mb-3">Algunos detalles sobre tu logros</p>
                <div className='row gap-2'>
                    {ViewAgregar === 1 ?
                        <AgregarLogros
                            Paises={Paises}
                            Tipo_instituciones={Tipo_instituciones}
                            Tipo_institucion={Tipo_institucion}
                            setTipo_institucion={setTipo_institucion}
                            Categorias={Categorias}
                            Categoria={Categoria}
                            setCategoria={setCategoria}
                            Pais={Pais}
                            setPais={setPais}
                            NombreTorneo={NombreTorneo}
                            setNombreTorneo={setNombreTorneo}
                            NombreLogro={NombreLogro}
                            setNombreLogro={setNombreLogro}
                            Fecha={Fecha}
                            setFecha={setFecha}
                            setViewAgregar={setViewAgregar}
                        />
                        :
                        ViewAgregar === 2 ?
                            <EditarLogros
                                Paises={Paises}
                                Tipo_instituciones={Tipo_instituciones}
                                Tipo_institucion={Tipo_institucion}
                                setTipo_institucion={setTipo_institucion}
                                Categorias={Categorias}
                                Categoria={Categoria}
                                setCategoria={setCategoria}
                                Pais={Pais}
                                setPais={setPais}
                                NombreTorneo={NombreTorneo}
                                setNombreTorneo={setNombreTorneo}
                                NombreLogro={NombreLogro}
                                setNombreLogro={setNombreLogro}
                                Fecha={Fecha}
                                setFecha={setFecha}
                                setViewAgregar={setViewAgregar}
                            />
                            :
                            <>
                                <div className='Out-div-btn-agregar-institucion'>
                                    <button className='btn-agregar-institucion' onClick={() => { setViewAgregar(1); LimpiarCampos(); }}>
                                        <div className='d-flex'><div className='icon-plus'>+</div></div>
                                        <div>Agregar un logro</div>
                                    </button>
                                </div>
                                {LogrosDeportivos.length !== 0 &&
                                    <div className='Container_Card_Institucion_Jugador'>
                                        {LogrosJugador.map(lj => {
                                            return (
                                                <div className='Card_Institucion_Jugador' key={lj.vit_palmares_id}>
                                                    <div className='Out_Info_logro_Jugador col'>
                                                        <img src='https://cdn.discordapp.com/attachments/909842814211334165/1072889018351624192/LogroIcon.png' alt={lj.nombre_institucion}></img>
                                                        <div className='Info_Institucion_Jugador'>
                                                            <h5 className='Nombre_Institucion_Jugador'>{lj.torneo} - {lj.nombre_categoria}</h5>
                                                            <h5 className='sub-info'>{lj.logro}</h5>
                                                            <p className='sub-info'>{lj.nombre_pais} - {new Date(lj.fecha).getFullYear()}</p>
                                                        </div>
                                                    </div>
                                                    <div className='Out_Actions_Institucion_Jugador col'>
                                                        <div className='Actions_Institucion_Jugador'>
                                                            <button className='btn_Institucion_Jugador' onClick={() => ModuloEditar(lj.vit_palmares_id, lj.torneo, lj.id_categoria, lj.vit_tipo_institucion_id, lj.id_pais, lj.logro, lj.fecha)}><i className="fa-solid fa-pen"></i></button>
                                                            <button className='btn_Institucion_Jugador' onClick={() => SupInstitucion(lj.vit_palmares_id)}><i className="fa-solid fa-trash"></i></button>
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
                        <button type='button' className="btn btn-secondary" onClick={() => VolverTab(setFormulario, "Carrera", "profile-tab")}>Anterior</button>
                    </div>
                    <div className="d-flex justify-content-between">
                        <button className="btn btn-primary" onClick={() => AvanzarModulo(setFormulario, "Videos", "profile-tab")}>Siguiente</button>
                    </div>
                </div>
                : ViewAgregar === 1 ?
                    <div className="card-footer one-btn">
                        <div className="d-flex justify-content-between">
                            <button className="btn btn-primary" onClick={() => AddLogro(id, Tipo_institucion, NombreTorneo, Fecha, Categoria, NombreLogro, Pais)}>Agregar</button>
                        </div>
                    </div>
                    :
                    ViewAgregar === 2 ?
                        <div className="card-footer one-btn">
                            <div className="d-flex justify-content-between">
                                <button className="btn btn-primary" onClick={() => UpdLogro(id, Logro_id, NombreTorneo, Categoria, Tipo_institucion, Pais, NombreLogro, Fecha)}>Guardar</button>
                            </div>
                        </div>
                        :
                        <></>
            }
        </>
    );
}

export default LogrosDeportivos;
