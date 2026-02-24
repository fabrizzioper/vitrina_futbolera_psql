import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { DEFAULT_IMAGES } from '../../../Funciones/DefaultImages';
import "./Clubes.css"

const CardClubes = ({ data, handleScroll }) => {
    const location = useLocation();

    return (
        <div className='card-club'>
            <Link onClick={() => handleScroll && handleScroll()} to={`/club/` + data.vit_institucion_id} state={{ from: location }} className='div-logo-club'>
                <img src={data.Logo ? data.Logo : DEFAULT_IMAGES.ESCUDO_CLUB} alt={data.nombre} />
            </Link>
            <span className='club-name'>{data.nombre}</span>
        </div>
    );
}

export default CardClubes;
