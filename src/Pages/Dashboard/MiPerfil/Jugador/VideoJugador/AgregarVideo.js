import React from 'react';

const AgregarVideo = ({ setViewAgregar, UrlVideo, setUrlVideo}) => {
    return (
        <div>
            <div className='d-flex flex-column'>
                <div className="d-flex">
                    <div className='header-return' onClick={() => setViewAgregar(0)}>
                        <i className='icon-flecha2'></i>
                        <h5>Nuevo Video</h5>
                    </div>
                </div>
                <div className='row mt-2'>
                    <div className="mt-3 col-12 centrar-input">
                        <label htmlFor="urlVideo" className="form-label">URL YouTube</label>
                        <input type="url" className="form-control" id="urlVideo" placeholder="" required="" value={UrlVideo} onChange={(e) => setUrlVideo(e.target.value)} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AgregarVideo;
