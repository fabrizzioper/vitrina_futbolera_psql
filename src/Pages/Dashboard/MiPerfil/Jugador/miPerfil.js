import React, { useEffect, useState } from 'react';
import "./miPerfil.css";
import axios from 'axios';
import { useAuth } from '../../../../Context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import CompletarPerfilHeader from '../../../CompletarPerfil/CompletarPerfilHeader';
import CarreraDeportiva from './CarreraDeportiva/CarreraDeportiva';
import InformacionDeportiva from './informacionDeportiva';
import InfomacionPersonal from './infomacionPersonal';
import { DarFormatoFecha } from '../../../../Funciones/Funciones';
import LogrosDeportivos from './LogrosDeportivos/LogrosDeportivos';
import VideosJugador from './VideoJugador/VideosJugador';

const MiPerfil = ({ titulo, headerAction }) => {
    const [Formulario, setFormulario] = useState("Personal");
    const { Request, currentUser, RandomNumberImg } = useAuth();
    const location = useLocation();

    const [Actualizar, setActualizar] = useState(true);

    // Informacion Personal
    const [Nombre, setNombre] = useState("");
    const [Apellido, setApellido] = useState("");
    const [Sexo, setSexo] = useState("");
    const [TipoDocumento, setTipoDocumento] = useState("");
    const [Documento, setDocumento] = useState("");
    const [Fecha, setFecha] = useState("");
    const [Pais, setPais] = useState("");
    const [Pais2, setPais2] = useState("");
    const [NombreApoderado, setNombreApoderado] = useState("");
    const [DocApoderado, setDocApoderado] = useState("");
    const [TipoDocApoderado, setTipoDocApoderado] = useState("");
    const [ParentescoApoderado, setParentescoApoderado] = useState("");
    const [AutorizacionEstado, setAutorizacionEstado] = useState(0);

    // Caracteristicas Fisicas
    const [Estatura, setEstatura] = useState("");
    const [Peso, setPeso] = useState("");
    const [TallaRopa, setTallaRopa] = useState("");
    const [Sangre, setSangre] = useState("");

    // Informacion Deportiva
    const [Perfil, setPerfil] = useState("");
    const [Posición, setPosición] = useState("");
    const [PosicionSecundaria, setPosicionSecundaria] = useState("");
    const [DetallePosicion, setDetallePosicion] = useState("");
    const [SistemaJuego, setSistemaJuego] = useState("");
    const [Mercado, setMercado] = useState("");
    const [CaracteristicaFutbolerasValores, setCaracteristicaFutbolerasValores] = useState([]);
    const [JugadorNivel, setJugadorNivel] = useState("");

    //Seccion Inmagenes
    const [FileFotoCara, setFileFotoCara] = useState(null);
    const [FileFotoMedioCuerpo, setFileFotoMedioCuerpo] = useState(null);


    useEffect(() => {
        //obtener los datos de los jugadores
        function ObtenerJugador() {
            const formdata = new FormData();
            formdata.append("vit_jugador_id", currentUser.vit_jugador_id);

            axios({
                method: "post",
                url: `${Request.Dominio}/ficha_jugador`,
                headers: {
                    "userLogin": Request.userLogin,
                    "userPassword": Request.userPassword,
                    "systemRoot": Request.Empresa
                },
                data: formdata

            }).then(res => {
                const arreglo = res.data.data[0]
                console.log(arreglo);
                setFileFotoCara(arreglo.foto_perfil ? arreglo.foto_perfil+ "?random=" + RandomNumberImg : "")
                setFileFotoMedioCuerpo(arreglo.foto_cuerpo ? arreglo.foto_cuerpo+ "?random=" + RandomNumberImg : "")
                setNombre(arreglo.jugador_nombres ? arreglo.jugador_nombres : "")
                setApellido(arreglo.jugador_apellidos ? arreglo.jugador_apellidos : "")
                setSexo(arreglo.sexo ? arreglo.sexo : "M")
                setTipoDocumento(arreglo.tipo_documento ? arreglo.tipo_documento : "DNI")
                setDocumento(arreglo.DNI ? arreglo.DNI : "")
                setPais(arreglo.fb_pais_id ? arreglo.fb_pais_id : "111")
                setPais2(arreglo.fb_pais_2_id ? arreglo.fb_pais_2_id : "")
                setNombreApoderado(arreglo.jugador_nombre_apoderado === "undefined" || !arreglo.jugador_nombre_apoderado ? "" : arreglo.jugador_nombre_apoderado)
                setDocApoderado(arreglo.jugador_doc_apoderado || "")
                setTipoDocApoderado(arreglo.jugador_tipo_doc_apoderado || "")
                setParentescoApoderado(arreglo.jugador_parentesco_apoderado || "")
                setAutorizacionEstado(arreglo.autorizacion_menor_estado || 0)
                setJugadorNivel(arreglo.vit_jugador_nivel_id ? arreglo.vit_jugador_nivel_id : "")

                setFecha(arreglo.jugador_fecha_nacimiento ? DarFormatoFecha(arreglo.jugador_fecha_nacimiento) : "");

                // Caracteristicas ficisas
                setEstatura(arreglo.jugador_estatura_cm ? arreglo.jugador_estatura_cm : "")
                setPeso(arreglo.jugador_peso_kg ? arreglo.jugador_peso_kg : "")
                setTallaRopa(arreglo.vit_jugador_talla_id ? arreglo.vit_jugador_talla_id : "")
                setSangre(arreglo.jugador_grupo_sanguineo ? arreglo.jugador_grupo_sanguineo : "")


                // Informacion Deportiva
                setPerfil(arreglo.perfil ? arreglo.perfil : "")
                setPosición(arreglo.vit_posicion_juego_id ? arreglo.vit_posicion_juego_id : "")
                setPosicionSecundaria(arreglo.vit_sub_posicion_juego_id ? arreglo.vit_sub_posicion_juego_id : "")
                setDetallePosicion(arreglo.detalle_posicion ? arreglo.detalle_posicion : "")
                setSistemaJuego(arreglo.vit_sistema_juego_id ? arreglo.vit_sistema_juego_id : "")
                setMercado(arreglo.vit_mercado_id ? arreglo.vit_mercado_id : "")



            }).catch(error => {
            });
        }

        if (currentUser) {
            ObtenerJugador()
        }
    }, [Request, currentUser]);


    useEffect(() => {
        //Obtener el Array con los Paises
        function GetValoresCaracteristica_futbolera() {

            const formdata = new FormData();
            formdata.append("vit_jugador_id", currentUser.vit_jugador_id);

            axios({
                method: "post",
                url: `${Request.Dominio}/jugador_caracteristica_list`,
                headers: {
                    "userLogin": Request.userLogin,
                    "userPassword": Request.userPassword,
                    "systemRoot": Request.Empresa
                },
                data: formdata

            }).then(res => {
                const Arreglo = res.data.data
                setCaracteristicaFutbolerasValores(Arreglo)

            }).catch(error => {
            });
        }
        if (currentUser) {
            GetValoresCaracteristica_futbolera()
        }
    }, [Request, currentUser, Actualizar]);


    return (
        <div className='mi-perfil-container' >
            {currentUser ?
                <>
                    <CompletarPerfilHeader titulo={titulo || 'Mi Perfil'} headerAction={headerAction} />
                    <div className='row justify-content-center mt-5 out-div-card-continer'>
                        <div className='col d-flex div-card-continer'>
                            <ul className="nav nav-pills steps mb-7 mt-n3 mx-auto " id="profile-tab" role="tablist" >
                                <li className="nav-item" role="presentation">
                                    <button className="nav-link-profile profile-tab active" id="profileTabone"  >
                                        <i className="fa-solid icon-usuario"></i>
                                    </button>
                                </li>
                                <li className="nav-item" role="presentation">
                                    <button className="nav-link-profile profile-tab" id="profileTabtwo" >
                                        <i className="fa-solid icon-balon2"></i>
                                    </button>
                                </li>
                                <li className="nav-item" role="presentation">
                                    <button className="nav-link-profile profile-tab" id="profileTabthree"  >
                                        <i className="fa-solid icon-club4"></i>
                                    </button>
                                </li>
                                <li className="nav-item" role="presentation">
                                    <button className="nav-link-profile profile-tab" id="profileTabtfour" >
                                        <i className="fa-solid icon-copa1"></i>
                                    </button>
                                </li>
                                <li className="nav-item" role="presentation">
                                    <button className="nav-link-profile profile-tab" id="profileTabfive"  >
                                        <i className="fa-solid icon-play"></i>
                                    </button>
                                </li>
                            </ul>
                            <div className='mt-5 py-6 px-md-4 card-profile shadow-sm'>
                                {Formulario === "Personal" ? <InfomacionPersonal id={currentUser.vit_jugador_id} Nombre={Nombre} setNombre={setNombre} Apellido={Apellido} setApellido={setApellido} Sexo={Sexo} setSexo={setSexo} TipoDocumento={TipoDocumento} setTipoDocumento={setTipoDocumento} Documento={Documento} setDocumento={setDocumento} Fecha={Fecha} setFecha={setFecha} Pais={Pais} setPais={setPais} Pais2={Pais2} setPais2={setPais2} NombreApoderado={NombreApoderado} setNombreApoderado={setNombreApoderado} DocApoderado={DocApoderado} setDocApoderado={setDocApoderado} TipoDocApoderado={TipoDocApoderado} setTipoDocApoderado={setTipoDocApoderado} ParentescoApoderado={ParentescoApoderado} setParentescoApoderado={setParentescoApoderado} AutorizacionEstado={AutorizacionEstado} setAutorizacionEstado={setAutorizacionEstado} FileFotoCara={FileFotoCara} setFileFotoCara={setFileFotoCara} FileFotoMedioCuerpo={FileFotoMedioCuerpo} setFileFotoMedioCuerpo={setFileFotoMedioCuerpo} Estatura={Estatura} setEstatura={setEstatura} Peso={Peso} setPeso={setPeso} TallaRopa={TallaRopa} setTallaRopa={setTallaRopa} Sangre={Sangre} setSangre={setSangre} setFormulario={setFormulario} /> :
                                    Formulario === "Deportiva" ? <InformacionDeportiva id={currentUser.vit_jugador_id} Perfil={Perfil} setPerfil={setPerfil} Posición={Posición} setPosición={setPosición} PosicionSecundaria={PosicionSecundaria} setPosicionSecundaria={setPosicionSecundaria} DetallePosicion={DetallePosicion} setDetallePosicion={setDetallePosicion} SistemaJuego={SistemaJuego} setSistemaJuego={setSistemaJuego} Mercado={Mercado} setMercado={setMercado} CaracteristicaFutbolerasValores={CaracteristicaFutbolerasValores} JugadorNivel={JugadorNivel} setJugadorNivel={setJugadorNivel} setFormulario={setFormulario} Actualizar={Actualizar} setActualizar={setActualizar} /> :
                                        Formulario === "Carrera" ? <CarreraDeportiva id={currentUser.vit_jugador_id} setFormulario={setFormulario} /> :
                                            Formulario === "Logros" ? <LogrosDeportivos id={currentUser.vit_jugador_id} setFormulario={setFormulario} /> :
                                                Formulario === "Videos" ? <VideosJugador id={currentUser.vit_jugador_id} setFormulario={setFormulario} /> :
                                                    <></>
                                }
                            </div>
                        </div>
                    </div>
                </>
                :
                <div className='loginRequired'>
                    <span className='icon icon-hand-holding-mobile-phone-icon'></span>
                    <h4>Inicia Sesión para acceder a esta sección</h4>
                    <div className='div-link'><Link to={"/login"} state={{ from: location }} className='boton'>Iniciar Sesión</Link></div>
                </div>
            }

        </div>
    );
}

export default MiPerfil;
