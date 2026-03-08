import React, { useState } from 'react';
import Cropper from 'react-easy-crop'
import { useCallback } from 'react';
import Compressor from 'compressorjs';
import getCroppedImg from './cropImage';
import * as faceapi from 'face-api.js';
import { removeBackground } from '@imgly/background-removal';

let faceModelsLoaded = false;

async function loadFaceModels() {
    if (faceModelsLoaded) return;
    await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
    faceModelsLoaded = true;
}

const ModalCrop = ({NombreModal,Base64, setBase64, setFile, setFormato, AspectRatio,id_jugador, validateFace, removeBg}) => {

    const [TipoArchivo, setTipoArchivo] = useState("");
    const [Area, setArea] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [faceError, setFaceError] = useState("");
    const [detecting, setDetecting] = useState(false);
    const [removingBg, setRemovingBg] = useState(false);
    const [bgRemoved, setBgRemoved] = useState(false);



    // Obtener la nueva area para el recorte
    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setArea(croppedAreaPixels)
    }, [])

    // Obtener el archivo, comprimirlo y colorcarlo en un estado
    function OnSelectFile(e, set) {
        if (e) {
            setFaceError("");

            //Comprimir imagenes (convertir a JPEG para compatibilidad, quality solo aplica a JPEG/WebP)
            new Compressor(e, {
                quality: 0.8,
                maxWidth: 500,
                mimeType: 'image/jpeg',
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

                        if (removeBg) {
                            setRemovingBg(true);
                            try {
                                const resp = await fetch(dataUrl);
                                const blob = await resp.blob();
                                const resultBlob = await removeBackground(blob);
                                const reader2 = new FileReader();
                                reader2.onload = () => {
                                    set(reader2.result);
                                    setBgRemoved(true);
                                    setRemovingBg(false);
                                };
                                reader2.readAsDataURL(resultBlob);
                            } catch (err) {
                                console.error("Error al quitar fondo:", err);
                                set(dataUrl);
                                setRemovingBg(false);
                            }
                        } else {
                            set(dataUrl);
                        }
                    });
                },
            });

            setTipoArchivo(removeBg ? 'png' : 'jpeg')
        }
    }

    // Setear la nueva imagen recortada en base64 con el formato para el envio  ponerla en preview
    const showCroppedImage = useCallback(async (img, Area, setPreview, setfotmat, Prefijo, id, TipoArchivo, bgWasRemoved) => {
        try {
            const outputFormat = bgWasRemoved ? 'image/png' : 'image/jpeg';
            const croppedImage = await getCroppedImg(
                img,
                Area,
                0,
                { horizontal: false, vertical: false },
                outputFormat
            )
            setPreview(croppedImage) //Enviar la imagen al preview
            const base64 = croppedImage.split(",")[1]

            // Si TipoArchivo está vacío (imagen cargada externamente), extraer del data URL
            let tipo = TipoArchivo;
            if (!tipo) {
                const match = croppedImage.match(/^data:image\/(\w+);/);
                tipo = match ? match[1] : 'png';
            }

            const formatoEnvio = `${id}-${Prefijo}.${tipo};${base64}`;
            console.log("=== MODAL CROP ===");
            console.log("Prefijo:", Prefijo);
            console.log("TipoArchivo:", TipoArchivo, "-> tipo:", tipo);
            console.log("Formato nombre:", `${id}-${Prefijo}.${tipo}`);
            console.log("Base64 length:", base64?.length);
            setfotmat(formatoEnvio); // Formato de Envio "{Prefijo-id.Extencion;Base64}"

        } catch (e) {
            console.error(e)
        }
    }, [])

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
                        {removingBg && (
                            <div className="text-center my-3 text-info">
                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                Quitando fondo...
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
                        <button type="button" className="btn btn-primary" data-bs-dismiss="modal" aria-label="Close" onClick={() => showCroppedImage(Base64, Area, setFile, setFormato, NombreModal, id_jugador, TipoArchivo, bgRemoved)}>Aceptar</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ModalCrop;
