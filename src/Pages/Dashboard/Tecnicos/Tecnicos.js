import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../Context/AuthContext';
import { fetchData } from '../../../Funciones/Funciones';
import CardTecnico from './CardTecnico';
import LoaderClub from '../Clubes/LoaderClub';

const Tecnicos = () => {
    const { Request, RandomNumberImg } = useAuth();
    const location = useLocation();
    let previusURL = location.state?.from.pathname || "/";

    const [DatosTecnicos, setDatosTecnicos] = useState([]);
    const [NuevosDatosTecnicos, setNuevosDatosTecnicos] = useState([]);
    const [Paises, setPaises] = useState([]);
    const [Isloading, setIsloading] = useState(true);
    const [Pais, setPais] = useState("");

    function handleScroll() {
        window.localStorage.setItem('ScrollY', JSON.stringify(window.scrollY));
    }

    useEffect(() => {
        let savedScrollY = JSON.parse(window.localStorage.getItem('ScrollY'));
        if (NuevosDatosTecnicos && NuevosDatosTecnicos.length > 0) {
            window.scrollTo(0, savedScrollY);
            window.localStorage.removeItem('ScrollY');
        }
    }, [NuevosDatosTecnicos]);

    useEffect(() => {
        let isMounted = true;
        setIsloading(true);

        Promise.all([
            fetchData(Request, "tarjetas_tecnicos", [{ nombre: "dato", envio: 0 }]),
            fetchData(Request, "pais", [{ nombre: "dato", envio: 0 }])
        ])
            .then(([tecnicos, paises]) => {
                if (isMounted && tecnicos && paises) {
                    setDatosTecnicos(tecnicos);
                    setNuevosDatosTecnicos(tecnicos);
                    setPaises(paises);
                }
            }).finally(() => {
                setIsloading(false);
            });

        return () => { isMounted = false; };
    }, [Request]);

    function onSearch(array, filters) {
        let filtro = filters.toLowerCase();
        let arr = array.filter(data => {
            let nombre = (data.nombres || "").toLowerCase().includes(filtro);
            let apellido = (data.apellidos || "").toLowerCase().includes(filtro);
            let pais = (data.pais || "").toLowerCase().includes(filtro);
            let club = (data.club_actual || "").toLowerCase().includes(filtro);
            return nombre || apellido || pais || club;
        });
        setNuevosDatosTecnicos(arr);
    }

    function ViewFiltros() {
        let divFiltro = document.getElementById("filtros").classList;
        if (!divFiltro[1]) {
            divFiltro.add("hideFilter");
        } else {
            divFiltro.remove("hideFilter");
        }
    }

    function Filtrar(Pais) {
        let arr = DatosTecnicos.filter(data => {
            let pais = true;
            if (Pais) {
                pais = data.fb_pais_id === parseInt(Pais);
            }
            return pais;
        });
        setNuevosDatosTecnicos(arr);
    }

    return (
        <>
            <div className='out-div-seccion'>
                <div className='header-seccion row gap-3'>
                    <div className='col'>
                        <Link className='Volver-link' to={previusURL}>
                            <span className='icon-flecha2'></span>
                            <h5 className='d-flex'>Técnicos <span className='cant-Jugadores'>({DatosTecnicos.length})</span></h5>
                        </Link>
                    </div>
                    <div className="input-group input-group-sm flex-nowrap div-input-search col">
                        <label htmlFor='serch' className="input-group-text input-search"><i className="fa-solid icon-search"></i></label>
                        <input id="serch" type="text" className="form-control input-search" name='search' placeholder="Buscar..." onChange={e => onSearch(DatosTecnicos, e.target.value)} />
                        <button className="input-group-text input-filtros" onClick={() => ViewFiltros()}><i className="fa-solid fa-filter"></i></button>
                    </div>
                </div>
                <div id='filtros' className='div-filtros hideFilter'>
                    <div className='in-div-filtro row'>
                        <div className='col-md-3 mt-2'>
                            <b>País</b>
                            <div className='div-select'>
                                <select className="form-select" value={Pais} onChange={(e) => setPais(e.target.value)}>
                                    <option value="">Mostrar Todos</option>
                                    {Paises.map(p => (
                                        <option key={p.pais_id} value={p.pais_id}>{p.pais_nombre}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="d-flex justify-content-end px-4 sm-mt-3">
                        <button className="btn btn-primary" onClick={() => Filtrar(Pais)}>Aplicar</button>
                    </div>
                </div>
                <div className='div-seccion mt-3'>
                    <div className='col-lg-12 p-none'>
                        <div className='seccion seccion-clubes'>
                            {Isloading || NuevosDatosTecnicos.length === 0 ? (
                                Isloading ? <LoaderClub /> : <>No se encontraron técnicos...</>
                            ) : (
                                NuevosDatosTecnicos.map((data, index) => (
                                    <CardTecnico
                                        key={data.vit_jugador_id}
                                        data={data}
                                        index={index}
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

export default Tecnicos;
