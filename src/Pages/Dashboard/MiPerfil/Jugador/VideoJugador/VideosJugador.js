import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper";
import { useAuth } from '../../../../../Context/AuthContext';
import AgregarVideo from './AgregarVideo';
import Swal from 'sweetalert2';
import { fetchData, VolverTab } from '../../../../../Funciones/Funciones';
import { useNavigate } from 'react-router-dom';

const VideosJugador = ({ id, setFormulario }) => {
    let navigate = useNavigate();

    const { Alerta, Request, currentUser, setloading, marcarPerfilCompletado } = useAuth();
    const [Actualizar2, setActualizar2] = useState(false);
    const [VideosJugador, setVideosJugador] = useState([]);

    // AGREGAR NUEVO VIDEO VIEW
    const [ViewAgregar, setViewAgregar] = useState(0);
    const [UrlVideo, setUrlVideo] = useState("");


    // FUNCION PARA LIMPIAR LOS CAMPOS
    function LimpiarCampos() {
        setUrlVideo("")
    }

    useEffect(() => {
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
    }, [Request, id, Actualizar2]);





    // FUNCION PARA INSERTAR UN VIDEO
    function InsVideo(id, UrlVideo) {
        const patron = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=)[a-zA-Z0-9_-]{11}$/;

        if (patron.test(UrlVideo)) {
            const formdata2 = new FormData();
            formdata2.append('vit_jugador_id', id);
            formdata2.append('multimedia_tipo', "url");
            formdata2.append('multimedia_archivo', "");
            formdata2.append('multimedia_archivo_url_youtube', UrlVideo);
            formdata2.append('multimedia_fecha', "");
            formdata2.append('multimedia_titulo', "");
            formdata2.append('multimedia_descripcion', "");
            formdata2.append('estado', 1);
            axios({
                method: "post",
                url: `${Request.Dominio}/jugador_multimedia`,
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
                    setActualizar2(!Actualizar2)
                } else {
                    Alerta("error", "Ocurrio un error con el link")
                }


            }).catch(error => {
                console.log("error", error);
            });
        } else {
            Swal.fire({
                title: "¡Formato inválido!",
                html: `
                <p>Por favor usa este formato:</p>
                <p class='form-text small text-muted'>https://www.youtube.com/watch?v=XXXXXXXXXXX</p>
                `,
                icon: 'warning',
                confirmButtonColor: '#017cb9',
                cancelButtonColor: '#d33',
                background: "#0e3769",
                color: "#fff"
            })
        }

    }


    // FUNCION PARA ELIMINAR UN VIDEO
    function SupVideo(idJugador, idVideo) {
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
                formdata2.append('vit_jugador_multimedia_id', idVideo);

                axios({
                    method: "post",
                    url: `${Request.Dominio}/jugador_multimedia_sup`,
                    headers: {
                        "userLogin": Request.userLogin,
                        "userPassword": Request.userPassword,
                        "systemRoot": Request.Empresa
                    },
                    data: formdata2

                }).then(res => {
                    console.log(res);
                    if (res.data.success !== false) {
                        Alerta("success", "Se eliminó Correctamente")
                        setViewAgregar(0)
                        setActualizar2(!Actualizar2)
                    } else {
                        Alerta("error", "Ocurrio un error")
                    }


                }).catch(error => {
                    console.log("error", error);
                });

            }
        })



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
        // Si no se encuentra el ID del video en la URL, devolver null
        return null;
    }

    function CompletarPerfil() {

        if (currentUser.flag_perfil_completado) {
            navigate("/ficha/"+id)
        } else {

            setloading(true);
            Promise.all([
                fetchData(Request,
                    "flag_perfil_upd",
                    [
                        { nombre: 'jugador_email ', envio: currentUser.email },
                        { nombre: 'password ', envio: currentUser.password }
                    ]
                )
            ])
                .then(([res]) => {
                    if (res[0].Success) {
                        Alerta("success", res[0].Success)
                        setTimeout(() => {
                            marcarPerfilCompletado();
                            navigate("/ficha/" + id);
                        }, 1000);

                    }

                }).catch(error => {
                    Alerta("error", "Error al subir la información")
                    console.log(error);

                }).finally(() => {
                    // Se desactiva el indicador de carga
                    setloading(false);

                })
        }

    }


    return (
        <>
            <div className='card-body' data-aos="zoom-in">
                <h2 className="h4 fw-semibold text-center mb-0">Videos</h2>
                <p className="text-secondary text-center mb-3">Sube tus mejores jugadas</p>
                <div className='row gap-2'>
                    {ViewAgregar === 1 ?
                        <AgregarVideo
                            setViewAgregar={setViewAgregar}
                            UrlVideo={UrlVideo}
                            setUrlVideo={setUrlVideo}
                        />
                        :
                        <>
                            <div className='Out-div-btn-agregar-institucion'>
                                <button className='btn-agregar-institucion' onClick={() => { setViewAgregar(1); LimpiarCampos() }}>
                                    <div className='d-flex'><div className='icon-plus'>+</div></div>
                                    <div>Agregar link de YouTube</div>
                                </button>
                            </div>
                            {VideosJugador.length !== 0 &&
                                <div className='div-videoJugador'>
                                    <Swiper
                                        pagination={pagination}
                                        modules={[Pagination]}
                                        className="videos-jugador mi-perfil"
                                    >{VideosJugador.map(vj => {
                                        return (
                                            <SwiperSlide key={vj.vit_jugador_multimedia_id}>
                                                <div className='btn-eliminar-video' onClick={() => SupVideo(id, vj.vit_jugador_multimedia_id)}>
                                                    <i className="fa-solid fa-trash"></i>
                                                </div>
                                                {vj.multimedia_archivo_url_youtube ?
                                                    <iframe
                                                        title={vj.vit_jugador_multimedia_id}
                                                        type="text/html"
                                                        className='react-player'
                                                        src={"https://www.youtube.com/embed/" + obtenerIdVideo(vj.multimedia_archivo_url_youtube) + "?enablejsapi=1&origin=" + document.location.origin}
                                                        allowFullScreen={true}
                                                    >
                                                    </iframe>
                                                    :
                                                    <div className='btn-eliminar-video' onClick={() => SupVideo(id, vj.vit_jugador_multimedia_id)}>
                                                        <i className="fa-solid fa-trash"></i>
                                                    </div>
                                                }
                                            </SwiperSlide>
                                        )
                                    })}

                                    </Swiper>
                                </div>
                            }
                        </>
                    }
                </div>
            </div>
            {
                ViewAgregar === 1 ?
                    <div className="card-footer one-btn">
                        <div className="d-flex justify-content-between">
                            <button className="btn btn-primary" onClick={() => InsVideo(id, UrlVideo)}>Agregar</button>
                        </div>
                    </div>
                    :
                    <div className="card-footer">
                        <div className="d-flex justify-content-between">
                            <button type='button' className="btn btn-secondary" onClick={() => VolverTab(setFormulario, "Logros", "profile-tab")}>Anterior</button>
                        </div>
                        <div className="d-flex justify-content-between">
                            <div onClick={() => CompletarPerfil()} className="btn btn-primary" >Finalizar</div>
                        </div>
                    </div>
            }
        </>
    );
}

export default VideosJugador;
