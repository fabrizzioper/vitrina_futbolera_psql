import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import MultiRangeSlider from '../../../Componentes/MultiRageSlider/MultiRangeSlider';
import { useAuth } from '../../../Context/AuthContext';
import { fetchData } from '../../../Funciones/Funciones';
import CardJugador from './CardJugador';
import "./jugadores.css"
import LoaderCardJugador from './LoaderCardJugador';

const Jugadores = () => {
    const { Request, RandomNumberImg } = useAuth();

    const [Isloading, setIsloading] = useState(true);

    const [DatosJugadores, setDatosJugadores] = useState([]);
    const [NuevosDatosJugadores, setNuevosDatosJugadores] = useState([]);
    const [Paises, setPaises] = useState([]);

    //Datos para Filtros
    const [Posicion, setPosicion] = useState("");
    const [Pais, setPais] = useState("");
    const [Edad, setEdad] = useState("");


    const location = useLocation();
    let previusURL = location.state?.from.pathname || "/"



    function handleScroll() {
        window.localStorage.setItem('ScrollY', JSON.stringify(window.scrollY));
    }



    useEffect(() => {
        let savedScrollY = JSON.parse(window.localStorage.getItem('ScrollY'))


        if (NuevosDatosJugadores && NuevosDatosJugadores.length > 0) {
            window.scrollTo(0, savedScrollY)
            window.localStorage.removeItem('ScrollY')

        }

    }, [NuevosDatosJugadores]);


    useEffect(() => {
        // Se crea una variable isMounted con el valor inicial de true
        let isMounted = true;

        // Se activa el indicador de carga
        setIsloading(true);

        // Se crea una promesa con dos llamadas fetchData que retornan datos de la API
        Promise.all([
            fetchData(Request, "tarjetas_jugadores", [{ nombre: "dato", envio: 0 }]),
            fetchData(Request, "pais", [{ nombre: "dato", envio: 0 }])
        ])
            .then(([jugadores, paises]) => {
                // Se verifica si el componente está montado antes de actualizar el estado
                if (isMounted && jugadores && paises) {
                    setDatosJugadores(jugadores);
                    setNuevosDatosJugadores(jugadores);
                    setPaises(paises);
                }
            }).finally(() => {
                // Se desactiva el indicador de carga
                setIsloading(false);
            })

        // Se retorna una función que se ejecuta cuando el componente se desmonta
        return () => {
            // Se actualiza la variable isMounted a false cuando el componente se desmonta
            isMounted = false;
        };

    }, [Request]);



    function onSearch(array, filters) {
        let filtro = filters.toLowerCase()
        let arr = array.filter(data => {
            let nombre = (data.nombres).toLowerCase().includes(filtro)
            let apellido = (data.apellidos).toLowerCase().includes(filtro)
            let pais = (data.pais || "").toLowerCase().includes(filtro)
            return nombre || apellido || pais
        })
        setNuevosDatosJugadores(arr);
    }

    function ViewFiltros() {
        let divFiltro = document.getElementById("filtros").classList
        if (!divFiltro[1]) {
            divFiltro.add("hideFilter")
        } else {
            divFiltro.remove("hideFilter")
        }
    }

    function Filtrar(Pos, Pais, Edad) {
        let arr = DatosJugadores.filter(data => {
            let posicion = true
            let subPosicion = true
            let pais = true
            let edad = true


            if (Pos) {
                posicion = data.vit_posicion_juego_id === parseInt(Pos);
                subPosicion = data.vit_sub_posicion_juego_id === parseInt(Pos);
            }
            if (Pais) {
                pais = data.fb_pais_id === parseInt(Pais);
            }


            let nacimiento = new Date(data.jugador_fecha_nacimiento);
            let fecha_act = new Date();
            let edadTxt = fecha_act.getFullYear() - nacimiento.getFullYear()
            let diferenciaMeses = fecha_act.getMonth() - nacimiento.getMonth()
            if (diferenciaMeses < 0 || (diferenciaMeses === 0 && fecha_act.getDate() < nacimiento.getDate())) {
                edadTxt--
            }
            let e = Edad.split(',')
            let min = parseInt(e[0])
            let max = parseInt(e[1])


            if (edadTxt >= min && edadTxt <= max) {
                edad = true;
            } else {
                edad = false;
            }



            if (subPosicion) {
                return subPosicion && pais && edad;

            } else {
                return posicion && pais && edad;

            }


        })
        setNuevosDatosJugadores(arr)
    }

    return (
        <>
            <div className='out-div-seccion' >
                <div className='header-seccion row gap-3'>
                    <div className='col'>
                        <Link className='Volver-link' to={previusURL}><span className='icon-flecha2'></span><h5 className='d-flex' >Jugadores <span className='cant-Jugadores'>({DatosJugadores.length})</span></h5></Link>
                    </div>
                    <div className="input-group input-group-sm flex-nowrap div-input-search col">
                        <label htmlFor='serch' className="input-group-text input-search"><i className="fa-solid icon-search"></i></label>
                        <input id="serch" type="text" className="form-control input-search" name='search' placeholder="Buscar..." onChange={e => onSearch(DatosJugadores, e.target.value)} aria-label="Username" aria-describedby="addon-wrapping" />
                        <button className="input-group-text input-filtros" onClick={() => ViewFiltros()}><i className="fa-solid fa-filter"></i></button>
                    </div>
                </div>
                <div id='filtros' className='div-filtros hideFilter'>
                    <div className='in-div-filtro row'>
                        <div className='col-md-3 mt-2'>
                            <b>Posición</b>
                            <div className='div-select'>
                                <select className='form-select' value={Posicion} onChange={(e) => setPosicion(e.target.value)} tabIndex="1">
                                    <option value="" >Mostrar Todos</option>
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
                        </div>
                        <div className='col-md-3 mt-2'>
                            <b>País</b>
                            <div className='div-select'>
                                <select className="form-select" id="country" value={Pais} onChange={(e) => setPais(e.target.value)} autoComplete="off" data-select="{&quot;placeholder&quot;: &quot;Choose...&quot;}" data-option-template="<span className=&quot;d-flex align-items-center py-2&quot;><span className=&quot;avatar avatar-circle avatar-xxs&quot;><img className=&quot;avatar-img shadow-sm&quot; src=&quot;./assets/images/flags/1x1/[[value]].svg&quot; /></span><span className=&quot;text-truncate ms-2&quot;>[[text]]</span></span>" data-item-template="<span className=&quot;d-flex align-items-center&quot;><span className=&quot;avatar avatar-circle avatar-xxs&quot;><img className=&quot;avatar-img shadow-sm&quot; src=&quot;./assets/images/flags/1x1/[[value]].svg&quot; /></span><span className=&quot;text-truncate ms-2&quot;>[[text]]</span></span>" tabIndex="2">
                                    <option value="" label="Mostrar Todos"></option>
                                    {Paises.map(p => {
                                        return <option key={p.pais_id} value={p.pais_id}>{p.pais_nombre}</option>
                                    })}
                                </select>
                            </div>
                        </div>
                        <div className='col-md-3 mt-2 mb-4'>
                            <b>Edad</b>
                            <div className='div-select'>
                                <MultiRangeSlider
                                    min={0}
                                    max={60}
                                    onChange={({ min, max }) => setEdad(`${min},${max}`)}
                                    index={3}
                                    index2={4}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="d-flex justify-content-end px-4 sm-mt-3"><button className="btn btn-primary" tabIndex={5} onClick={() => Filtrar(Posicion, Pais, Edad)}>Aplicar</button></div>
                </div>
                <div className='div-seccion-Jugadores mt-3'>
                    <div className='col-lg-12 p-none'>
                        <div className='seccion seccion-jugadores centrar-players'>
                            {Isloading || NuevosDatosJugadores.length === 0 ? (
                                // Muestra el indicador de carga mientras se están cargando los datos o si no hay ningún jugador.
                                Isloading ? <LoaderCardJugador /> : <>No se encontraron jugadores...</>
                            ) : (
                                // Si los datos se cargaron correctamente y hay jugadores, muéstralos.
                                NuevosDatosJugadores.map(data => (
                                    <CardJugador
                                        key={data.vit_jugador_id}
                                        data={data}
                                        numeroRandom={RandomNumberImg}
                                        handleScroll={handleScroll}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Jugadores;
