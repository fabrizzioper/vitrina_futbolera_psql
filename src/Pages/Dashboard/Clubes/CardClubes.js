import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { DEFAULT_IMAGES } from '../../../Funciones/DefaultImages';
import "./Clubes.css"

const CardClubes = ({ data, handleScroll }) => {
    const location = useLocation();

    const clubUrl = `/club/${data.vit_institucion_id}`;
    return (
        <Link
            to={clubUrl}
            state={{ from: location }}
            className='card-club card-club-link'
            onClick={() => handleScroll && handleScroll()}
        >
            <div className='div-logo-club'>
                <img src={data.Logo ? data.Logo : DEFAULT_IMAGES.ESCUDO_CLUB} alt={data.nombre} />
            </div>
            <span className='club-name'>{data.nombre}</span>
        </Link>
    );
}

export default CardClubes;
