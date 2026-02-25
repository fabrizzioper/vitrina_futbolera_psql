import React, { useState } from 'react';
import Cropper from 'react-easy-crop'
import { useCallback } from 'react';
import Compressor from 'compressorjs';
import getCroppedImg from './cropImage';

const ModalCrop = ({NombreModal,Base64, setBase64, setFile, setFormato, AspectRatio,id_jugador}) => {

    const [TipoArchivo, setTipoArchivo] = useState("");
    const [Area, setArea] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)



    // Obtener la nueva area para el recorte
    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setArea(croppedAreaPixels)
    }, [])

    // Obtener el archivo, comprimirlo y colorcarlo en un estado
    function OnSelectFile(e, set) {
        if (e) {

            //Comprimir imagenes
            new Compressor(e, {
                quality: 0.8,
                maxWidth: 500,
                success: (compressedResult) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(compressedResult);
                    reader.addEventListener("load", () => {
                        set(reader.result)
                        console.log(reader.result);
                    })
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
