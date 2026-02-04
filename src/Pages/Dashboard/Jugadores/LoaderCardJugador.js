import React from 'react'

function LoaderCardJugador() {
    let arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    return (
        <>
            {arr.map(data => {
                return (
                    <div key={data} className='col centrar out-modal-player Loader'>
                        <div className='div-modal-player shadow-sm '>
                            <div className='Loader-head-Jugador'>
                                <div className='loader-animacion content-head'>
                                </div>
                            </div>
                            <div className='Loader-body-Jugador'>
                                <div className='loader-animacion content-body'>
                                </div>
                                <div className='subcontent-div'>
                                    <div className='loader-animacion subcontent-body-date'>
                                    </div>
                                    <div className=' loader-animacion subcontent-body-year'>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            })}
        </>
    )
}

export default LoaderCardJugador
