import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../Context/AuthContext';
import "./inicio.css"
import img1 from "../../../imagenes/carrusel-img-4.jpg";
import img2 from "../../../imagenes/carrusel-img-2.jpg";
import img3 from "../../../imagenes/carrusel-img-3.jpg";
import { fetchData } from '../../../Funciones/Funciones';

// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";


// import required modules
import { Navigation, Pagination } from "swiper";
import LoaderCardJugador from '../Jugadores/LoaderCardJugador';
import CardJugador from '../Jugadores/CardJugador';
import CardClubes from '../Clubes/CardClubes';
import LoaderClub from '../Clubes/LoaderClub';



const Inicio = () => {
    const location = useLocation();
    const [DatosJugadores, setDatosJugadores] = useState([]);
    const [DatosInstituciones, setDatosInstituciones] = useState([]);

    const { Request, RandomNumberImg } = useAuth();

    const [Isloading, setIsloading] = useState(true);

    useEffect(() => {
        // Se crea una variable isMounted con el valor inicial de true
        let isMounted = true;

        // Se activa el indicador de carga
        setIsloading(true);

        // Se crea una promesa con dos llamadas fetchData que retornan datos de la API
        Promise.all([
            fetchData(Request, "tarjetas_jugadores", [{ nombre: "dato", envio: 10 }]),
            fetchData(Request, "institucion_lista", [{ nombre: "pais", envio: "" },{ nombre: "dato", envio: 10 }])
        ])
            .then(([jugadores, instituciones]) => {
                // Se verifica si el componente está montado antes de actualizar el estado
                if (isMounted && jugadores && instituciones) {
                    setDatosJugadores(jugadores)
                    setDatosInstituciones(instituciones)
                }

            }).finally(() => {
                // Se desactiva el indicador de carga
                setIsloading(false);
            })

        // Se retorna una función que se ejecuta cuando el componente se desmonta
        return () => {
            // Se actualiza la variable isMounted a false cuando el componente se desmonta
            isMounted = false;
        };


    }, [Request]);

    const Navigate = useNavigate();

    return (
        <div className='out-div-seccion inicio'>
            <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center" data-aos="zoom-in">
                <div id="carouselExampleControls" className="carousel slide shadow-sm" data-bs-ride="carousel">
                    <div className="carousel-inner">
                        <div className="carousel-item torneo-img active overlay overlay-dark"onClick={()=> Navigate("/torneos/1")} ><img src={img1} alt="" /></div>
                        <div className="carousel-item overlay overlay-dark" ><img src={img2} alt="" /></div>
                        <div className="carousel-item overlay overlay-dark" ><img src={img3} alt="" /></div>
                    </div>
                    <button className="carousel-control-prev" type="button" data-bs-target="#carouselExampleControls" data-bs-slide="prev">
                        <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                        <span className="visually-hidden">Previous</span>
                    </button>
                    <button className="carousel-control-next" type="button" data-bs-target="#carouselExampleControls" data-bs-slide="next">
                        <span className="carousel-control-next-icon" aria-hidden="true"></span>
                        <span className="visually-hidden">Next</span>
                    </button>
                </div>
            </div>
            <div className='seccion'>
                <div className='header'>
                    <h5 className='d-flex' >Jugadores</h5>
                    <Link to={"/jugadores"} state={{ from: location }}>Ver todo <span className='icon-flecha1'></span></Link>
                </div>
                <div className="out-seccion-jugadores">
                    <div className="degradado1"></div>
                    <Swiper
                        slidesPerView={"auto"}
                        pagination={{
                            clickable: true,
                        }}
                        modules={[Navigation, Pagination]}
                        className="seccion-jugadores shadow-sm"
                    >
                        {!Isloading ?

                            DatosJugadores.map(data => {

                                return (
                                    <SwiperSlide key={data.vit_jugador_id}>
                                        <CardJugador
                                            key={data.vit_jugador_id}
                                            numeroRandom={RandomNumberImg}
                                            data={data}
                                        />
                                    </SwiperSlide>
                                )
                            })
                            :
                            <LoaderCardJugador />
                        }
                    </Swiper>
                    <div className="degradado2"></div>
                </div>

            </div>
            <div className='seccion'>
                <div className='header'>
                    <h5 className='d-flex' >Clubes & Academias</h5>
                    <Link to={"/clubes"} state={{ from: location }}>Ver todo <span className='icon-flecha1'></span></Link>
                </div>
                <div className="out-seccion-clubes">
                    <div className="degradado1"> </div>
                    <Swiper
                        slidesPerView={"auto"}
                        pagination={{
                            clickable: true,
                        }}
                        modules={[Navigation, Pagination]}
                        className="seccion-clubes shadow-sm"
                    >
                        {!Isloading ?

                            DatosInstituciones.map(data => {

                                return (
                                    <SwiperSlide key={data.vit_institucion_id}>
                                        <CardClubes
                                            key={data.vit_institucion_id}
                                            data={data}
                                        />
                                    </SwiperSlide>
                                )
                            })
                            :
                            <LoaderClub />
                        }
                    </Swiper>
                    <div className="degradado2"></div>
                </div>
            </div>
        </div>
    );
}

export default Inicio;
