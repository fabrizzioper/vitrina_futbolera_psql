import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../../Context/AuthContext';
import { fetchData } from '../../../Funciones/Funciones';
import UbigeoSelector from '../../../Componentes/Ubigeo/UbigeoSelector';

/**
 * Tab "Datos Ampliados" del perfil del club.
 * Cubre: nombre corto, nombre largo, status, ubigeo, fecha fundacion,
 * No.Partida SUNARP + PDF, vigencias, RUC, direccion, correo club.
 */
const ClubDatosAmpliados = ({ institucionId }) => {
    const { Request, Alerta } = useAuth();
    const [form, setForm] = useState({
        nombre_corto: '', nombre_largo: '', status_club: '',
        fb_distrito_id: '', fb_provincia_id: '', fb_departamento_id: '',
        fecha_fundacion: '', numero_partida_sunarp: '', archivo_partida_sunarp: '',
        fecha_inicio_vigencia: '', fecha_fin_vigencia: '',
        ruc: '', direccion: '', correo_club: '',
    });
    const [guardando, setGuardando] = useState(false);
    const [subiendoPdf, setSubiendoPdf] = useState(false);

    useEffect(() => {
        if (!institucionId) return;
        fetchData(Request, "club_perfil_completo_get", [
            { nombre: "vit_institucion_id", envio: institucionId }
        ]).then(rows => {
            const d = rows?.[0];
            if (d) {
                setForm({
                    nombre_corto: d.nombre_corto || '',
                    nombre_largo: d.nombre_largo || d.nombre || '',
                    status_club: d.status_club || '',
                    fb_distrito_id: d.fb_distrito_id || '',
                    fb_provincia_id: d.fb_provincia_id || '',
                    fb_departamento_id: d.fb_departamento_id || '',
                    fecha_fundacion: d.fecha_fundacion ? String(d.fecha_fundacion).slice(0, 10) : '',
                    numero_partida_sunarp: d.numero_partida_sunarp || '',
                    archivo_partida_sunarp: d.archivo_partida_sunarp || '',
                    fecha_inicio_vigencia: d.fecha_inicio_vigencia ? String(d.fecha_inicio_vigencia).slice(0, 10) : '',
                    fecha_fin_vigencia: d.fecha_fin_vigencia ? String(d.fecha_fin_vigencia).slice(0, 10) : '',
                    ruc: d.ruc || '',
                    direccion: d.direccion || '',
                    correo_club: d.correo_club || '',
                });
            }
        }).catch(() => {});
    }, [institucionId, Request]);

    const handleChange = (campo, valor) => setForm(prev => ({ ...prev, [campo]: valor }));

    const handleUbigeo = (u) => {
        setForm(prev => ({
            ...prev,
            fb_departamento_id: u.fb_departamento_id || '',
            fb_provincia_id: u.fb_provincia_id || '',
            fb_distrito_id: u.fb_distrito_id || '',
        }));
    };

    const handleUploadPdf = (e) => {
        const file = e.target.files?.[0];
        if (!file || !institucionId) return;
        setSubiendoPdf(true);
        const fd = new FormData();
        fd.append("vit_institucion_id", institucionId);
        fd.append("archivo", file);
        axios({
            method: "post",
            url: `${Request.Dominio}/club_upload_partida_sunarp`,
            headers: {
                "userLogin": Request.userLogin,
                "userPassword": Request.userPassword,
                "systemRoot": Request.Empresa
            },
            data: fd
        }).then(res => {
            if (res.data?.success) {
                setForm(prev => ({ ...prev, archivo_partida_sunarp: res.data.url || res.data.path }));
                Alerta('success', 'PDF de partida SUNARP subido correctamente');
            } else {
                Alerta('error', res.data?.message || 'Error al subir el PDF');
            }
        }).catch(() => Alerta('error', 'Error de red al subir el PDF'))
          .finally(() => setSubiendoPdf(false));
    };

    const handleGuardar = () => {
        if (!institucionId) return;
        setGuardando(true);
        fetchData(Request, "club_datos_basicos_upd", [
            { nombre: "vit_institucion_id", envio: institucionId },
            { nombre: "nombre_corto", envio: form.nombre_corto || '' },
            { nombre: "nombre_largo", envio: form.nombre_largo || '' },
            { nombre: "status_club", envio: form.status_club || '' },
            { nombre: "fb_distrito_id", envio: form.fb_distrito_id || 0 },
            { nombre: "fecha_fundacion", envio: form.fecha_fundacion || '' },
            { nombre: "numero_partida_sunarp", envio: form.numero_partida_sunarp || '' },
            { nombre: "archivo_partida_sunarp", envio: form.archivo_partida_sunarp || '' },
            { nombre: "fecha_inicio_vigencia", envio: form.fecha_inicio_vigencia || '' },
            { nombre: "fecha_fin_vigencia", envio: form.fecha_fin_vigencia || '' },
            { nombre: "ruc", envio: form.ruc || '' },
            { nombre: "direccion", envio: form.direccion || '' },
            { nombre: "correo_club", envio: form.correo_club || '' },
        ]).then(rows => {
            const ok = rows?.[0]?.exito;
            if (ok) Alerta('success', 'Datos actualizados');
            else Alerta('warning', 'Sin cambios');
        }).catch(() => Alerta('error', 'Error al guardar'))
          .finally(() => setGuardando(false));
    };

    if (!institucionId) return <div className="text-secondary">Complete los datos básicos primero</div>;

    return (
        <div style={{ maxWidth: 760 }}>
            <h5 className="mb-3">Datos ampliados</h5>

            <div className="row g-3">
                <div className="col-md-6">
                    <label className="form-label">Nombre corto</label>
                    <input className="form-control" maxLength={60} value={form.nombre_corto}
                           onChange={e => handleChange('nombre_corto', e.target.value)} />
                </div>
                <div className="col-md-6">
                    <label className="form-label">Nombre largo</label>
                    <input className="form-control" maxLength={200} value={form.nombre_largo}
                           onChange={e => handleChange('nombre_largo', e.target.value)} />
                </div>

                <div className="col-md-6">
                    <label className="form-label">Status</label>
                    <div>
                        <label className="me-3"><input type="radio" name="status" value="A"
                            checked={form.status_club === 'A'}
                            onChange={() => handleChange('status_club', 'A')} /> Aficionado</label>
                        <label><input type="radio" name="status" value="P"
                            checked={form.status_club === 'P'}
                            onChange={() => handleChange('status_club', 'P')} /> Profesional</label>
                    </div>
                </div>
                <div className="col-md-6">
                    <label className="form-label">Fecha de fundación</label>
                    <input type="date" className="form-control" value={form.fecha_fundacion}
                           onChange={e => handleChange('fecha_fundacion', e.target.value)} />
                </div>

                <div className="col-12">
                    <label className="form-label">Ubicación (Departamento / Provincia / Distrito)</label>
                    <UbigeoSelector
                        value={{
                            fb_departamento_id: form.fb_departamento_id,
                            fb_provincia_id: form.fb_provincia_id,
                            fb_distrito_id: form.fb_distrito_id,
                        }}
                        onChange={handleUbigeo}
                    />
                </div>

                <div className="col-12">
                    <label className="form-label">Dirección</label>
                    <input className="form-control" maxLength={300} value={form.direccion}
                           onChange={e => handleChange('direccion', e.target.value)} />
                </div>

                <div className="col-md-6">
                    <label className="form-label">RUC</label>
                    <input className="form-control" maxLength={20} value={form.ruc}
                           onChange={e => handleChange('ruc', e.target.value)} />
                </div>
                <div className="col-md-6">
                    <label className="form-label">Correo del club</label>
                    <input type="email" className="form-control" maxLength={150} value={form.correo_club}
                           onChange={e => handleChange('correo_club', e.target.value)} />
                </div>

                <div className="col-md-6">
                    <label className="form-label">N° Partida SUNARP</label>
                    <input className="form-control" maxLength={60} value={form.numero_partida_sunarp}
                           onChange={e => handleChange('numero_partida_sunarp', e.target.value)} />
                </div>
                <div className="col-md-6">
                    <label className="form-label">PDF de la partida</label>
                    <input type="file" accept="application/pdf" className="form-control"
                           disabled={subiendoPdf} onChange={handleUploadPdf} />
                    {form.archivo_partida_sunarp && (
                        <small className="text-secondary d-block mt-1">
                            Archivo: {form.archivo_partida_sunarp}
                        </small>
                    )}
                </div>

                <div className="col-md-6">
                    <label className="form-label">Inicio de vigencia</label>
                    <input type="date" className="form-control" value={form.fecha_inicio_vigencia}
                           onChange={e => handleChange('fecha_inicio_vigencia', e.target.value)} />
                </div>
                <div className="col-md-6">
                    <label className="form-label">Fin de vigencia</label>
                    <input type="date" className="form-control" value={form.fecha_fin_vigencia}
                           onChange={e => handleChange('fecha_fin_vigencia', e.target.value)} />
                </div>
            </div>

            <div className="d-flex justify-content-end mt-3">
                <button className="btn btn-primary" disabled={guardando} onClick={handleGuardar}>
                    {guardando ? 'Guardando...' : 'Guardar datos ampliados'}
                </button>
            </div>
        </div>
    );
};

export default ClubDatosAmpliados;
