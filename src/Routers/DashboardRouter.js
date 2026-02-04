import React, { useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import SlideBar from '../Componentes/slideBar';
import SlideNavBar from '../Componentes/slideNavBar';
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
                    <button className="navbar-toggler position-fixed d-md-none collapsed bg-primary" onClick={() => setBtnstate(Btnstate => !Btnstate)} type="button" data-bs-toggle="collapse" data-bs-target="#sidebarMenu" aria-controls="sidebarMenu" aria-expanded="false" aria-label="Toggle navigation">
                        {Btnstate ? <i className="fa-solid icon-cross"></i> : <i className="fa-solid icon-three-horizontal-lines-icon"></i>}
                    </button>
                    <div className='div-main'>
                        <SlideNavBar />
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
