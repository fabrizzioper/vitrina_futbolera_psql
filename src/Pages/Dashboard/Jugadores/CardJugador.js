import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ObtenerEdad, CortarNombre } from '../../../Funciones/Funciones';

const CardJugador = ({ data, numeroRandom, handleScroll }) => {
    const location = useLocation();
    return (
        <>
            <div className='centrar out-modal-player'>
                <div className='div-modal-player shadow-sm' data-aos="zoom-in" data-aos-once="true">
                    <div className='div-img-player'>
                        {data.foto_cuerpo || data.foto_perfil ? <img loading="lazy" className='img-card-jugador' src={data.foto_cuerpo ? (data.foto_cuerpo + "?random=" + numeroRandom) : (data.foto_perfil + "?random=" + numeroRandom)} alt="img-player" /> : <span className='icon-arquero1 icono-jugador-modal'></span>}
                    </div>
                    {data.cod_posicion &&
                        <div className='div-posicion icon-player-left'>
                            <span>{data.cod_posicion}</span>
                        </div>
                    }
                    {data.cod_pais &&
                        <div className='info-pais icon-player-right'>
                            {data.cod_pais ? <img id='img-Pais' src={`https://flagcdn.com/w80/${data.cod_pais.toLowerCase()}.png`} alt={data.pais} /> : <></>}
                        </div>
                    }
                    <div className='div-modal-info-player'>
                        <div className='info-modal-player'>
                            <div className='foot-info-player'>
                                <div className='info-nombre'>{CortarNombre(data.nombres, data.apellidos)}</div>
                            </div>
                            <div className='foot-info-player'>
                                <div className='info-detalle'>{ObtenerEdad(data.jugador_fecha_nacimiento)}{data.pais ? ` · ${data.pais}` : ''}</div>
                            </div>
                            <Link onClick={() => handleScroll && handleScroll()} to={`/ficha/${data.vit_jugador_id}`} state={{ from: location }} className="link-verficha">Ver Ficha</Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default CardJugador;
