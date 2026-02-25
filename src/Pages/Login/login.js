import { Formik } from 'formik';
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../Context/AuthContext';
import { icon, type } from '../../Funciones/Funciones';
import logo from "../../imagenes/logo-vitrina.png";
import "./login.css";

const Login = () => {
    const { login, loginWithGoogle, setisQA, Alerta } = useAuth();
    const [view, setview] = useState(false);
    let { ambiente } = useParams();

    const googleLogin = useGoogleLogin({
        onSuccess: (tokenResponse) => loginWithGoogle(tokenResponse.access_token),
        onError: () => Alerta('error', 'Error al iniciar sesión con Google'),
        scope: 'openid email profile',
    });


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


    return (
        <div className='d-flex w-100 div-login '>
            <div className="container-fluid login text-white">
                <div className="row justify-content-center flex-row-reverse">
                    <div className="col px-0">
                        <div className='div-out-form py-6 d-flex flex-column'>
                            <div className='div-form-wrapper flex-grow-1 d-flex align-items-center justify-content-center'>
                            <div className='div-form'>
                                <div className="navbar-brand navbar-brand-above-title mb-3 d-flex justify-content-center">
                                    <img src={logo} className="navbar-brand-img logo-light logo-large" alt="Vitrina Futbolera" />
                                </div>
                                <h1 className="mb-2 fs-4 fw-bold text-center">
                                    Iniciar Sesión
                                </h1>
                                <p className="text-secondary text-center">
                                    Ingresa tu email y contraseña para acceder a tu cuenta
                                </p>
                                <Formik
                                    initialValues={{ email: '', password: '' }}
                                    validate={values => {
                                        const errors = {};
                                        // validacion de Usuario
                                        if (!values.email) {
                                            errors.email = 'input-error';
                                        }
                                        else if (
                                            !/^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(values.email)
                                        ) {
                                            errors.email = 'input-error';
                                        }

                                        // validacion de Contraseña
                                        if (!values.password) {
                                            errors.password = 'input-error';
                                        }
                                        // } else if (
                                        //     !/^[0-9]+$/.test(values.password)
                                        // ) {
                                        //     errors.password = 'Solo debe contener numeros';
                                        // }

                                        return errors;
                                    }}
                                    onSubmit={(values) => {
                                        login(values.email, values.password);


                                    }}
                                >
                                    {({ values, errors, touched, handleChange, handleBlur, handleSubmit }) => (
                                        <form onSubmit={handleSubmit}>
                                            <div className="row justify-content-center">
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
                                                            required
                                                            tabIndex="1"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-lg-12 col-sm-10">
                                                    <div className="mb-4">
                                                        <div className="row row-label-password">
                                                            <div className="col">
                                                                <label className="form-label">
                                                                    Contraseña
                                                                </label>
                                                            </div>
                                                            <div className="col-auto">
                                                                <Link to="/reset-password" className="form-text small text-muted">¿Olvidó su contraseña?</Link>
                                                            </div>
                                                        </div>


                                                        <div className={`input-group input-group-merge ${errors.password && touched.password && errors.password}`}>
                                                            <input
                                                                type={type(view)}
                                                                className='form-control'
                                                                placeholder="Tu Contraseña"
                                                                name="password"
                                                                onChange={handleChange}
                                                                onBlur={handleBlur}
                                                                value={values.password}
                                                                autoComplete="on"
                                                                required
                                                                tabIndex="2"
                                                            />

                                                            <span className="view-btn input-group-text px-4 text-secondary link-primary text-decoration-none" onClick={() => setview(!view)} ><i className={`view-icon fa-solid ${icon(view)}`}></i></span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className='mt-3 mb-4 w-100 d-flex justify-content-center'>
                                                <button type="submit" className="btn btn-primary w-75" tabIndex="3">
                                                    Continuar
                                                </button>
                                            </div>
                                        </form>
                                    )}
                                </Formik>

                                <div className='w-100 d-flex align-items-center gap-2 my-1'>
                                    <hr className='flex-grow-1' />
                                    <small className='text-muted'>o continúa con</small>
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
                                        <span>Continuar con Google</span>
                                    </button>
                                </div>
                            </div>
                            </div>

                            <div className="mt-auto">
                                <small className="mb-0 text-muted ">
                                    ¿Aún no tienes una cuenta? <Link className="fw-semibold link-primary" to={"/registro"}>Registrate</Link>
                                </small>
                            </div>
                            <Link to={"/"} className="btn-volver-fixed">
                                <i className="fa-solid fa-arrow-left me-1"></i>
                                Volver
                            </Link>
                        </div>
                    </div>

                    <div className="col col-login-img d-none d-md-block div-img-login">
                        <div className="overlay overlay-dark overlay-50 imgs-login img-login"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
