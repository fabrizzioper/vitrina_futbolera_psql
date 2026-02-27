import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../Context/AuthContext';
import { fetchData } from '../../../Funciones/Funciones';
import CardClubes from './CardClubes';
import LoaderClub from './LoaderClub';

const Clubes = () => {
    const { Request } = useAuth();

    const location = useLocation();
    let previusURL = location.state?.from.pathname || "/"

    const [DatosInstituciones, setDatosInstituciones] = useState([]);
    const [NuevosDatosInstituciones, setNuevosDatosInstituciones] = useState([]);

    const [Isloading, setIsloading] = useState(true);

    const [Paises, setPaises] = useState([]);

    //Datos para Filtros
    const [Pais, setPais] = useState("");

    function handleScroll() {
        window.localStorage.setItem('ScrollY', JSON.stringify(window.scrollY));
    }


    useEffect(() => {
        let savedScrollY = JSON.parse(window.localStorage.getItem('ScrollY'))


        if (NuevosDatosInstituciones && NuevosDatosInstituciones.length > 0) {
            window.scrollTo(0, savedScrollY)
            window.localStorage.removeItem('ScrollY')

        }


    }, [NuevosDatosInstituciones]);



    useEffect(() => {
        // Se crea una variable isMounted con el valor inicial de true
        let isMounted = true;

        // Se activa el indicador de carga
        setIsloading(true);

        // Se crea una promesa con dos llamadas fetchData que retornan datos de la API
        Promise.all([
            fetchData(Request, "institucion_lista", [{ nombre: "pais", envio: "" }, { nombre: "dato", envio: 0 }]),
            fetchData(Request, "pais", [{ nombre: "dato", envio: 0 }])
        ])
            .then(([instituciones, paises]) => {
                // Se verifica si el componente está montado antes de actualizar el estado
                if (isMounted && instituciones && paises) {
                    setDatosInstituciones(instituciones)
                    setNuevosDatosInstituciones(instituciones)
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
            let nombre = (data.nombre).toLowerCase().includes(filtro)
            let pais = (data.nombre_pais || "").toLowerCase().includes(filtro)
            return nombre || pais
        })
        setNuevosDatosInstituciones(arr);
    }

    function ViewFiltros() {
        let divFiltro = document.getElementById("filtros").classList
        if (!divFiltro[1]) {
            divFiltro.add("hideFilter")
        } else {
            divFiltro.remove("hideFilter")
        }
    }

    function Filtrar(Pais) {
        let arr = DatosInstituciones.filter(data => {
            let pais = true

            console.log(Pais);
            if (Pais) {
                pais = data.fb_pais_id === parseInt(Pais);
            }
            return pais
        })

        setNuevosDatosInstituciones(arr)
    }



    return (
        <>
            <div className='out-div-seccion' >
                <div className='header-seccion row gap-3'>
                    <div className='col'>
                        <Link className='Volver-link' to={previusURL}><span className='icon-flecha2'></span><h5 className='d-flex' >Clubes & Academias <span className='cant-Jugadores'>({DatosInstituciones.length})</span></h5></Link>
                    </div>
                    <div className="input-group input-group-sm flex-nowrap div-input-search col">
                        <label htmlFor='serch' className="input-group-text input-search"><i className="fa-solid icon-search"></i></label>
                        <input id="serch" type="text" className="form-control input-search" name='search' placeholder="Buscar..." onChange={e => onSearch(DatosInstituciones, e.target.value)} aria-label="Username" aria-describedby="addon-wrapping" />
                        <button className="input-group-text input-filtros" onClick={() => ViewFiltros()}><i className="fa-solid fa-filter"></i></button>
                    </div>
                </div>
                <div id='filtros' className='div-filtros hideFilter'>
                    <div className='in-div-filtro row'>
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
                    </div>
                    <div className="d-flex justify-content-end px-4 sm-mt-3"><button className="btn btn-primary" tabIndex={5} onClick={() => Filtrar(Pais)}>Aplicar</button></div>
                </div>
                <div className='div-seccion mt-3'>
                    <div className='col-lg-12 p-none'>
                        <div className='seccion seccion-clubes'>
                            {Isloading || NuevosDatosInstituciones.length === 0 ? (
                                // Muestra el indicador de carga mientras se están cargando los datos o si no hay ningún jugador.
                                Isloading ? <LoaderClub /> : <>No se encontraron clubes...</>
                            ) : (
                                // Si los datos se cargaron correctamente y hay jugadores, muéstralos.
                                NuevosDatosInstituciones.map(data => (
                                    <CardClubes
                                        key={data.vit_institucion_id}
                                        data={data}
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

export default Clubes;
