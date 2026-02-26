import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../../../Context/AuthContext';
import { DarFormatoFecha, fetchData } from '../../../Funciones/Funciones';
import { DEFAULT_IMAGES } from '../../../Funciones/DefaultImages';
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper";
import "./ficha.css";
import CaracteristicasFutbolerasCharts from '../../../Componentes/RadarChart/caracteristicasFutbolerasCharts';


const FichaJugador = () => {
    const [JugadorFicha, setJugadorFicha] = useState([]);
    const [CaracteristicaFutbolerasValores, setCaracteristicaFutbolerasValores] = useState([]);
    const [InstitucionesJugador, setInstitucionesJugador] = useState([]);
    const [LogrosJugador, setLogrosJugador] = useState([]);
    const [VideosJugador, setVideosJugador] = useState([]);
    const { Request, RandomNumberImg, clubData, currentUser, Alerta } = useAuth();
    let { id } = useParams();
    const location = useLocation();
    let previusURL = location.state?.from.pathname || "/"

    // --- Comentarios del club ---
    const [comentarios, setComentarios] = useState([]);
    const [cargandoComentarios, setCargandoComentarios] = useState(false);
    const [nuevoComentario, setNuevoComentario] = useState('');
    const [enviandoComentario, setEnviandoComentario] = useState(false);

    const esUsuarioClub = clubData && clubData.vit_institucion_id;

    const cargarComentarios = (jugId) => {
        setCargandoComentarios(true);
        fetchData(Request, "club_jugador_comentario_list_all", [
            { nombre: "vit_jugador_id", envio: jugId }
        ]).then(data => {
            setComentarios(data || []);
            setCargandoComentarios(false);
        }).catch(() => {
            setComentarios([]);
            setCargandoComentarios(false);
        });
    };

    const handleAgregarComentario = () => {
        if (!nuevoComentario.trim()) return;
        setEnviandoComentario(true);
        fetchData(Request, "club_jugador_comentario_ins", [
            { nombre: "vit_jugador_id", envio: id },
            { nombre: "vit_institucion_id", envio: clubData.vit_institucion_id },
            { nombre: "autor_jugador_id", envio: currentUser.vit_jugador_id },
            { nombre: "comentario", envio: nuevoComentario.trim() }
        ]).then(() => {
            setNuevoComentario('');
            cargarComentarios(id);
            Alerta('success', 'Comentario agregado');
        }).catch(() => {
            Alerta('error', 'Error al agregar comentario');
        }).finally(() => {
            setEnviandoComentario(false);
        });
    };

    const handleEliminarComentario = (comentarioId) => {
        fetchData(Request, "club_jugador_comentario_del", [
            { nombre: "vit_jugador_comentario_club_id", envio: comentarioId },
            { nombre: "autor_jugador_id", envio: currentUser.vit_jugador_id }
        ]).then(() => {
            cargarComentarios(id);
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

    // Obtener los datos de los jugadores
    useEffect(() => {
        function ObtenerJugadores() {
            const formdata = new FormData();
            formdata.append("vit_jugador_id", id);

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
                setJugadorFicha(arreglo)

            }).catch(error => {
                console.log("error al traer jugador");;
            });
        }

        //Obtener el Array con los Paises
        function GetValoresCaracteristica_futbolera() {

            const formdata = new FormData();
            formdata.append("vit_jugador_id", id);

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
                console.log(Arreglo);


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
                let Arreglo = res.data.data
                setInstitucionesJugador(Arreglo);
                console.log(Arreglo);

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

        //FUNCION LISTAR TODOS LOS VIDEOS DE UN JUGADOR
        function ListVideos(id) {
            const formdata = new FormData();
            formdata.append('vit_jugador_id', id);
            axios({
                method: "post",
                url: `${Request.Dominio}/jugador_multimedia_list`,
                headers: {
                    "userLogin": Request.userLogin,
                    "userPassword": Request.userPassword,
                    "systemRoot": Request.Empresa
                },
                data: formdata

            }).then(res => {
                let arreglo = res.data.data
                setVideosJugador(arreglo)


            }).catch(error => {
                console.log("error", error);
            });
        }



        ListVideos(id)
        GetValoresCaracteristica_futbolera()
        ObtenerJugadores()
        GetInstitucionesJugador(id)
        GetLogrosJugador(id)
        cargarComentarios(id)
    }, [Request, id]);

    // Dar formato de fecha
    function DarFomatoFecha() {
        if (JugadorFicha.jugador_fecha_nacimiento) {
            return new Date(JugadorFicha.jugador_fecha_nacimiento).toLocaleDateString('en-us', { day: "numeric", month: "numeric", year: "numeric" })
        }
        return ""
    }

    // Obtener edad con la fecha de nacimiento y darle formato
    function ObtenerEdad() {
        if (JugadorFicha.jugador_fecha_nacimiento) {
            let nacimiento = new Date(JugadorFicha.jugador_fecha_nacimiento);
            let fecha_act = new Date();
            let edad = fecha_act.getFullYear() - nacimiento.getFullYear()
            let diferenciaMeses = fecha_act.getMonth() - nacimiento.getMonth()
            if (diferenciaMeses < 0 || (diferenciaMeses === 0 && fecha_act.getDate() < nacimiento.getDate())) {
                edad--
            }
            return edad + " años"
        }
        return ""
    }


    const pagination = {
        clickable: true,
        renderBullet: function (index, className) {
            return '<span class="' + className + '">' + (index + 1) + "</span>";
        },
    };

    function obtenerIdVideo(url) {
        // Buscar el ID del video en la URL
        const videoIdMatch = url.match(/(?:youtube.com\/watch\?v=|youtu.be\/)([\w-]+)/);
        if (videoIdMatch) {
            // Devolver el ID del video
            return videoIdMatch[1];
        }
        // Si no se encuentra el ID del video en la URL, devolver ""
        return "";
    }

    return (
        <>
            {
                JugadorFicha ?
                    <>

                        <div className='out-div-seccion '>
                            <div className='header-ficha'>
                                <Link className='Volver-link' to={previusURL}><span className='icon-flecha2'></span>Volver</Link>
                                <a href={`${process.env.REACT_APP_VF_REPORT_BASE_URL}/externalReport/execute/${Request.Referencia}/rpt_ficha_jugador_vf/PDF/jugador_id=${id}/reportes_sistema/ `} target="_blank" rel="noreferrer" className='div-icon-reporte' >
                                    <i className="fa-solid fa-file-pdf"></i> Ver PDF
                                </a>
                            </div>
                            <div className="ficha-jugador">
                                <div className="row in-ficha-jugador gap-3">
                                    <div className="col cards-ficha" data-aos="zoom-in" data-aos-once="true">
                                        <div className="in-div-card-ficha ">
                                            <span className='info info-estatura'>{JugadorFicha.jugador_estatura_cm ? `${JugadorFicha.jugador_estatura_cm} cm` : "- cm"}</span>
                                            <span className='info info-peso'>{JugadorFicha.jugador_peso_kg ? `${JugadorFicha.jugador_peso_kg} kg` : "- kg"}</span>
                                            <div className='info info-pais'>
                                                <span>{JugadorFicha.pais ? `${JugadorFicha.pais}` : "-"}</span>
                                                <span className='sub-info'>{JugadorFicha.pais2 ? `${JugadorFicha.pais2}` : ""}</span>
                                            </div>
                                            <div className='info info-nacimiento'>
                                                <span >{DarFomatoFecha()}</span>
                                                <span className='sub-info'>{ObtenerEdad()}</span>
                                            </div>
                                            <div className='div-img'>
                                                <img className='info img-user' src={JugadorFicha.foto_perfil ? JugadorFicha.foto_perfil + "?random=" + RandomNumberImg : DEFAULT_IMAGES.CARA_USUARIO} alt="..." />
                                                {/* <h5>{CortarNombre()}</h5> */}
                                                {JugadorFicha.cod_pais ? <img className='info img-bandera' src={`https://flagcdn.com/w80/${JugadorFicha.cod_pais.toLowerCase()}.png`} alt={JugadorFicha.pais} /> : <></>}
                                            </div>

                                        </div>
                                    </div>
                                    <div className="col cards-ficha" data-aos="zoom-in" data-aos-once="true">
                                        <div className="in-div-card-ficha ">
                                            <div className='info info-nombreCompleto'>
                                                <span >{!JugadorFicha.jugador_nombres || !JugadorFicha.jugador_apellidos ? '' : `${JugadorFicha.jugador_nombres} ${JugadorFicha.jugador_apellidos}`}</span>
                                            </div>
                                            <div className='info info-pie'>
                                                <img className={`img ${JugadorFicha.perfil}`} src={DEFAULT_IMAGES.PIES} alt={JugadorFicha.perfil} />
                                                <span>{JugadorFicha.perfil === "Derecho" ? "Diestro" : JugadorFicha.perfil === "Izquierdo" ? "Zurdo" : ""}</span>
                                            </div>
                                            <div className="info info-TallaRopa">
                                                <span className='icon-polo1'></span>
                                                <span >{JugadorFicha.talla}</span>
                                            </div>
                                            <div className="info info-Sangre">
                                                <img src={DEFAULT_IMAGES.SANGRE} alt="sangre-icon"></img>
                                                <span>{JugadorFicha.jugador_grupo_sanguineo}</span>
                                            </div>
                                        </div>
                                    </div>
                                    {
                                        JugadorFicha.posicion &&
                                        <div className="col cards-ficha" data-aos="zoom-in" data-aos-once="true">
                                            <div className="in-div-card-ficha ">
                                                <div className="info info-sistemaJuego">{JugadorFicha.sistema_juego}</div>
                                                <div className="info info-posición">
                                                    <span>{JugadorFicha.posicion}</span>
                                                    <span className='subposicion'>{JugadorFicha.subposicion}</span>
                                                </div>

                                                <div className={`cancha ${JugadorFicha.cod_sistema_juego}`}>
                                                    <img className='cancha-img' src={DEFAULT_IMAGES.CANCHA} alt="cancha" />
                                                    <>
                                                        <div className={`posicion PO-pos ${JugadorFicha.cod_posicion === "PO" ? JugadorFicha.cod_posicion : ""}   ${JugadorFicha.cod_subposicion === "PO" ? JugadorFicha.cod_subposicion : ""}`}></div>
                                                        <div className={`posicion df LD-pos ${JugadorFicha.cod_posicion === "LD" ? JugadorFicha.cod_posicion : ""}  ${JugadorFicha.cod_subposicion === "LD" ? JugadorFicha.cod_subposicion : ""}`}></div>
                                                        <div className={`posicion df DCD-pos ${JugadorFicha.cod_posicion === "DCD" ? JugadorFicha.cod_posicion : ""}  ${JugadorFicha.cod_subposicion === "DCD" ? JugadorFicha.cod_subposicion : ""}`}></div>
                                                        <div className={`posicion df DCI-pos ${JugadorFicha.cod_posicion === "DCI" ? JugadorFicha.cod_posicion : ""}  ${JugadorFicha.cod_subposicion === "DCI" ? JugadorFicha.cod_subposicion : ""}`}></div>
                                                        <div className={`posicion df LI-pos ${JugadorFicha.cod_posicion === "LI" ? JugadorFicha.cod_posicion : ""}  ${JugadorFicha.cod_subposicion === "LI" ? JugadorFicha.cod_subposicion : ""}`}></div>
                                                        <div className={`posicion mc MCD-pos ${JugadorFicha.cod_posicion === "MCD" ? JugadorFicha.cod_posicion : ""}  ${JugadorFicha.cod_subposicion === "MCD" ? JugadorFicha.cod_subposicion : ""}`}></div>
                                                        <div className={`posicion mc MD-pos ${JugadorFicha.cod_posicion === "MD" ? JugadorFicha.cod_posicion : ""}  ${JugadorFicha.cod_subposicion === "MD" ? JugadorFicha.cod_subposicion : ""}`}></div>
                                                        <div className={`posicion mc MI-pos ${JugadorFicha.cod_posicion === "MI" ? JugadorFicha.cod_posicion : ""}  ${JugadorFicha.cod_subposicion === "MI" ? JugadorFicha.cod_subposicion : ""}`}></div>
                                                        <div className={`posicion mc MCO-pos ${JugadorFicha.cod_posicion === "MCO" ? JugadorFicha.cod_posicion : ""}  ${JugadorFicha.cod_subposicion === "MCO" ? JugadorFicha.cod_subposicion : ""}`}></div>
                                                        <div className={`posicion de ED-pos ${JugadorFicha.cod_posicion === "ED" ? JugadorFicha.cod_posicion : ""}  ${JugadorFicha.cod_subposicion === "ED" ? JugadorFicha.cod_subposicion : ""}`}></div>
                                                        <div className={`posicion de SD-pos ${JugadorFicha.cod_posicion === "SD" ? JugadorFicha.cod_posicion : ""}  ${JugadorFicha.cod_subposicion === "SD" ? JugadorFicha.cod_subposicion : ""}`}></div>
                                                        <div className={`posicion de EI-pos ${JugadorFicha.cod_posicion === "EI" ? JugadorFicha.cod_posicion : ""}  ${JugadorFicha.cod_subposicion === "EI" ? JugadorFicha.cod_subposicion : ""}`}></div>
                                                        <div className={`posicion de CD-pos ${JugadorFicha.cod_posicion === "CD" ? JugadorFicha.cod_posicion : ""}  ${JugadorFicha.cod_subposicion === "CD" ? JugadorFicha.cod_subposicion : ""}`}></div>
                                                    </>
                                                </div>
                                            </div>
                                        </div>
                                    }
                                    {CaracteristicaFutbolerasValores.length !== 0 &&
                                        <div className="col cards-ficha" data-aos="zoom-in" data-aos-once="true">
                                            <div className='in-div-card-ficha'>
                                            <CaracteristicasFutbolerasCharts
                                                 min={0}
                                                 max={5}
                                                 steps={1}
                                                 labels={CaracteristicaFutbolerasValores.map(cf => cf.nombre)}
                                                 valores={CaracteristicaFutbolerasValores.map(cf => cf.puntaje)}
                                            />
                                            </div>
                                        </div>
                                    }
                                    {VideosJugador.length !== 0 &&
                                        <div className="col cards-ficha" data-aos="zoom-in" data-aos-once="true">
                                            <div className="in-div-card-ficha estadisticas">
                                                <div className='div-videoJugador'>
                                                    <Swiper
                                                        pagination={pagination}
                                                        modules={[Pagination]}
                                                        className="videos-jugador"
                                                    >
                                                        {VideosJugador.map(vj => {
                                                            return (
                                                                vj.multimedia_archivo_url_youtube ?
                                                                    <SwiperSlide key={vj.vit_jugador_multimedia_id}>
                                                                        <iframe
                                                                            title={vj.vit_jugador_multimedia_id}
                                                                            type="text/html"
                                                                            className='react-player'
                                                                            src={"https://www.youtube.com/embed/" + obtenerIdVideo(vj.multimedia_archivo_url_youtube) + "?enablejsapi=1&origin=" + document.location.origin}
                                                                            allowFullScreen={true}
                                                                        >
                                                                        </iframe>
                                                                    </SwiperSlide>
                                                                    :
                                                                    <div key={vj.vit_jugador_multimedia_id}></div>
                                                            )
                                                        })}

                                                    </Swiper>
                                                </div>
                                            </div>
                                        </div>
                                    }
                                    {InstitucionesJugador.length !== 0 &&
                                        <div className="col-12 cards-ficha3" data-aos="zoom-in" data-aos-once="true">
                                            <div className="in-div-card-ficha estadisticas">
                                                <div className='Titulo'>CARRERA DEPORTIVA</div>
                                                <table className="table">
                                                    <thead>
                                                        <tr>
                                                            <th className="min" scope="col">INICIO</th>
                                                            <th className="min" scope="col">FIN</th>
                                                            <th className="min">LOGO</th>
                                                            <th className="max" scope="col">CLUB</th>
                                                            <th className="min" scope="col">NIVEL</th>
                                                            <th className="min" scope="col">PAIS</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {InstitucionesJugador.map((ij) => {
                                                            return (
                                                                <tr key={ij.vit_jugador_institucion_id}>
                                                                    <td >{DarFormatoFecha(ij.fecha_inicio)}</td>
                                                                    <td>{ij.flag_actual === 1 || !ij.fecha_fin ? "Actualidad" : DarFormatoFecha(ij.fecha_fin)} </td>
                                                                    <td><img height={30} src={ij.logo ? ij.logo : DEFAULT_IMAGES.ESCUDO_CLUB} alt=''></img></td>
                                                                    <td>
                                                                        {ij.nombre_institucion}
                                                                        {(() => {
                                                                            const verificado = Number(ij.flag_verificado);
                                                                            const estado = Number(ij.estado_verificacion);
                                                                            if (verificado === 1 || estado === 2) {
                                                                                return <span className="badge bg-success ms-2" style={{ fontSize: '0.7rem' }}>Verificado</span>;
                                                                            } else if (estado === 3) {
                                                                                return <span className="badge bg-danger ms-2" style={{ fontSize: '0.7rem' }}>Rechazado</span>;
                                                                            } else if (estado === 0 && ij.vit_institucion_id) {
                                                                                return <span className="badge bg-warning text-dark ms-2" style={{ fontSize: '0.7rem' }}>En proceso</span>;
                                                                            } else {
                                                                                return <span className="badge bg-secondary ms-2" style={{ fontSize: '0.7rem' }}>No verificado</span>;
                                                                            }
                                                                        })()}
                                                                    </td>
                                                                    <td>{ij.nombre_nivel}</td>
                                                                    <td>{ij.codigo_pais ? <img height={20} src={`https://flagcdn.com/w80/${ij.codigo_pais.toLowerCase()}.png`} alt={ij.nombre_pais}></img> : '-'}</td>
                                                                </tr>
                                                            )
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    }
                                    {LogrosJugador.length !== 0 &&
                                        <div className="col-12 cards-ficha3" data-aos="zoom-in" data-aos-once="true">
                                            <div className="in-div-card-ficha estadisticas">
                                                <div className='Titulo'>LOGROS</div>
                                                <table className="table">
                                                    <thead>
                                                        <tr>
                                                            <th className="min" scope="col">AÑO</th>
                                                            <th className="max" scope="col">TORNEO</th>
                                                            <th className="min">PAIS</th>
                                                            <th className="max" scope="col">LOGRO</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {LogrosJugador.map((lj) => {
                                                            return (
                                                                <tr key={lj.vit_palmares_id}>
                                                                    <td >{lj.anno}</td>
                                                                    <td>{lj.torneo} </td>
                                                                    <td><img height={20} src={`https://flagcdn.com/w80/${lj.codigo_pais.toLowerCase()}.png`} alt={lj.nombre_pais}></img></td>
                                                                    <td>{lj.logro}</td>
                                                                </tr>
                                                            )
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    }
                                    {/* Sección de notas/comentarios - visible para todos */}
                                    <div className="col-12 cards-ficha3 notas-del-club-card" data-aos="zoom-in" data-aos-once="true">
                                        <div className="in-div-card-ficha estadisticas notas-del-club-inner">
                                            <div className="notas-del-club-titulo">
                                                <i className="fa-solid fa-sticky-note me-2" style={{ color: 'var(--accent-color, #ef8700)' }}></i>
                                                <span>Notas del club</span>
                                            </div>

                                            {/* Input para nuevo comentario - solo para usuarios del club */}
                                            {esUsuarioClub && (
                                                <div className="d-flex gap-2 mb-3">
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm"
                                                        placeholder="Escribir una nota sobre este jugador..."
                                                        value={nuevoComentario}
                                                        onChange={(e) => setNuevoComentario(e.target.value)}
                                                        onKeyDown={(e) => { if (e.key === 'Enter') handleAgregarComentario(); }}
                                                        maxLength={1000}
                                                        disabled={enviandoComentario}
                                                    />
                                                    <button
                                                        className="btn btn-sm btn-primary"
                                                        onClick={handleAgregarComentario}
                                                        disabled={!nuevoComentario.trim() || enviandoComentario}
                                                    >
                                                        {enviandoComentario ? (
                                                            <span className="spinner-border spinner-border-sm" role="status"></span>
                                                        ) : (
                                                            <i className="fa-solid fa-paper-plane"></i>
                                                        )}
                                                    </button>
                                                </div>
                                            )}

                                            {/* Lista de comentarios */}
                                            {cargandoComentarios ? (
                                                <div className="text-center py-4">
                                                    <span className="spinner-border spinner-border-sm text-primary" role="status"></span>
                                                </div>
                                            ) : comentarios.length === 0 ? (
                                                <div className="notas-del-club-empty">
                                                    <i className="fa-regular fa-note-sticky"></i>
                                                    <p className="mb-0">Sin notas todav&iacute;a</p>
                                                </div>
                                            ) : (
                                                <div className="notas-del-club-list" style={{ maxHeight: 300, overflowY: 'auto' }}>
                                                    {comentarios.map((c) => (
                                                        <div key={c.vit_jugador_comentario_club_id} className="nota-del-club-item">
                                                            <img
                                                                className="nota-del-club-logo"
                                                                src={c.logo_club || DEFAULT_IMAGES.ESCUDO_CLUB}
                                                                alt={c.nombre_club || 'Club'}
                                                            />
                                                            <div className="nota-del-club-item-body">
                                                                <p className="nota-del-club-texto">{c.comentario}</p>
                                                                <div className="nota-del-club-meta">
                                                                    <span className="nota-del-club-autor">{c.autor_nombres} {c.autor_apellidos}</span>
                                                                    {c.rol_nombre && <span className="nota-del-club-badge nota-del-club-badge-rol">{c.rol_nombre}</span>}
                                                                    {c.nombre_club && <span className="nota-del-club-badge nota-del-club-badge-club">{c.nombre_club}</span>}
                                                                    <span className="nota-del-club-fecha">&middot; {formatFechaComentario(c.fecha)}</span>
                                                                </div>
                                                            </div>
                                                            {currentUser && String(c.autor_jugador_id) === String(currentUser.vit_jugador_id) && (
                                                                <button
                                                                    type="button"
                                                                    className="nota-del-club-btn-delete"
                                                                    onClick={() => handleEliminarComentario(c.vit_jugador_comentario_club_id)}
                                                                    title="Eliminar nota"
                                                                >
                                                                    <i className="fa-solid fa-trash"></i>
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                    :
                    <div className='out-div-seccion ficha-jugador'>
                        <div className="error-div">
                            <div className="img-error-player">
                                <img src={DEFAULT_IMAGES.PLAYER} className='' alt="..." />
                            </div>
                            <h3 className='error-msg'>No se encontró lo que buscabas</h3>
                            <Link to={previusURL}><span className='icon-flecha2'></span> Volver</Link>
                        </div>
                    </div>
            }
        </>
    );
}

export default FichaJugador;
