import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import "./Clubes.css"

const CardClubes = ({ data, handleScroll }) => {
    const location = useLocation();

    return (
        <div className='card-club'>
            <Link onClick={() => handleScroll && handleScroll()} to={`/club/` + data.vit_institucion_id} state={{ from: location }} className='div-logo-club'>
                <img src={data.Logo ? data.Logo : 'https://media.discordapp.net/attachments/1070478259206234227/1070478319918792704/Escudo-predeterminado.png'} alt={data.nombre} />
            </Link>
            <span className='club-name'>{data.nombre}</span>
        </div>
    );
}

export default CardClubes;
