import React from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import logo from "../imagenes/logo-vitrina.png";
import { useAuth } from '../Context/AuthContext';
import { useTheme } from '../Context/ThemeContext';

const SlideBar = ({ setBtnstate, Btnstate }) => {
    const location = useLocation();
    const { currentUser, logOut, isClub } = useAuth();
    const { theme, toggleTheme } = useTheme();

    return (
        <>
            <div className="div-espacio"></div>
            <nav id="sidebarMenu" className={`col-md-3 col-lg-2 d-md-block sidebar collapse shadow-sm ${Btnstate ? "show": "hide"}`}>
                <div className=" sidebar-sticky">
                    <ul className="nav flex-column h-100">
                        <div className="sidebar-mobile-header">
                            <Link className="div-logo-slidebar navbar-brand" to="/" onClick={() => setBtnstate(false)}>
                                <img src={logo} alt="logo Vitrina Futbolera" className='logo-slidebar' />
                                <h5 className='titulo'>Vitrina<br />Futbolera</h5>
                            </Link>
                            <button className="sidebar-close-btn" onClick={() => setBtnstate(false)} aria-label="Cerrar menú">
                                <i className="fa-solid icon-cross"></i>
                            </button>
                        </div>
                        <li className="nav-item">
                            <NavLink className={({ isActive }) => isActive ? "nav-link activo" : "nav-link"} to={"/inicio"} state={{ from: location }} onClick={() => setBtnstate(Btnstate => !Btnstate)} >
                                <span data-feather="home" className="align-text-bottom"></span>
                                <span className="fa-solid icon-home3"></span><label >Inicio</label>
                            </NavLink>
                        </li>
                        {isClub && (
                            <>
                                <li className="nav-item">
                                    <NavLink className={({ isActive }) => isActive ? "nav-link activo" : "nav-link"} to={"/club/dashboard"} state={{ from: location }} onClick={() => setBtnstate(Btnstate => !Btnstate)} >
                                        <span data-feather="home" className="align-text-bottom"></span>
                                        <i className="fa-solid fa-building"></i><label>Mi Club</label>
                                    </NavLink>
                                </li>
                                <li className="nav-item">
                                    <NavLink className={({ isActive }) => isActive ? "nav-link activo" : "nav-link"} to={"/club/solicitudes"} state={{ from: location }} onClick={() => setBtnstate(Btnstate => !Btnstate)} >
                                        <span data-feather="home" className="align-text-bottom"></span>
                                        <i className="fa-solid fa-clipboard-list"></i><label>Solicitudes</label>
                                    </NavLink>
                                </li>
                            </>
                        )}
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
                        <div className="sidebar-mobile-extras">
                            <hr className="sidebar-divider" />
                            <li className="nav-item">
                                <button className="nav-link sidebar-btn" onClick={toggleTheme}>
                                    <i className={`fa-solid ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i>
                                    <label>{theme === 'dark' ? 'Modo Día' : 'Modo Noche'}</label>
                                </button>
                            </li>
                            {currentUser ? (
                                <li className="nav-item">
                                    <button className="nav-link sidebar-btn" onClick={() => { logOut(); setBtnstate(false); }}>
                                        <span className="fa-solid icon-cerrar1"></span><label>Cerrar Sesión</label>
                                    </button>
                                </li>
                            ) : (
                                <>
                                    <li className="nav-item">
                                        <NavLink className="nav-link" to={"/login"} state={{ from: location }} onClick={() => setBtnstate(false)}>
                                            <span className="fa-solid fa-sign-in-alt"></span><label>Iniciar Sesión</label>
                                        </NavLink>
                                    </li>
                                    <li className="nav-item">
                                        <NavLink className="nav-link" to={"/registro"} onClick={() => setBtnstate(false)}>
                                            <span className="fa-solid fa-user-plus"></span><label>Registrarme</label>
                                        </NavLink>
                                    </li>
                                </>
                            )}
                        </div>
                    </ul>
                </div>
            </nav>
            {Btnstate && <div className="filtro-slider" onClick={() => setBtnstate(false)}></div>}
        </>
    );
}

export default SlideBar;
