import React, { useEffect, useState } from 'react';
import "../Login/login.css";
import "./registro.css";
import logo from "../../imagenes/logo-vitrina.png";
import imgRegistro from "../../imagenes/foto-login3.jpg";
import { Link, useParams } from 'react-router-dom';
import { Formik } from 'formik';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../Context/AuthContext';
import axios from 'axios';
import { icon, type } from '../../Funciones/Funciones';
import UseModal from '../../Componentes/modal/useModal';

const TIPO_TECNICO_ID = 2;
const TIPO_CLUB_ID = 3;
const TIPO_ORGANIZADOR_ID = 4;

const Registro = () => {
    const { registro, registroClub, registroOrganizador, setisQA, Request, loginWithGoogle, Alerta } = useAuth();
    let { ambiente } = useParams();

    const googleLogin = useGoogleLogin({
        onSuccess: (tokenResponse) => loginWithGoogle(tokenResponse.access_token),
        onError: () => Alerta('error', 'Error al registrarse con Google'),
        scope: 'openid email profile',
    });
    const [view, setview] = useState(false);
    const [view2, setview2] = useState(false);
    const [TipoUser, setTipoUser] = useState([]);
    const [TipoInstitucion, setTipoInstitucion] = useState([]);


    /*
     * Establece el estado de 'isQA' basándose en el valor de 'ambiente'.
     *
     * Si el valor de 'ambiente' es 'QA', establece 'isQA' en true. De lo contrario, establece 'isQA' en false.
     *
     * @param {string} ambiente - El valor de 'ambiente' que se va a utilizar para establecer el estado de 'isQA'.
     * @param {function} setisQA - La función que se utiliza para establecer el estado de 'isQA'.
    */
    useEffect(() => {
        setisQA(ambiente === "QA");
    }, [ambiente, setisQA]);


    // Obtiene tipos de usuarios de un punto de acceso de API y actualiza el estado
    useEffect(() => {
        async function obtenerTipoUser() {
            const formdata = new FormData();
            formdata.append("dato", 1);

            try {
                const res = await axios({
                    method: "post",
                    url: `${Request.Dominio}/jugador_tipo`,
                    headers: {
                        "userLogin": Request.userLogin,
                        "userPassword": Request.userPassword,
                        "systemRoot": Request.Empresa
                    },
                    data: formdata
                });

                // Actualiza el estado con los datos de respuesta
                setTipoUser(res.data.data);
            } catch (error) {
                // Manejar el error
                console.log(error);
            }
        }

        // Llama la función para obtener tipos de usuarios cuando Request cambia
        obtenerTipoUser();
    }, [Request]);

    // Cargar tipos de institucion y paises para registro de club
    useEffect(() => {
        async function cargarDatosClub() {
            try {
                const fdTipo = new FormData();
                fdTipo.append("dato", 1);
                const resTipo = await axios({
                    method: "post",
                    url: `${Request.Dominio}/tipo_institucion_list`,
                    headers: { "userLogin": Request.userLogin, "userPassword": Request.userPassword, "systemRoot": Request.Empresa },
                    data: fdTipo
                });
                setTipoInstitucion(resTipo.data.data || []);

            } catch (error) {
                console.log(error);
            }
        }
        cargarDatosClub();
    }, [Request]);


    /*
        * Convierte una cadena de texto en formato CamelCase.
        * @param {string} text - La cadena de texto a convertir.
        * @returns {string} La cadena de texto convertida en formato CamelCase.
    */
    function camelCase(text) {
        // Separa la cadena de texto en palabras utilizando los espacios como delimitador.
        const words = text.split(" ");

        // Convierte la primera letra de cada palabra a mayúscula.
        for (let i = 0; i < words.length; i++) {
            if (words[i]) {
                words[i] = words[i][0].toUpperCase() + words[i].substr(1);
            }
        }

        // Une las palabras en una sola cadena de texto en formato CamelCase.
        return words.join(" ");
    }

    return (
        <>
            <div className='d-flex w-100 div-login '>
                <div className="container-fluid login shadow-lg text-white">
                    <div className="row justify-content-center flex-row-reverse">
                        <div className="col px-0 registro-form-col">
                            <div className='div-out-form py-6 d-flex flex-column'>
                                <div className='div-form-wrapper flex-grow-1 d-flex align-items-center justify-content-center'>
                                <div className='div-form'>
                                    <div className="navbar-brand navbar-brand-above-title mb-3 d-flex justify-content-center">
                                        <img src={logo} className="navbar-brand-img logo-light logo-large" alt="Vitrina Futbolera" />
                                    </div>
                                    <h1 className="mb-2 fs-4 fw-bold text-center ">
                                        Registro
                                    </h1>
                                    <p className="text-secondary text-center">
                                        ¿No tienes una cuenta? Crea tu cuenta, te llevará menos de un minuto
                                    </p>
                                    <Formik
                                        initialValues={{ tipoUser: '', name: '', lastname: '', email: '', password: '', confirmpassword: '', confirmterms: false, tipoInstitucion: '', nombreClub: '' }}

                                        // validacion de Usuario
                                        validate={values => {
                                            const errors = {};
                                            const esClub = parseInt(values.tipoUser) === TIPO_CLUB_ID;

                                            // validacion de tipo usuario
                                            if (!values.tipoUser) {
                                                errors.tipoUser = 'input-error';
                                            }

                                            // Campos de club: nombre y tipo de institucion
                                            if (esClub) {
                                                if (!values.nombreClub || !values.nombreClub.trim()) errors.nombreClub = 'input-error';
                                                if (!values.tipoInstitucion) errors.tipoInstitucion = 'input-error';
                                            }

                                            // validacion de nombre y apellido (solo para jugador)
                                            if (!esClub) {
                                                if (!values.name) {
                                                    errors.name = 'input-error';
                                                }
                                                if (values.name) {
                                                    values.name = camelCase(values.name);
                                                }
                                                if (!values.lastname) {
                                                    errors.lastname = 'input-error';
                                                }
                                                if (values.lastname) {
                                                    values.lastname = camelCase(values.lastname);
                                                }
                                            }

                                            // validacion de email
                                            if (!values.email) {
                                                errors.email = 'input-error';
                                            }
                                            else if (
                                                !/^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(values.email)
                                            ) {
                                                errors.email = 'input-error';
                                            }

                                            // validacion de contraseña
                                            if (!values.password) {
                                                errors.password = 'input-error';
                                            }

                                            // validacion de confirmacion de contraseña
                                            if (!values.confirmpassword) {
                                                errors.confirmpassword = 'input-error';
                                            }
                                            else if (values.confirmpassword !== values.password) {
                                                errors.confirmpassword = 'input-error';
                                            }

                                            if (!values.confirmterms) {
                                                errors.confirmterms = 'input-error';
                                            }

                                            return errors;
                                        }}

                                        onSubmit={(values) => {
                                            if (values.password === values.confirmpassword) {
                                                if (parseInt(values.tipoUser) === TIPO_CLUB_ID) {
                                                    registroClub(values.nombreClub.trim(), values.tipoInstitucion, 0, '', '', values.email, values.password);
                                                } else if (parseInt(values.tipoUser) === TIPO_ORGANIZADOR_ID) {
                                                    registroOrganizador(values.name, values.lastname, values.email, values.password);
                                                } else {
                                                    registro(values.tipoUser, values.name, values.lastname, values.email, values.password);
                                                }
                                            }
                                        }}
                                    >
                                        {({ values, errors, touched, handleChange, handleBlur, handleSubmit }) => (
                                            <form onSubmit={handleSubmit}>
                                                <div className="row justify-content-center">
                                                    <div className="col-lg-12 col-sm-10">
                                                        <div className="mb-4">
                                                            <label htmlFor="exampleFormControlTextarea1" className="form-label">Tipo de usuario</label>
                                                            <select
                                                                className={`form-select ${errors.tipoUser && touched.tipoUser && errors.tipoUser}`}
                                                                name="tipoUser"
                                                                onChange={handleChange}
                                                                onBlur={handleBlur}
                                                                value={values.tipoUser}
                                                            >
                                                                <option value="" disabled>Seleccione el tipo de usuario</option>
                                                                {TipoUser.map(tu => {
                                                                    return <option key={tu.vit_jugador_tipo_id} value={tu.vit_jugador_tipo_id} disabled={tu.vit_jugador_tipo_id !== 1 && tu.vit_jugador_tipo_id !== TIPO_TECNICO_ID && tu.vit_jugador_tipo_id !== TIPO_CLUB_ID && tu.vit_jugador_tipo_id !== TIPO_ORGANIZADOR_ID}>{tu.nombre}</option>
                                                                })}
                                                            </select>
                                                        </div>
                                                    </div>
                                                    {/* Campos exclusivos para Club */}
                                                    {parseInt(values.tipoUser) === TIPO_CLUB_ID && (
                                                        <div className="col-lg-12 col-sm-10">
                                                            <div className="mb-4">
                                                                <label className="form-label">Nombre del Club o Academia</label>
                                                                <input
                                                                    className={`form-control ${errors.nombreClub && touched.nombreClub && errors.nombreClub}`}
                                                                    placeholder="Nombre de tu club o academia"
                                                                    type="text"
                                                                    name="nombreClub"
                                                                    onChange={handleChange}
                                                                    onBlur={handleBlur}
                                                                    value={values.nombreClub}
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                    {parseInt(values.tipoUser) === TIPO_CLUB_ID && (
                                                        <div className="col-lg-12 col-sm-10">
                                                            <div className="mb-4">
                                                                <label className="form-label">Tipo de Institución</label>
                                                                <select
                                                                    className={`form-select ${errors.tipoInstitucion && touched.tipoInstitucion && errors.tipoInstitucion}`}
                                                                    name="tipoInstitucion"
                                                                    onChange={handleChange}
                                                                    onBlur={handleBlur}
                                                                    value={values.tipoInstitucion}
                                                                >
                                                                    <option value="" disabled>Seleccione tipo</option>
                                                                    {TipoInstitucion.map(ti => (
                                                                        <option key={ti.vit_tipo_institucion_id} value={ti.vit_tipo_institucion_id}>{ti.vit_tipo_institucion_nombre}</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Nombre y Apellido (solo para jugador, club los completa después) */}
                                                    {parseInt(values.tipoUser) !== TIPO_CLUB_ID && (
                                                    <>
                                                    <div className="col-lg-6 col-sm-5 col-xs-5">
                                                        <div className="mb-4">
                                                            <label className="form-label">Nombres</label>
                                                            <input
                                                                className={`form-control ${errors.name && touched.name && errors.name}`}
                                                                placeholder="Tu nombre"
                                                                type="text"
                                                                name="name"
                                                                onChange={handleChange}
                                                                onBlur={handleBlur}
                                                                value={values.name}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-lg-6 col-sm-5 col-xs-5">
                                                        <div className="mb-4">
                                                            <label className="form-label">Apellidos</label>
                                                            <input
                                                                className={`form-control ${errors.lastname && touched.lastname && errors.lastname}`}
                                                                placeholder="Tu apellido"
                                                                type="text"
                                                                name="lastname"
                                                                onChange={handleChange}
                                                                onBlur={handleBlur}
                                                                value={values.lastname}
                                                            />
                                                        </div>
                                                    </div>
                                                    </>
                                                    )}
                                                    <div className="col-lg-12 col-sm-10">
                                                        <div className="mb-4">
                                                            <label className="form-label">
                                                                Correo Electrónico
                                                            </label>
                                                            <input
                                                                type="email"
                                                                className={`form-control ${errors.email && touched.email && errors.email}`}
                                                                placeholder="Tu correo electronico"
                                                                name="email"
                                                                onChange={handleChange}
                                                                onBlur={handleBlur}
                                                                value={values.email}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-lg-6 col-sm-5 col-xs-5">
                                                        <div className="mb-4">
                                                            <label className="form-label">
                                                                Contraseña
                                                            </label>


                                                            <div className={`input-group input-group-merge ${errors.password && touched.password && errors.password}`}>
                                                                <input
                                                                    type={type(view)}
                                                                    className={`form-control`}
                                                                    placeholder="Tu Contraseña"
                                                                    name="password"
                                                                    onChange={handleChange}
                                                                    onBlur={handleBlur}
                                                                    value={values.password}
                                                                    autoComplete="on"
                                                                />

                                                                <span type="button" className="view-btn input-group-text px-4 text-secondary link-primary text-decoration-none" onClick={() => setview(!view)} ><i className={`view-icon fa-solid ${icon(view)}`}></i></span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-lg-6 col-sm-5 col-xs-5">
                                                        <div className="mb-4">
                                                            <label className="form-label">
                                                                Confirmar Contraseña
                                                            </label>


                                                            <div className={`input-group input-group-merge ${errors.confirmpassword && touched.confirmpassword && errors.confirmpassword}`}>
                                                                <input
                                                                    type={type(view2)}
                                                                    className={`form-control`}
                                                                    placeholder="Confirmar contraseña"
                                                                    name="confirmpassword"
                                                                    onChange={handleChange}
                                                                    onBlur={handleBlur}
                                                                    value={values.confirmpassword}
                                                                    autoComplete="on"
                                                                />

                                                                <span type="button" className="view-btn input-group-text px-4 text-secondary link-primary text-decoration-none" onClick={() => setview2(!view2)} ><i className={`view-icon fa-solid ${icon(view2)}`}></i></span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Checkbox Terminos y condiciones */}

                                                <div className='terminos_condiciones for-check d-flex gap-2'>

                                                    <input
                                                        className={`form-check-input ${errors.confirmterms && touched.confirmterms && errors.confirmterms}`}
                                                        type="checkbox"
                                                        id='checkTerminos'
                                                        name="confirmterms"
                                                        onChange={handleChange}
                                                        value={values.confirmterms}
                                                        checked={values.confirmterms}
                                                    />
                                                    <label className='form-check-label' htmlFor='checkTerminos'>  Acepto los <span data-bs-toggle="modal" data-bs-target="#modalTerminosCondiciones" className='link-primary'>Términos y Condiciones</span> </label>

                                                </div>

                                                <div className='mt-3 mb-4 w-100 d-flex justify-content-center'>
                                                    <button type="submit" className="btn btn-primary w-75">
                                                        Continuar
                                                    </button>
                                                </div>
                                            </form>
                                        )}
                                    </Formik>

                                    <div className='w-100 d-flex align-items-center gap-2 my-1'>
                                        <hr className='flex-grow-1' />
                                        <small className='text-muted'>o regístrate con</small>
                                        <hr className='flex-grow-1' />
                                    </div>
                                    <div className='w-100 d-flex justify-content-center mb-3'>
                                        <button type="button" className="btn btn-google w-75" onClick={() => googleLogin()}>
                                            <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                            </svg>
                                            <span>Registrarse con Google</span>
                                        </button>
                                    </div>
                                </div>
                                </div>

                                <div className="mt-auto">
                                    <small className="mb-0 text-muted">
                                        ¿Ya registrado? <Link className="fw-semibold link-primary" to={"/login"}>Inicia Sesión</Link>
                                    </small>
                                </div>
                                <Link to={"/"} className="btn-volver-fixed">
                                    <i className="fa-solid fa-arrow-left me-1"></i>
                                    Volver
                                </Link>
                            </div>
                        </div>

                        <div className="col col-login-img div-img-login registro-img-col">
                            <div
                                className="overlay overlay-dark overlay-50 imgs-login img2-login"
                                style={{ backgroundImage: `url(${imgRegistro})` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* modalTerminosCondiciones  */}


            <UseModal

                id="modalTerminosCondiciones"
                titulo="Vitrina Futbolera"
                className="terminos-condiciones"
                contenido={<div className='row'>


                    <div className='col-12 col-sm-6'>
                        <h1 className='fs-4  py-3 pb-0' >TÉRMINOS Y CONDICIONES</h1>
                        <p>Bienvenido a Vitrina Futbolera, una página web de propiedad y operada por DominioSport ("nosotros", "nos" o "nuestro"). Al utilizar nuestro sitio web, aceptas los siguientes términos y condiciones:</p>

                        <h2>Registro y cuentas:</h2>
                        <p>Para utilizar ciertas funciones de nuestro sitio web, como la creación de un perfil de jugador o equipo de fútbol, deberás registrarte una cuenta donde aceptas proporcionar información precisa y completa durante el proceso de registro y mantener actualizada tu información de cuenta. Eres responsable de mantener la confidencialidad de tu cuenta y contraseña y de todas las actividades que ocurran bajo tu cuenta.</p>

                        <h2>Propiedad intelectual:</h2>
                        <p>Todos los derechos de propiedad intelectual en nuestro sitio web, incluyendo, marcas registradas, derechos de autor y patentes, son propiedad nuestra o de nuestros licenciantes. No se te concede ningún derecho de propiedad intelectual por el uso de nuestro sitio web.</p>

                        <h2>Contenido de usuario:</h2>
                        <p>Al publicar, cargar o transmitir cualquier contenido a nuestro sitio web, aceptas que tienes todos los derechos necesarios para hacerlo y que dicho contenido no infringe los derechos de propiedad intelectual o de otra índole de terceros. Nos reservamos el derecho de eliminar cualquier contenido de usuario que consideremos inapropiado o que viole estos términos y condiciones.</p>

                        <h2>Pago:</h2>
                        <p>En el futuro, Vitrina Futbolera puede ofrecer opciones de pago para acceder a funciones adicionales o mejoradas en nuestro sitio web. Al utilizar estos servicios de pago, aceptas pagar los cargos correspondientes y cumplir con las condiciones de pago que se te presenten.</p>

                        <h2>Modificaciones a los términos y condiciones:</h2>
                        <p>Nos reservamos el derecho de modificar estos términos y condiciones en cualquier momento. Cualquier modificación se hará efectiva inmediatamente después de la publicación en nuestro sitio web. Es tu responsabilidad revisar periódicamente estos términos y condiciones para asegurarte de que estás familiarizado con las versiones más recientes.</p>
                    </div>



                    <div className='col-12 col-sm-6'>
                        <h1 className='fs-4  py-3 pb-0' >POLÍTICA DE PRIVACIDAD</h1>
                        <p>En Vitrina Futbolera, valoramos la privacidad de nuestros usuarios y nos comprometemos a protegerla. Esta política de privacidad describe cómo recopilamos, utilizamos y protegemos la información personal de nuestros usuarios.</p>

                        <h2>Recopilación de información personal</h2>
                        <p>Recopilamos información personal de nuestros usuarios cuando se registran en la página para utilizar nuestros servicios. Esta información incluye el nombre, la dirección de correo electrónico, la fecha de nacimiento, el país de origen y otra información relacionada con el perfil futbolístico.</p>

                        <h2>Uso de información personal</h2>
                        <p>La información personal recopilada se utilizará para crear perfiles futbolísticos y CVs para los usuarios, para administrar la página y sus servicios, para proporcionar información sobre eventos futbolísticos y para enviar publicidad y otros materiales promocionales a los usuarios que se hayan registrado para recibirla.</p>

                        <h2>Opciones de privacidad</h2>
                        <p>Los usuarios pueden optar por recibir correos electrónicos promocionales y publicitarios de Vitrina Futbolera en el momento de su registro y en cualquier momento posterior mediante el uso de la opción de exclusión proporcionada en cada correo electrónico.</p>

                        <h2>Cambios a esta política de privacidad</h2>
                        <p>Nos reservamos el derecho de actualizar esta política de privacidad en cualquier momento. Se notificará a los usuarios de cualquier cambio material a través de un aviso en la página web.</p>

                        <h2>Contacto</h2>
                        <p>Si tiene alguna pregunta o inquietud sobre nuestra política de privacidad, puede ponerse en contacto con nosotros a través de la página web o escribiendo a nuestro correo electrónico de atención al cliente.</p>
                    </div>

                    {/* <div className='col-12 mt-5'>
                        Fecha de entrada en vigor: {DarFormatoFecha(new Date())}
                    </div> */}

                </div>}

                footer={<button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cerrar </button>}


            />



        </>
    );
}

export default Registro;
