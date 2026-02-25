import axios from 'axios';
import { Formik } from 'formik';
import React, { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import { icon, type } from '../../Funciones/Funciones';
import './changePassword.css'

const ChangePassword = () => {
    const [view, setview] = useState(false);
    const [view2, setview2] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const { Alerta, Request, currentUser } = useAuth();

    // Reset mode: email viene de la URL (flujo de recuperar contraseña)
    const queryParams = new URLSearchParams(location.search);
    const emailFromUrl = queryParams.get('email') || '';
    const isResetMode = !!emailFromUrl;

    // Si no es modo reset y no hay usuario autenticado, redirigir al login
    if (!isResetMode && !currentUser) {
        return <Navigate to="/login" />;
    }


    /*
     * changePass - Función para cambiar la contraseña del usuario actual.
     *
     * @param {object} e - Evento que desencadena la función y contiene la nueva contraseña.
    */
    function changePass(e) {
        // Crear una instancia de FormData y agregar los datos necesarios.
        const formData = new FormData();
        formData.append("jugador_email", isResetMode ? emailFromUrl : currentUser.email);
        formData.append("contrasena_nueva", e.newPass);
        formData.append("contrasena_actual", e.passActual);

        // Hacer una solicitud a la API para cambiar la contraseña.
        axios({
            method: "post",
            url: `${Request.Dominio}/cambiar_contrasena`,
            headers: {
                "userLogin": Request.userLogin,
                "userPassword": Request.userPassword,
                "systemRoot": Request.Empresa
            },
            data: formData
        }).then(res => {
            console.log(res);
            //Cuando el WS manda un mensaje significa que paso un error.
            if (res.data.data[0].MENSAJE.split(":")[0] === "Se ha generado una nueva contraseña") {
                // Si la solicitud es exitosa, mostrar una alerta de éxito y redirigir al usuario.
                Alerta("success", "Su contraseña se cambió")

                if (isResetMode) {
                    navigate("/login", { replace: true });
                } else {
                    navigate("/")
                }

            } else if (res.data.data[0].MENSAJE.split(":")[0] === "Email O Contraseña invalida") {
                // Si la solicitud falla, por error en el email o Password
                Alerta("error", "Contraseña actual inválida")

            } else {
                // Si la solicitud falla, mostrar una alerta de error.
                Alerta("error", "Por favor, intenta más tarde.")
            }

        }).catch(error => {
            console.log(error);;
        });
    }


    return (
        <div className='d-flex w-100 forgot div-login centrar div-changpass'>
            <Formik
                initialValues={{ email: isResetMode ? emailFromUrl : '', passActual: '', newPass: '' }}
                validate={values => {
                    const errors = {};

                    // validacion de Email (solo en modo autenticado)
                    if (!isResetMode && !values.email) {
                        errors.email = 'input-error';
                    }

                    // validacion de Contraseña actual
                    if (!values.passActual) {
                        errors.passActual = 'input-error';
                    }
                    else if (!isResetMode && values.passActual !== currentUser.password) {
                        errors.passActual = 'input-error';
                    }

                    // validacion de Nueva Contraseña
                    if (!values.newPass) {
                        errors.newPass = 'input-error';
                    }

                    return errors;
                }}
                onSubmit={(values) => {
                    if (isResetMode || values.passActual === currentUser.password) {
                        changePass(values)
                    }

                }}
            >
                {({ values, errors, touched, handleChange, handleBlur, handleSubmit }) => (
                    <form onSubmit={handleSubmit}>
                        <p className="heading">Cambiar Contraseña</p>
                        <label className="form-label">
                            Correo Electrónico
                        </label>
                        <input
                            type="email"
                            className={`input-group form-control ${errors.email && touched.email && errors.email}`}
                            placeholder="Tu correo electronico"
                            name="email"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.email}
                            required
                            tabIndex="1"
                            readOnly={isResetMode}
                        />
                        <label htmlFor="contrasena-actual">{isResetMode ? 'Contraseña temporal (del correo):' : 'Contraseña actual:'}</label>
                        <div className={`input-group input-group-merge ${errors.passActual && touched.passActual && errors.passActual}`}>
                            <input
                                type={type(view)}
                                className='form-control'
                                placeholder={isResetMode ? "Ingresa la contraseña del correo" : "Contraseña actual"}
                                name="passActual"
                                autoComplete="on"
                                required
                                tabIndex="2"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.passActual}
                            />

                            <span className="view-btn input-group-text px-4 text-secondary link-primary text-decoration-none" onClick={() => setview(!view)} ><i className={`view-icon fa-solid ${icon(view)}`}></i></span>
                        </div>

                        <label htmlFor="nueva-contrasena">Nueva contraseña:</label>
                        <div className={`input-group input-group-merge ${errors.newPass && touched.newPass && errors.newPass}`}>
                            <input
                                type={type(view2)}
                                className='form-control'
                                placeholder="Nueva contraseña"
                                name="newPass"
                                autoComplete="on"
                                required
                                tabIndex="3"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.newPass}
                            />

                            <span className="view-btn input-group-text px-4 text-secondary link-primary text-decoration-none" onClick={() => setview2(!view2)} ><i className={`view-icon fa-solid ${icon(view2)}`}></i></span>
                        </div>
                        <input className='btn btn-primary w-75 mt-2' type="submit" value="Cambiar contraseña" />
                    </form>
                )}
            </Formik>
        </div>
    );
}

export default ChangePassword;
