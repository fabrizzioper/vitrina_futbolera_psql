import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../../Context/AuthContext';
import { AvanzarModulo, fetchData, limpiarCadena } from '../../../../Funciones/Funciones';
import ModalCrop from '../Componentes/ModalCrop';
import AutorizacionMenor from './AutorizacionMenor/AutorizacionMenor';


const InfomacionPersonal = ({ id, Nombre, setNombre, Apellido, setApellido, Sexo, setSexo, TipoDocumento, setTipoDocumento, Documento, setDocumento, Fecha, setFecha, Pais, setPais, Pais2, setPais2, NombreApoderado, setNombreApoderado, DocApoderado, setDocApoderado, TipoDocApoderado, setTipoDocApoderado, ParentescoApoderado, setParentescoApoderado, AutorizacionEstado, setAutorizacionEstado, FileFotoCara, setFileFotoCara, FileFotoMedioCuerpo, setFileFotoMedioCuerpo, Estatura, setEstatura, Peso, setPeso, TallaRopa, setTallaRopa, Sangre, setSangre, setFormulario, soloSiguiente }) => {
    const { Alerta, Request, setloading, setActualizar, Actualizar, refreshCurrentUser } = useAuth();

    const [Tallas, setTallas] = useState([]);
    const [TiposDocs, setTiposDocs] = useState([]);
    const [Paises, setPaises] = useState([]);
    const [MenorEdad, setMenorEdad] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [showValidationErrors, setShowValidationErrors] = useState(false);

    // Reglas por tipo de documento
    const docRules = {
        DNI:    { maxLen: 8, soloNumeros: true },
        PASA:   { maxLen: 8, soloNumeros: false },
        CAR_EX: { maxLen: 9, soloNumeros: false },
    };

    function handleDocumentoChange(value) {
        const rules = docRules[TipoDocumento];
        if (!rules) { setDocumento(value); return; }
        let val = value.toUpperCase();
        if (rules.soloNumeros) val = val.replace(/\D/g, '');
        else val = val.replace(/[^A-Z0-9]/g, '');
        setDocumento(val.slice(0, rules.maxLen));
    }

    const campoRequeridoVacio = (val) => showValidationErrors && (!val || (typeof val === 'string' && !val.trim()));

    const [CaraBase64, setCaraBase64] = useState(null);
    const [MedioCuerpoBase64, setMedioCuerpoBase64] = useState(null);
    const [FormatoCara, setFormatoCara] = useState("");
    const [FormatoMedioCuerpo, setFormatoMedioCuerpo] = useState("");
    const [ImgCaraError, setImgCaraError] = useState(false);
    const [ImgCuerpoError, setImgCuerpoError] = useState(false);

    useEffect(() => {
        setImgCaraError(false);
    }, [FileFotoCara]);
    useEffect(() => {
        setImgCuerpoError(false);
    }, [FileFotoMedioCuerpo]);

    // Detectar cambios de imagen (vienen de ModalCrop, no de onChange del form)
    useEffect(() => {
        if (FormatoCara) setHasChanges(true);
    }, [FormatoCara]);
    useEffect(() => {
        if (FormatoMedioCuerpo) setHasChanges(true);
    }, [FormatoMedioCuerpo]);

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
            if (!nac || String(nac).trim() === '') {
                setMenorEdad(false);
                return;
            }
            let nacimiento = new Date(nac);
            if (isNaN(nacimiento.getTime())) {
                setMenorEdad(false);
                return;
            }
            let fecha_act = new Date();
            let edad = fecha_act.getFullYear() - nacimiento.getFullYear();
            let diferenciaMeses = fecha_act.getMonth() - nacimiento.getMonth();
            if (diferenciaMeses < 0 || (diferenciaMeses === 0 && fecha_act.getDate() < nacimiento.getDate())) {
                edad--;
            }
            setMenorEdad(edad < 18);
        }
        validarEdad(Fecha);
    }, [Fecha]);



    // Envio de datos con el ws
    function GuardarInformaciónPersonal(id, Nombre, Apellido, Sexo, TipoDocumento, Documento, Fecha, Pais, Pais2, NombreApoderado, DocApoderado, TipoDocApoderado, ParentescoApoderado, FormatoCara, FormatoMedioCuerpo, Estatura, Peso, TallaRopa, Sangre, onSuccess) {
        const apoderadoOk = !MenorEdad || (NombreApoderado && NombreApoderado.trim().length !== 0 && ParentescoApoderado && ParentescoApoderado.length !== 0);
        if (Nombre.length !== 0 &&
            Apellido.length !== 0 &&
            TipoDocumento.length !== 0 &&
            Documento.length !== 0 &&
            Fecha.length !== 0 &&
            Sexo.length !== 0 &&
            Estatura.length !== 0 &&
            Peso.length !== 0 &&
            TallaRopa.length !== 0 &&
            Pais.length !== 0 &&
            apoderadoOk) {
            setloading(true) //Acitvar el Loader

            console.log("=== DEBUG FOTOS AL GUARDAR ===");
            console.log("FormatoCara:", FormatoCara ? FormatoCara.substring(0, 80) + "..." : FormatoCara);
            console.log("FormatoMedioCuerpo:", FormatoMedioCuerpo ? FormatoMedioCuerpo.substring(0, 80) + "..." : FormatoMedioCuerpo);
            console.log("FileFotoCara:", FileFotoCara ? FileFotoCara.substring(0, 80) + "..." : FileFotoCara);
            console.log("FileFotoMedioCuerpo:", FileFotoMedioCuerpo ? FileFotoMedioCuerpo.substring(0, 80) + "..." : FileFotoMedioCuerpo);
            console.log("foto_perfil enviado:", (FormatoCara || "") ? "tiene valor" : "string vacio");
            console.log("foto_cuerpo enviado:", (FormatoMedioCuerpo || "") ? "tiene valor" : "string vacio");

            // Se crea una promesa con dos llamadas fetchData que retornan datos de la API
            const paramsPersonal = [
                { nombre: "vit_jugador_id", envio: id },
                { nombre: "jugador_nombres", envio: Nombre },
                { nombre: "jugador_apellidos", envio: Apellido },
                { nombre: "tipo_documento", envio: TipoDocumento },
                { nombre: "documento_codigo", envio: Documento },
                { nombre: "jugador_fecha_nacimiento", envio: Fecha },
                { nombre: "jugador_nombre_apoderado", envio: NombreApoderado },
                { nombre: "jugador_doc_apoderado", envio: DocApoderado },
                { nombre: "jugador_tipo_doc_apoderado", envio: TipoDocApoderado },
                { nombre: "jugador_parentesco_apoderado", envio: ParentescoApoderado },
                { nombre: "sexo", envio: Sexo },
                { nombre: "fb_pais_id", envio: Pais },
                { nombre: "fb_pais_2_id", envio: Pais2 },
                { nombre: "foto_perfil", envio: FormatoCara || "" },
                { nombre: "foto_cuerpo", envio: FormatoMedioCuerpo || "" },
            ];

            Promise.all([
                fetchData(Request, "jugador_informacion_personal_v2_upd", paramsPersonal),
                fetchData(Request,
                    "jugador_caracteristicas_fisicas_upd",
                    [
                        { nombre: 'vit_jugador_id', envio: id },
                        { nombre: 'jugador_estatura_cm', envio: Estatura },
                        { nombre: 'jugador_peso_kg', envio: Peso },
                        { nombre: 'vit_jugador_talla_ropa_id', envio: TallaRopa },
                        { nombre: 'vit_jugador_talla_calzado_id', envio: '' },
                        { nombre: 'jugador_grupo_sanguineo', envio: Sangre },
                        { nombre: 'vit_caracteristica_fisica_id', envio: '1' }
                    ]
                )
            ])
                .then(([res_i_p]) => {

                    if (res_i_p[0].Success) {
                        Alerta("success", res_i_p[0].Success)
                        setHasChanges(false)
                        setFormatoCara("")
                        setFormatoMedioCuerpo("")
                        // refreshCurrentUser actualiza RandomNumberImg, lo cual dispara la recarga de ObtenerJugador
                        refreshCurrentUser()
                        if (onSuccess) onSuccess()
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
            setShowValidationErrors(true);
            Alerta("error", "Complete todos los campos requeridos.")
        }
    }




    return (
        <>
            <div className='card-body' data-aos="zoom-in" onChange={() => { setHasChanges(true); setShowValidationErrors(false); }}>
                <h2 className="h4 fw-semibold text-center mb-0">Información Personal</h2>
                <p className="text-secondary text-center mb-3">Algunos detalles sobre ti</p>
                <div className='row gap-2'>
                    <div className='col out-tipo-user mt-3'>
                        <div className='card-tipo-User card-tipo-User-foto'>
                            {(!FileFotoCara || ImgCaraError) ? (
                                <div className='card-tipo-User-placeholder'>
                                    <i className='fa-solid fa-face-smile icono-jugador-modal' aria-hidden="true"></i>
                                </div>
                            ) : (
                                <img
                                    loading="lazy"
                                    className='img-user'
                                    src={FileFotoCara}
                                    alt="Foto cara"
                                    onError={() => setImgCaraError(true)}
                                />
                            )}
                            <button className="filtro" data-bs-toggle="modal" data-bs-target="#FCara">
                                <i className="fa-solid fa-camera"></i>
                            </button>
                        </div>
                    </div>
                    <div className='col out-tipo-user mt-3'>
                        <div className='card-tipo-User card-tipo-User-foto'>
                            {(!FileFotoMedioCuerpo || ImgCuerpoError) ? (
                                <div className='card-tipo-User-placeholder'>
                                    <span className='icon-arquero1 icono-jugador-modal' aria-hidden="true"></span>
                                </div>
                            ) : (
                                <img
                                    loading="lazy"
                                    className='img-user'
                                    src={FileFotoMedioCuerpo}
                                    alt="Foto medio cuerpo"
                                    onError={() => setImgCuerpoError(true)}
                                />
                            )}
                            <button className="filtro" data-bs-toggle="modal" data-bs-target="#FCuerpo">
                                <i className="fa-solid fa-camera"></i>
                            </button>
                        </div>
                    </div>
                    <div className='col-12'>
                        <div className='row'>
                            {/* Fila 1: solo Tipo de documento + Nro. Documento (ocupan toda la fila) */}
                            <div className="col-lg-6 col-md-6 mt-3 centrar-input">
                                <label className="form-label">Tipo Documento *</label>
                                <select className={`form-select ${campoRequeridoVacio(TipoDocumento) ? 'input-error' : ''}`} value={TipoDocumento} onChange={(e) => { setTipoDocumento(e.target.value); setDocumento(''); }}>
                                    <option value="" disabled>Seleccione una opción</option>
                                    {TiposDocs.map(p => {
                                        return <option key={p.SC_MASTER_TABLE_ID} value={p.CODE}>{p.NAME}</option>
                                    })}
                                </select>
                            </div>
                            <div className="col-lg-6 col-md-6 mt-3 centrar-input">
                                <label className="form-label">
                                    Nro. Documento *
                                    {TipoDocumento === 'DNI' && <span className="text-secondary ms-1 small">(8 dígitos)</span>}
                                    {TipoDocumento === 'PASA' && <span className="text-secondary ms-1 small">(hasta 8 caracteres)</span>}
                                    {TipoDocumento === 'CAR_EX' && <span className="text-secondary ms-1 small">(hasta 9 caracteres)</span>}
                                </label>
                                <input
                                    type="text"
                                    inputMode={docRules[TipoDocumento]?.soloNumeros ? "numeric" : "text"}
                                    className={`form-control ${campoRequeridoVacio(Documento) ? 'input-error' : ''}`}
                                    placeholder={TipoDocumento === 'DNI' ? "12345678" : TipoDocumento === 'PASA' ? "AB123456" : "Nro. de documento"}
                                    value={Documento}
                                    onChange={(e) => handleDocumentoChange(e.target.value)}
                                    maxLength={docRules[TipoDocumento]?.maxLen || 20}
                                />
                            </div>
                            {/* Fila 2: Nombres + Apellidos */}
                            <div className="col-lg-6 col-md-6 mt-3 centrar-input">
                                <label className="form-label">Nombres *</label>
                                <input type="text" className={`form-control ${campoRequeridoVacio(Nombre) ? 'input-error' : ''}`} placeholder="Su nombre" required="" value={Nombre} onChange={(e) => setNombre(e.target.value)} />
                            </div>
                            <div className="col-lg-6 col-md-6 mt-3 centrar-input">
                                <label className="form-label">Apellidos *</label>
                                <input type="text" className={`form-control ${campoRequeridoVacio(Apellido) ? 'input-error' : ''}`} placeholder="Su apellido" required="" value={Apellido} onChange={(e) => setApellido(e.target.value)} />
                            </div>
                            {/* Fila 3: Fecha de nacimiento + Sexo */}
                            <div className="col-lg-6 col-md-6 mt-3 centrar-input">
                                <label htmlFor="projectName" className="form-label">Fecha de nacimiento *</label>
                                <input type="date" className={`form-control ${campoRequeridoVacio(Fecha) ? 'input-error' : ''}`} id="projectName" required="" value={Fecha} onChange={(e) => setFecha(e.target.value)} />
                            </div>
                            <div className="col-lg-6 col-md-6 mt-3 centrar-input">
                                <label htmlFor="projectName" className="form-label">Sexo *</label>
                                <select className={`form-select ${campoRequeridoVacio(Sexo) ? 'input-error' : ''}`} value={Sexo} onChange={(e) => setSexo(e.target.value)}>
                                    <option value="" disabled>Seleccione una opción</option>
                                    <option value="M">Masculino</option>
                                    <option value="F">Femenino</option>
                                </select>
                            </div>
                            {/* Fila 4: Nacionalidad + Segunda nacionalidad (solo estas dos en la fila) */}
                            <div className="col-lg-6 col-md-6 mt-3 centrar-input">
                                <label htmlFor="projectName" className="form-label">Nacionalidad *</label>
                                <select className={`form-select tomselected ts-hidden-accessible ${campoRequeridoVacio(Pais) ? 'input-error' : ''}`} id="country" value={Pais} onChange={(e) => setPais(e.target.value)} required="" autoComplete="off" data-select="{&quot;placeholder&quot;: &quot;Choose...&quot;}" data-option-template="<span className=&quot;d-flex align-items-center py-2&quot;><span className=&quot;avatar avatar-circle avatar-xxs&quot;><img className=&quot;avatar-img shadow-sm&quot; src=&quot;./assets/images/flags/1x1/[[value]].svg&quot; /></span><span className=&quot;text-truncate ms-2&quot;>[[text]]</span></span>" data-item-template="<span className=&quot;d-flex align-items-center&quot;><span className=&quot;avatar avatar-circle avatar-xxs&quot;><img className=&quot;avatar-img shadow-sm&quot; src=&quot;./assets/images/flags/1x1/[[value]].svg&quot; /></span><span className=&quot;text-truncate ms-2&quot;>[[text]]</span></span>">
                                    <option value="" disabled label="Seleccione un pais"></option>
                                    {Paises.map(p => {
                                        return <option key={p.pais_id} value={p.pais_id}>{p.pais_nombre}</option>
                                    })}
                                </select>
                            </div>
                            <div className="col-lg-6 col-md-6 mt-3 centrar-input">
                                <label htmlFor="projectName" className="form-label">Segunda Nacionalidad</label>
                                <select className="form-select tomselected ts-hidden-accessible" id="country2" value={Pais2} onChange={(e) => setPais2(e.target.value)} autoComplete="off">
                                    <option value="">No aplica</option>
                                    {Paises.map(p => {
                                        return <option key={p.pais_id} value={p.pais_id}>{p.pais_nombre}</option>
                                    })}
                                </select>
                            </div>
                            {/* Fila: Peso + Estatura (debajo de nacionalidad) */}
                            <div className="col-lg-6 col-md-6 centrar-input mt-3">
                                <label className="form-label">Peso (kg): *</label>
                                <input type="number" inputMode='numeric' className={`form-control mb-2 ${campoRequeridoVacio(Peso) ? 'input-error' : ''}`} placeholder="ej. 70" value={Peso} onChange={(e) => setPeso(e.target.value)} />
                                <input type="range" className="form-range" min="30" max="150" value={Peso || 30} onChange={(e) => setPeso(e.target.value)} tabIndex={"-1"} />
                            </div>
                            <div className="col-lg-6 col-md-6 centrar-input mt-3">
                                <label className="form-label">Estatura (cm): *</label>
                                <input type="number" inputMode='numeric' className={`form-control mb-2 ${campoRequeridoVacio(Estatura) ? 'input-error' : ''}`} placeholder="ej. 175" value={Estatura} onChange={(e) => setEstatura(e.target.value)} />
                                <input type="range" className="form-range" min="100" max="250" value={Estatura || 100} onChange={(e) => setEstatura(e.target.value)} tabIndex={"-1"} />
                            </div>
                            {/* Fila: Talla de ropa + Grupo sanguíneo (siempre visibles después de Peso/Estatura) */}
                            <div className="col-lg-6 col-md-6 centrar-input mt-3">
                                <label htmlFor="posicionInicial" className="form-label">Talla de ropa *</label>
                                <select className={`form-select ${campoRequeridoVacio(TallaRopa) ? 'input-error' : ''}`} value={TallaRopa} onChange={(e) => setTallaRopa(e.target.value)}>
                                    <option value="" disabled>Seleccione su talla</option>
                                    {Tallas.map(t => {
                                        return <option key={t.vit_jugador_talla_id} value={t.vit_jugador_talla_id}>{t.nombre}</option>
                                    })}
                                </select>
                            </div>
                            <div className="col-lg-6 col-md-6 centrar-input mt-3">
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
                            {MenorEdad ?
                                <>
                                    <div className="col-12 mt-4">
                                        <h5 className="fw-semibold">Datos del Apoderado</h5>
                                        <hr />
                                    </div>
                                    <div className="col-sm-6 mt-3 centrar-input">
                                        <label className="form-label">Nombre del Apoderado *</label>
                                        <input type="text" className={`form-control ${campoRequeridoVacio(NombreApoderado) ? 'input-error' : ''}`} placeholder="Nombre completo del apoderado" value={NombreApoderado} onChange={(e) => setNombreApoderado(e.target.value)} />
                                    </div>
                                    <div className="col-sm-6 mt-3 centrar-input">
                                        <label className="form-label">Parentesco *</label>
                                        <select className={`form-select ${campoRequeridoVacio(ParentescoApoderado) ? 'input-error' : ''}`} value={ParentescoApoderado} onChange={(e) => setParentescoApoderado(e.target.value)}>
                                            <option value="" disabled>Seleccione</option>
                                            <option value="Padre">Padre</option>
                                            <option value="Madre">Madre</option>
                                            <option value="Tutor Legal">Tutor Legal</option>
                                            <option value="Otro">Otro</option>
                                        </select>
                                    </div>
                                    <div className="col-lg-6 col-md-6 mt-3 centrar-input">
                                        <label className="form-label">Tipo Documento Apoderado</label>
                                        <select className='form-select' value={TipoDocApoderado} onChange={(e) => setTipoDocApoderado(e.target.value)}>
                                            <option value="" disabled>Seleccione</option>
                                            {TiposDocs.map(p => {
                                                return <option key={p.SC_MASTER_TABLE_ID} value={p.CODE}>{p.NAME}</option>
                                            })}
                                        </select>
                                    </div>
                                    <div className="col-lg-6 col-md-6 mt-3 centrar-input">
                                        <label className="form-label">Nro. Documento Apoderado</label>
                                        <input type="text" className="form-control" placeholder="Documento del apoderado" value={DocApoderado} onChange={(e) => setDocApoderado(e.target.value)} />
                                    </div>
                                </>
                                :
                                <></>
                            }
                            {MenorEdad &&
                                <div className="col-12">
                                    <AutorizacionMenor id={id} NombreApoderado={NombreApoderado} DocApoderado={DocApoderado} TipoDocApoderado={TipoDocApoderado} ParentescoApoderado={ParentescoApoderado} NombreJugador={Nombre} ApellidoJugador={Apellido} TipoDocJugador={TipoDocumento} DocJugador={Documento} FechaNacimiento={Fecha} AutorizacionEstado={AutorizacionEstado} setAutorizacionEstado={setAutorizacionEstado} />
                                </div>
                            }
                        </div>
                    </div>
                </div>
            </div>
            <div className="card-footer">
                {!soloSiguiente && (
                    <div className="d-flex justify-content-between">
                        <button className="btn btn-success" disabled={!hasChanges} onClick={() => GuardarInformaciónPersonal(id, limpiarCadena(Nombre), limpiarCadena(Apellido), Sexo, TipoDocumento, Documento, Fecha, Pais, Pais2, limpiarCadena(NombreApoderado), limpiarCadena(DocApoderado), TipoDocApoderado, ParentescoApoderado, FormatoCara, FormatoMedioCuerpo, Estatura, Peso, TallaRopa, Sangre)}>Guardar</button>
                    </div>
                )}
                <div className="d-flex justify-content-between">
                    <button className="btn btn-primary" onClick={() => {
                        if (MenorEdad && AutorizacionEstado !== 2) {
                            if (AutorizacionEstado === 0) Alerta("error", "Debe completar el proceso de autorización de menor para poder avanzar.")
                            else if (AutorizacionEstado === 1) Alerta("error", "Su autorización está pendiente de revisión. No puede avanzar hasta que sea aprobada.")
                            else if (AutorizacionEstado === 3) Alerta("error", "Su autorización fue rechazada. Vuelva a enviar los documentos para poder avanzar.")
                        } else {
                            GuardarInformaciónPersonal(
                                id, limpiarCadena(Nombre), limpiarCadena(Apellido), Sexo, TipoDocumento, Documento, Fecha,
                                Pais, Pais2, limpiarCadena(NombreApoderado), limpiarCadena(DocApoderado),
                                TipoDocApoderado, ParentescoApoderado, FormatoCara, FormatoMedioCuerpo,
                                Estatura, Peso, TallaRopa, Sangre,
                                () => AvanzarModulo(setFormulario, "Deportiva", "profile-tab")
                            )
                        }
                    }}>Siguiente</button>
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
                validateFace={true}
            />

            <ModalCrop
                NombreModal="FCuerpo"
                Base64={MedioCuerpoBase64}
                setBase64={setMedioCuerpoBase64}
                setFile={setFileFotoMedioCuerpo}
                setFormato={setFormatoMedioCuerpo}
                AspectRatio={4 / 5}
                id_jugador={id}
                validateFace={true}
                removeBg={true}
            />

        </>
    );
}

export default InfomacionPersonal;
