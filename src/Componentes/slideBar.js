import React from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import logo from "../imagenes/logo-vitrina.png";
const SlideBar = ({ setBtnstate, Btnstate }) => {
    const location = useLocation();

    return (
        <>
            <div className="div-espacio"></div>
            <nav id="sidebarMenu" className={`col-md-3 col-lg-2 d-md-block sidebar collapse shadow-sm ${Btnstate ? "show": "hide"}`}>
                <div className=" sidebar-sticky">
                    <ul className="nav flex-column h-100">
                        <Link className="div-logo-slidebar navbar-brand" to="/"><img src={logo} alt="logo Vitrina Futbolera" className='logo-slidebar' />
                            <h5 className='titulo'>Vitrina<br />Futbolera</h5>
                        </Link>
                        <li className="nav-item">
                            <NavLink className={({ isActive }) => isActive ? "nav-link activo" : "nav-link"} to={"/inicio"} state={{ from: location }} onClick={() => setBtnstate(Btnstate => !Btnstate)} >
                                <span data-feather="home" className="align-text-bottom"></span>
                                <span className="fa-solid icon-home3"></span><label >Inicio</label>
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink className={({ isActive }) => isActive ? "nav-link activo" : "nav-link"} to={"/jugadores"} state={{ from: location }} onClick={() => setBtnstate(Btnstate => !Btnstate)} >
                                <span data-feather="home" className="align-text-bottom"></span>
                                <span className="fa-solid icon-jugador1"></span><label>Jugadores</label>
                            </NavLink>
                        </li>
                        <li className="nav-item disabled-link">
                            <div className={"nav-link"} to={"/tecnicos"} state={{ from: location }} >
                                <span data-feather="file" className="align-text-bottom"></span>
                                <span className="fa-solid icon-tecnico1"></span><label>Técnicos</label>
                            </div>
                        </li>
                        <li className="nav-item">
                            <NavLink className={({ isActive }) => isActive ? "nav-link activo" : "nav-link"} to={"/clubes"} state={{ from: location }} onClick={() => setBtnstate(Btnstate => !Btnstate)} >
                                <span data-feather="file" className="align-text-bottom"></span>
                                <span className="fa-solid icon-club1"></span><label>Clubes&nbsp;&&nbsp;Academias</label>
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink className={({ isActive }) => isActive ? "nav-link activo" : "nav-link"} to={"/torneos"} state={{ from: location }} >
                                <span data-feather="shopping-cart" className="align-text-bottom"></span>
                                <span className="fa-solid icon-trophy"></span><label>Torneos&nbsp;&&nbsp;Campeonatos</label>
                            </NavLink>
                        </li>
                        <li className="nav-item disabled-link">
                            <div className={"nav-link"} to={"/capacitacion"} state={{ from: location }} >
                                <span data-feather="users" className="align-text-bottom"></span>
                                <s className="fa-solid icon-capacitacion1"></s><label>Capacitación</label>
                            </div>
                        </li>
                        <li className="nav-item">
                            <NavLink className={({ isActive }) => isActive ? "nav-link activo" : "nav-link"} to={"/contacto"} state={{ from: location }} >
                                <span data-feather="bar-chart-2" className="align-text-bottom"></span>
                                <i className="fa-solid icon-phone"></i><label>Contáctenos</label>
                            </NavLink>
                        </li>
                    </ul>
                </div>
            </nav>
            <div className="filtro-slider"></div>
        </>
    );
}

export default SlideBar;
