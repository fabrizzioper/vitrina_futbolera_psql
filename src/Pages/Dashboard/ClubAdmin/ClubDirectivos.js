import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../../Context/AuthContext';
import { fetchData } from '../../../Funciones/Funciones';

const CARGOS = ['PRESIDENTE', 'VICEPRESIDENTE', 'SECRETARIO', 'TESORERO', 'VOCAL', 'ADMINISTRATIVO'];
const initForm = {
    cargo_directivo: 'PRESIDENTE',
    nombres: '', apellidos: '', dni: '', correo: '', telefono: '',
    fecha_inicio_cargo: '', fecha_fin_cargo: '',
};

const ClubDirectivos = ({ institucionId }) => {
    const { Request, Alerta } = useAuth();
    const [lista, setLista] = useState([]);
    const [editandoId, setEditandoId] = useState(null);
    const [form, setForm] = useState(initForm);
    const [guardando, setGuardando] = useState(false);

    const refrescar = useCallback(() => {
        console.log('[Directivos] institucionId =', institucionId);
        if (!institucionId) {
            console.warn('[Directivos] NO hay institucionId');
            return;
        }
        fetchData(Request, "club_directivos_list", [
            { nombre: "vit_institucion_id", envio: institucionId }
        ]).then(rows => {
            console.log('[Directivos] respuesta:', rows);
            setLista(rows || []);
        }).catch(e => {
            console.error('[Directivos] error:', e);
            setLista([]);
        });
    }, [Request, institucionId]);

    useEffect(() => { refrescar(); }, [refrescar]);

    const limpiar = () => { setEditandoId(null); setForm(initForm); };

    const handleGuardar = () => {
        if (!form.nombres || !form.apellidos) {
            Alerta('warning', 'Nombres y apellidos son obligatorios');
            return;
        }
        setGuardando(true);
        const baseParams = [
            { nombre: "cargo_directivo", envio: form.cargo_directivo },
            { nombre: "nombres", envio: form.nombres },
            { nombre: "apellidos", envio: form.apellidos },
            { nombre: "dni", envio: form.dni || '' },
            { nombre: "correo", envio: form.correo || '' },
            { nombre: "telefono", envio: form.telefono || '' },
            { nombre: "fecha_inicio_cargo", envio: form.fecha_inicio_cargo || '' },
            { nombre: "fecha_fin_cargo", envio: form.fecha_fin_cargo || '' },
        ];
        const endpoint = editandoId ? "club_directivo_upd" : "club_directivo_ins";
        const params = editandoId
            ? [{ nombre: "vit_institucion_directivo_id", envio: editandoId }, ...baseParams]
            : [{ nombre: "vit_institucion_id", envio: institucionId }, ...baseParams];

        fetchData(Request, endpoint, params)
            .then(rows => {
                const ok = rows?.[0]?.exito;
                if (ok || ok === 1) {
                    Alerta('success', editandoId ? 'Directivo actualizado' : 'Directivo agregado');
                    limpiar();
                    refrescar();
                } else {
                    Alerta('error', rows?.[0]?.mensaje || 'No se pudo guardar');
                }
            })
            .catch(() => Alerta('error', 'Error al guardar'))
            .finally(() => setGuardando(false));
    };

    const handleEditar = (d) => {
        setEditandoId(d.vit_institucion_directivo_id);
        setForm({
            cargo_directivo: d.cargo_directivo || 'PRESIDENTE',
            nombres: d.nombres || '',
            apellidos: d.apellidos || '',
            dni: d.dni || '',
            correo: d.correo || '',
            telefono: d.telefono || '',
            fecha_inicio_cargo: d.fecha_inicio_cargo ? String(d.fecha_inicio_cargo).slice(0, 10) : '',
            fecha_fin_cargo: d.fecha_fin_cargo ? String(d.fecha_fin_cargo).slice(0, 10) : '',
        });
    };

    const handleBorrar = (id) => {
        if (!window.confirm('¿Borrar este directivo?')) return;
        fetchData(Request, "club_directivo_del", [
            { nombre: "vit_institucion_directivo_id", envio: id }
        ]).then(() => { Alerta('success', 'Directivo borrado'); refrescar(); })
          .catch(() => Alerta('error', 'Error al borrar'));
    };

    if (!institucionId) return <div className="text-secondary">Complete los datos básicos primero</div>;

    return (
        <div>
            <h5 className="mb-3">Junta directiva y administrativos</h5>

            <div className="row g-2 mb-3">
                <div className="col-md-3">
                    <label className="form-label">Cargo</label>
                    <select className="form-select" value={form.cargo_directivo}
                            onChange={e => setForm({ ...form, cargo_directivo: e.target.value })}>
                        {CARGOS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div className="col-md-3">
                    <label className="form-label">Nombres *</label>
                    <input className="form-control" value={form.nombres}
                           onChange={e => setForm({ ...form, nombres: e.target.value })} />
                </div>
                <div className="col-md-3">
                    <label className="form-label">Apellidos *</label>
                    <input className="form-control" value={form.apellidos}
                           onChange={e => setForm({ ...form, apellidos: e.target.value })} />
                </div>
                <div className="col-md-3">
                    <label className="form-label">DNI</label>
                    <input className="form-control" value={form.dni}
                           onChange={e => setForm({ ...form, dni: e.target.value })} />
                </div>

                <div className="col-md-4">
                    <label className="form-label">Correo</label>
                    <input type="email" className="form-control" value={form.correo}
                           onChange={e => setForm({ ...form, correo: e.target.value })} />
                </div>
                <div className="col-md-3">
                    <label className="form-label">Teléfono</label>
                    <input className="form-control" value={form.telefono}
                           onChange={e => setForm({ ...form, telefono: e.target.value })} />
                </div>
                <div className="col-md-2">
                    <label className="form-label">Desde</label>
                    <input type="date" className="form-control" value={form.fecha_inicio_cargo}
                           onChange={e => setForm({ ...form, fecha_inicio_cargo: e.target.value })} />
                </div>
                <div className="col-md-2">
                    <label className="form-label">Hasta</label>
                    <input type="date" className="form-control" value={form.fecha_fin_cargo}
                           onChange={e => setForm({ ...form, fecha_fin_cargo: e.target.value })} />
                </div>
            </div>

            <div className="d-flex gap-2 mb-4">
                <button className="btn btn-primary" disabled={guardando} onClick={handleGuardar}>
                    {editandoId ? 'Actualizar' : '+ Agregar directivo'}
                </button>
                {editandoId && <button className="btn btn-secondary" onClick={limpiar}>Cancelar</button>}
            </div>

            <table className="table table-sm">
                <thead>
                    <tr>
                        <th>Cargo</th><th>Nombre</th><th>DNI</th><th>Correo</th><th>Vigencia</th><th></th>
                    </tr>
                </thead>
                <tbody>
                    {lista.length === 0 && (
                        <tr><td colSpan={6} className="text-secondary text-center">Sin directivos registrados</td></tr>
                    )}
                    {lista.map(d => (
                        <tr key={d.vit_institucion_directivo_id}>
                            <td><strong>{d.cargo_directivo}</strong></td>
                            <td>{d.nombres} {d.apellidos}</td>
                            <td>{d.dni || '-'}</td>
                            <td>{d.correo || '-'}</td>
                            <td>
                                {d.fecha_inicio_cargo ? String(d.fecha_inicio_cargo).slice(0, 10) : '-'}
                                {' / '}
                                {d.fecha_fin_cargo ? String(d.fecha_fin_cargo).slice(0, 10) : '-'}
                            </td>
                            <td className="text-end">
                                <button className="btn btn-sm btn-link" onClick={() => handleEditar(d)}>Editar</button>
                                <button className="btn btn-sm btn-link text-danger" onClick={() => handleBorrar(d.vit_institucion_directivo_id)}>Borrar</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ClubDirectivos;
