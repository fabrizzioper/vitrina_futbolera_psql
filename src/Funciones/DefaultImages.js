import escudoDefault from '../imagenes/escudo-default.svg';
import piesIcon from '../imagenes/pies.png';
import sangreIcon from '../imagenes/sangre.svg';
import canchaImg from '../imagenes/cancha.svg';
import playerIcon from '../imagenes/player.svg';

export const DEFAULT_IMAGES = {
    ESCUDO_CLUB: escudoDefault,
    // Placeholder local (data URI) para evitar 404 cuando no hay foto de perfil
    CARA_USUARIO: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Ccircle fill='%23e0e0e0' cx='50' cy='50' r='50'/%3E%3Ccircle fill='%23b0b0b0' cx='50' cy='38' r='14'/%3E%3Cellipse fill='%23b0b0b0' cx='50' cy='82' rx='28' ry='24'/%3E%3C/svg%3E",
    PIES: piesIcon,
    SANGRE: sangreIcon,
    CANCHA: canchaImg,
    PLAYER: playerIcon,
    MITAD_CUERPO: playerIcon,
    CARA: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle fill='%23e0e0e0' cx='50' cy='50' r='45' stroke='%23ccc' stroke-width='2'/%3E%3Ccircle fill='%23b0b0b0' cx='50' cy='40' r='16'/%3E%3Cellipse fill='%23b0b0b0' cx='50' cy='85' rx='28' ry='22'/%3E%3C/svg%3E",
    LOGRO_ICON: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Cpath d='M20 8h24v20c0 8-5 14-12 14S20 36 20 28V8z' fill='%23f1c40f' stroke='%23d4a017' stroke-width='2'/%3E%3Cpath d='M20 14H10c0 8 4 14 10 16' fill='none' stroke='%23d4a017' stroke-width='2'/%3E%3Cpath d='M44 14h10c0 8-4 14-10 16' fill='none' stroke='%23d4a017' stroke-width='2'/%3E%3Crect x='26' y='42' width='12' height='6' fill='%23d4a017'/%3E%3Crect x='22' y='48' width='20' height='4' rx='2' fill='%23d4a017'/%3E%3C/svg%3E",
    LOGO_QA: escudoDefault,
};
