import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../../Context/AuthContext';
import { AvanzarModulo, fetchData, limpiarCadena } from '../../../../Funciones/Funciones';
import ModalCrop from '../Componentes/ModalCrop';


const InfomacionPersonal = ({ id, Nombre, setNombre, Apellido, setApellido, Sexo, setSexo, TipoDocumento, setTipoDocumento, Documento, setDocumento, Fecha, setFecha, Pais, setPais, Pais2, setPais2, NombrePadre, setNombrePadre, NombreMadre, setNombreMadre, FileFotoCara, setFileFotoCara, FileFotoMedioCuerpo, setFileFotoMedioCuerpo, Estatura, setEstatura, Peso, setPeso, TallaRopa, setTallaRopa, Sangre, setSangre, setFormulario }) => {
    const { Alerta, Request, setloading, setActualizar, Actualizar } = useAuth();

    const [Tallas, setTallas] = useState([]);
    const [TiposDocs, setTiposDocs] = useState([]);
    const [Paises, setPaises] = useState([]);
    const [MenorEdad, setMenorEdad] = useState(false);

    const [CaraBase64, setCaraBase64] = useState(null);
    const [MedioCuerpoBase64, setMedioCuerpoBase64] = useState(null);
    const [FormatoCara, setFormatoCara] = useState("");
    const [FormatoMedioCuerpo, setFormatoMedioCuerpo] = useState("");

    // const [data, setData] = useState({
    //     Tallas: [],
    //     TiposDocs: [],
    //     Paises: [],
    //     MenorEdad: false,
    //     Imagen: {
    //       CaraBase64: null,
    //       MedioCuerpoBase64: null,
    //       FormatoCara: "",
    //       FormatoMedioCuerpo: ""
    //     }
    //   });



    // Hook para cada vez que se carga la pagina
    useEffect(() => {
        // Obtener Array con los Tipos de Documentos
        function GetTiposDocumentos() {
            const formdata = new FormData();
            formdata.append("dato", 1);


            axios({
                method: "post",
                url: `${Request.Dominio}/tipo_documento`,
                headers: {
                    "userLogin": Request.userLogin,
                    "userPassword": Request.userPassword,
                    "systemRoot": Request.Empresa
                },
                data: formdata

            }).then(res => {
                const arreglo = res.data.data
                setTiposDocs(arreglo);


            }).catch(error => {
            });
        }

        // Obtener el Array con los Paises
        function GetPaises() {

            const formdata = new FormData();
            formdata.append("dato", 1);


            axios({
                method: "post",
                url: `${Request.Dominio}/pais`,
                headers: {
                    "userLogin": Request.userLogin,
                    "userPassword": Request.userPassword,
                    "systemRoot": Request.Empresa
                },
                data: formdata

            }).then(res => {
                const arreglo = res.data.data
                setPaises(arreglo);

            }).catch(error => {
            });
        }
        function GetTallas() {
            const formdata = new FormData();
            formdata.append("dato", 1);

            //Obtener Array con los Tipos de Documentos
            axios({
                method: "post",
                url: `${Request.Dominio}/talla`,
                headers: {
                    "userLogin": Request.userLogin,
                    "userPassword": Request.userPassword,
                    "systemRoot": Request.Empresa
                },
                data: formdata

            }).then(res => {
                const arreglo = res.data.data
                setTallas(arreglo)

            }).catch(error => {
            });
        }

        GetTallas()

        GetTiposDocumentos()
        GetPaises()
    }, [Request]);

    // Validar la edad cada vez que se cambie el estado de fecha
    useEffect(() => {
        function validarEdad(nac) {
            let nacimiento = new Date(nac);
            let fecha_act = new Date();
            let edad = fecha_act.getFullYear() - nacimiento.getFullYear()
            let diferenciaMeses = fecha_act.getMonth() - nacimiento.getMonth()
            if (diferenciaMeses < 0 || (diferenciaMeses === 0 && fecha_act.getDate() < nacimiento.getDate())) {
                edad--
            }
            if (edad < 18) {
                setMenorEdad(true)
            } else {
                setMenorEdad(false)
            }

        }
        validarEdad(Fecha)
    }, [Fecha]);



    // Envio de datos con el ws
    function GuardarInformaciónPersonal(id, Nombre, Apellido, Sexo, TipoDocumento, Documento, Fecha, Pais, Pais2, NombrePadre, NombreMadre, FormatoCara, FormatoMedioCuerpo, Estatura, Peso, TallaRopa, Sangre) {
        if (Nombre.length !== 0 &&
            Apellido.length !== 0 &&
            TipoDocumento.length !== 0 &&
            Documento.length !== 0 &&
            Fecha.length !== 0 &&
            Sexo.length !== 0 &&
            Estatura.length !== 0 &&
            Peso.length !== 0 &&
            TallaRopa.length !== 0 &&
            Pais.length !== 0) {
            setloading(true) //Acitvar el Loader

            // Se crea una promesa con dos llamadas fetchData que retornan datos de la API
            Promise.all([
                fetchData(Request,
                    "jugador_informacion_personal_upd",
                    [
                        { nombre: "vit_jugador_id", envio: id },
                        { nombre: "jugador_nombres", envio: Nombre },
                        { nombre: "jugador_apellidos", envio: Apellido },
                        { nombre: "tipo_documento", envio: TipoDocumento },
                        { nombre: "documento_codigo", envio: Documento },
                        { nombre: "jugador_fecha_nacimiento", envio: Fecha },
                        { nombre: "jugador_nombre_padre", envio: NombrePadre },
                        { nombre: "jugador_nombre_madre", envio: NombreMadre },
                        { nombre: "sexo", envio: Sexo },
                        { nombre: "fb_pais_id", envio: Pais },
                        { nombre: "fb_pais_2_id", envio: Pais2 },
                        { nombre: "foto_perfil", envio: FormatoCara },
                        { nombre: "foto_cuerpo", envio: FormatoMedioCuerpo }
                    ]
                ),
                fetchData(Request,
                    "jugador_caracteristicas_fisicas_upd",
                    [
                        { nombre: 'vit_jugador_id ', envio: id },
                        { nombre: 'jugador_estatura_cm ', envio: Estatura },
                        { nombre: 'jugador_peso_kg ', envio: Peso },
                        { nombre: 'vit_jugador_talla_ropa_id', envio: TallaRopa },
                        { nombre: 'jugador_grupo_sanguineo ', envio: Sangre },
                        { nombre: 'vit_caracteristica_fisica_id ', envio: '1' }
                    ]
                )
            ])
                .then(([res_i_p]) => {

                    if (res_i_p[0].Success) {
                        Alerta("success", res_i_p[0].Success)

                        //Pasar al siguiente formulario
                        AvanzarModulo(setFormulario, "Deportiva", "profile-tab")

                        setActualizar(!Actualizar)
                    } else {
                        Alerta("error", res_i_p[0].Error)
                    }

                }).catch(error => {
                    Alerta("error", "Error al subir la información")
                    console.log(error);

                }).finally(() => {
                    // Se desactiva el indicador de carga
                    setloading(false);

                })
        } else {

            Alerta("error", "Complete todos los campos requeridos.")
        }
    }




    return (
        <>
            <div className='card-body' data-aos="zoom-in">
                <h2 className="h4 fw-semibold text-center mb-0">Información Personal</h2>
                <p className="text-secondary text-center mb-3">Algunos detalles sobre ti</p>
                <div className='row gap-2'>
                    <div className='col out-tipo-user mt-3'>
                        <div className='card-tipo-User'>
                            <img loading="lazy" className='img-user' src={FileFotoCara ? FileFotoCara : "https://cdn.discordapp.com/attachments/866837932907954233/1037972875929456690/cara.png"} alt="..." />
                            <button className="filtro" data-bs-toggle="modal" data-bs-target="#FCara">
                                <img className='filtro-img' src="https://cdn.discordapp.com/attachments/866837932907954233/1037972875929456690/cara.png" alt="..." />
                            </button>
                        </div>

                    </div>
                    <div className='col out-tipo-user mt-3'>
                        <div className='card-tipo-User'>
                            <img loading="lazy" className='img-user' src={FileFotoMedioCuerpo ? FileFotoMedioCuerpo : "https://cdn.discordapp.com/attachments/866837932907954233/1037969659745538078/mitad-cuerpo.png"} alt="..." />
                            <button className="filtro" data-bs-toggle="modal" data-bs-target="#FCuerpo">
                                <img className='filtro-img' src="https://cdn.discordapp.com/attachments/866837932907954233/1037969659745538078/mitad-cuerpo.png" alt="..." />
                            </button>
                        </div>

                    </div>
                    <div className='col-12'>
                        <div className='row'>
                            <div className="col-sm-6  mt-3 centrar-input">
                                <label htmlFor="projectName" className="form-label">Nombres *</label>
                                <input type="text" className="form-control" id="projectName" placeholder="Su nombre" required="" value={Nombre} onChange={(e) => setNombre(e.target.value)} />
                            </div>
                            <div className="col-sm-6  mt-3 centrar-input">
                                <label htmlFor="projectName" className="form-label">Apellidos *</label>
                                <input type="text" className="form-control" id="projectName" placeholder="Su apellido" required="" value={Apellido} onChange={(e) => setApellido(e.target.value)} />
                            </div>
                            <div className="col-lg-4 col-md-4 mt-3 centrar-input">
                                <label htmlFor="projectName" className="form-label">Tipo Documento *</label>
                                <select className='form-select' value={TipoDocumento} onChange={(e) => setTipoDocumento(e.target.value)}>
                                    <option value="" disabled>Seleccione una opción</option>
                                    {TiposDocs.map(p => {
                                        return <option key={p.SC_MASTER_TABLE_ID} value={p.CODE}>{p.NAME}</option>
                                    })}
                                </select>
                            </div>
                            <div className="col-lg-4 col-md-8 mt-3 centrar-input">
                                <label htmlFor="projectName" className="form-label">Nro. Documento *</label>
                                <input type="number" inputMode="numeric" className="form-control" id="projectName" placeholder="Nro. de documento" required="" value={Documento} onChange={(e) => setDocumento(e.target.value)} />
                            </div>
                            <div className="col-lg-4 mt-3 col-sm-6 centrar-input">
                                <label htmlFor="projectName" className="form-label">Fecha de nacimiento *</label>
                                <input type="date" className="form-control" id="projectName" required="" value={Fecha} onChange={(e) => { setFecha(e.target.value); }} />
                            </div>
                            <div className="col-lg-4 mt-3 col-sm-6 centrar-input">
                                <div className="col-sm centrar-input">
                                    <label htmlFor="projectName" className="form-label">Sexo *</label>
                                    <select className='form-select' value={Sexo} onChange={(e) => setSexo(e.target.value)}>
                                        <option value="" disabled>Seleccione una opción</option>
                                        <option value="M">Masculino</option>
                                        <option value="F">Femenino</option>
                                    </select>
                                </div>
                            </div>
                            <div className="col-lg-4 mt-3 col-sm-6 centrar-input">
                                <label htmlFor="projectName" className="form-label">Nacionalidad *</label>
                                <select className="form-select tomselected ts-hidden-accessible" id="country" value={Pais} onChange={(e) => setPais(e.target.value)} required="" autoComplete="off" data-select="{&quot;placeholder&quot;: &quot;Choose...&quot;}" data-option-template="<span className=&quot;d-flex align-items-center py-2&quot;><span className=&quot;avatar avatar-circle avatar-xxs&quot;><img className=&quot;avatar-img shadow-sm&quot; src=&quot;./assets/images/flags/1x1/[[value]].svg&quot; /></span><span className=&quot;text-truncate ms-2&quot;>[[text]]</span></span>" data-item-template="<span className=&quot;d-flex align-items-center&quot;><span className=&quot;avatar avatar-circle avatar-xxs&quot;><img className=&quot;avatar-img shadow-sm&quot; src=&quot;./assets/images/flags/1x1/[[value]].svg&quot; /></span><span className=&quot;text-truncate ms-2&quot;>[[text]]</span></span>">
                                    <option value="" disabled label="Seleccione un pais"></option>
                                    {Paises.map(p => {
                                        return <option key={p.pais_id} value={p.pais_id}>{p.pais_nombre}</option>
                                    })}
                                </select>
                            </div>
                            <div className="col-sm mt-3 centrar-input">
                                <label htmlFor="projectName" className="form-label">Segunda Nacionalidad </label>
                                <select className="form-select tomselected ts-hidden-accessible" id="country" value={Pais2} onChange={(e) => setPais2(e.target.value)} required="" autoComplete="off" data-select="{&quot;placeholder&quot;: &quot;Choose...&quot;}" data-option-template="<span className=&quot;d-flex align-items-center py-2&quot;><span className=&quot;avatar avatar-circle avatar-xxs&quot;><img className=&quot;avatar-img shadow-sm&quot; src=&quot;./assets/images/flags/1x1/[[value]].svg&quot; /></span><span className=&quot;text-truncate ms-2&quot;>[[text]]</span></span>" data-item-template="<span className=&quot;d-flex align-items-center&quot;><span className=&quot;avatar avatar-circle avatar-xxs&quot;><img className=&quot;avatar-img shadow-sm&quot; src=&quot;./assets/images/flags/1x1/[[value]].svg&quot; /></span><span className=&quot;text-truncate ms-2&quot;>[[text]]</span></span>">
                                    <option value="" disabled label="Seleccione un pais"></option>
                                    {Paises.map(p => {
                                        return <option key={p.pais_id} value={p.pais_id}>{p.pais_nombre}</option>
                                    })}
                                </select>
                            </div>
                            {MenorEdad ?
                                <>
                                    <div className="col-sm-6 mt-3 centrar-input">
                                        <label htmlFor="projectName" className="form-label">Padre *</label>
                                        <input type="text" className="form-control" id="projectName" placeholder="Su nombre completo" required="" value={NombrePadre} onChange={(e) => setNombrePadre(e.target.value)} />
                                    </div>
                                    <div className="col-sm-6 mt-3 centrar-input">
                                        <label htmlFor="projectName" className="form-label">Madre *</label>
                                        <input type="text" className="form-control" id="projectName" placeholder="Su nombre completo" required="" value={NombreMadre} onChange={(e) => setNombreMadre(e.target.value)} />
                                    </div>
                                </>

                                :
                                <></>
                            }
                            <div className="col-sm-6 centrar-input mt-3">
                                <label htmlFor="projectName" className="form-label">Estatura (cm): *<input type="number" inputMode='numeric' className='input-justText' value={Estatura} onChange={(e) => setEstatura(e.target.value)} /></label>
                                <input type="range" className="form-range" min="100" max="250" value={Estatura} onChange={(e) => setEstatura(e.target.value)} id="customRange3" tabIndex={"-1"} />
                            </div>
                            <div className="col-sm-6 centrar-input mt-3">
                                <label htmlFor="projectName" className="form-label">Peso (kg): *<input type="number" inputMode='numeric' className='input-justText' value={Peso} onChange={(e) => setPeso(e.target.value)} /></label>
                                <input type="range" className="form-range" min="30" max="150" value={Peso} onChange={(e) => setPeso(e.target.value)} id="customRange3" tabIndex={"-1"} />
                            </div>
                            <div className="col-sm-6 centrar-input mt-3">
                                <label htmlFor="posicionInicial" className="form-label">Talla de ropa *</label>
                                <select className='form-select' value={TallaRopa} onChange={(e) => setTallaRopa(e.target.value)}>
                                    <option value="" disabled>Seleccione su talla</option>
                                    {Tallas.map(t => {
                                        return <option key={t.vit_jugador_talla_id} value={t.vit_jugador_talla_id}>{t.nombre}</option>
                                    })}
                                </select>
                            </div>
                            <div className="col-sm-6 centrar-input mt-3">
                                <label htmlFor="posicionInicial" className="form-label">Grupo Sanguíneo</label>
                                <select className='form-select' value={Sangre} onChange={(e) => setSangre(e.target.value)}>
                                    <option value="" disabled>Seleccione su tipo de Sangre</option>
                                    <option value="A+">A+</option>
                                    <option value="O+">O+</option>
                                    <option value="B+">B+</option>
                                    <option value="AB+">AB+</option>
                                    <option value="A-">A-</option>
                                    <option value="O-">O-</option>
                                    <option value="B-">B-</option>
                                    <option value="AB-">AB-</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="card-footer one-btn">
                <div className="d-flex justify-content-between">
                    <button className="btn btn-primary" onClick={() => GuardarInformaciónPersonal(id, limpiarCadena(Nombre), limpiarCadena(Apellido), Sexo, TipoDocumento, Documento, Fecha, Pais, Pais2, limpiarCadena(NombrePadre), limpiarCadena(NombreMadre), FormatoCara, FormatoMedioCuerpo, Estatura, Peso, TallaRopa, Sangre)}>Siguiente</button>
                </div>
            </div>






            {/* Modales Subir Imagenes */}
            <ModalCrop
                NombreModal="FCara"
                Base64={CaraBase64}
                setBase64={setCaraBase64}
                setFile={setFileFotoCara}
                setFormato={setFormatoCara}
                AspectRatio={1 / 1}
                id_jugador={id}
            />

            <ModalCrop
                NombreModal="FCuerpo"
                Base64={MedioCuerpoBase64}
                setBase64={setMedioCuerpoBase64}
                setFile={setFileFotoMedioCuerpo}
                setFormato={setFormatoMedioCuerpo}
                AspectRatio={4 / 5}
                id_jugador={id}
            />

        </>
    );
}

export default InfomacionPersonal;
