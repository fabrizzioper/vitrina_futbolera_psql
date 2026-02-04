import React, { useEffect } from 'react';
import { useAuth } from '../../Context/AuthContext';
import MiPerfil from '../Dashboard/MiPerfil/Jugador/miPerfil';
import './completarPerfil.css'

const CompletarPerfil = () => {
    const { Alerta } = useAuth();

    useEffect(() => {
        Alerta('info', 'Complete su perfil por favor.')
    }, []);
    return (
        <div className='div-main div-completar-perfil'>
            <MiPerfil
                titulo={`Completa tu Perfil`}
            />
        </div>
    );
}

export default CompletarPerfil;
