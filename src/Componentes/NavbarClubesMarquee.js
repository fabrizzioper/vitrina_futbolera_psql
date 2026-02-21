import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import { fetchData } from '../Funciones/Funciones';

function normalizarLista(res) {
    if (Array.isArray(res)) return res;
    if (res && typeof res === 'object') {
        if (Array.isArray(res.lista)) return res.lista;
        if (Array.isArray(res.data)) return res.data;
        if (Array.isArray(res.items)) return res.items;
    }
    return [];
}

const DEFAULT_LOGO = 'https://media.discordapp.net/attachments/1070478259206234227/1070478319918792704/Escudo-predeterminado.png';

const NavbarClubesMarquee = () => {
    const { Request } = useAuth();
    const [clubes, setClubes] = useState([]);

    useEffect(() => {
        if (!Request?.Dominio) return;
        fetchData(Request, "institucion_lista", [
            { nombre: "pais", envio: "" },
            { nombre: "dato", envio: 20 }
        ])
            .then((data) => setClubes(normalizarLista(data)))
            .catch(() => setClubes([]));
    }, [Request]);

    if (clubes.length === 0) return null;

    /* Repetir items dentro de cada track para que siempre llene el ancho visible */
    const itemWidth = 52; // ~36px item + ~16px gap
    const copies = Math.max(2, Math.ceil(window.innerWidth / (clubes.length * itemWidth)) + 1);
    const trackItems = [];
    for (let c = 0; c < copies; c++) trackItems.push(...clubes);

    /* Velocidad proporcional al contenido: ~1.25s por item */
    const duration = trackItems.length * 1.25;

    const renderTrack = (key) => (
        <div
            className="navbar-clubes-marquee-track"
            key={key}
            aria-hidden={key === 'b'}
            style={{ animationDuration: `${duration}s` }}
        >
            {trackItems.map((club, i) => (
                <Link
                    key={`${key}-${club.vit_institucion_id}-${i}`}
                    to={`/club/${club.vit_institucion_id}`}
                    className="navbar-clubes-marquee-item"
                >
                    <img
                        src={club.Logo || DEFAULT_LOGO}
                        alt={club.nombre || 'Club'}
                    />
                </Link>
            ))}
        </div>
    );

    return (
        <div className="navbar-clubes-marquee">
            {renderTrack('a')}
            {renderTrack('b')}
        </div>
    );
};

export default NavbarClubesMarquee;
