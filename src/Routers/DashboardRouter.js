import React, { useState } from 'react';
import { Route, Routes, Link } from 'react-router-dom';
import SlideBar from '../Componentes/slideBar';
import SlideNavBar from '../Componentes/slideNavBar';
import NavbarClubesMarquee from '../Componentes/NavbarClubesMarquee';
import logo from "../imagenes/logo-vitrina.png";
import Clubes from '../Pages/Dashboard/Clubes/Clubes';
import FichaClub from '../Pages/Dashboard/Clubes/FichaClub';
import Contacto from '../Pages/Dashboard/contacto/contacto';
import "../Pages/Dashboard/dashboard.css"
import Inicio from '../Pages/Dashboard/Inicio/inicio';
import FichaJugador from '../Pages/Dashboard/Jugadores/FichaJugador';
import Jugadores from '../Pages/Dashboard/Jugadores/jugadores';
import MiPerfil from '../Pages/Dashboard/MiPerfil/Jugador/miPerfil';
import Redireccion from '../Pages/Dashboard/Redireccion';
import Torneos from '../Pages/Dashboard/Torneos/Torneos';

const DashboardRouter = () => {
    const [Btnstate, setBtnstate] = useState(false);

    return (
        <div className='body-dashboard' >
            <div className="container-fluid">
                <div className="div-body">
                    <SlideBar
                        setBtnstate={setBtnstate}
                        Btnstate={Btnstate}
                    />
                    <div className='div-main'>
                        <div className="navbar-row">
                            <Link className="navbar-mobile-logo" to="/inicio">
                                <img src={logo} alt="logo Vitrina Futbolera" height={32} />
                            </Link>
                            <div className="navbar-clubes-marquee-wrap">
                                <NavbarClubesMarquee />
                            </div>
                            <SlideNavBar />
                            <button className="navbar-mobile-hamburger" onClick={() => setBtnstate(true)} type="button" aria-label="Abrir menú">
                                <i className="fa-solid icon-three-horizontal-lines-icon"></i>
                            </button>
                        </div>
                        <main className="ms-sm-auto px-md-4 px-2 main p-2 pb-5">
                            <Routes>
                                <Route exact path="/" element={<Redireccion />} />
                                <Route exact path="inicio" element={<Inicio />} />
                                <Route exact path="torneos" element={<Torneos />} />
                                <Route exact path="torneos/:id" element={<Torneos />} />
                                <Route exact path="jugadores" element={<Jugadores />} />
                                <Route exact path="ficha/:id" element={<FichaJugador />} />
                                <Route exact path="contacto" element={<Contacto />} />
                                <Route exact path="clubes" element={<Clubes />} />
                                <Route exact path="club/:id" element={<FichaClub />} />
                                <Route exact path="editar/perfil" element={<MiPerfil />} />
                            </Routes>
                        </main>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DashboardRouter;
