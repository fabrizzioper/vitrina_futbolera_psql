import React, { useState } from 'react';
import Cropper from 'react-easy-crop'
import { useCallback } from 'react';
import Compressor from 'compressorjs';
import getCroppedImg from './cropImage';
import * as faceapi from 'face-api.js';

let faceModelsLoaded = false;

async function loadFaceModels() {
    if (faceModelsLoaded) return;
    await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
    faceModelsLoaded = true;
}

const ModalCrop = ({NombreModal,Base64, setBase64, setFile, setFormato, AspectRatio,id_jugador, validateFace}) => {

    const [TipoArchivo, setTipoArchivo] = useState("");
    const [Area, setArea] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [faceError, setFaceError] = useState("");
    const [detecting, setDetecting] = useState(false);



    // Obtener la nueva area para el recorte
    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setArea(croppedAreaPixels)
    }, [])

    // Obtener el archivo, comprimirlo y colorcarlo en un estado
    function OnSelectFile(e, set) {
        if (e) {
            setFaceError("");

            //Comprimir imagenes
            new Compressor(e, {
                quality: 0.8,
                maxWidth: 500,
                success: async (compressedResult) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(compressedResult);
                    reader.addEventListener("load", async () => {
                        const dataUrl = reader.result;

                        if (validateFace) {
                            setDetecting(true);
                            try {
                                await loadFaceModels();
                                const img = new Image();
                                img.src = dataUrl;
                                await new Promise(res => { img.onload = res; });
                                const detections = await faceapi.detectAllFaces(img, new faceapi.TinyFaceDetectorOptions());
                                if (detections.length === 0) {
                                    setFaceError("No se detectó ningún rostro. Por favor sube una foto donde se vea claramente tu cara.");
                                    setDetecting(false);
                                    return;
                                }
                            } catch (err) {
                                console.error("Error en detección de rostro:", err);
                            }
                            setDetecting(false);
                        }

                        set(dataUrl);
                    });
                },
            });

            setTipoArchivo(e.type.split("/")[1])
        }
    }

    // Setear la nueva imagen recortada en base64 con el formato para el envio  ponerla en preview
    const showCroppedImage = useCallback(async (img, Area, setPreview, setfotmat, Prefijo, id, TipoArchivo) => {
        try {
            const croppedImage = await getCroppedImg(
                img,
                Area
            )
            setPreview(croppedImage) //Enviar la imagen al preview
            const base64 = croppedImage.split(",")[1]

            // Si TipoArchivo está vacío (imagen cargada externamente), extraer del data URL
            let tipo = TipoArchivo;
            if (!tipo) {
                const match = croppedImage.match(/^data:image\/(\w+);/);
                tipo = match ? match[1] : 'png';
            }

            setfotmat(`${id}-${Prefijo}.${tipo};${base64}`); // Formato de Envio "{Prefijo-id.Extencion;Base64}"

        } catch (e) {
            console.error(e)
        }
    }, [])

    // function RemoveGB(base64, set) {
    //     const formdata = new FormData();
    //     formdata.append('image_file_b64', base64);


    //     axios({
    //         method: "post",
    //         url: `https://api.remove.bg/v1.0/removebg`,
    //         headers: {
    //             'X-Api-Key': 'hXwWrPVG3RLeASjB8VE5BwMf',
    //             'Accept': 'application/json',
    //         },
    //         data: formdata,

    //     }).then(res => {
    //         const data = res.data.data.result_b64;
    //         set("data:image/png;base64," + data)
    //         console.log(data);


    //     }).catch(error => {
    //         console.log(error);
    //     });
    // }

    return (
        <div className="modal fade " id={NombreModal} tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content bg-dark">
                    <div className="modal-header">
                        <h1 className="modal-title fs-5" id="exampleModalLabel">Subir Imagen</h1>
                        <button type="button" className="icon-cross" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <input accept="image/png,image/jpeg" type="file" onChange={e => OnSelectFile(e.target.files[0], setBase64)} />
                        {detecting && (
                            <div className="text-center my-3 text-info">
                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                Analizando imagen...
                            </div>
                        )}
                        {faceError && (
                            <div className="alert alert-danger mt-2 py-2 small">{faceError}</div>
                        )}
                        {Base64 ?
                            <>
                                <div className='d-flex'>
                                    <div className="col-6 centrar-input my-3">
                                        <label htmlFor="projectName" className="form-label">Zoom</label>
                                        <input type="range" className="form-range" id="customRange3" min={1} max={5} step={0.01} value={zoom} onChange={e => setZoom(e.target.value)} />
                                    </div>
                                    {/* <div className="col-6 centrar-input my-3 px-3">
                                            <button type='button' className='btn-borrarfondo' onClick={() => RemoveGB(Base64, setBase64)}>Borrar Fondo</button>
                                        </div> */}
                                </div>
                                <Cropper
                                    image={Base64}
                                    crop={crop}
                                    zoom={zoom}
                                    aspect={AspectRatio}
                                    onCropChange={setCrop}
                                    onZoomChange={setZoom}
                                    onCropComplete={onCropComplete}
                                />
                            </>
                            :
                            null

                        }
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-primary" data-bs-dismiss="modal" aria-label="Close" onClick={() => showCroppedImage(Base64, Area, setFile, setFormato, NombreModal, id_jugador, TipoArchivo)}>Aceptar</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ModalCrop;
