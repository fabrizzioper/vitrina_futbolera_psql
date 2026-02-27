import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../Context/AuthContext';
import { CortarNombre, getFotoUrl } from '../../../Funciones/Funciones';

const CardTecnico = ({ data, numeroRandom, handleScroll }) => {
    const location = useLocation();
    const { Request } = useAuth();
    const [imgError, setImgError] = useState(false);
    const fichaUrl = `/ficha/${data.vit_jugador_id}`;
    const fotoRaw = data.foto_perfil;
    const fotoUrl = getFotoUrl(fotoRaw, Request?.Dominio);
    const srcFoto = fotoUrl ? fotoUrl + '?random=' + numeroRandom : null;
    const mostrarPlaceholder = !srcFoto || imgError;

    return (
        <Link
            to={fichaUrl}
            state={{ from: location }}
            className='card-club card-club-link'
            onClick={() => handleScroll && handleScroll()}
        >
            <div className='card-club-logo-area' style={{ padding: '16px 16px 8px' }}>
                <div style={{
                    width: 72, height: 72, borderRadius: '50%', overflow: 'hidden',
                    background: 'var(--card-section-bg, #f0f0f0)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center'
                }}>
                    {srcFoto && !imgError ? (
                        <img
                            src={srcFoto}
                            alt={data.nombres}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={() => setImgError(true)}
                            loading="lazy"
                        />
                    ) : (
                        <i className="fa-solid fa-user-tie" style={{ fontSize: '2rem', color: 'var(--text-secondary, #999)' }}></i>
                    )}
                </div>
                {data.cod_pais && (
                    <img
                        className='card-club-flag'
                        src={`https://flagcdn.com/w40/${data.cod_pais.toLowerCase()}.png`}
                        alt={data.pais || ''}
                    />
                )}
            </div>
            <div className='card-club-info'>
                <span className='club-name'>{CortarNombre(data.nombres, data.apellidos)}</span>
                <span className='club-meta'>
                    <span className='club-type'>Director Técnico</span>
                    {data.pais && <span className='club-country'>{data.pais}</span>}
                </span>
                {data.club_actual && (
                    <span className='club-players' style={{ fontSize: '0.75rem' }}>
                        <i className="fa-solid fa-futbol"></i> {data.club_actual}
                    </span>
                )}
                {data.cant_clubes > 0 && !data.club_actual && (
                    <span className='club-players' style={{ fontSize: '0.75rem' }}>
                        <i className="fa-solid fa-building"></i> {data.cant_clubes} club{data.cant_clubes > 1 ? 'es' : ''}
                    </span>
                )}
            </div>
        </Link>
    );
}

export default CardTecnico;
