import React from 'react';

/**
 * Encabezado compartido para "Completa tu Perfil" (jugador y club).
 * Mismo componente para que tamaño de letra y padding sean idénticos.
 * Estilos: miPerfil.css (jugador) o importar miPerfil.css en la página club.
 */
const CompletarPerfilHeader = ({ titulo = 'Completa tu Perfil', headerAction }) => (
    <div className="mi-perfil-titulo-row">
        <h1 className="h4">{titulo}</h1>
        {headerAction && <div className="mi-perfil-header-action">{headerAction}</div>}
    </div>
);

export default CompletarPerfilHeader;
