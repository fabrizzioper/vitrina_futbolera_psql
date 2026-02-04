import { motion } from 'framer-motion'
import React from 'react'

const CardTorneos = ({ id, titulo, src, onClick }) => {
    return (
        <div >
            <motion.div layoutId={id} className='card-torneo'>
                <img src={src} alt={titulo} />
                <div className='info'>
                    <h5>{titulo}</h5>
                </div>
                <div className='out-btn'>
                    <button onClick={onClick}>Ver más</button>
                </div>
            </motion.div>   
        </div>
    )

}

export default CardTorneos
