import axios from 'axios';
import React, { useState } from 'react';
import Cropper from 'react-easy-crop'
import { useAuth } from '../../../Context/AuthContext';
import { DEFAULT_IMAGES } from '../../../../Funciones/DefaultImages';

const TipoUsuario = ({ id, FileFotoCara, setFileFotoCara, FileFotoMedioCuerpo, setFileFotoMedioCuerpo }) => {

    const { Alerta, Request } = useAuth();

    const [FotoCaraBase64, setFotoCaraBase64] = useState(null);
    const [FotoMedioCuerpoBase64, setFotoMedioCuerpoBase64] = useState(null);
    const [Tipo, setTipo] = useState("");
    const [Archivo, setArchivo] = useState("");
    const [Fecha, setFecha] = useState("");
    const [Titulo, setTitulo] = useState("");
    const [Descripcion, setDescripcion] = useState("");

    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [crop2, setCrop2] = useState({ x: 0, y: 0 })
    const [zoom2, setZoom2] = useState(1)


    function CovertirBase64(e, i) {
        const reader = new FileReader();
        reader.readAsDataURL(e);
        reader.onload = function () {

            var Base64 = reader.result
            i(Base64);
            setTipo(e.type)
            setArchivo(Base64)
            //Dar Formato a la fecha
            const fechaNac = new Date(e.lastModifiedDate)
            let dia = fechaNac.getDate()
            let mes = fechaNac.getMonth() + 1
            let año = fechaNac.getFullYear()

            if (mes < 10) {
                mes = `0${mes}`
            }
            if (dia < 10) {
                dia = `0${dia}`
            }
            setFecha(`${año}-${mes}-${dia}`)
            setTitulo(e.name)
            setDescripcion(e.Descripcion)
        }

        //Setear datos para el envio de la imagen
        console.log(e);

    }

    function OnSelectFile(e) {
        if (e) {
            const reader = new FileReader();
            reader.readAsDataURL(e);
            reader.addEventListener("load", () => {
                setFileFotoMedioCuerpo(reader.result)
            })
            CovertirBase64(e, setFotoMedioCuerpoBase64)

        }
    }
    function OnSelectFile2(e) {
        if (e) {
            const reader = new FileReader();
            reader.readAsDataURL(e);
            reader.addEventListener("load", () => {
                setFileFotoCara(reader.result)
            })
            CovertirBase64(e, setFotoCaraBase64)

        }
    }

    function GuardarImagen(id, Tipo, Archivo, Fecha, Titulo, Descripcion) {

        const formdata = new FormData();
        formdata.append('vit_jugador_id', id);
        formdata.append('multimedia_tipo', Tipo);
        formdata.append('multimedia_archivo', Archivo);
        formdata.append('multimedia_fecha', Fecha);
        formdata.append('multimedia_titulo', Titulo);
        formdata.append('multimedia_descripcion', Descripcion);
        formdata.append('estado', '1');

        axios({
            method: "post",
            url: `${Request.Dominio}/jugador_caracteristicas_fisicas_upd`,
            headers: {
                "userLogin": Request.userLogin,
                "userPassword": Request.userPassword,
                "systemRoot": Request.Empresa
            },
            data: formdata

        }).then(res => {
            Alerta("success", "Se guardó Correctamente")

        }).catch(error => {
            Alerta("error", "Error al subir la información")
        });

    }

    return (

        <>
            <div className='card-body'>
                <h2 className="h4 fw-semibold text-center mb-0">Fotos de Perfil</h2>
                <p className="text-secondary text-center mb-4">Suba sus fotos para su perfil</p>
                <div className='row row-tipo-user'>
                    <div className='col out-tipo-user'>
                        <div className='card-tipo-User'>
                            <img src={FileFotoMedioCuerpo ? FileFotoMedioCuerpo : DEFAULT_IMAGES.MITAD_CUERPO} alt="..." />
                            <button className="file-select filtro icon-camara1" data-bs-toggle="modal" data-bs-target="#FotoMedioCuerpo">
                            </button>
                        </div>

                    </div>
                    <div className='col out-tipo-user'>
                        <div className='card-tipo-User'>
                            <img src={FileFotoCara ? FileFotoCara : DEFAULT_IMAGES.CARA} alt="..." />
                            <button className="file-select filtro icon-camara1" data-bs-toggle="modal" data-bs-target="#FotoCara">
                            </button>
                        </div>

                    </div>
                </div>
            </div>



            <div className="modal fade " id="FotoMedioCuerpo" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content  bg-dark">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="exampleModalLabel">Subir Imagen</h1>
                            <button type="button" className="icon-cross" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <input accept="image/png" type="file" onChange={e => OnSelectFile(e.target.files[0])} />
                            {FileFotoMedioCuerpo ?
                                <>
                                    <div className='d-flex'>
                                        <div className="col-6 centrar-input my-3">
                                            <label htmlFor="projectName" className="form-label">Zoom</label>
                                            <input type="range" className="form-range" id="customRange3" min={1} max={5} step={0.01} value={zoom} onChange={e => setZoom(e.target.value)} />
                                        </div>
                                        <div className="col-6 centrar-input my-3 px-3">
                                            <button type='button' className='btn-borrarfondo'>Borrar Fondo</button>
                                        </div>
                                    </div>
                                    <Cropper
                                        image={FileFotoMedioCuerpo}
                                        crop={crop}
                                        zoom={zoom}
                                        aspect={1 / 1}
                                        onCropChange={setCrop}
                                        onZoomChange={setZoom}
                                    />
                                </>
                                :
                                null

                            }
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-primary" data-bs-dismiss="modal" aria-label="Close" onClick={e => GuardarImagen(id, Tipo, Archivo, Fecha, Titulo, Descripcion)}>Guardar</button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="modal fade " id="FotoCara" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content bg-dark">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="exampleModalLabel">Subir Imagen</h1>
                            <button type="button" className="icon-cross" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <input accept="image/png" type="file" onChange={e => OnSelectFile2(e.target.files[0])} />
                            {FileFotoCara ?
                                <>
                                    <div className='d-flex'>
                                        <div className="col-6 centrar-input my-3">
                                            <label htmlFor="projectName" className="form-label">Zoom</label>
                                            <input type="range" className="form-range" id="customRange3" min={1} max={2.5} step={0.01} value={zoom2} onChange={e => setZoom2(e.target.value)} />
                                        </div>
                                        <div className="col-6 centrar-input my-3 px-3">
                                            <button type='button' className='btn-borrarfondo'>Borrar Fondo</button>
                                        </div>
                                    </div>
                                    <Cropper
                                        image={FileFotoCara}
                                        crop={crop2}
                                        zoom={zoom2}
                                        aspect={1 / 1}
                                        onCropChange={setCrop2}
                                        onZoomChange={setZoom2}
                                    />
                                </>
                                :
                                null

                            }
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-primary" data-bs-dismiss="modal" aria-label="Close" onClick={e => GuardarImagen(id, Tipo, Archivo, Fecha, Titulo, Descripcion)}>Guardar</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default TipoUsuario;
