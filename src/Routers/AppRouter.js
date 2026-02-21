import React from 'react';
import {
    Routes,
    Route,
    HashRouter,
} from "react-router-dom";
import QALogo from '../Componentes/QALogo';
import ChangePassword from '../Pages/ChangePassword/changePassword';
import CompletarPerfil from '../Pages/CompletarPerfil/completarPerfil';
import ForgotPassword from '../Pages/ForgotPassword/forgotPassword';
import Login from '../Pages/Login/login';
import Registro from '../Pages/Registro/registro';
import ValidacionCorreo from '../Pages/ValidacionCorreo/validacionCorreo';
import DashboardRouter from './DashboardRouter';
import PrivateRouter from './PrivateRouter';
import PublicRouter from './PublicRouter';
import { ValidacionCorrecta, ValidacionPerfil, ValidacionPerfilCorrecta } from './ValidacionRouter';
import { AuthProvider } from '../Context/AuthContext';
import { ThemeProvider } from '../Context/ThemeContext';

const AppRouter = () => {
    return (
        <HashRouter>
            <ThemeProvider>
            <AuthProvider>
                <QALogo />
                <Routes>
                    <Route element={<ValidacionPerfil />}>
                        <Route exact path="/*" element={<DashboardRouter />} />
                    </Route>
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
                    <Route element={<PublicRouter />}>
                        <Route path="reset-password" element={<ForgotPassword />} />
                    </Route>
                    <Route element={<PrivateRouter />}>
                        <Route path="change-password" element={<ChangePassword />} />
                    </Route>
                    <Route element={<ValidacionPerfilCorrecta />}>
                        <Route path="perfil" element={<CompletarPerfil />} />
                    </Route>
                </Routes>
            </AuthProvider>
            </ThemeProvider>
        </HashRouter>
    );
}

export default AppRouter;
