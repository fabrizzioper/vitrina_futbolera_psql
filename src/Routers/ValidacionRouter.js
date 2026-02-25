import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

export const ValidacionIncorrecta = () => {
  const location = useLocation();
  const { currentUser } = useAuth();

  const hasUserData = currentUser && currentUser.vit_jugador_id;

  return (
    <>
      {!hasUserData || currentUser.validacion_correo ? (
        <Outlet />
      ) : (
        <Navigate to={"/validacion"} state={{ from: location }} />
      )}
    </>
  );
};

export const ValidacionCorrecta = () => {
  const { currentUser } = useAuth();
  const hasUserData = currentUser && currentUser.vit_jugador_id;
  const esClub = hasUserData && (currentUser.vit_jugador_tipo_id === 3 || currentUser.vit_jugador_tipo_id === '3');
  return (
    <>
      {!hasUserData ? (
        <Navigate to={"/login"} />
      ) : currentUser.validacion_correo ? (
        <Navigate to={esClub ? "/perfil-club" : "/perfil"} />
      ) : (
        <Outlet />
      )}
    </>
  );
};

export const ValidacionPerfil = () => {
  const { currentUser, setloading, clubData } = useAuth();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  const hasUserData = currentUser && currentUser.vit_jugador_id;
  const esClub = hasUserData && (currentUser.vit_jugador_tipo_id === 3 || currentUser.vit_jugador_tipo_id === '3');

  useEffect(() => {
    if (hasUserData) {
      setloading(false);
      setIsLoading(false);
    }
  }, [hasUserData]);

  // Si no hay datos de usuario, permitir que el Outlet maneje (login redirect, etc.)
  if (!hasUserData) {
    return isLoading ? null : <Outlet />;
  }

  // Validar correo verificado antes de permitir acceso al dashboard
  if (!currentUser.validacion_correo) {
    return <Navigate to={"/validacion"} state={{ from: location }} />;
  }

  // Validar perfil completado
  if (!currentUser.flag_perfil_completado) {
    return <Navigate to={esClub ? "/perfil-club" : "/perfil"} />;
  }

  // Club con perfil completado: esperar clubData y verificar aprobación
  if (esClub) {
    if (!clubData) {
      return <div className="text-center py-5"><div className="spinner-border" role="status"></div></div>;
    }
    const aprobado = clubData.estado_aprobacion === 1 || clubData.estado_aprobacion === '1';
    if (!aprobado) {
      return <Navigate to="/perfil-club" />;
    }
  }

  return <Outlet />;
};

export const ValidacionAutorizacionMenor = () => {
  const { currentUser } = useAuth();
  const location = useLocation();

  return (
    <>
      {currentUser && currentUser.autorizacion_menor_estado === 1 ? (
        <Navigate to={"/autorizacion-pendiente"} state={{ from: location }} />
      ) : (
        <Outlet />
      )}
    </>
  );
};

export const ValidacionPerfilCorrecta = () => {
  const { currentUser, clubData } = useAuth();
  const location = useLocation();

  if (!currentUser || !currentUser.vit_jugador_id) {
    return <Navigate to={"/login"} state={{ from: location }} />;
  }

  const esClub = currentUser.vit_jugador_tipo_id === 3 || currentUser.vit_jugador_tipo_id === '3';

  if (!currentUser.validacion_correo) {
    return <Navigate to={"/validacion"} state={{ from: location }} />;
  }

  if (currentUser.flag_perfil_completado) {
    // Club no aprobado: quedarse en /perfil-club para ver estado
    if (esClub) {
      const aprobado = clubData?.estado_aprobacion === 1 || clubData?.estado_aprobacion === '1';
      if (!aprobado) {
        return <Outlet />;
      }
      return <Navigate to="/club/dashboard" state={{ from: "/editar/perfil" }} />;
    }
    return <Navigate to={`/ficha/${currentUser.vit_jugador_id}`} state={{ from: "/editar/perfil" }} />;
  }

  return <Outlet />;
};

export const ValidacionClub = () => {
  const { currentUser, isClub } = useAuth();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to={"/login"} state={{ from: location }} />;
  }
  if (!isClub) {
    return <Navigate to={"/inicio"} state={{ from: location }} />;
  }
  return <Outlet />;
};
