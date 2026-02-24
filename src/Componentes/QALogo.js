import React from 'react';
import { useAuth } from '../Context/AuthContext';
import { DEFAULT_IMAGES } from '../Funciones/DefaultImages';

const QALogo = () => {
    const { isQA } = useAuth();
    return (
        isQA ? 
        <div className='div-LogoQA'>
            <img src={DEFAULT_IMAGES.LOGO_QA} alt="logoQA" />
        </div>
        : 
        <></>
    );
}

export default QALogo;
