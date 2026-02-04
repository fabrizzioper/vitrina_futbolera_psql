import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../Context/AuthContext';
import './validacionCorreo.css';

const ValidacionCorreo = () => {
    const { currentUser, Request, Alerta, Actualizar, setActualizar,logOut } = useAuth()

    const [Contador, setContador] = useState(60);


    const input1Ref = useRef(null);
    const input2Ref = useRef(null);
    const input3Ref = useRef(null);
    const input4Ref = useRef(null);


    useEffect(() => {
        if (Contador === 0) return;

        const intervalId = setInterval(() => {
            setContador(Contador => Contador - 1);
        }, 1000);

        return () => clearInterval(intervalId);
    }, [Contador]);



    // Función auxiliar para convertir segundos en formato "minutos:segundos"
    const FormatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };


    function moveInput(event, nextInputRef, backInputRef) {
        let valor = event.target.value.trim() !== ''

        if (event.key === "ArrowLeft") {
            return backInputRef.current.select();
        } else if (event.key === "ArrowRight") {
            return nextInputRef.current.select();
        } else if (event.key === "Delete") {
            return ""
        }
        else if (event.key === "Backspace" && !valor) {
            return backInputRef.current.select();
        }
        else if (valor && event.key !== "Backspace") {
            return nextInputRef.current.select();
        }
    }

    function handlePaste(event) {
        const pastedText = event.clipboardData.getData('text');
        const inputs = [input1Ref, input2Ref, input3Ref, input4Ref];
        for (let i = 0; i < pastedText.length && i < inputs.length; i++) {
            inputs[i].current.value = pastedText[i];
            if (inputs[i + 1]) {
                inputs[i + 1].current.select();
            }
        }
        event.preventDefault();
    }


    function toggleIcon(icon_hide, icon_show, boton) {
        icon_hide.classList.remove("show")
        icon_hide.classList.add("hide")
        icon_show.classList.remove("hide")
        icon_show.classList.add("show")
        boton.classList.contains("btn_animacion") ? boton.classList.remove("btn_animacion") : boton.classList.add("btn_animacion")

    }

    function ValidarCodigo(e) {
        e.preventDefault();
        let codigo = e.target.input1.value + e.target.input2.value + e.target.input3.value + e.target.input4.value

        let boton = document.getElementById("boton_verify");
        let label = document.getElementById("label_verify");
        let check = document.getElementById("check_verify");

        const formdata = new FormData();
        formdata.append("jugador_email", currentUser.email);
        formdata.append("password", currentUser.password);
        formdata.append("codigo_validacion", codigo);


        axios({
            method: "post",
            url: `${Request.Dominio}/validar_codigo_verificacion`,
            headers: {
                "userLogin": Request.userLogin,
                "userPassword": Request.userPassword,
                "systemRoot": Request.Empresa
            },
            data: formdata

        }).then(res => {
            let mensaje = res.data.data[0].Mensaje

            if (mensaje === "Error de verificación") {
                Alerta("error", mensaje)

                boton.classList.add("error_verify")
                setTimeout(() => {
                    boton.classList.remove("error_verify")
                }, 2000);

            } else {
                Alerta("success", mensaje)
                toggleIcon(label, check, boton)
                setTimeout(() => {
                    setActualizar(!Actualizar)
                }, 2100);


            }

        }).catch(error => {
        });
    }


    function ReenviarCodigo() {
        const formdata = new FormData();
        formdata.append("jugador_email", currentUser.email);
        formdata.append("password", currentUser.password);


        axios({
            method: "post",
            url: `${Request.Dominio}/codigo_verificacion`,
            headers: {
                "userLogin": Request.userLogin,
                "userPassword": Request.userPassword,
                "systemRoot": Request.Empresa
            },
            data: formdata

        }).then(res => {
            if (res.data.data === null) {
                setContador(60)
                Alerta("success", "El código fue reenviado")
            }else{
                Alerta("error", "Ocurrió un error")
            }

        }).catch(error => {
        });
    }


    return (
        <div className='vh-100 vw-100 d-flex align-items-center justify-content-center validacionCorreo'>
            <form className="form bg-dark" onSubmit={(e) => ValidarCodigo(e)}>
                <p className="heading">¡Verifica tu cuenta!</p>
                <p className='subinfo' >Ingrese los 4 dígitos que se envió a su correo electrónico.</p>
                <div className="box">
                    <input required id="input1" className="input" type="text" inputMode="numeric" maxLength="1" ref={input1Ref} onKeyDown={(e) => moveInput(e, input2Ref, input1Ref)} onPaste={handlePaste} />
                    <input required id="input2" className="input" type="text" inputMode="numeric" maxLength="1" ref={input2Ref} onKeyDown={(e) => moveInput(e, input3Ref, input1Ref)} onPaste={handlePaste} />
                    <input required id="input3" className="input" type="text" inputMode="numeric" maxLength="1" ref={input3Ref} onKeyDown={(e) => moveInput(e, input4Ref, input2Ref)} onPaste={handlePaste} />
                    <input required id="input4" className="input" type="text" inputMode="numeric" maxLength="1" ref={input4Ref} onKeyDown={(e) => moveInput(e, input4Ref, input3Ref)} onPaste={handlePaste} />
                </div>
                <p className='label_reenviar' ><button tabIndex={"-1"} type='button' onClick={() => ReenviarCodigo()} disabled={Contador !== 0}>Reenviar</button> en {FormatTime(Contador)} segundos</p>
                <button className="btn1" id="boton_verify" type='submit'>
                    <p className='show' id="label_verify">Enviar</p>
                    <div className="wrapper hide" id="check_verify">
                        <svg className="check checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52"><circle className="checkmark_circle" cx="26" cy="26" r="25" fill="none" /><path className="checkmark_check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" /></svg>
                    </div>
                </button>
                <p className='label_signOut' onClick={() => logOut()} ><i class="fa-solid fa-right-from-bracket"></i> Cerrar sesión</p>
            </form>
        </div>
    );
}

export default ValidacionCorreo;
