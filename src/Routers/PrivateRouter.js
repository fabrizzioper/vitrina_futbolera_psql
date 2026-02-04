import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';


/*
 * Un componente que protege una ruta de acceso a usuarios no autenticados.
 * 
 * Si el usuario actual ha iniciado sesión, se le permite acceder a la ruta protegida y se muestra su contenido.
 * De lo contrario, el usuario es redirigido a la página de inicio de sesión.
*/
const PrivateRouter = () => {
    // Obtener la ubicación actual de la aplicación y el estado del usuario.
    const location = useLocation();
    const { currentUser } = useAuth();


    // Si el usuario actual ha iniciado sesión, permitir el acceso a la ruta protegida.
    // De lo contrario, redirigir al usuario a la página de inicio de sesión.
    return (
        currentUser ? <Outlet /> : <Navigate to={"/login"} state={{ from: location }} />
    );
}

export default PrivateRouter;