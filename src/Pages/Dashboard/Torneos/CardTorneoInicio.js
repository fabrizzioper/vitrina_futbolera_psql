import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './CardTorneoInicio.css';

const TORNEO_IMAGES = [
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=250&fit=crop',
    'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=400&h=250&fit=crop',
    'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=400&h=250&fit=crop',
    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=400&h=250&fit=crop',
    'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=400&h=250&fit=crop',
    'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400&h=250&fit=crop',
    'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=400&h=250&fit=crop',
    'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=400&h=250&fit=crop',
];

const CardTorneoInicio = ({ data, index }) => {
    const location = useLocation();
    const [imgError, setImgError] = useState(false);
    const imgSrc = TORNEO_IMAGES[index % TORNEO_IMAGES.length];

    const formatFecha = (fecha) => {
        if (!fecha) return null;
        const d = new Date(fecha);
        return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });
    };

    const fechaInicio = formatFecha(data.fecha_inicio_torneo);
    const fechaFin = formatFecha(data.fecha_fin_torneo);

    return (
        <Link
            to={`/torneo/${data.vit_torneo_id}`}
            state={{ from: location }}
            className="card-torneo-inicio"
        >
            <div className={`card-torneo-inicio-img${imgError ? ' no-photo' : ''}`}>
                {imgError ? (
                    <div className="card-torneo-inicio-img-placeholder">
                        <i className="fa-solid fa-futbol" aria-hidden></i>
                    </div>
                ) : (
                    <img
                        src={imgSrc}
                        alt={data.nombre}
                        loading="lazy"
                        onError={() => setImgError(true)}
                    />
                )}
                <div className="card-torneo-inicio-overlay">
                    {data.costo_inscripcion ? (
                        <span className="card-torneo-inicio-precio">
                            {data.moneda || 'PEN'} {data.costo_inscripcion}
                        </span>
                    ) : (
                        <span className="card-torneo-inicio-precio gratis">Gratis</span>
                    )}
                </div>
            </div>
            <div className="card-torneo-inicio-body">
                <h6 className="card-torneo-inicio-titulo">{data.nombre}</h6>
                <span className="card-torneo-inicio-org">
                    {data.entidad_organizadora || 'Organizador'}
                </span>
                {(fechaInicio || data.lugar) && (
                    <div className="card-torneo-inicio-meta">
                        {fechaInicio && (
                            <span><i className="fa-regular fa-calendar"></i> {fechaInicio}{fechaFin ? ` - ${fechaFin}` : ''}</span>
                        )}
                        {data.lugar && (
                            <span><i className="fa-solid fa-location-dot"></i> {data.lugar}</span>
                        )}
                    </div>
                )}
                {data.categorias && (
                    <div className="card-torneo-inicio-categorias">
                        {data.categorias.split(',').slice(0, 3).map((cat, i) => (
                            <span key={i} className="card-torneo-inicio-tag">{cat.trim()}</span>
                        ))}
                    </div>
                )}
            </div>
        </Link>
    );
};

export default CardTorneoInicio;
