import React from 'react';

const LoaderClub = () => {
    let arr = [1, 2, 3, 4, 5, 6, 7, 8, 9]
    return (
        <>
            {arr.map(data => {
                return (
                    <div key={data} className="card-club">
                        <div className='club-loader'>
                        </div>
                    </div>

                )
            })}
        </>
    );
}

export default LoaderClub;
