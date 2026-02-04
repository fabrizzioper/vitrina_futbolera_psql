import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../Context/AuthContext';
import { ObtenerEdad, DarFormatoFecha, CortarNombre } from '../../../Funciones/Funciones';

const CardJugador = ({ data, numeroRandom, handleScroll }) => {
    const location = useLocation();
    const { Request } = useAuth();
    return (
        <>
            <div className='centrar out-modal-player'>
                <div className='div-modal-player shadow-sm ' data-aos="zoom-in" data-aos-once="true">
                    <div className='div-img-player'>
                        {data.foto_cuerpo || data.foto_perfil ? <img loading="lazy" className='img-card-jugador' src={data.foto_cuerpo ? (data.foto_cuerpo + "?random=" + numeroRandom) : (data.foto_perfil + "?random=" + numeroRandom)} alt="img-player" /> : <span className='icon-arquero1 icono-jugador-modal'></span>}
                    </div>
                    {data.cod_posicion &&
                        <div className='div-posicion icon-player-left'>
                            {data.cod_posicion ?
                                <>
                                    <div className='icon-cancha'></div>
                                    <span>{data.cod_posicion}</span>
                                </> :
                                <></>
                            }
                        </div>
                    }
                    {data.cod_pais &&
                        <div className='info-pais icon-player-right'>
                            {data.cod_pais ? <img id='img-Pais' src={`https://flagcdn.com/w80/${data.cod_pais.toLowerCase()}.png`} alt={data.pais} /> : <></>}
                            <label htmlFor='img-Pais'>{data.pais ? data.pais.substr(0, 3).toUpperCase() : data.pais}</label>
                        </div>
                    }
                    <div className='div-modal-info-player'>
                        <div className='info-modal-player'>
                            <a href={`https://app.safe2biz.com/vitrina_futbolera/externalReport/execute/${Request.Referencia}/rpt_ficha_jugador_vf/PDF/jugador_id=${data.vit_jugador_id}/reportes_sistema/ `} target="_blank" rel="noreferrer" className="link-verpfd"><i className="fa-solid fa-file-pdf"></i></a>
                            <Link onClick={() => handleScroll && handleScroll()} to={`/ficha/${data.vit_jugador_id}`} state={{ from: location }} className="link-verficha">Ver Ficha</Link>

                            <div className='foot-info-player'>
                                <div className='info-nombre'>{CortarNombre(data.nombres, data.apellidos)}</div>
                            </div>
                            <div className='foot-info-player'>
                                <div className='info-fecha'>{DarFormatoFecha(data.jugador_fecha_nacimiento)}</div>
                                <div className='info-edad'>{ObtenerEdad(data.jugador_fecha_nacimiento)}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default CardJugador;
