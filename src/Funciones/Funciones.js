import CryptoJS from 'crypto-js';
import axios from 'axios';



/*
 * Esta función recibe una fecha de nacimiento y devuelve la edad correspondiente en años.
 * @param {string} fecha - Una cadena que representa una fecha de nacimiento en cualquier formato válido para el objeto Date de JavaScript.
 * @returns {string} - Una cadena que representa la edad en años, seguida de la palabra "años".
*/
export function ObtenerEdad(fecha) {
    // Verifica si se proporcionó un valor válido para la fecha de nacimiento.
    if (fecha) {
        // Crea objetos Date para la fecha actual y la fecha de nacimiento.
        const nacimiento = new Date(fecha);
        const fechaActual = new Date();
        // Calcula la diferencia de años entre la fecha actual y la fecha de nacimiento.
        let edad = fechaActual.getFullYear() - nacimiento.getFullYear();
        // Calcula la diferencia de meses entre la fecha actual y la fecha de nacimiento.
        const diferenciaMeses = fechaActual.getMonth() - nacimiento.getMonth();
        // Si la diferencia de meses es negativa o es cero pero la fecha actual es anterior al día de nacimiento, resta un año a la edad.
        if (diferenciaMeses < 0 || (diferenciaMeses === 0 && fechaActual.getDate() < nacimiento.getDate())) {
            edad--;
        }
        // Devuelve la edad en años, seguida de la palabra "años".
        return `${edad} años`;
    }
    // Si no se proporcionó una fecha de nacimiento válida, devuelve una cadena vacía.
    return '';
}




/*
 * Esta función recibe una fecha en formato de cadena y la convierte en una cadena en formato "AAAA-MM-DD".
 * @param {string} fecha - Una cadena que representa una fecha en cualquier formato válido para el objeto Date de JavaScript.
 * @returns {string} - Una cadena que representa la misma fecha en formato "AAAA-MM-DD".
*/
export function DarFormatoFecha(fecha) {
    // Verifica si se proporcionó un valor válido para la fecha.
    if (fecha) {
        // Crea un objeto Date a partir de la cadena de fecha.
        const fechaNac = new Date(fecha);
        // Obtiene el día, mes y año de la fecha.
        const dia = fechaNac.getDate().toString().padStart(2, '0');
        const mes = (fechaNac.getMonth() + 1).toString().padStart(2, '0');
        const año = fechaNac.getFullYear().toString();
        // Concatena el año, mes y día con guiones para formar la cadena en formato "AAAA-MM-DD".
        return `${año}-${mes}-${dia}`;
    }
    // Si no se proporcionó una fecha, devuelve una cadena vacía.
    return '';
}



/*
 * Esta función recibe dos cadenas de texto y devuelve el primer nombre y apellido de cada una, separados por un espacio.
 * @param {string} nombres - Cadena que contiene uno o más nombres separados por espacios.
 * @param {string} apellidos - Cadena que contiene uno o más apellidos separados por espacios.
 * @returns {string} - Una cadena que contiene el primer nombre y apellido de cada parámetro, separados por un espacio.
*/
export function CortarNombre(nombres, apellidos) {
    // Verifica si se proporcionaron ambos parámetros.
    if (nombres && apellidos) {
        // Divide la cadena de nombres en un arreglo y devuelve el primer elemento.
        const primerNombre = nombres.split(' ')[0];
        // Divide la cadena de apellidos en un arreglo y devuelve el primer elemento.
        const primerApellido = apellidos.split(' ')[0];
        // Devuelve la concatenación del primer nombre y apellido, separados por un espacio.
        return `${primerNombre} ${primerApellido}`;
    }
    // Si falta algún parámetro, devuelve una cadena vacía.
    return '';
}



