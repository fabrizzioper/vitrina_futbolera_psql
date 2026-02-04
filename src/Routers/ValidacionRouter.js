import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

export const ValidacionIncorrecta = () => {
  const location = useLocation();
  const { currentUser } = useAuth();
  console.log("ValidacionIncorrecta");

  return (
    <>
      {currentUser && currentUser.validacion_correo ? (
        <Outlet />
      ) : (
        <Navigate to={"/validacion"} state={{ from: location }} />
      )}
    </>
  );
};

export const ValidacionCorrecta = () => {
  const { currentUser } = useAuth();
  console.log("ValidacionCorrecta");
  return (
    <>
      {!currentUser ? (
        <Navigate to={"/login"} />
      ) : currentUser.validacion_correo ? (
        <Navigate to={"/perfil"} />
      ) : (
        <Outlet />
      )}
    </>
  );
};

export const ValidacionPerfil = () => {
  const { currentUser, setloading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      setloading(false);
      setIsLoading(false);
    }
  }, []);
  return (
    <>
      {isLoading ? (
        <Outlet />
      ) : currentUser ? (
        currentUser.flag_perfil_completado ? (
          <Outlet />
        ) : (
          <Navigate to={"/perfil"} />
        )
      ) : (
        <Outlet />
      )}
    </>
  );
};

export const ValidacionPerfilCorrecta = () => {
  const { currentUser } = useAuth();
  const location = useLocation();
  
  return (
    (currentUser && !currentUser.validacion_correo) ? 
    <Navigate to={"/validacion"} state={{ from: location }} /> : 
    (currentUser && currentUser.flag_perfil_completado) ? 
    <Navigate to={`/ficha/${currentUser.vit_jugador_id}`} state={{ from: "/editar/perfil" }} /> : 
    <Outlet />
  );
};
