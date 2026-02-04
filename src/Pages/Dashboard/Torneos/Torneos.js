import React, { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import CardTorneos from './CardTorneos';
import './Torneos.css'

import img1 from '../../../imagenes/BANNER_COPA_DE_LA_AMISTAD.jpg'
import img2 from '../../../imagenes/COPA_DE_LA_AMISTA_FLYER.png'
import { AnimatePresence, motion } from 'framer-motion';

const Torneos = () => {
    const location = useLocation();
    let previusURL = location.state?.from.pathname || "/"

    const id_Torneo = useParams().id || null
    const [selectedId, setSelectedId] = useState(id_Torneo)

    return (
        <>
            <div className='out-div-seccion inicio'>
                <div className='header-seccion row gap-3'>
                    <div className='col'>
                        <Link className='Volver-link' to={previusURL}><span className='icon-flecha2'></span><h5 className='d-flex' >Torneos & Campeonatos</h5></Link>
                    </div>
                    <div className="input-group input-group-sm flex-nowrap div-input-search col">
                    </div>
                </div>
                <div className='div-seccion-Jugadores mt-3'>
                    <div className='seccion seccion-torneos'>
                        <CardTorneos
                            id={1}
                            src={img1}
                            titulo={'39° Copa de la Amistad'}
                            onClick={() => setSelectedId(1)}
                        />
                    </div>
                </div>
            </div>
            <AnimatePresence initial={false}>
                {selectedId && (
                    <div className='out-modal-torneo' onClick={() => setSelectedId(null)}>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            layoutId={selectedId} className='modal-torneo'>
                            <img src={img2} alt='' />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    )
}

export default Torneos

