import axios from "axios";
import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import { decrypt, encrypt, fetchData } from "../Funciones/Funciones";
import Loader from "../Pages/Loader/loader";
import Cookies from 'js-cookie';
import Maintenance from "../Pages/Mantenimiento/Maintenance";

// Crear una instancia de Swal para mostrar notificaciones tipo toast en la parte superior de la página.
const Toast = Swal.mixin({
    toast: true,
    position: 'top',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: false,
    background: "#0e3769",
    color: "#fff",
    customClass: {
        alert: 'my-toast-class',

    }
})


// Definir el contexto de autenticación utilizando createContext().
const AuthContext = React.createContext(null)

// Exportar la función useAuth() para consumir el contexto de autenticación en componentes hijos.
export function useAuth() {
    return useContext(AuthContext)
}



/*
 * Proporciona el contexto de autenticación para el resto de la aplicación.
 * @param {Object} props - Propiedades del componente.
 * @param {ReactNode} props.children - Los elementos hijos del componente.
*/
export function AuthProvider({ children }) {

    const [Actualizar, setActualizar] = useState(false);
    const [loading, setloading] = useState(false);
    const [currentUser, setCurrentUser] = useState([]);
    const [isQA, setisQA] = useState(false);
    const [RandomNumberImg, setRandomNumberImg] = useState(null);
    const [FlagMaintenance, setFlagMaintenance] = useState(false);
    const [clubData, setClubData] = useState(null);
    const navigate = useNavigate();


    // Crear un objeto Request utilizando useMemo().
    const Request = useMemo(() => ({
        // Utilizar variables descriptivas para las diferentes propiedades.
        Dominio: isQA ? process.env.REACT_APP_VF_DOMINIODEV : process.env.REACT_APP_VF_DOMINIO,
        userLogin: isQA ? process.env.REACT_APP_VF_USERDEV : process.env.REACT_APP_VF_USER,
        userPassword: isQA ? process.env.REACT_APP_VF_PASSWORDDEV : process.env.REACT_APP_VF_PASSWORD,
        Empresa: isQA ? process.env.REACT_APP_VF_EMPRESADEV : process.env.REACT_APP_VF_EMPRESA,
        Referencia: isQA ? process.env.REACT_APP_VF_REFDEV : process.env.REACT_APP_VF_REF,
    }), [isQA]);

    // Función de alerta que utiliza la biblioteca SweetAlert.
    function Alerta(icon, mensaje) {
        Toast.fire({
            icon: icon,
            title: mensaje
        })
    }



    /*
     * Registra un nuevo usuario
     * @param {number} tipoUsuario - El tipo de usuario que se va a registrar
     * @param {string} nombre - El nombre del usuario que se va a registrar
     * @param {string} apellido - El apellido del usuario que se va a registrar
     * @param {string} email - El correo electrónico del usuario que se va a registrar
     * @param {string} password - La contraseña del usuario que se va a registrar
    */
    function registro(tipoUser, nombre, apellido, email, password) {
        setloading(true)

        // Crear objeto FormData con los datos del usuario
        const formdata = new FormData();
        formdata.append("jugador_nombres", nombre);
        formdata.append("jugador_apellidos", apellido);
        formdata.append("jugador_email", email);
        formdata.append("jugador_contrasena", password);
        formdata.append("vit_jugador_tipo_id", tipoUser);

        // Hacer una petición POST con axios
        axios({
            method: "post",
            url: `${Request.Dominio}/registro_cuenta`,
            headers: {
                "userLogin": Request.userLogin,
                "userPassword": Request.userPassword,
                "systemRoot": Request.Empresa
            },
            data: formdata

        }).then(res => {
            const arreglo = res.data.data;

            const data = arreglo[0]

            // Si el correo electrónico ya existe, mostrar un mensaje de error
            if (data.Registrado === "Email ya existe") {
                Toast.fire({
                    icon: 'error',
                    title: data.Registrado
                })

            }
            else {
                // Si todo salió bien, llamar a la función login()
                login(email, password, true)
                return; // login maneja su propio setloading
            }
            setloading(false)

        }).catch(e => {
            // Mostrar un mensaje de error si algo salió mal
            Toast.fire({
                icon: 'error',
                title: '¡Ups! Algo salió mal'
            })
            setloading(false)
        })
    }




    /*
     * Registra un nuevo club/academia
     * @param {string} nombreClub - Nombre del club
     * @param {number} tipoInstitucion - ID del tipo de institucion
     * @param {number} paisId - ID del pais
     * @param {string} nombre - Nombres del responsable
     * @param {string} apellido - Apellidos del responsable
     * @param {string} email - Correo electronico
     * @param {string} password - Contrasena
    */
    function registroClub(nombreClub, tipoInstitucion, paisId, nombre, apellido, email, password) {
        setloading(true)

        const formdata = new FormData();
        formdata.append("nombre_club", nombreClub);
        formdata.append("vit_tipo_institucion_id", tipoInstitucion);
        formdata.append("fb_pais_id", paisId);
        formdata.append("responsable_nombres", nombre);
        formdata.append("responsable_apellidos", apellido);
        formdata.append("jugador_email", email);
        formdata.append("jugador_contrasena", password);

        axios({
            method: "post",
            url: `${Request.Dominio}/registro_cuenta_club`,
            headers: {
                "userLogin": Request.userLogin,
                "userPassword": Request.userPassword,
                "systemRoot": Request.Empresa
            },
            data: formdata
        }).then(res => {
            const arreglo = res.data.data;
            const data = arreglo[0]

            if (data.Registrado === "Email ya existe") {
                Toast.fire({ icon: 'error', title: data.Registrado })
            } else {
                login(email, password, true)
                return;
            }
            setloading(false)
        }).catch(e => {
            Toast.fire({ icon: 'error', title: '¡Ups! Algo salió mal' })
            setloading(false)
        })
    }

    /*
     * Obtiene los datos del club vinculado al usuario actual
     * @param {number} jugadorId - ID del jugador/usuario
    */
    const fetchClubData = useCallback((jugadorId) => {
        const formdata = new FormData();
        formdata.append("vit_jugador_id", jugadorId);

        axios({
            method: "post",
            url: `${Request.Dominio}/institucion_usuario_get`,
            headers: {
                "userLogin": Request.userLogin,
                "userPassword": Request.userPassword,
                "systemRoot": Request.Empresa
            },
            data: formdata
        }).then(res => {
            const data = res.data?.data?.[0];
            if (data) {
                setClubData(data);
            } else {
                setClubData(null);
            }
        }).catch(() => {
            setClubData(null);
        })
    }, [Request]);

    /*
     * Inicia sesión en la aplicación
     * @param {string} email - Correo electrónico del usuario
     * @param {string} password - Contraseña del usuario
     * @param {boolean} mensaje - Indica si es la primera vez que el usuario inicia sesión
    */
    function login(email, password, mensaje) {
        // Activa el indicador de carga
        setloading(true)

        // Crea un objeto FormData con los datos de inicio de sesión
        const formdata = new FormData();
        formdata.append("user_login", email);
        formdata.append("password", password);

        // Realiza la solicitud de inicio de sesión utilizando Axios
        axios({
            method: "post",
            url: `${Request.Dominio}/pr_ws_sc_user`,
            headers: {
                "userLogin": Request.userLogin,
                "userPassword": Request.userPassword,
                "systemRoot": Request.Empresa
            },
            data: formdata

        }).then(res => {
            // Obtiene los datos del usuario y los almacena en el estado y en el almacenamiento local
            const data = res.data.data[0];
            if (data) {
                setCurrentUser(data)

                // Si es tipo club (3), cargar datos del club vinculado
                if (data.vit_jugador_tipo_id === 3 || data.vit_jugador_tipo_id === '3') {
                    fetchClubData(data.vit_jugador_id);
                }

                // Encripta los datos del usuario utilizando una clave secreta
                const encryptedData = encrypt(data, process.env.REACT_APP_VF_KEY);

                // Almacena los datos en una cookie cifrada
                Cookies.set('currentUser', encryptedData, { expires: 7, secure: true, sameSite: 'strict' });

                //Verificar si es por primera vez el ingreso
                if (mensaje) {
                    const esClubUser = data.vit_jugador_tipo_id === 3 || data.vit_jugador_tipo_id === '3';
                    navigate(esClubUser ? "/perfil-club" : "/perfil", { replace: true })
                    // Muestra un mensaje de éxito
                    Toast.fire({
                        icon: 'success',
                        title: 'Se Registro correctamente'
                    })

                } else {
                    // Muestra un mensaje de éxito
                    Toast.fire({
                        icon: 'success',
                        title: 'Inicio de sesión exitoso'
                    })
                }
                // Desactiva el indicador de carga
                setloading(false)
            }
            else {
                // Muestra un mensaje de error si las credenciales son incorrectas
                Toast.fire({
                    icon: 'error',
                    title: 'Credenciales incorrectas'
                })
                // Desactiva el indicador de carga
                setloading(false)
            }

        }).catch(e => {
            // Muestra un mensaje de error si algo salió mal
            console.log(e);
            Toast.fire({
                icon: 'error',
                title: '¡Ups! Algo salió mal'
            })
            // Desactiva el indicador de carga
            setloading(false)
        })

    }



    /*
     * Inicia sesión usando Google Sign-In
     * @param {string} accessToken - El access_token recibido de Google
    */
    function loginWithGoogle(accessToken) {
        setloading(true)

        const formdata = new FormData();
        formdata.append("accessToken", accessToken);

        axios({
            method: "post",
            url: `${Request.Dominio}/google_auth_token`,
            headers: {
                "userLogin": Request.userLogin,
                "userPassword": Request.userPassword,
                "systemRoot": Request.Empresa
            },
            data: formdata

        }).then(res => {
            const data = res.data?.data?.[0];
            if (data) {
                const esNuevo = !data.flag_perfil_completado || data.flag_perfil_completado === 0 || data.flag_perfil_completado === '0';
                const noEsClub = data.vit_jugador_tipo_id !== 3 && data.vit_jugador_tipo_id !== '3';

                if (esNuevo && noEsClub) {
                    // Usuario nuevo via Google: preguntar rol
                    setloading(false);
                    Swal.fire({
                        title: 'Bienvenido a Vitrina Futbolera',
                        text: '¿Qué tipo de cuenta deseas crear?',
                        icon: 'question',
                        showDenyButton: true,
                        confirmButtonText: 'Soy Jugador',
                        denyButtonText: 'Soy Club / Academia',
                        confirmButtonColor: '#28a745',
                        denyButtonColor: '#17a2b8',
                        background: "#0e3769",
                        color: "#fff",
                        allowOutsideClick: false
                    }).then((result) => {
                        if (result.isDenied) {
                            // Eligio Club: convertir cuenta a tipo club
                            setloading(true);
                            fetchData(Request, "configurar_cuenta_club", [
                                { nombre: "vit_jugador_id", envio: data.vit_jugador_id },
                                { nombre: "nombre_club", envio: '' },
                                { nombre: "vit_tipo_institucion_id", envio: 1 },
                                { nombre: "fb_pais_id", envio: 0 }
                            ]).then(() => {
                                const updatedData = { ...data, vit_jugador_tipo_id: 3 };
                                setCurrentUser(updatedData);
                                const enc = encrypt(updatedData, process.env.REACT_APP_VF_KEY);
                                Cookies.set('currentUser', enc, { expires: 7, secure: true, sameSite: 'strict' });
                                fetchClubData(data.vit_jugador_id);
                                Toast.fire({ icon: 'success', title: 'Cuenta de club creada' });
                                setloading(false);
                            }).catch(() => {
                                setCurrentUser(data);
                                const enc = encrypt(data, process.env.REACT_APP_VF_KEY);
                                Cookies.set('currentUser', enc, { expires: 7, secure: true, sameSite: 'strict' });
                                Toast.fire({ icon: 'error', title: 'Error al configurar cuenta de club' });
                                setloading(false);
                            });
                        } else {
                            // Eligio Jugador: flujo normal
                            setCurrentUser(data);
                            const enc = encrypt(data, process.env.REACT_APP_VF_KEY);
                            Cookies.set('currentUser', enc, { expires: 7, secure: true, sameSite: 'strict' });
                            Toast.fire({ icon: 'success', title: 'Inicio de sesión exitoso' });
                        }
                    });
                } else {
                    // Usuario existente o ya es club: flujo normal
                    setCurrentUser(data);
                    if (data.vit_jugador_tipo_id === 3 || data.vit_jugador_tipo_id === '3') {
                        fetchClubData(data.vit_jugador_id);
                    }
                    const encryptedData = encrypt(data, process.env.REACT_APP_VF_KEY);
                    Cookies.set('currentUser', encryptedData, { expires: 7, secure: true, sameSite: 'strict' });
                    Toast.fire({ icon: 'success', title: 'Inicio de sesión exitoso' });
                    setloading(false);
                }
            } else {
                Toast.fire({ icon: 'error', title: '¡Ups! Algo salió mal' })
                setloading(false);
            }

        }).catch(e => {
            console.log(e);
            Toast.fire({ icon: 'error', title: '¡Ups! Algo salió mal' })
            setloading(false)
        })
    }


    /*
     * Cierra la sesión del usuario
     * Elimina los datos del usuario del estado y del almacenamiento local y muestra un mensaje de información
    */
    function marcarPerfilCompletado() {
        const updated = { ...currentUser, flag_perfil_completado: 1 };
        setCurrentUser(updated);
        const encryptedData = encrypt(updated, process.env.REACT_APP_VF_KEY);
        Cookies.set('currentUser', encryptedData, { expires: 7, secure: true, sameSite: 'strict' });
    }

    function logOut() {
        // Elimina los datos del usuario del estado
        setCurrentUser(null)
        // Eliminar la cookie
        Cookies.remove('currentUser', { secure: true, sameSite: 'strict' });

        // Muestra un mensaje de información
        Toast.fire({
            icon: 'info',
            title: 'Se cerró sesión'
        })

    }




    /*
     * Verifica si hay datos de usuario almacenados en caché y actualiza los datos del usuario si es necesario.
     * Se ejecuta cuando se actualizan los valores de Request y Actualizar.
    */
    useEffect(() => {
        setRandomNumberImg(Math.random())
        setloading(true)

        //Eliminar remanentes de el anterior guardado de usuario sin cifrar
        window.localStorage.removeItem('currentUser')


        // Obtener los datos del usuario almacenados en la cookie cifrada
        const encryptedData = Cookies.get('currentUser');
        let decryptedData = null

        if (encryptedData) {
            decryptedData = decrypt(encryptedData, process.env.REACT_APP_VF_KEY);
        }
        setCurrentUser(decryptedData)


        if (decryptedData) {

            // Actualizar los datos del usuario si es necesario
            const formdata = new FormData();
            formdata.append("user_login", decryptedData.usuario);
            formdata.append("password", decryptedData.password);

            axios({
                method: "post",
                url: `${Request.Dominio}/pr_ws_sc_user`,
                headers: {
                    "userLogin": Request.userLogin,
                    "userPassword": Request.userPassword,
                    "systemRoot": Request.Empresa
                },
                data: formdata

            }).then(res => {
                const arreglo = res.data.data;
                const data = arreglo[0]
                if (data) {
                    // Actualizar los datos del usuario
                    setCurrentUser(data)

                    // Si es tipo club (3), cargar datos del club vinculado
                    if (data.vit_jugador_tipo_id === 3 || data.vit_jugador_tipo_id === '3') {
                        fetchClubData(data.vit_jugador_id);
                    }

                    // Encripta los datos del usuario utilizando una clave secreta
                    const encryptedData = encrypt(data, process.env.REACT_APP_VF_KEY);

                    // Almacena los datos en una cookie cifrada
                    Cookies.set('currentUser', encryptedData, { expires: 7, secure: true, sameSite: 'strict' });

                } else {
                    if (decryptedData && decryptedData.google_id) {
                        // Usuario solo-Google sin SC_USER: mantener sesión del cookie
                        setCurrentUser(decryptedData)
                    } else {
                        // Credenciales inválidas: cerrar sesión
                        setCurrentUser(null)
                        Cookies.remove('currentUser', { secure: true, sameSite: 'strict' });
                    }
                }
                setloading(false)

            }).catch(e => {
                console.log("Error al actualizar datos del usuario");
                setFlagMaintenance(true)
                setloading(false)
            })
        }else{
            setloading(false)
        }
    }, [Request, Actualizar]);



    const isClub = currentUser && (currentUser.vit_jugador_tipo_id === 3 || currentUser.vit_jugador_tipo_id === '3');

    // Objeto que contiene los valores del contexto de autenticación
    const value = {
        currentUser,
        Request,
        login,
        loginWithGoogle,
        logOut,
        registro,
        registroClub,
        Alerta,
        setloading,
        isQA,
        setisQA,
        setActualizar,
        Actualizar,
        RandomNumberImg,
        marcarPerfilCompletado,
        clubData,
        isClub,
        fetchClubData
    }

    // Renderizar el componente de proveedor de contexto de autenticación
    return (
        <AuthContext.Provider value={value}>
            {loading && <Loader />}
            {FlagMaintenance ? <Maintenance /> : children}
        </AuthContext.Provider>
    )
}