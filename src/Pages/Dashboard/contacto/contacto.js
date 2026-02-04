import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import "./contacto.css"
import { Formik } from 'formik';
import axios from 'axios';
import { useAuth } from '../../../Context/AuthContext';
import Swal from 'sweetalert2/dist/sweetalert2.js'

const Contacto = () => {
    const { Alerta, Request } = useAuth();

    const location = useLocation();
    let previusURL = location.state?.from.pathname || "/"

    function SendEmail(e) {
        const formdata = new FormData();
        formdata.append("nombre", e.input_full_name);
        formdata.append("celular", e.input_phone);
        formdata.append("email", e.input_email);
        formdata.append("asunto", e.input_subject);
        formdata.append("comentario", e.input_message);

        axios({
            method: "post",
            url: `${Request.Dominio}/contactenos`,
            headers: {
                "userLogin": Request.userLogin,
                "userPassword": Request.userPassword,
                "systemRoot": Request.Empresa
            },
            data: formdata

        }).then(res => {
            console.log(res);
            if (res.data.success !== false) {
                Swal.fire({
                    title: '¡Gracias por contactarnos!',
                    text: 'Nuestro equipo ha recibido tu correo electrónico y te responderemos pronto.',
                    icon: 'success',
                    confirmButtonColor: '#ef8700',
                    background: "#0e3769",
                    color: "#fff"
                })

            } else {
                Alerta("error", "Por favor, intenta más tarde.")
            }

        }).catch(error => {
            console.log(error);;
        });
    }

    return (
        <>
            <div className='out-div-seccion'>
                <div className='header-seccion row gap-3'>
                    <div className='col'>
                    </div>
                </div>
            </div>
            <div className='div-seccion-Jugadores mt-3'>
                <div className='col-12 p-none centrar'>
                    <Formik
                        initialValues={{ input_full_name: '', input_phone: '', input_email: '', input_subject: '', input_message: '' }}
                        validate={values => {
                            const errors = {};
                            if (!values.input_full_name) {
                                errors.input_full_name = 'input-error';
                            }
                            if (!values.input_phone) {
                                errors.input_phone = 'input-error';
                            }
                            if (!values.input_email) {
                                errors.input_email = 'input-error';
                            }
                            if (!values.input_subject) {
                                errors.input_subject = 'input-error';
                            }
                            if (!values.input_message) {
                                errors.input_message = 'input-error';
                            }
                            return errors;
                        }}
                        onSubmit={(values) => {
                            SendEmail(values);
                        }}
                    >
                        {({ values, errors, touched, handleChange, handleBlur, handleSubmit }) => (
                            <form className='seccion seccion-contacto shadow-sm row' onSubmit={handleSubmit}>
                                <div className='mb-4'>
                                    <Link className='Volver-link' to={previusURL}><span className='icon-flecha2'></span><h5>Contáctenos</h5></Link>
                                </div>
                                <div className="col-sm-4 mt-3 centrar-input">
                                    <label htmlFor="projectName" className="form-label">Nombre completo</label>
                                    <input
                                        type="text"
                                        className={`form-control ${errors.input_full_name && touched.input_full_name && errors.input_full_name}`}
                                        name="input_full_name"
                                        placeholder="Su nombre completo"
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        value={values.input_full_name}
                                        required
                                    />
                                </div>
                                <div className="col-sm-4 mt-3 centrar-input">
                                    <label htmlFor="projectName" className="form-label">Celular</label>
                                    <input
                                        type="number"
                                        inputMode="numeric"
                                        className={`form-control ${errors.input_phone && touched.input_phone && errors.input_phone}`}
                                        name="input_phone"
                                        placeholder="Su nro. celular"
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        value={values.input_phone}
                                        required
                                    />
                                </div>
                                <div className="col-sm-4 mt-3 centrar-input">
                                    <label htmlFor="projectName" className="form-label">Correo</label>
                                    <input
                                        type="email"
                                        className={`form-control ${errors.input_email && touched.input_email && errors.input_email}`}
                                        name="input_email"
                                        placeholder="Su correo electrónico"
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        value={values.input_email}
                                        required
                                    />
                                </div>
                                <div className="col-sm-12 mt-3 centrar-input">
                                    <label htmlFor="projectName" className="form-label">Asunto</label>
                                    <input
                                        type="text"
                                        className={`form-control ${errors.input_subject && touched.input_subject && errors.input_subject}`}
                                        name="input_subject"
                                        placeholder="Motivo del correo"
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        value={values.input_subject}
                                        required
                                    />
                                </div>
                                <div className="col-sm-12 mt-3 centrar-input">
                                    <label htmlFor="projectName" className="form-label">Mensaje</label>
                                    <textarea
                                        className={`form-control ${errors.input_message && touched.input_message && errors.input_message}`}
                                        placeholder="¿En qué podemos ayudarte?"
                                        name="input_message"
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        value={values.input_message}
                                        required
                                    >
                                    </textarea>
                                </div>
                                <div className='footer-form'>
                                    <button type='submit'>
                                        <div className="svg-wrapper-1">
                                            <div className="svg-wrapper">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                                                    <path fill="none" d="M0 0h24v24H0z"></path>
                                                    <path fill="currentColor" d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-8.054-2.685z"></path>
                                                </svg>
                                            </div>
                                        </div>
                                        <span>Enviar</span>
                                    </button>
                                </div>
                            </form>
                        )}
                    </Formik>
                </div>
            </div>
        </>
    );
}

export default Contacto;