// Esta función avanza al siguiente módulo y actualiza la clase de los botones correspondientes.
export function AvanzarModulo(setModulo, Modulo, ClassBtn) {
    // Avanzar al siguiente formulario
    setModulo(Modulo)

    // Obtiene todos los botones de navegación
    let botones = document.getElementsByClassName(ClassBtn)

    // Declara el indice
    let indice = false

    for (let i = 0; i < botones.length; i++) {
        const boton = botones[i];

        // Si el botón actual está activo
        if (boton.classList.contains('active')) {
            // Cambia el indice a true
            indice = true;

            // Si el indice es True
            if (indice) {
                // El botón siguiente se convierte en activo
                botones[i + 1].classList.add('active');
                // El botón actual se vuelve inactivo
                boton.classList.remove('active');
                return;
            }
        }
    }
}



// Esta función volver al módulo anterior y actualiza la clase de los botones correspondientes.
export function VolverTab(setModulo, Modulo, ClassBtn) {
    //Volver al anterior formulario
    setModulo(Modulo)

    // Obtiene todos los botones de navegación
    let botones = document.getElementsByClassName(ClassBtn)

    // Declara el indice
    let indice = false

    for (let i = 0; i < botones.length; i++) {
        const boton = botones[i];

        // Si el botón actual está activo
        if (boton.classList.contains('active')) {
            // Cambia el indice a true
            indice = true;

            // Si el indice es True
            if (indice) {
                // El botón anterior se convierte en activo
                botones[i - 1].classList.add('active');
                // El botón actual se vuelve inactivo
                boton.classList.remove('active');
                return;
            }
        }
    }
}



/*
 * Devuelve el nombre de clase de un icono basado en un valor booleano.
 *
 * @param {boolean} e - El valor booleano que determina si se muestra el icono de ojo o no.
 * @returns {string} El nombre de clase del icono correspondiente.
 */
export const icon = (e) => e ? "icon-eye" : "icon-eye-blocked";


/*
 * Devuelve el tipo de entrada de un campo de contraseña basado en un valor booleano.
 *
 * @param {boolean} e - El valor booleano que determina si se muestra el campo de contraseña como texto o como contraseña oculta.
 * @returns {string} El tipo de entrada correspondiente (texto o contraseña).
 */
export const type = (e) => e ? "text" : "password";



/*
 * Devuelve una cadena de texto sin espacios en blanco al principio o al final,
 * y reemplaza cualquier secuencia de espacios en blanco dentro de la cadena
 * por un solo espacio en blanco.
 *
 * @param {string} cadena La cadena de texto que se va a limpiar.
 * @returns {string} La cadena de texto sin espacios en blanco no deseados.
 * @throws {Error} Si la entrada no es una cadena de texto.
 */

export function limpiarCadena(cadena) {
    return cadena.replace(/^\s+|\s+$/g, '').replace(/\s+/g, ' ');
}




// Encriptar datos utilizando AES y una clave secreta
export function encrypt(data, key) {
    const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(data), key);
    return encryptedData.toString();
}


// Desencriptar datos utilizando AES y una clave secreta
export function decrypt(data, key) {
    try {
        const decryptedData = CryptoJS.AES.decrypt(data, key);
        const decryptedString = decryptedData.toString(CryptoJS.enc.Utf8);
        return JSON.parse(decryptedString);
    } catch (error) {
        console.error("Error decrypting data:", error);
        return null; // Devuelve null si no se pudo desencriptar
    }
}


export function fetchData(Request, url, transferData) {
    const formdata = new FormData();
    for (const dato of transferData) {
        formdata.append(dato.nombre, dato.envio);
    }

    return new Promise((resolve, reject) => {
        axios({
            method: "post",
            url: `${Request.Dominio}/${url}`,
            headers: {
                "userLogin": Request.userLogin,
                "userPassword": Request.userPassword,
                "systemRoot": Request.Empresa
            },
            data: formdata
        })
            .then(response => {
                resolve(response.data.data);
            })
            .catch(error => {
                console.log(error);
                reject(error);
            })
    });
}