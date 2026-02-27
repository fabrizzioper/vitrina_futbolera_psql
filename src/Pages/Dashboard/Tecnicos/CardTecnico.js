import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../Context/AuthContext';
import { CortarNombre, getFotoUrl } from '../../../Funciones/Funciones';
import './CardTecnico.css';

const COLORS_FONDO = ['#c9a962', '#b8860b', '#d4a574', '#e07c45'];

const CardTecnico = ({ data, numeroRandom, handleScroll }) => {
    const location = useLocation();
    const { Request } = useAuth();
    const [imgError, setImgError] = useState(false);
    const fichaUrl = `/ficha/${data.vit_jugador_id}`;
    const fotoRaw = data.foto_perfil;
    const fotoUrl = getFotoUrl(fotoRaw, Request?.Dominio);
    const srcFoto = fotoUrl ? fotoUrl + '?random=' + numeroRandom : null;
    const colorIndex = (data.vit_jugador_id || 0) % COLORS_FONDO.length;
    const colorFondo = COLORS_FONDO[colorIndex];

    return (
        <Link
            to={fichaUrl}
            state={{ from: location }}
            className='card-tecnico card-tecnico-ficha'
            style={{ '--card-tecnico-bg': colorFondo }}
            onClick={() => handleScroll && handleScroll()}
        >
            <div className='card-tecnico-imagen'>
                {srcFoto && !imgError ? (
                    <img
                        src={srcFoto}
                        alt={data.nombres}
                        className='card-tecnico-foto-img'
                        onError={() => setImgError(true)}
                        loading="lazy"
                    />
                ) : (
                    <div className='card-tecnico-foto-placeholder'>
                        <i className="fa-solid fa-user-tie" aria-hidden></i>
                    </div>
                )}
                {data.cod_pais && (
                    <img
                        className='card-tecnico-flag'
                        src={`https://flagcdn.com/w40/${data.cod_pais.toLowerCase()}.png`}
                        alt={data.pais || ''}
                    />
                )}
            </div>
            <div className='card-tecnico-overlay'>
                <h3 className='card-tecnico-name'>{CortarNombre(data.nombres, data.apellidos)}</h3>
                <span className='card-tecnico-rol'>Director Técnico</span>
                <div className='card-tecnico-datos'>
                    {data.pais && (
                        <span className='card-tecnico-dato'>
                            <i className="fa-solid fa-flag" aria-hidden></i>
                            {data.pais}
                        </span>
                    )}
                    {(data.club_actual || data.cant_clubes > 0) && (
                        <span className='card-tecnico-dato'>
                            <i className="fa-solid fa-futbol" aria-hidden></i>
                            {data.club_actual || `${data.cant_clubes} club${data.cant_clubes > 1 ? 'es' : ''}`}
                        </span>
                    )}
                </div>
                <span className='card-tecnico-btn'>Ver Ficha</span>
            </div>
        </Link>
    );
};

export default CardTecnico;
