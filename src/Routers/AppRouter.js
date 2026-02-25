import React from 'react';
import {
    Routes,
    Route,
    HashRouter,
} from "react-router-dom";
import { GoogleOAuthProvider } from '@react-oauth/google';
import QALogo from '../Componentes/QALogo';
import ChangePassword from '../Pages/ChangePassword/changePassword';
import CompletarPerfil from '../Pages/CompletarPerfil/completarPerfil';
import CompletarPerfilClub from '../Pages/CompletarPerfil/completarPerfilClub';
import ForgotPassword from '../Pages/ForgotPassword/forgotPassword';
import Login from '../Pages/Login/login';
import Registro from '../Pages/Registro/registro';
import ValidacionCorreo from '../Pages/ValidacionCorreo/validacionCorreo';
import DashboardRouter from './DashboardRouter';
import RegistroInvitado from '../Pages/RegistroInvitado/RegistroInvitado';
import PrivateRouter from './PrivateRouter';
import PublicRouter from './PublicRouter';
import { ValidacionCorrecta, ValidacionPerfil, ValidacionPerfilCorrecta, ValidacionAutorizacionMenor } from './ValidacionRouter';
import AutorizacionPendiente from '../Pages/Dashboard/AutorizacionPendiente/autorizacionPendiente';
import { AuthProvider } from '../Context/AuthContext';
import { ThemeProvider } from '../Context/ThemeContext';

const AppRouter = () => {
    return (
        <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
        <HashRouter>
            <ThemeProvider>
            <AuthProvider>
                <QALogo />
                <Routes>
                    <Route element={<ValidacionPerfil />}>
                        <Route element={<ValidacionAutorizacionMenor />}>
                            <Route exact path="/*" element={<DashboardRouter />} />
                        </Route>
                    </Route>
                    <Route path="autorizacion-pendiente" element={<AutorizacionPendiente />} />
                    <Route element={<ValidacionCorrecta />}>
                        <Route path="validacion" element={<ValidacionCorreo />} />
                    </Route>
                    <Route element={<PublicRouter />}>
                        <Route path="login/:ambiente" element={<Login />} />
                    </Route>
                    <Route element={<PublicRouter />}>
                        <Route path="login" element={<Login />} />
                    </Route>
                    <Route element={<PublicRouter />}>
                        <Route path="registro/:ambiente" element={<Registro />} />
                    </Route>
                    <Route element={<PublicRouter />}>
                        <Route path="registro" element={<Registro />} />
                    </Route>
                    <Route path="reset-password" element={<ForgotPassword />} />
                    <Route element={<PublicRouter />}>
                        <Route path="invitacion/:token" element={<RegistroInvitado />} />
                    </Route>
                    <Route path="change-password" element={<ChangePassword />} />
                    <Route element={<ValidacionPerfilCorrecta />}>
                        <Route path="perfil" element={<CompletarPerfil />} />
                        <Route path="perfil-club" element={<CompletarPerfilClub />} />
                    </Route>
                </Routes>
            </AuthProvider>
            </ThemeProvider>
        </HashRouter>
        </GoogleOAuthProvider>
    );
}

export default AppRouter;
