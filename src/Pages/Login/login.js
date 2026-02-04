import { Formik } from 'formik';
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import { icon, type } from '../../Funciones/Funciones';
import logo from "../../imagenes/logo-vitrina.png";
import "./login.css";

const Login = () => {
    const { login, setisQA } = useAuth();
    const [view, setview] = useState(false);
    let { ambiente } = useParams();


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
                        <div className='div-out-form py-6  d-flex flex-column'>
                            <div className="navbar-brand mb-auto">
                                <img src={logo} className="navbar-brand-img logo-light logo-large" alt="..." />
                            </div>
                            <div className='div-form '>
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
                            </div>

                            <div className="mt-auto">
                                <small className="mb-0 text-muted ">
                                    ¿Aún no tienes una cuenta? <Link className="fw-semibold link-primary" to={"/registro"}>Registrate</Link>
                                </small>
                            </div>
                            <Link to={"/"} className="navbar-toggler position-fixed collapsed bg-primary">
                                <i className="fa-solid icon-home"></i>
                            </Link>
                        </div>
                    </div>

                    <div className="col d-none d-lg-block div-img-login ">
                        <div className="overlay overlay-dark overlay-50 imgs-login img-login"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
