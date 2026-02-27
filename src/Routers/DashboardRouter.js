import React, { useState } from 'react';
import { Route, Routes, Link } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import { ValidacionClub } from './ValidacionRouter';
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
import Tecnicos from '../Pages/Dashboard/Tecnicos/Tecnicos';
import MiPerfil from '../Pages/Dashboard/MiPerfil/Jugador/miPerfil';
import Redireccion from '../Pages/Dashboard/Redireccion';
import Torneos from '../Pages/Dashboard/Torneos/Torneos';
import ClubDashboard from '../Pages/Dashboard/ClubAdmin/ClubDashboard';
import ClubSolicitudes from '../Pages/Dashboard/ClubAdmin/ClubSolicitudes';
import ClubPerfil from '../Pages/Dashboard/ClubAdmin/ClubPerfil';
import ClubUsuarios from '../Pages/Dashboard/ClubAdmin/ClubUsuarios';
import ClubJugadores from '../Pages/Dashboard/ClubAdmin/ClubJugadores';
import CrearTorneo from '../Pages/Torneo/CrearTorneo';
import MisTorneos from '../Pages/Torneo/MisTorneos';
import DetalleTorneo from '../Pages/Torneo/DetalleTorneo';
import Marketplace from '../Pages/Torneo/Marketplace';
import InscribirseATorneo from '../Pages/Torneo/InscribirseATorneo';
import MisInscripciones from '../Pages/Torneo/MisInscripciones';
import GestionInscripciones from '../Pages/Torneo/GestionInscripciones';
import FixtureTorneo from '../Pages/Torneo/FixtureTorneo';
import PlanillaPartido from '../Pages/Torneo/PlanillaPartido';
import ActaPartido from '../Pages/Torneo/ActaPartido';
import TablaPosiciones from '../Pages/Torneo/TablaPosiciones';
import TorneoVeedores from '../Pages/Torneo/TorneoVeedores';
import MisPartidosVeedor from '../Pages/Torneo/MisPartidosVeedor';

const DashboardRouter = () => {
    const [Btnstate, setBtnstate] = useState(false);
    const { currentUser } = useAuth();
    const navRowClass = currentUser ? 'navbar-row nav-authenticated' : 'navbar-row nav-guest';

    return (
        <div className='body-dashboard' >
            <div className="container-fluid">
                <div className="div-body">
                    <SlideBar
                        setBtnstate={setBtnstate}
                        Btnstate={Btnstate}
                    />
                    <div className='div-main'>
                        <div className={navRowClass}>
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
                                <Route exact path="tecnicos" element={<Tecnicos />} />
                                <Route exact path="ficha/:id" element={<FichaJugador />} />
                                <Route exact path="contacto" element={<Contacto />} />
                                <Route exact path="clubes" element={<Clubes />} />
                                <Route exact path="club/:id" element={<FichaClub />} />
                                <Route exact path="editar/perfil" element={<MiPerfil />} />
                                <Route exact path="torneo/crear" element={<CrearTorneo />} />
                                <Route exact path="torneo/mis-torneos" element={<MisTorneos />} />
                                <Route exact path="torneo/:id" element={<DetalleTorneo />} />
                                <Route exact path="torneo/:id/inscripciones" element={<GestionInscripciones />} />
                                <Route exact path="torneo/:id/fixture" element={<FixtureTorneo />} />
                                <Route exact path="torneo/:torneoId/partido/:partidoId/planilla" element={<PlanillaPartido />} />
                                <Route exact path="torneo/:torneoId/partido/:partidoId/acta" element={<ActaPartido />} />
                                <Route exact path="torneo/:id/posiciones" element={<TablaPosiciones />} />
                                <Route exact path="torneo/:id/veedores" element={<TorneoVeedores />} />
                                <Route exact path="veedor/mis-partidos" element={<MisPartidosVeedor />} />
                                <Route exact path="marketplace" element={<Marketplace />} />
                                <Route exact path="inscribirse/:torneoId" element={<InscribirseATorneo />} />
                                <Route element={<ValidacionClub />}>
                                    <Route exact path="club/dashboard" element={<ClubDashboard />} />
                                    <Route exact path="club/solicitudes" element={<ClubSolicitudes />} />
                                    <Route exact path="club/perfil" element={<ClubPerfil />} />
                                    <Route exact path="club/usuarios" element={<ClubUsuarios />} />
                                    <Route exact path="club/jugadores" element={<ClubJugadores />} />
                                    <Route exact path="club/inscripciones" element={<MisInscripciones />} />
                                </Route>
                            </Routes>
                        </main>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DashboardRouter;
