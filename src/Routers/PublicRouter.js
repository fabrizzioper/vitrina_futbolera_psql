import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';


/*
 * Un componente que protege una ruta de acceso a usuarios autenticados.
 * 
 * Si el usuario actual no ha iniciado sesión, se le permite acceder a la ruta protegida y se muestra su contenido.
 * De lo contrario, el usuario es redirigido a la página anterior.
*/
const PublicRouter = () => {
    // Obtener la ubicación actual de la aplicación y el estado del usuario.
    const location = useLocation();
    const { currentUser } = useAuth();

    // Obtener la ruta anterior o establecerla como la ruta de inicio si no hay una anterior.
    let previusURL = location.state?.from.pathname || "/"

    // Si el usuario actual no ha iniciado sesión, permitir el acceso a la ruta protegida.
    // De lo contrario, redirigir al usuario a la página anterior.
    return (
        <>
            {!currentUser ? <Outlet /> : <Navigate to={previusURL} />}
        </>
    );
}

export default PublicRouter;