import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../Context/AuthContext';
import { ObtenerEdad, CortarNombre, getFotoUrl } from '../../../Funciones/Funciones';

const CardJugador = ({ data, numeroRandom, handleScroll }) => {
    const location = useLocation();
    const { Request } = useAuth();
    const [imgError, setImgError] = useState(false);
    const fichaUrl = `/ficha/${data.vit_jugador_id}`;
    // Preferir URLs de descarga del backend (des_foto_*) si vienen; si no, usar foto_cuerpo/foto_perfil
    const fotoRaw = data.des_foto_cuerpo || data.des_foto_perfil || data.foto_cuerpo || data.foto_perfil;
    const fotoUrl = getFotoUrl(fotoRaw, Request?.Dominio);
    const srcFoto = fotoUrl ? fotoUrl + '?random=' + numeroRandom : null;
    const mostrarPlaceholder = !srcFoto || imgError;
    return (
        <Link
            to={fichaUrl}
            state={{ from: location }}
            className='centrar out-modal-player card-jugador-link'
            onClick={() => handleScroll && handleScroll()}
        >
            <div className='div-modal-player shadow-sm' data-aos="zoom-in" data-aos-once="true">
                    <div className={`div-img-player ${mostrarPlaceholder ? 'no-photo' : ''}`}>
                        {srcFoto && !imgError ? (
                            <img
                                loading="lazy"
                                className='img-card-jugador'
                                referrerPolicy="no-referrer"
                                src={srcFoto}
                                alt="img-player"
                                onError={() => { setImgError(true); }}
                            />
                        ) : (
                            <span className='icon-arquero1 icono-jugador-modal'></span>
                        )}
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
                            <span className="link-verficha">Ver Ficha</span>
                        </div>
                    </div>
                </div>
        </Link>
    );
}

export default CardJugador;
