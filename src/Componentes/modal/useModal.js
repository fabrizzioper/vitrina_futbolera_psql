import React from 'react'

export default function UseModal({id, titulo, className, contenido, footer}) {
    return (
        <div className={`modal fade ${className} `} id={id} tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div className="modal-dialog">
                <div className="modal-content bg-dark">
                    <div className="modal-header">
                        <h1 className="modal-title fs-4" id="exampleModalLabel">{titulo}</h1>
                        <button type="button" className="icon-cross" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body ">
                        {contenido}
                    </div>
                    <div className="modal-footer">
                        {footer}
                    </div>
                </div>
            </div>
        </div>
    )
}
