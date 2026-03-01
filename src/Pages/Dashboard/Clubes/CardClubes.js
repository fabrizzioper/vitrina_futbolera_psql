import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { DEFAULT_IMAGES } from '../../../Funciones/DefaultImages';
import "./Clubes.css"

const CardClubes = ({ data, handleScroll }) => {
    const location = useLocation();
    const [imgError, setImgError] = useState(false);

    const clubUrl = `/club/${data.vit_institucion_id}`;
    const codigoPais = data.codigo_pais ? data.codigo_pais.toLowerCase() : null;
    const logoSrc = data.Logo || DEFAULT_IMAGES.ESCUDO_CLUB;
    const mostrarPlaceholder = !logoSrc || imgError;

    return (
        <Link
            to={clubUrl}
            state={{ from: location }}
            className='card-club card-club-link'
            onClick={() => handleScroll && handleScroll()}
        >
            <div className='card-club-logo-area'>
                <div className='div-logo-club'>
                    {mostrarPlaceholder ? (
                        <div className='card-club-logo-placeholder'>
                            <i className="fa-solid fa-building" aria-hidden></i>
                        </div>
                    ) : (
                        <img
                            src={logoSrc}
                            alt={data.nombre}
                            onError={() => setImgError(true)}
                            loading="lazy"
                        />
                    )}
                </div>
                {codigoPais && (
                    <img
                        className='card-club-flag'
                        src={`https://flagcdn.com/w40/${codigoPais}.png`}
                        alt={data.nombre_pais || ''}
                    />
                )}
            </div>
            <div className='card-club-info'>
                <span className='club-name'>{data.nombre}</span>
                {(data.tipo_institucion || data.nombre_pais) && (
                    <span className='club-meta'>
                        {data.tipo_institucion && <span className='club-type'>{data.tipo_institucion}</span>}
                        {data.nombre_pais && <span className='club-country'>{data.nombre_pais}</span>}
                    </span>
                )}
                {data.cant_jugadores > 0 && (
                    <span className='club-players'>
                        <i className="fa-solid fa-user-group"></i> {data.cant_jugadores}
                    </span>
                )}
            </div>
        </Link>
    );
}

export default CardClubes;
