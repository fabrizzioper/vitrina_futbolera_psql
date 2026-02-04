import { Formik } from 'formik';
import React from 'react';
import { Link } from 'react-router-dom';
import "./forgotPassword.css";
import logo from "../../imagenes/logo-vitrina.png";
import { useAuth } from '../../Context/AuthContext';
import Swal from 'sweetalert2/dist/sweetalert2.js'
import axios from 'axios';

const ForgotPassword = () => {
    const { Alerta, Request } = useAuth();


    /*
     * Envía un correo electrónico al usuario con un enlace para restablecer su contraseña.
     * 
     * @param {Object} datosUsuario - Un objeto que contiene los datos del usuario, incluyendo su dirección de correo electrónico.
    */
    function RecuperarContrasena(datosUsuario) {
        // Crear un objeto FormData con los datos del usuario.
        const datosFormulario = new FormData();
        datosFormulario.append("jugador_email", datosUsuario.email);
        datosFormulario.append("link", document.location.origin + "/#/change-password");

        // Hacer una petición a la API para enviar el correo electrónico.
        axios({
            method: "post",
            url: `${Request.Dominio}/olvide_contrasena`,
            headers: {
                "userLogin": Request.userLogin,
                "userPassword": Request.userPassword,
                "systemRoot": Request.Empresa
            },
            data: datosFormulario
        })
            .then(res => {
                console.log(res);
                // Mostrar un mensaje de éxito al usuario si la petición fue exitosa.
                if (res.data.success !== false) {
                    Swal.fire({
                        title: 'Recuperación de contraseña',
                        html: `
                            <p class="small text-muted">Por favor, sigue las instrucciones en el correo para iniciar sesión con tu nueva contraseña.</p>
                        ` ,
                        icon: 'success',
                        confirmButtonColor: '#ef8700',
                        background: "#0e3769",
                        color: "#fff"
                    })

                } else {
                    // Mostrar un mensaje de error si la petición no fue exitosa.
                    Alerta("error", "Por favor, intenta más tarde.")
                }

            }).catch(error => {
                // Manejar cualquier excepción que se produzca durante la petición.
                console.log(error);;
            });
    }

    return (
        <div className='d-flex w-100 forgot div-login'>
            <div className="container-fluid login shadow-lg text-white">
                <div className="row align-items-center justify-content-center flex-row-reverse">
                    <div className="col-lg-4 px-0 ">
                        <div className='div-out-form py-6 d-flex flex-column'>
                            <div className="navbar-brand mb-auto">
                                <img src={logo} className="navbar-brand-img logo-light logo-large" alt="..." />
                            </div>
                            <div>
                                <h1 className="mb-2 fs-4 fw-bold text-center">
                                    ¿Olvidaste tu contraseña?
                                </h1>
                                <p className="text-secondary text-center">
                                    Introduce tu correo electrónico y te enviaremos <br />un mensaje con las instrucciunes
                                </p>
                                <Formik
                                    initialValues={{ email: '' }}
                                    validate={values => {
                                        const errors = {};
                                        // validacion de Usuario
                                        if (!values.email) {
                                            errors.email = 'input-error';
                                        }
                                        //  else if (
                                        //     !/^[a-z.]+$/.test(values.email)
                                        // ) 
                                        // {
                                        //     errors.email = 'Usuario invalido';
                                        // }

                                        return errors;
                                    }}
                                    onSubmit={(values) => {
                                        RecuperarContrasena(values)
                                    }}
                                >
                                    {({ values, errors, touched, handleChange, handleBlur, handleSubmit }) => (
                                        <form onSubmit={handleSubmit}>
                                            <div className="row justify-content-center">
                                                <div className="col-lg-12 col-sm-10 ">
                                                    <div className="mb-4">
                                                        <label className="form-label">
                                                            Correo Electrónico
                                                        </label>
                                                        <input
                                                            type="email"
                                                            className={`form-control ${errors.email && touched.email && errors.email}`}
                                                            placeholder="Ingresa tu correo electronico"
                                                            name="email"
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            value={values.email}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className='mt-3 mb-5 w-100 d-flex justify-content-center'>
                                                <button type="submit" className="btn btn-primary w-75">
                                                    Continuar
                                                </button>
                                            </div>
                                        </form>
                                    )}
                                </Formik>
                            </div>

                            <div className="mt-auto">
                                <small className="mb-0 text-muted">
                                    Volver a <Link className="fw-semibold link-primary" to={"/login"}>Iniciar sesión</Link>
                                </small>
                            </div>
                            <Link to={"/"} className="navbar-toggler position-fixed collapsed bg-primary">
                                <i className="fa-solid icon-home"></i>
                            </Link>
                        </div>
                    </div>

                    <div className="col d-none d-lg-block">
                        <div className="overlay overlay-dark overlay-50 imgs-login img3-login"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;
