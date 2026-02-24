import React, { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../../../Context/AuthContext';
import { DarFormatoFecha, fetchData } from '../../../Funciones/Funciones';
import { DEFAULT_IMAGES } from '../../../Funciones/DefaultImages';

const FichaClub = () => {
    let { id } = useParams();
    const location = useLocation();
    let previusURL = location.state?.from.pathname || "/"

    const { Request, setloading, RandomNumberImg } = useAuth();


    const [Institucion, setInstitucion] = useState([]);
    const [Jugadores_Club, setJugadores_Club] = useState([]);


    useEffect(() => {
        // Se crea una variable isMounted con el valor inicial de true
        let isMounted = true;

        // Se activa el indicador de carga
        setloading(true);

        // Se crea una promesa con dos llamadas fetchData que retornan datos de la API
        Promise.all([
            fetchData(Request, "institucion", [{ nombre: "id_institucion", envio: id }]),
            fetchData(Request, "ficha_institucion_jugadores", [{ nombre: "id_institucion", envio: id }])
        ])
            .then(([institucion, jugadores_club]) => {
                // Se verifica si el componente está montado antes de actualizar el estado
                if (isMounted && institucion && jugadores_club) {
                    setInstitucion(institucion[0])
                    setJugadores_Club(jugadores_club)
                }
                console.log(institucion);

            }).finally(() => {
                // Se desactiva el indicador de carga
                setloading(false);
            })

        // Se retorna una función que se ejecuta cuando el componente se desmonta
        return () => {
            // Se actualiza la variable isMounted a false cuando el componente se desmonta
            isMounted = false;
        };

    }, [Request, id, setloading]);

    return (
        <div className='out-div-seccion '>
            <div className='header-ficha'>
                <Link className='Volver-link' to={previusURL}><span className='icon-flecha2'></span>Volver</Link>
            </div>
            <div className='ficha-club'>
                <div className='cabecera-ficha'>
                    <img src={Institucion.logo ? Institucion.logo : DEFAULT_IMAGES.ESCUDO_CLUB} alt={"..."} />
                    <div className='info-club'>
                        <h2>
                            {Institucion.nombre}
                        </h2>
                        <p>{Institucion.nombre_pais}</p>
                    </div>
                    {Institucion.codigo_pais &&
                        <div className='div-img-pais'>
                            <img
                                className='img-pais'
                                src={`https://flagcdn.com/${Institucion.codigo_pais.toLowerCase()}.svg`}
                                alt={Institucion.nombre_pais}></img>
                        </div>
                    }
                </div>
                <div className='body-ficha'>
                    <div className="tab-ficha">
                        Jugadores
                    </div>
                    <div className='content-ficha'>
                        <div className='in-content-ficha'>
                            <div className="row row-content-ficha head-content-ficha">
                                <div className='col head foto'>
                                    Imagen
                                </div>
                                <div className='col head centrar nombre'>
                                    Nombre
                                </div>
                                <div className='col head centrar pais'>
                                    Pais
                                </div>
                                <div className='col head centrar posicion'>
                                    Posicion
                                </div>
                                <div className='col head centrar fecha_inicio'>
                                    Fecha inicio
                                </div>
                                <div className='col head centrar fecha_fin'>
                                    Fecha fin
                                </div>
                                <div className='col head centrar verificacion'>
                                    Verificación

                                </div>
                            </div>
                            {Jugadores_Club.length > 0 ?
                                Jugadores_Club.map(data => (
                                    <div className='row row-content-ficha' key={data.vit_jugador_institucion_id}>
                                        <div className='col foto'>
                                            <img src={data.foto_jugador ? data.foto_jugador + "?random=" + RandomNumberImg : DEFAULT_IMAGES.CARA_USUARIO} alt="" />
                                        </div>
                                        <div className='col centrar nombre'>
                                            <Link to={`/ficha/` + data.vit_jugador_id} state={{ from: location }}>{data.jugador_nombres} {data.jugador_apellidos} <i className="fa-solid fa-up-right-from-square"></i></Link>
                                        </div>
                                        <div className='col centrar pais'>
                                            <img height={25} src={`https://flagcdn.com/w80/${data.codigo_pais.toLowerCase()}.png`} alt={data.nombre_pais}></img>
                                        </div>
                                        <div className='col centrar posicion'>
                                            {data.posicion ? data.posicion : "-"}
                                        </div>
                                        <div className='col centrar fecha_inicio'>
                                            {DarFormatoFecha(data.fecha_inicio)}
                                        </div>
                                        <div className='col centrar fecha_fin'>
                                            {data.flag_actual ? "Actualmente" : DarFormatoFecha(data.fecha_fin)}
                                        </div>
                                        <div className='col centrar verificacion'>
                                            {data.flag_verificado ?
                                                <svg xmlns="http://www.w3.org/2000/svg" width="35px" height="35px" viewBox="0 0 24 24" fill="none">
                                                    <path d="M21.5609 10.7386L20.2009 9.15859C19.9409 8.85859 19.7309 8.29859 19.7309 7.89859V6.19859C19.7309 5.13859 18.8609 4.26859 17.8009 4.26859H16.1009C15.7109 4.26859 15.1409 4.05859 14.8409 3.79859L13.2609 2.43859C12.5709 1.84859 11.4409 1.84859 10.7409 2.43859L9.17086 3.80859C8.87086 4.05859 8.30086 4.26859 7.91086 4.26859H6.18086C5.12086 4.26859 4.25086 5.13859 4.25086 6.19859V7.90859C4.25086 8.29859 4.04086 8.85859 3.79086 9.15859L2.44086 10.7486C1.86086 11.4386 1.86086 12.5586 2.44086 13.2486L3.79086 14.8386C4.04086 15.1386 4.25086 15.6986 4.25086 16.0886V17.7986C4.25086 18.8586 5.12086 19.7286 6.18086 19.7286H7.91086C8.30086 19.7286 8.87086 19.9386 9.17086 20.1986L10.7509 21.5586C11.4409 22.1486 12.5709 22.1486 13.2709 21.5586L14.8509 20.1986C15.1509 19.9386 15.7109 19.7286 16.1109 19.7286H17.8109C18.8709 19.7286 19.7409 18.8586 19.7409 17.7986V16.0986C19.7409 15.7086 19.9509 15.1386 20.2109 14.8386L21.5709 13.2586C22.1509 12.5686 22.1509 11.4286 21.5609 10.7386ZM16.1609 10.1086L11.3309 14.9386C11.1909 15.0786 11.0009 15.1586 10.8009 15.1586C10.6009 15.1586 10.4109 15.0786 10.2709 14.9386L7.85086 12.5186C7.56086 12.2286 7.56086 11.7486 7.85086 11.4586C8.14086 11.1686 8.62086 11.1686 8.91086 11.4586L10.8009 13.3486L15.1009 9.04859C15.3909 8.75859 15.8709 8.75859 16.1609 9.04859C16.4509 9.33859 16.4509 9.81859 16.1609 10.1086Z" fill="#fff" />
                                                </svg>
                                                :
                                                <></>
                                            }

                                        </div>
                                    </div>
                                ))
                                :
                                <div className='centrar mt-3'>No hay jugadores asociados</div>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default FichaClub;
