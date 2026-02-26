import React from 'react';
import "./loader.css"

const Loader = () => {
    return (
        <div className='div-loader' aria-live="polite" aria-busy="true">
            <div className="loader">
                <div className="loader-pelota" role="status" aria-label="Cargando"></div>
            </div>
        </div>
    );
}

export default Loader;
