import React from 'react';
import sp1 from "../../../imagenes/sponsor-1.png";
import sp2 from "../../../imagenes/sponsor-2.png";
import sp3 from "../../../imagenes/sponsor-3.png";
import sp4 from "../../../imagenes/sponsor-4.png";

const CardSponsor = () => {
    return (
        <>
            <div className='col div-img-sponsor'>
                <img src={sp1} alt="" className="sponsor-img shadow-sm" />
            </div>
            <div className='col div-img-sponsor'>
                <img src={sp2} alt="" className="sponsor-img shadow-sm" />
            </div>
            <div className='col div-img-sponsor'>
                <img src={sp3} alt="" className="sponsor-img shadow-sm" />
            </div>
            <div className='col div-img-sponsor'>
                <img src={sp4} alt="" className="sponsor-img shadow-sm" />
            </div>
        </>
    );
}

export default CardSponsor;
