import React from 'react';
import { useAuth } from '../Context/AuthContext';

const QALogo = () => {
    const { isQA } = useAuth();
    return (
        isQA ? 
        <div className='div-LogoQA'>
            <img src="https://cdn.discordapp.com/attachments/909842814211334165/1075643352810258452/logoQA.png" alt="logoQA" />
        </div>
        : 
        <></>
    );
}

export default QALogo;
