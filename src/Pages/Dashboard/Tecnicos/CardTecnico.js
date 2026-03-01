import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../Context/AuthContext';
import { CortarNombre, getFotoUrl } from '../../../Funciones/Funciones';
import './CardTecnico.css';

/* Tonos pastel que combinan con la app */
const COLORS_FONDO = ['#e8d5c4', '#d4e4d4', '#e2d4e8', '#d4dce8', '#f0e0d4'];

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
                <h3 className='card-tecnico-name' title={CortarNombre(data.nombres, data.apellidos)}>
                    {CortarNombre(data.nombres, data.apellidos)}
                </h3>
                <span className='card-tecnico-rol'>Director Técnico</span>
                <div className='card-tecnico-datos'>
                    {(data.club_actual || data.cant_clubes > 0) && (
                        <span className='card-tecnico-dato'>
                            <i className="fa-solid fa-futbol" aria-hidden></i>
                            {data.club_actual || `${data.cant_clubes} club${data.cant_clubes > 1 ? 'es' : ''}`}
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
};

export default CardTecnico;
