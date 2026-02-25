import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from "../imagenes/logo-vitrina.png";
import user_logo from "../imagenes/user_logo.png";
import { useAuth } from '../Context/AuthContext';
import { useTheme } from '../Context/ThemeContext';


const SlideNavBar = () => {
    const location = useLocation();
    const { currentUser, logOut, RandomNumberImg, isClub } = useAuth();
    const { theme, toggleTheme } = useTheme();
    return (
        <header className="navbar py-3 ms-sm-auto px-md-4 p-2">
            <div className='div-logo col nav-items'>
                <Link className="logo-Nav-cel d-md-none" to="/"><img src={logo} alt="logo Vitrina Futbolera" height={40} /></Link>
            </div>
            <div className='col-sm-2 nav-items div-actions'>
                {/* <Link className='div-icon-chat'>
                    <i className="fa-solid icon-notification-bell-icon"></i>
                </Link> */}
                {currentUser ?
                    <><button className="theme-toggle" onClick={toggleTheme} title={theme === 'dark' ? 'Modo Día' : 'Modo Noche'} style={{ marginRight: '4px' }}>
                        <i className={`fa-solid ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i>
                    </button>
                    <div className="dropdown">
                        <button type='button' className="div-avatar" data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-haspopup="true" aria-expanded="true" data-bs-offset="0,10">
                            <div className="avatar avatar-circle avatar-sm avatar-online">
                                <img src={currentUser.foto_perfil ? currentUser.foto_perfil + "?random=" + RandomNumberImg : user_logo} alt="..." className="rounded-circle" width="40" height="40" />
                            </div>
                        </button>

                        <div className="dropdown-menu bg-dark" data-popper-placement="bottom-start">
                            <div className="dropdown-item-text">
                                <div className="d-flex align-items-center">
                                    <div className="avatar">
                                        <img src={currentUser.foto_perfil ? currentUser.foto_perfil + "?random=" + RandomNumberImg : user_logo} alt="..." className="rounded-circle" width="40" height="40" />
                                    </div>
                                    <div className="flex-grow-1 ms-3 ">
                                        <h4 className="mb-0 card-name text-truncate">{currentUser.nombre_jugador}</h4>
                                        <p className="card-text text-truncate">{currentUser.usuario}</p>
                                    </div>
                                </div>
                            </div>
                            <hr className="dropdown-divider" />
                            <Link className="dropdown-item" to={isClub ? "/club/perfil" : "/editar/perfil"}><i className="fa-solid icon-usuario"></i> Mi Perfil</Link>

                            <button className="dropdown-item" onClick={logOut}><i className="fa-solid icon-cerrar1"></i> Cerrar Sesión</button>
                        </div>
                    </div></>
                    :
                    <>
                        <div className="itemsOutUser">
                            <button className="theme-toggle" onClick={toggleTheme} title={theme === 'dark' ? 'Modo Día' : 'Modo Noche'}>
                                <i className={`fa-solid ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i>
                            </button>
                            <Link className="btn btn-outline-primary btn-sm btn-nav" to={"login"} state={{ from: location }}>Iniciar Sesión</Link>
                            <Link className="btn btn-primary btn-sm btn-nav" to={"registro"}>Registrarme</Link>
                        </div>
                        <div className="dropdown itemsOutUser2">
                            <button className="theme-toggle" onClick={toggleTheme} title={theme === 'dark' ? 'Modo Día' : 'Modo Noche'} style={{ marginRight: '4px' }}>
                                <i className={`fa-solid ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i>
                            </button>
                            <button type='button' className="div-avatar" data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-haspopup="true" aria-expanded="true" data-bs-offset="0,10">
                                <i className="fa-solid fa-ellipsis-vertical"></i>
                            </button>

                            <div className="dropdown-menu bg-dark" data-popper-placement="bottom-start">
                                <Link className="dropdown-item" to={"login"} state={{ from: location }}>Iniciar Sesión</Link>
                                <Link className="dropdown-item" to={"registro"}>Registrate</Link>
                            </div>
                        </div>
                    </>
                }
            </div>
        </header>
    );
}

export default SlideNavBar;
