import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../../../Context/AuthContext';
import { DarFormatoFecha, fetchData, getFotoUrl } from '../../../Funciones/Funciones';
import { DEFAULT_IMAGES } from '../../../Funciones/DefaultImages';
import { obtenerEstadisticasJugador } from '../../../Funciones/TorneoService';
import "./ficha.css";
import CaracteristicasFutbolerasCharts from '../../../Componentes/RadarChart/caracteristicasFutbolerasCharts';
import FichaCardModal from './FichaCard/FichaCardModal';


const FichaJugador = () => {
    const [JugadorFicha, setJugadorFicha] = useState([]);
    const [CaracteristicaFutbolerasValores, setCaracteristicaFutbolerasValores] = useState([]);
    const [InstitucionesJugador, setInstitucionesJugador] = useState([]);
    const [LogrosJugador, setLogrosJugador] = useState([]);
    const [VideosJugador, setVideosJugador] = useState([]);
    const [videosVisiblesCount, setVideosVisiblesCount] = useState(4);
    const { Request, RandomNumberImg, clubData, currentUser, Alerta } = useAuth();
    let { id } = useParams();
    const location = useLocation();
    let previusURL = location.state?.from.pathname || "/"

    // --- Comentarios del club ---
    const [comentarios, setComentarios] = useState([]);
    const [cargandoComentarios, setCargandoComentarios] = useState(false);
    const [nuevoComentario, setNuevoComentario] = useState('');
    const [enviandoComentario, setEnviandoComentario] = useState(false);

    const [showFichaModal, setShowFichaModal] = useState(false);
    const [estadisticasTorneo, setEstadisticasTorneo] = useState([]);
    const esUsuarioClub = clubData && clubData.vit_institucion_id;

    const cargarComentarios = useCallback((jugId) => {
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
    }, [Request]);

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
        setVideosVisiblesCount(4);
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

            }).catch(() => {});
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
        obtenerEstadisticasJugador(Request, id).then(res => {
            setEstadisticasTorneo(res.data.data || []);
        }).catch(() => {});
    }, [Request, id, cargarComentarios]);

    function calcularEdad(fechaNac) {
        if (!fechaNac) return null;
        const hoy = new Date();
        const nac = new Date(fechaNac);
        let edad = hoy.getFullYear() - nac.getFullYear();
        const m = hoy.getMonth() - nac.getMonth();
        if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
        return edad;
    }

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

    // Preferir URL de descarga del backend (des_foto_perfil) si viene; si no, usar foto_perfil
    const fotoPerfilUrl = getFotoUrl(JugadorFicha?.des_foto_perfil || JugadorFicha?.foto_perfil, Request?.Dominio);
    const srcPerfil = fotoPerfilUrl ? fotoPerfilUrl + "?random=" + RandomNumberImg : DEFAULT_IMAGES.CARA_USUARIO;

    // Club actual del jugador (para mostrar en hero)
    const clubActual = (InstitucionesJugador || []).find(i => Number(i.flag_actual) === 1);
    const clubVerificado = clubActual && (Number(clubActual.flag_verificado) === 1 || Number(clubActual.estado_verificacion) === 2);

    return (
        <>
            {
                JugadorFicha ?
                    <>

                        <div className='out-div-seccion '>
                            <div className='header-ficha'>
                                <Link className='Volver-link' to={previusURL}><span className='icon-flecha2'></span>Volver</Link>
                                <button className='div-icon-reporte' onClick={() => setShowFichaModal(true)}>
                                    <i className="fa-solid fa-id-card"></i> Generar Ficha
                                </button>
                            </div>
                            <div className="ficha-jugador">
                                {/* Hero Section */}
                                <div className="ficha-hero" data-aos="fade-up" data-aos-once="true">
                                    <div className="ficha-hero-cols">
                                        {/* Columna izquierda: foto + nombre */}
                                        <div className="ficha-hero-left">
                                            <div className="ficha-foto-wrapper">
                                                <img src={srcPerfil} alt="Foto de perfil" referrerPolicy="no-referrer"
                                                    onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_IMAGES.CARA_USUARIO; }} />
                                            </div>
                                            <div className="ficha-hero-info">
                                                <h1 className="ficha-nombre">
                                                    {JugadorFicha.jugador_nombres || ''} {JugadorFicha.jugador_apellidos || ''}
                                                </h1>
                                                {JugadorFicha.posicion && (
                                                    <span className="ficha-posicion-badge">{JugadorFicha.cod_posicion} · {JugadorFicha.posicion}</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Columna centro: datos básicos */}
                                        {(JugadorFicha.jugador_fecha_nacimiento || JugadorFicha.jugador_estatura_cm) && (
                                            <div className="ficha-datos-basicos">
                                                {JugadorFicha.jugador_fecha_nacimiento && (
                                                    <div className="ficha-dato-item">
                                                        <span className="ficha-dato-label">F. Nacim./Edad</span>
                                                        <span className="ficha-dato-valor">
                                                            {DarFormatoFecha(JugadorFicha.jugador_fecha_nacimiento)}
                                                            {calcularEdad(JugadorFicha.jugador_fecha_nacimiento) !== null && (
                                                                <span className="ficha-dato-edad"> ({calcularEdad(JugadorFicha.jugador_fecha_nacimiento)})</span>
                                                            )}
                                                        </span>
                                                    </div>
                                                )}
                                                {JugadorFicha.jugador_lugar_nacimiento && (
                                                    <div className="ficha-dato-item">
                                                        <span className="ficha-dato-label">Lugar de nac.</span>
                                                        <span className="ficha-dato-valor">{JugadorFicha.jugador_lugar_nacimiento}</span>
                                                    </div>
                                                )}
                                                {JugadorFicha.jugador_estatura_cm && (
                                                    <div className="ficha-dato-item">
                                                        <span className="ficha-dato-label">Altura</span>
                                                        <span className="ficha-dato-valor">{(JugadorFicha.jugador_estatura_cm / 100).toFixed(2).replace('.', ',')} m</span>
                                                    </div>
                                                )}
                                                {JugadorFicha.jugador_peso_kg && (
                                                    <div className="ficha-dato-item">
                                                        <span className="ficha-dato-label">Peso</span>
                                                        <span className="ficha-dato-valor">{JugadorFicha.jugador_peso_kg} kg</span>
                                                    </div>
                                                )}
                                                {JugadorFicha.posicion && (
                                                    <div className="ficha-dato-item">
                                                        <span className="ficha-dato-label">Posición</span>
                                                        <span className="ficha-dato-valor">{JugadorFicha.posicion}</span>
                                                    </div>
                                                )}
                                                {JugadorFicha.pais && (
                                                    <div className="ficha-dato-item">
                                                        <span className="ficha-dato-label">Nacionalidad</span>
                                                        <span className="ficha-dato-valor">{JugadorFicha.pais}</span>
                                                    </div>
                                                )}
                                                {JugadorFicha.pais2 && (
                                                    <div className="ficha-dato-item">
                                                        <span className="ficha-dato-label">2da Nac.</span>
                                                        <span className="ficha-dato-valor">{JugadorFicha.pais2}</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Columna derecha: club actual con logo */}
                                        {clubActual && (
                                            <div className="ficha-club-card">
                                                <div className="ficha-club-card-header">
                                                    {clubActual.logo ? (
                                                        <img src={clubActual.logo} alt={clubActual.nombre_institucion}
                                                            className="ficha-club-logo"
                                                            onError={(e) => { e.target.style.display='none'; }} />
                                                    ) : (
                                                        <div className="ficha-club-logo-placeholder">
                                                            <i className="fa-solid fa-shield-halved"></i>
                                                        </div>
                                                    )}
                                                    <div className="ficha-club-card-info">
                                                        <span className="ficha-club-card-nombre">{clubActual.nombre_institucion}</span>
                                                        {clubVerificado && (
                                                            <span className="ficha-verificado-badge">
                                                                <i className="fa-solid fa-circle-check"></i> Verificado
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="ficha-club-card-datos">
                                                    <div className="ficha-dato-item">
                                                        <span className="ficha-dato-label">Fichado</span>
                                                        <span className="ficha-dato-valor">{DarFormatoFecha(clubActual.fecha_inicio) || '-'}</span>
                                                    </div>
                                                    <div className="ficha-dato-item">
                                                        <span className="ficha-dato-label">Contrato hasta</span>
                                                        <span className="ficha-dato-valor">{clubActual.fecha_fin ? DarFormatoFecha(clubActual.fecha_fin) : 'Actualidad'}</span>
                                                    </div>
                                                    {clubActual.nombre_nivel && (
                                                        <div className="ficha-dato-item">
                                                            <span className="ficha-dato-label">Liga</span>
                                                            <span className="ficha-dato-valor">{clubActual.nombre_nivel}</span>
                                                        </div>
                                                    )}
                                                    {clubActual.nombre_pais && (
                                                        <div className="ficha-dato-item">
                                                            <span className="ficha-dato-label">País</span>
                                                            <span className="ficha-dato-valor">{clubActual.nombre_pais}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Stats Bar */}
                                <div className="ficha-stats-bar" data-aos="fade-up" data-aos-once="true" data-aos-delay="100">
                                    <div className="ficha-stat">
                                        <span className="ficha-stat-label">PIE</span>
                                        <span className="ficha-stat-value">{JugadorFicha.perfil === "Derecho" ? "Diestro" : JugadorFicha.perfil === "Izquierdo" ? "Zurdo" : "-"}</span>
                                    </div>
                                    <div className="ficha-stat-divider"></div>
                                    <div className="ficha-stat">
                                        <span className="ficha-stat-label">FORMACI&Oacute;N</span>
                                        <span className="ficha-stat-value ficha-stat-highlight">{JugadorFicha.sistema_juego || '-'}</span>
                                    </div>
                                    <div className="ficha-stat-divider"></div>
                                    <div className="ficha-stat">
                                        <span className="ficha-stat-label">SANGRE</span>
                                        <span className="ficha-stat-value">{JugadorFicha.jugador_grupo_sanguineo || '-'}</span>
                                    </div>
                                    <div className="ficha-stat-divider"></div>
                                    <div className="ficha-stat">
                                        <span className="ficha-stat-label">PERFIL</span>
                                        <span className="ficha-stat-value">{JugadorFicha.talla || '-'}</span>
                                    </div>
                                </div>

                                {/* Content sections */}
                                <div className="row in-ficha-jugador gap-3">
                                    {/* Una sola fila: formación/cancha + características futboleras */}
                                    <div className="col-12">
                                        <div className="row g-3 row-ficha-dos-columnas">
                                            {
                                                JugadorFicha.posicion &&
                                                <div className="col-12 col-md-6 cards-ficha" data-aos="zoom-in" data-aos-once="true">
                                                    <div className="in-div-card-ficha ">
                                                        <div className="info info-sistemaJuego">{JugadorFicha.sistema_juego}</div>
                                                        <div className="info info-posición">
                                                            <span>{JugadorFicha.posicion}</span>
                                                            <span className='subposicion'>{JugadorFicha.subposicion}</span>
                                                        </div>

                                                        <div className={`cancha ${JugadorFicha.cod_sistema_juego}`}>
                                                            <img className='cancha-img' src="/cancha.jpg" alt="cancha" />
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
                                                <div className="col-12 col-md-6 cards-ficha" data-aos="zoom-in" data-aos-once="true">
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
                                        </div>
                                    </div>
                                    {VideosJugador.length !== 0 && (() => {
                                        const videosConYoutube = VideosJugador.filter(vj => vj.multimedia_archivo_url_youtube);
                                        const esUnSoloVideo = videosConYoutube.length === 1;
                                        const videosMostrados = esUnSoloVideo ? videosConYoutube : videosConYoutube.slice(0, videosVisiblesCount);
                                        const hayMasVideos = videosConYoutube.length > 4 && videosVisiblesCount < videosConYoutube.length;
                                        return (
                                        <div className="col-12 cards-ficha cards-ficha--videos" data-aos="zoom-in" data-aos-once="true">
                                            <div className="in-div-card-ficha estadisticas">
                                                <div className={`div-videoJugador ${esUnSoloVideo ? 'div-videoJugador--single' : 'div-videoJugador--grid'}`}>
                                                    {esUnSoloVideo ? (
                                                        <div className="video-item video-item--centered">
                                                            <iframe
                                                                title={videosConYoutube[0].vit_jugador_multimedia_id}
                                                                type="text/html"
                                                                className="react-player"
                                                                src={"https://www.youtube.com/embed/" + obtenerIdVideo(videosConYoutube[0].multimedia_archivo_url_youtube) + "?enablejsapi=1&origin=" + document.location.origin}
                                                                allowFullScreen={true}
                                                            />
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="videos-grid-dos-columnas">
                                                                {videosMostrados.map(vj => (
                                                                    <div key={vj.vit_jugador_multimedia_id} className="video-item">
                                                                        <iframe
                                                                            title={vj.vit_jugador_multimedia_id}
                                                                            type="text/html"
                                                                            className="react-player"
                                                                            src={"https://www.youtube.com/embed/" + obtenerIdVideo(vj.multimedia_archivo_url_youtube) + "?enablejsapi=1&origin=" + document.location.origin}
                                                                            allowFullScreen={true}
                                                                        />
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            {hayMasVideos && (
                                                                <div className="videos-ver-mas-wrap">
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-videos-ver-mas"
                                                                        onClick={() => setVideosVisiblesCount(prev => Math.min(prev + 4, videosConYoutube.length))}
                                                                    >
                                                                        Ver más ({videosConYoutube.length - videosVisiblesCount} más)
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        );
                                    })()}
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
                                    {/* Sección de estadísticas de torneos */}
                                    {estadisticasTorneo.length > 0 && (
                                        <div className="col-12 cards-ficha3" data-aos="zoom-in" data-aos-once="true">
                                            <div className="in-div-card-ficha estadisticas">
                                                <div className='Titulo'>ESTADÍSTICAS EN TORNEOS</div>
                                                <div style={{ overflowX: 'auto' }}>
                                                    <table className="table">
                                                        <thead>
                                                            <tr>
                                                                <th className="max" style={{ textAlign: 'left' }}>Torneo</th>
                                                                <th className="min">Cat.</th>
                                                                <th className="min">PJ</th>
                                                                <th className="min">Goles</th>
                                                                <th className="min">TA</th>
                                                                <th className="min">TR</th>
                                                                <th className="min">Min</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {estadisticasTorneo.map((e, idx) => (
                                                                <tr key={idx}>
                                                                    <td style={{ textAlign: 'left' }}>{e.torneo_nombre}</td>
                                                                    <td>{e.categoria}</td>
                                                                    <td style={{ fontWeight: 'bold' }}>{e.partidos_jugados}</td>
                                                                    <td style={{ fontWeight: 'bold', color: '#27ae60' }}>{e.goles}</td>
                                                                    <td style={{ color: '#f1c40f' }}>{e.tarjetas_amarillas}</td>
                                                                    <td style={{ color: '#e74c3c' }}>{e.tarjetas_rojas}</td>
                                                                    <td>{e.minutos_jugados}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    )}
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
                        <FichaCardModal
                            show={showFichaModal}
                            onClose={() => setShowFichaModal(false)}
                            jugador={JugadorFicha}
                            caracteristicas={CaracteristicaFutbolerasValores}
                            instituciones={InstitucionesJugador}
                            logros={LogrosJugador}
                            randomImg={RandomNumberImg}
                            comentarios={comentarios}
                        />
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
