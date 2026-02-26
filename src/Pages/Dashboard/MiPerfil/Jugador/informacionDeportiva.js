import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../../../Context/AuthContext';
import { AvanzarModulo, fetchData, VolverTab } from '../../../../Funciones/Funciones';

const InformacionDeportiva = ({ id, Perfil, setPerfil, Posición, setPosición, PosicionSecundaria, setPosicionSecundaria, DetallePosicion, setDetallePosicion, SistemaJuego, setSistemaJuego, Mercado, setMercado, CaracteristicaFutbolerasValores, JugadorNivel, setJugadorNivel, setFormulario, Actualizar, setActualizar }) => {
    const { Alerta, Request, setloading } = useAuth();
    const [Mercados, setMercados] = useState([]);
    const [SistemasJuego, setSistemasJuego] = useState([]);
    const [CaracteristicaFutboleras, setCaracteristicaFutboleras] = useState([]);
    const [hasChanges, setHasChanges] = useState(false);
    const formRef = useRef(null);
    var indice = 0

    useEffect(() => {
        //Obtener Array con los Tipos de Documentos
        function GetMercados() {
            const formdata = new FormData();
            formdata.append("dato", 1);

            axios({
                method: "post",
                url: `${Request.Dominio}/mercado`,
                headers: {
                    "userLogin": Request.userLogin,
                    "userPassword": Request.userPassword,
                    "systemRoot": Request.Empresa
                },
                data: formdata

            }).then(res => {
                const arreglo = res.data.data
                setMercados(arreglo)

            }).catch(error => {
            });
        }

        //Obtener el Array con los Paises
        function GetSistemasJuego() {

            const formdata = new FormData();
            formdata.append("dato", 1);

            axios({
                method: "post",
                url: `${Request.Dominio}/sistema_juego`,
                headers: {
                    "userLogin": Request.userLogin,
                    "userPassword": Request.userPassword,
                    "systemRoot": Request.Empresa
                },
                data: formdata

            }).then(res => {
                const Arreglo = res.data.data
                setSistemasJuego(Arreglo);

            }).catch(error => {
            });
        }

        //Obtener el Array con los Paises
        function GetCaracteristica_futbolera() {

            const formdata = new FormData();
            formdata.append("dato", 1);

            axios({
                method: "post",
                url: `${Request.Dominio}/caracteristica_futbolera`,
                headers: {
                    "userLogin": Request.userLogin,
                    "userPassword": Request.userPassword,
                    "systemRoot": Request.Empresa
                },
                data: formdata

            }).then(res => {
                const Arreglo = res.data.data
                setCaracteristicaFutboleras(Arreglo);

            }).catch(error => {
            });
        }



        GetCaracteristica_futbolera()
        GetMercados()
        GetSistemasJuego()

    }, [Request, id]);

    function GuardarInformaciónDeportiva(id, Perfil, Posición, PosicionSecundaria, DetallePosicion, SistemaJuego, Mercado, inputs) {
        if (Perfil && Posición && SistemaJuego && Mercado && JugadorNivel && inputs) {
            setloading(true) //Acitvar el Loader

            // Se crea una promesa con dos llamadas fetchData que retornan datos de la API
            Promise.all([
                fetchData(Request,
                    "jugador_informacion_deportiva_upd",
                    [
                        { nombre: "vit_jugador_id", envio: id },
                        { nombre: "perfil", envio: Perfil },
                        { nombre: "vit_posicion_juego_id", envio: Posición },
                        { nombre: "vit_sub_posicion_juego_id", envio: PosicionSecundaria },
                        { nombre: "detalle_posicion", envio: DetallePosicion },
                        { nombre: "vit_sistema_juego_id", envio: SistemaJuego },
                        { nombre: "vit_mercado_id", envio: Mercado },
                        { nombre: "vit_jugador_nivel_id", envio: JugadorNivel }
                    ]
                )
            ]).then(([res_i_d]) => {

                if (res_i_d[0].Success) {
                    Alerta("success", res_i_d[0].Success)
                    setHasChanges(false)
                    setActualizar(!Actualizar)

                } else {
                    Alerta("error", res_i_d[0].Error)
                }

            }).catch(error => {
                Alerta("error", "Error al subir la información")
                console.log(error);

            }).finally(() => {
                // Se desactiva el indicador de carga
                setloading(false);

            })


            for (let i = 0; i < inputs.length; i++) {
                fetchData(Request,
                    "jugador_caracteristica",
                    [
                        { nombre: "vit_caracteristica_futbolera_id", envio: inputs[i].className.split(" ")[1] },
                        { nombre: "vit_jugador_id", envio: id },
                        { nombre: "vit_jugador_caracteristica_id", envio: inputs[i].className.split(" ")[1] },
                        { nombre: "puntaje", envio: inputs[i].value },
                        { nombre: "orden ", envio: inputs[i].className.split(" ")[3] }
                    ]
                )
            }


        }
        else {
            Alerta("error", "Complete todos los campos requeridos.")
        }



    }

    return (
        <>
            <form onSubmit={(e) => e.preventDefault()} ref={formRef}>
                <div className='card-body' data-aos="zoom-in" onChange={() => setHasChanges(true)}>
                    <h2 className="h4 fw-semibold text-center mb-0">Información Deportiva</h2>
                    <p className="text-secondary text-center mb-4">Algunos detalles sobre tus habilidades</p>
                    <div className='col-12'>
                        <div className="row">
                            <div className="col-sm-12 centrar-input">
                                <label htmlFor="projectName" className="form-label">Perfil *</label>
                                <div className="d-flex gap-3">
                                    <div className="form-check">
                                        <input className="form-check-input" name="flexRadioDefault" checked={Perfil === "Izquierdo" ? true : false} onChange={(e) => { e.target.checked ? setPerfil("Izquierdo") : setPerfil("") }} type="radio" id="flexCheckChecked" />
                                        <label className="form-check-label" htmlFor="flexCheckChecked">
                                            Izquierdo
                                        </label>
                                    </div>
                                    <div className="form-check">
                                        <input className="form-check-input" name="flexRadioDefault" checked={Perfil === "Derecho" ? true : false} onChange={(e) => { e.target.checked ? setPerfil("Derecho") : setPerfil("") }} type="radio" value="" id="flexCheckDefault" />
                                        <label className="form-check-label" htmlFor="flexCheckDefault">
                                            Derecho
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div className="col-sm-4 centrar-input mt-3">
                                <label htmlFor="projectName" className="form-label">Niveles de Jugador *</label>
                                <select className='form-select' value={JugadorNivel} onChange={(e) => setJugadorNivel(e.target.value)}>
                                    <option value="" disabled>Seleccione tu nivel</option>
                                    <option value="1">Aficionado</option>
                                    <option value="2">Profesional</option>
                                </select>
                            </div>
                            <div className="col-sm-4 centrar-input mt-3">
                                <label htmlFor="posicionInicial" className="form-label">Posición Principal *</label>
                                <select className='form-select' value={Posición} onChange={(e) => setPosición(e.target.value)}>
                                    <option value="" disabled>Seleccione tu posición</option>
                                    <optgroup label='Portero'>
                                        <option value="1">Portero</option>
                                    </optgroup>
                                    <optgroup label='Defensa'>
                                        <option value="2">Lateral Derecho</option>
                                        <option value="3">Central Derecho</option>
                                        <option value="4">Central Izquierdo</option>
                                        <option value="5">Lateral Izquierdo</option>
                                    </optgroup>
                                    <optgroup label='MedioCampo'>
                                        <option value="6">MedioCampo Defensivo</option>
                                        <option value="7">Mediocampo Derecho</option>
                                        <option value="8">Mediocampo Izquierda</option>
                                        <option value="9">MedioCampo Ofensivo</option>
                                    </optgroup>
                                    <optgroup label='Delantero'>
                                        <option value="10">Extremo Derecho</option>
                                        <option value="11">Segundo Delantero</option>
                                        <option value="12">Extremo Izquierdo</option>
                                        <option value="13">Central Delantero</option>
                                    </optgroup>
                                </select>
                            </div>
                            <div className="col-sm-4 centrar-input mt-3">
                                <label htmlFor="posicionSecundaria" className="form-label">Posición Secundaria</label>
                                <select className='form-select' value={PosicionSecundaria} onChange={(e) => setPosicionSecundaria(e.target.value)}>
                                    <option value="" disabled>Seleccione tu posición</option>
                                    <optgroup label='Portero'>
                                        <option value="1">Portero</option>
                                    </optgroup>
                                    <optgroup label='Defensa'>
                                        <option value="2">Lateral Derecho</option>
                                        <option value="3">Central Derecho</option>
                                        <option value="4">Central Izquierdo</option>
                                        <option value="5">Lateral Izquierdo</option>
                                    </optgroup>
                                    <optgroup label='MedioCampo'>
                                        <option value="6">MedioCampo Defensivo</option>
                                        <option value="7">Mediocampo Derecho</option>
                                        <option value="8">Mediocampo Izquierda</option>
                                        <option value="9">MedioCampo Ofensivo</option>
                                    </optgroup>
                                    <optgroup label='Delantero'>
                                        <option value="10">Extremo Derecho</option>
                                        <option value="11">Segundo Delantero</option>
                                        <option value="12">Extremo Izquierdo</option>
                                        <option value="13">Central Delantero</option>
                                    </optgroup>
                                </select>
                            </div>
                            <div className="col-sm-12 centrar-input mt-3">
                                <label htmlFor="exampleFormControlTextarea1" className="form-label">Resumen Jugador</label>
                                <textarea className="form-control" id="exampleFormControlTextarea1" rows="3" value={DetallePosicion} onChange={(e) => setDetallePosicion(e.target.value)}></textarea>
                            </div>
                            <div className="col-sm-6 centrar-input mt-3">
                                <label htmlFor="exampleFormControlTextarea1" className="form-label">Sistema de juego preferido *</label>
                                <select className='form-select' value={SistemaJuego} onChange={(e) => setSistemaJuego(e.target.value)}>
                                    <option value="" disabled>Seleccione su sistema de juego</option>
                                    {SistemasJuego.map(p => {
                                        return <option key={p.sistema_id} value={p.sistema_id}>{p.sistema_nombre}</option>
                                    })}
                                </select>
                            </div>
                            <div className="col-sm-6 centrar-input mt-3">
                                <label htmlFor="exampleFormControlTextarea1" className="form-label">¿Qué mercado te interesa? *</label>
                                <select className='form-select' value={Mercado} onChange={(e) => setMercado(e.target.value)}>
                                    <option value="" disabled>Seleccione tu posición</option>
                                    {Mercados.map(p => {
                                        return <option key={p.mercado_id} value={p.mercado_id}>{p.mercado_nombre}</option>
                                    })}
                                </select>
                            </div>
                            {
                                CaracteristicaFutboleras.map(c => {
                                    var value = 1
                                    if (CaracteristicaFutbolerasValores.length !== 0) {
                                        value = CaracteristicaFutbolerasValores[indice].puntaje
                                        indice = indice + 1

                                    }
                                    return (
                                        <div className="col-sm-6 centrar-input mt-4" key={c.codigo}>
                                            <label htmlFor="projectName" className="form-label">{c.nombre}: *</label>
                                            <input defaultValue={value} id='info_Deportiva' key={c.vit_caracteristica_futbolera_id} type="range" className={`form-range ${c.vit_caracteristica_futbolera_id} ${c.codigo} ${c.orden} `} min="1" max="5" step="1" />
                                            <div className="footer-input-Range">
                                                <span>Bajo</span>
                                                <span>Alto</span>
                                            </div>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>
                </div>
                <div className="card-footer">
                    <div className="d-flex justify-content-between">
                        <button type='button' className="btn btn-secondary" onClick={() => VolverTab(setFormulario, "Personal", "profile-tab")}>Anterior</button>
                    </div>
                    <div className="d-flex gap-2">
                        <button type='button' className="btn btn-success" disabled={!hasChanges} onClick={() => {
                            const inputs = formRef.current ? formRef.current.info_Deportiva : null;
                            GuardarInformaciónDeportiva(id, Perfil, Posición, PosicionSecundaria, DetallePosicion, SistemaJuego, Mercado, inputs, JugadorNivel);
                        }}>Guardar</button>
                        <button type='button' className="btn btn-primary" onClick={() => AvanzarModulo(setFormulario, "Carrera", "profile-tab")}>Siguiente</button>
                    </div>
                </div>
            </form>
        </>
    );
}

export default InformacionDeportiva;
