import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import user_logo from '../../imagenes/user_logo.png';
import MiPerfil from '../Dashboard/MiPerfil/Jugador/miPerfil';
import './completarPerfil.css'

const CompletarPerfil = () => {
    const navigate = useNavigate();
    const { Alerta, currentUser, logOut, RandomNumberImg } = useAuth();

    const handleCerrarSesion = () => {
        logOut();
        navigate('/login');
    };

    useEffect(() => {
        Alerta('info', 'Complete su perfil por favor.')
    }, [Alerta]);

    const leftAction = currentUser ? (
        <button
            type="button"
            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
            onClick={handleCerrarSesion}
            title="Ir a Inicio"
        >
            <i className="fa-solid fa-house"></i>
            <span>Inicio</span>
        </button>
    ) : null;

    const headerAction = currentUser ? (
        <div className="d-flex align-items-center gap-2">
            <div className="dropdown completar-perfil-dropdown">
                <button type="button" className="div-avatar completar-perfil-avatar" data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-haspopup="true" aria-expanded="false" data-bs-offset="0,8">
                    <div className="avatar avatar-circle avatar-sm avatar-online">
                        <img src={currentUser.foto_perfil ? currentUser.foto_perfil + "?random=" + RandomNumberImg : user_logo} alt="" className="rounded-circle" width="40" height="40" />
                    </div>
                </button>
                <div className="dropdown-menu dropdown-menu-end bg-dark" data-popper-placement="bottom-end">
                    <div className="dropdown-item-text">
                        <div className="d-flex align-items-center">
                            <div className="avatar">
                                <img src={currentUser.foto_perfil ? currentUser.foto_perfil + "?random=" + RandomNumberImg : user_logo} alt="" className="rounded-circle" width="40" height="40" />
                            </div>
                            <div className="flex-grow-1 ms-3">
                                <h4 className="mb-0 card-name text-truncate">{currentUser.nombre_jugador}</h4>
                                <p className="card-text text-truncate">{currentUser.usuario}</p>
                            </div>
                        </div>
                    </div>
                    <hr className="dropdown-divider" />
                    <button type="button" className="dropdown-item" onClick={handleCerrarSesion}><i className="fa-solid icon-cerrar1"></i> Cerrar sesión</button>
                </div>
            </div>
        </div>
    ) : null;

    return (
        <div className='div-main div-completar-perfil'>
            <MiPerfil
                titulo="Completa tu Perfil"
                leftAction={leftAction}
                headerAction={headerAction}
                soloSiguiente={true}
            />
        </div>
    );
}

export default CompletarPerfil;
