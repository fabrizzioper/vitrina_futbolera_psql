import React, { useEffect, useRef, useState } from 'react';
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


import CardJugador from '../Jugadores/CardJugador';
import CardTorneoInicio from '../Torneos/CardTorneoInicio';
import CardTecnico from '../Tecnicos/CardTecnico';
import CardClubes from '../Clubes/CardClubes';
import { listarMarketplace } from '../../../Funciones/TorneoService';



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
    const [DatosTorneos, setDatosTorneos] = useState([]);
    const [DatosTecnicos, setDatosTecnicos] = useState([]);
    const [DatosInstituciones, setDatosInstituciones] = useState([]);

    const { Request, RandomNumberImg } = useAuth();

    const [IsloadingJugadores, setIsloadingJugadores] = useState(true);
    const [IsloadingTorneos, setIsloadingTorneos] = useState(true);
    const [IsloadingTecnicos, setIsloadingTecnicos] = useState(true);
    const [IsloadingClubes, setIsloadingClubes] = useState(true);

    const swiperJugadoresRef = useRef(null);
    const swiperTorneosRef = useRef(null);
    const swiperTecnicosRef = useRef(null);
    const swiperClubesRef = useRef(null);

    useEffect(() => {
        let isMounted = true;

        if (!Request?.Dominio) {
            setIsloadingJugadores(false);
            setIsloadingTorneos(false);
            setIsloadingTecnicos(false);
            setIsloadingClubes(false);
            return;
        }

        setIsloadingJugadores(true);
        setIsloadingTorneos(true);
        setIsloadingTecnicos(true);
        setIsloadingClubes(true);

        // Cargar jugadores, torneos, tecnicos y clubes de forma independiente
        Promise.allSettled([
            fetchData(Request, "tarjetas_jugadores", [{ nombre: "dato", envio: 10 }]),
            listarMarketplace(Request),
            fetchData(Request, "tarjetas_tecnicos", [{ nombre: "dato", envio: 10 }]),
            fetchData(Request, "institucion_lista", [{ nombre: "pais", envio: "" }, { nombre: "dato", envio: 10 }])
        ]).then(([resultJugadores, resultTorneos, resultTecnicos, resultInstituciones]) => {
            if (!isMounted) return;
            if (resultJugadores.status === 'fulfilled') {
                setDatosJugadores(normalizarLista(resultJugadores.value));
            }
            if (resultTorneos.status === 'fulfilled') {
                const torneosData = resultTorneos.value?.data?.data || [];
                setDatosTorneos(torneosData);
            }
            if (resultTecnicos.status === 'fulfilled') {
                setDatosTecnicos(normalizarLista(resultTecnicos.value));
            }
            if (resultInstituciones.status === 'fulfilled') {
                setDatosInstituciones(normalizarLista(resultInstituciones.value));
            }
        }).catch(() => {
            if (isMounted) {
                setDatosJugadores([]);
                setDatosTorneos([]);
                setDatosTecnicos([]);
                setDatosInstituciones([]);
            }
        }).finally(() => {
            if (isMounted) {
                setIsloadingJugadores(false);
                setIsloadingTorneos(false);
                setIsloadingTecnicos(false);
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
                    <button type="button" className="inicio-swiper-btn inicio-swiper-prev jugadores" aria-label="Anterior" onClick={() => swiperJugadoresRef.current?.slidePrev()} />
                    <button type="button" className="inicio-swiper-btn inicio-swiper-next jugadores" aria-label="Siguiente" onClick={() => swiperJugadoresRef.current?.slideNext()} />
                    <Swiper
                        onSwiper={(swiper) => { swiperJugadoresRef.current = swiper; }}
                        slidesPerView="auto"
                        spaceBetween={8}
                        loop={DatosJugadores.length > 0}
                        allowTouchMove={false}
                        simulateTouch={false}
                        className="seccion-jugadores"
                    >
                        {IsloadingJugadores ? (
                            [...Array(6)].map((_, i) => (
                                <SwiperSlide key={`loader-j-${i}`}>
                                    <div className='centrar out-modal-player Loader'>
                                        <div className='div-modal-player'>
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
                </div>

            </div>
            <div className='seccion'>
                <div className='header'>
                    <h5 className='d-flex'>TORNEOS & CAMPEONATOS</h5>
                    <Link to={"/torneos"} state={{ from: location }}>Ver todo <span className='icon-flecha1'></span></Link>
                </div>
                <div className="out-seccion-torneos">
                    <button type="button" className="inicio-swiper-btn inicio-swiper-prev torneos" aria-label="Anterior" onClick={() => swiperTorneosRef.current?.slidePrev()} />
                    <button type="button" className="inicio-swiper-btn inicio-swiper-next torneos" aria-label="Siguiente" onClick={() => swiperTorneosRef.current?.slideNext()} />
                    <Swiper
                        onSwiper={(swiper) => { swiperTorneosRef.current = swiper; }}
                        slidesPerView="auto"
                        spaceBetween={8}
                        loop={DatosTorneos.length > 3}
                        allowTouchMove={false}
                        simulateTouch={false}
                        className="seccion-torneos-inicio"
                    >
                        {IsloadingTorneos ? (
                            [...Array(5)].map((_, i) => (
                                <SwiperSlide key={`loader-t-${i}`}>
                                    <div className="card-torneo-inicio" style={{ opacity: 0.5 }}>
                                        <div className="card-torneo-inicio-img">
                                            <div style={{ width: '100%', height: '100%', background: 'var(--card-section-bg, #e0e0e0)' }}></div>
                                        </div>
                                        <div className="card-torneo-inicio-body">
                                            <div style={{ width: '80%', height: 12, background: 'var(--card-section-bg, #e0e0e0)', borderRadius: 4 }}></div>
                                            <div style={{ width: '60%', height: 10, background: 'var(--card-section-bg, #e0e0e0)', borderRadius: 4, marginTop: 4 }}></div>
                                        </div>
                                    </div>
                                </SwiperSlide>
                            ))
                        ) : DatosTorneos.length > 0 ? (
                            DatosTorneos.map((data, index) => (
                                <SwiperSlide key={data.vit_torneo_id}>
                                    <CardTorneoInicio data={data} index={index} />
                                </SwiperSlide>
                            ))
                        ) : (
                            <SwiperSlide>
                                <div style={{ padding: '20px 10px', color: 'var(--text-secondary, #7f8c8d)', fontSize: '0.85rem' }}>
                                    No hay torneos disponibles. <Link to="/torneo/crear" style={{ color: '#ef8700' }}>Crea el primero</Link>
                                </div>
                            </SwiperSlide>
                        )}
                    </Swiper>
                </div>
            </div>
            <div className='seccion seccion-tecnicos-inicio'>
                <div className='header'>
                    <h5 className='d-flex'>TÉCNICOS DESTACADOS</h5>
                    <Link to={"/tecnicos"} state={{ from: location }}>Ver todo <span className='icon-flecha1'></span></Link>
                </div>
                <div className="out-seccion-clubes out-seccion-tecnicos">
                    <button type="button" className="inicio-swiper-btn inicio-swiper-prev tecnicos" aria-label="Anterior" onClick={() => swiperTecnicosRef.current?.slidePrev()} />
                    <button type="button" className="inicio-swiper-btn inicio-swiper-next tecnicos" aria-label="Siguiente" onClick={() => swiperTecnicosRef.current?.slideNext()} />
                    <Swiper
                        onSwiper={(swiper) => { swiperTecnicosRef.current = swiper; }}
                        slidesPerView="auto"
                        spaceBetween={8}
                        loop={DatosTecnicos.length > 0}
                        allowTouchMove={false}
                        simulateTouch={false}
                        className="seccion-clubes seccion-tecnicos"
                    >
                        {IsloadingTecnicos ? (
                            [...Array(8)].map((_, i) => (
                                <SwiperSlide key={`loader-dt-${i}`}>
                                    <div className="card-club">
                                        <div className='club-loader'></div>
                                    </div>
                                </SwiperSlide>
                            ))
                        ) : DatosTecnicos.length > 0 ? (
                            DatosTecnicos.map(data => (
                                <SwiperSlide key={data.vit_jugador_id}>
                                    <CardTecnico
                                        data={data}
                                        numeroRandom={RandomNumberImg}
                                    />
                                </SwiperSlide>
                            ))
                        ) : (
                            <SwiperSlide>
                                <div style={{ padding: '20px 10px', color: 'var(--text-secondary, #7f8c8d)', fontSize: '0.85rem' }}>
                                    No hay técnicos registrados aún.
                                </div>
                            </SwiperSlide>
                        )}
                    </Swiper>
                </div>
            </div>
            <div className='seccion'>
                <div className='header'>
                    <h5 className='d-flex'>CLUBES & ACADEMIAS</h5>
                    <Link to={"/clubes"} state={{ from: location }}>Ver todo <span className='icon-flecha1'></span></Link>
                </div>
                <div className="out-seccion-clubes">
                    <button type="button" className="inicio-swiper-btn inicio-swiper-prev clubes" aria-label="Anterior" onClick={() => swiperClubesRef.current?.slidePrev()} />
                    <button type="button" className="inicio-swiper-btn inicio-swiper-next clubes" aria-label="Siguiente" onClick={() => swiperClubesRef.current?.slideNext()} />
                    <Swiper
                        onSwiper={(swiper) => { swiperClubesRef.current = swiper; }}
                        slidesPerView="auto"
                        spaceBetween={8}
                        loop={DatosInstituciones.length > 0}
                        allowTouchMove={false}
                        simulateTouch={false}
                        className="seccion-clubes"
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
                </div>
            </div>
        </div>
    );
}

export default Inicio;
