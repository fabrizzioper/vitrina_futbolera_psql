import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../../Context/AuthContext";

/**
 * Selector en cascada de Departamento / Provincia / Distrito.
 * Consume los endpoints ubigeo_departamentos_list / _provincias_list / _distritos_list.
 *
 * Props:
 *  - value:    { fb_departamento_id, fb_provincia_id, fb_distrito_id } | null
 *  - onChange: ({ fb_departamento_id, fb_provincia_id, fb_distrito_id, distrito }) => void
 *  - disabled: bool
 */
export default function UbigeoSelector({ value, onChange, disabled }) {
    const { Request } = useAuth();

    const [departamentos, setDepartamentos] = useState([]);
    const [provincias, setProvincias] = useState([]);
    const [distritos, setDistritos] = useState([]);

    const [depto, setDepto] = useState(value?.fb_departamento_id || "");
    const [prov, setProv]   = useState(value?.fb_provincia_id   || "");
    const [dist, setDist]   = useState(value?.fb_distrito_id    || "");

    const headers = {
        userLogin: Request.userLogin,
        userPassword: Request.userPassword,
        systemRoot: Request.Empresa,
    };

    // Carga inicial de departamentos.
    // Nota: enviamos `dato=0` como param dummy porque el parser del framework
    // crashea con SPs sin parametros (Index 1 out of bounds for length 1).
    useEffect(() => {
        const fd = new FormData();
        fd.append("dato", 0);
        axios({
            method: "post",
            url: `${Request.Dominio}/ubigeo_departamentos_list`,
            headers,
            data: fd,
        })
            .then(res => setDepartamentos(res.data?.data || []))
            .catch(() => setDepartamentos([]));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Carga provincias cuando cambia depto
    const fetchProvincias = useCallback((deptoId) => {
        if (!deptoId) { setProvincias([]); return; }
        const fd = new FormData();
        fd.append("fb_departamento_id", deptoId);
        axios({
            method: "post",
            url: `${Request.Dominio}/ubigeo_provincias_list`,
            headers,
            data: fd,
        })
            .then(res => setProvincias(res.data?.data || []))
            .catch(() => setProvincias([]));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Carga distritos cuando cambia provincia
    const fetchDistritos = useCallback((provId) => {
        if (!provId) { setDistritos([]); return; }
        const fd = new FormData();
        fd.append("fb_provincia_id", provId);
        axios({
            method: "post",
            url: `${Request.Dominio}/ubigeo_distritos_list`,
            headers,
            data: fd,
        })
            .then(res => setDistritos(res.data?.data || []))
            .catch(() => setDistritos([]));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Si llega un value inicial completo, cargamos provincias y distritos
    useEffect(() => {
        if (value?.fb_departamento_id) fetchProvincias(value.fb_departamento_id);
        if (value?.fb_provincia_id)    fetchDistritos(value.fb_provincia_id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value?.fb_departamento_id, value?.fb_provincia_id]);

    const handleDepto = (e) => {
        const v = e.target.value;
        setDepto(v); setProv(""); setDist("");
        setProvincias([]); setDistritos([]);
        if (v) fetchProvincias(v);
        if (onChange) onChange({ fb_departamento_id: v || null, fb_provincia_id: null, fb_distrito_id: null, distrito: null });
    };

    const handleProv = (e) => {
        const v = e.target.value;
        setProv(v); setDist("");
        setDistritos([]);
        if (v) fetchDistritos(v);
        if (onChange) onChange({ fb_departamento_id: depto || null, fb_provincia_id: v || null, fb_distrito_id: null, distrito: null });
    };

    const handleDist = (e) => {
        const v = e.target.value;
        setDist(v);
        const seleccionado = distritos.find(d => String(d.fb_distrito_id) === String(v));
        if (onChange) onChange({
            fb_departamento_id: depto || null,
            fb_provincia_id: prov || null,
            fb_distrito_id: v || null,
            distrito: seleccionado || null,
        });
    };

    const labelStyle = {
        display: 'block',
        color: '#fff',
        fontWeight: 600,
        fontSize: 13,
        marginBottom: 4,
    };
    const selectStyle = {
        width: '100%',
        padding: '0.5rem 0.75rem',
        borderRadius: 8,
        border: '1px solid rgba(255,255,255,0.15)',
        background: 'rgba(255,255,255,0.08)',
        color: '#fff',
        fontSize: 14,
    };

    return (
        <div className="ubigeo-selector" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
                <label style={labelStyle}>Departamento</label>
                <select value={depto} onChange={handleDepto} disabled={disabled} style={selectStyle}>
                    <option value="">Selecciona departamento...</option>
                    {departamentos.map(d => (
                        <option key={d.fb_departamento_id} value={d.fb_departamento_id}>{d.nombre}</option>
                    ))}
                </select>
            </div>
            <div>
                <label style={labelStyle}>Provincia</label>
                <select value={prov} onChange={handleProv} disabled={disabled || !depto} style={selectStyle}>
                    <option value="">Selecciona provincia...</option>
                    {provincias.map(p => (
                        <option key={p.fb_provincia_id} value={p.fb_provincia_id}>{p.nombre}</option>
                    ))}
                </select>
            </div>
            <div>
                <label style={labelStyle}>Distrito</label>
                <select value={dist} onChange={handleDist} disabled={disabled || !prov} style={selectStyle}>
                    <option value="">Selecciona distrito...</option>
                    {distritos.map(d => (
                        <option key={d.fb_distrito_id} value={d.fb_distrito_id}>{d.nombre}</option>
                    ))}
                </select>
            </div>
        </div>
    );
}
