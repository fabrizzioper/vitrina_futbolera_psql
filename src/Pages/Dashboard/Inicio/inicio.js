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


// import required modules (solo navegación con flechas, sin puntitos)
import { Navigation } from "swiper";
import "swiper/css/navigation";
import CardJugador from '../Jugadores/CardJugador';
import CardClubes from '../Clubes/CardClubes';



// Normaliza la respuesta de la API: si es array la devuelve, si es objeto con lista/items/data la extrae, si no []
function normalizarLista(res) {
    if (Array.isArray(res)) return res;
    if (res && typeof res === 'object') {
        if (Array.isArray(res.lista)) return res.lista;
        if (Array.isArray(res.data)) return res.data;
        if (Array.isArray(res.items)) return res.items;
    }
    return [];
}

const Inicio = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [DatosJugadores, setDatosJugadores] = useState([]);
    const [DatosInstituciones, setDatosInstituciones] = useState([]);

    const { Request, RandomNumberImg } = useAuth();

    const [IsloadingJugadores, setIsloadingJugadores] = useState(true);
    const [IsloadingClubes, setIsloadingClubes] = useState(true);

    useEffect(() => {
        let isMounted = true;

        if (!Request?.Dominio) {
            setIsloadingJugadores(false);
            setIsloadingClubes(false);
            return;
        }

        setIsloadingJugadores(true);
        setIsloadingClubes(true);

        // Cargar jugadores y clubes de forma independiente para que uno no bloquee al otro
        Promise.allSettled([
            fetchData(Request, "tarjetas_jugadores", [{ nombre: "dato", envio: 10 }]),
            fetchData(Request, "institucion_lista", [{ nombre: "pais", envio: "" }, { nombre: "dato", envio: 10 }])
        ]).then(([resultJugadores, resultInstituciones]) => {
            if (!isMounted) return;
            if (resultJugadores.status === 'fulfilled') {
                setDatosJugadores(normalizarLista(resultJugadores.value));
            }
            if (resultInstituciones.status === 'fulfilled') {
                setDatosInstituciones(normalizarLista(resultInstituciones.value));
            }
        }).catch(() => {
            if (isMounted) {
                setDatosJugadores([]);
                setDatosInstituciones([]);
            }
        }).finally(() => {
            if (isMounted) {
                setIsloadingJugadores(false);
                setIsloadingClubes(false);
            }
        });

        return () => { isMounted = false; };
    }, [Request]);

    return (
        <div className='out-div-seccion inicio'>
            <div className="hero-section" data-aos="zoom-in">
                <div id="carouselExampleControls" className="carousel slide shadow-sm" data-bs-ride="carousel">
                    <div className="carousel-inner">
                        <div className="carousel-item active" onClick={() => navigate("/torneos/1")}><img src={img1} alt="" /></div>
                        <div className="carousel-item"><img src={img2} alt="" /></div>
                        <div className="carousel-item"><img src={img3} alt="" /></div>
                    </div>
                    <div className="hero-overlay">
                        <h1>Descubre el Talento del Fútbol Formativo</h1>
                        <p className="hero-subtitle">La plataforma de scouting que conecta jugadores emergentes con clubes y academias de toda Latinoamérica</p>
                        <Link to="/jugadores" className="btn btn-primary hero-cta">Explorar Jugadores <span className='icon-flecha1'></span></Link>
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
                    <h5 className='d-flex'>JUGADORES DESTACADOS</h5>
                    <Link to={"/jugadores"} state={{ from: location }}>Ver todo <span className='icon-flecha1'></span></Link>
                </div>
                <div className="out-seccion-jugadores">
                    <div className="degradado1"></div>
                    <Swiper
                        slidesPerView="auto"
                        spaceBetween={8}
                        loop={DatosJugadores.length > 0}
                        navigation
                        modules={[Navigation]}
                        className="seccion-jugadores shadow-sm"
                    >
                        {IsloadingJugadores ? (
                            [...Array(6)].map((_, i) => (
                                <SwiperSlide key={`loader-j-${i}`}>
                                    <div className='centrar out-modal-player Loader'>
                                        <div className='div-modal-player shadow-sm'>
                                            <div className='Loader-head-Jugador'><div className='loader-animacion content-head'></div></div>
                                            <div className='Loader-body-Jugador'><div className='loader-animacion content-body'></div><div className='subcontent-div'><div className='loader-animacion subcontent-body-date'></div><div className='loader-animacion subcontent-body-year'></div></div></div>
                                        </div>
                                    </div>
                                </SwiperSlide>
                            ))
                        ) : (
                            DatosJugadores.map(data => (
                                <SwiperSlide key={data.vit_jugador_id}>
                                    <CardJugador
                                        numeroRandom={RandomNumberImg}
                                        data={data}
                                    />
                                </SwiperSlide>
                            ))
                        )}
                    </Swiper>
                    <div className="degradado2"></div>
                </div>

            </div>
            <div className='seccion'>
                <div className='header'>
                    <h5 className='d-flex'>CLUBES & ACADEMIAS</h5>
                    <Link to={"/clubes"} state={{ from: location }}>Ver todo <span className='icon-flecha1'></span></Link>
                </div>
                <div className="out-seccion-clubes">
                    <div className="degradado1"> </div>
                    <Swiper
                        slidesPerView="auto"
                        spaceBetween={8}
                        loop={DatosInstituciones.length > 0}
                        navigation
                        modules={[Navigation]}
                        className="seccion-clubes shadow-sm"
                    >
                        {IsloadingClubes ? (
                            [...Array(8)].map((_, i) => (
                                <SwiperSlide key={`loader-c-${i}`}>
                                    <div className="card-club">
                                        <div className='club-loader'></div>
                                    </div>
                                </SwiperSlide>
                            ))
                        ) : (
                            DatosInstituciones.map(data => (
                                <SwiperSlide key={data.vit_institucion_id}>
                                    <CardClubes data={data} />
                                </SwiperSlide>
                            ))
                        )}
                    </Swiper>
                    <div className="degradado2"></div>
                </div>
            </div>
        </div>
    );
}

export default Inicio;
