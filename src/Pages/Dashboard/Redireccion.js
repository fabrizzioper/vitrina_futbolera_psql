import "./dashboard.css";
import { Navigate } from "react-router-dom";

const Redireccion = () => {
    return (
        <Navigate to="/inicio" replace={true} />
    );
}

export default Redireccion;