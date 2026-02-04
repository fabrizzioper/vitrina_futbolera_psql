import React from 'react';
import './Maintenance.css'

const Maintenance = () => {
    return (
        <div className='out-maintenance'>
            <article className='maintenance'>
                <h1>Volveremos pronto!</h1>
                <div>
                    <p>Disculpe las molestias, pero estamos realizando algunas tareas de mantenimiento en este momento. En breve estaremos en línea.</p>
                    <p className='author'>&mdash; El equipo de desarrollo</p>
                </div>
            </article>
        </div>
    );
}

export default Maintenance;
