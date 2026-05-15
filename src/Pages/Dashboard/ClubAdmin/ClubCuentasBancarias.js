import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../../Context/AuthContext';
import { fetchData } from '../../../Funciones/Funciones';

const initForm = { nombre_banco: '', numero_cuenta: '', numero_cuenta_interbancaria: '', moneda: 'PEN' };

const ClubCuentasBancarias = ({ institucionId }) => {
    const { Request, Alerta } = useAuth();
    const [cuentas, setCuentas] = useState([]);
    const [editandoId, setEditandoId] = useState(null);
    const [form, setForm] = useState(initForm);
    const [guardando, setGuardando] = useState(false);

    const refrescar = useCallback(() => {
        console.log('[Cuentas] institucionId =', institucionId);
        if (!institucionId) {
            console.warn('[Cuentas] NO hay institucionId, no se puede listar');
            return;
        }
        fetchData(Request, "club_cuentas_bancarias_list", [
            { nombre: "vit_institucion_id", envio: institucionId }
        ]).then(rows => {
            console.log('[Cuentas] respuesta del backend:', rows);
            setCuentas(rows || []);
        }).catch(e => {
            console.error('[Cuentas] error:', e);
            setCuentas([]);
        });
    }, [Request, institucionId]);

    useEffect(() => { refrescar(); }, [refrescar]);

    const limpiar = () => { setEditandoId(null); setForm(initForm); };

    const handleGuardar = () => {
        if (!form.nombre_banco || !form.numero_cuenta) {
            Alerta('warning', 'Banco y número de cuenta son obligatorios');
            return;
        }
        setGuardando(true);
        const baseParams = [
            { nombre: "nombre_banco", envio: form.nombre_banco },
            { nombre: "numero_cuenta", envio: form.numero_cuenta },
            { nombre: "numero_cuenta_interbancaria", envio: form.numero_cuenta_interbancaria || '' },
            { nombre: "moneda", envio: form.moneda || '' },
        ];
        const endpoint = editandoId ? "club_cuenta_bancaria_upd" : "club_cuenta_bancaria_ins";
        const params = editandoId
            ? [{ nombre: "vit_institucion_cuenta_bancaria_id", envio: editandoId }, ...baseParams]
            : [{ nombre: "vit_institucion_id", envio: institucionId }, ...baseParams];

        fetchData(Request, endpoint, params)
            .then(() => { Alerta('success', editandoId ? 'Cuenta actualizada' : 'Cuenta agregada'); limpiar(); refrescar(); })
            .catch(() => Alerta('error', 'Error al guardar'))
            .finally(() => setGuardando(false));
    };

    const handleEditar = (c) => {
        setEditandoId(c.vit_institucion_cuenta_bancaria_id);
        setForm({
            nombre_banco: c.nombre_banco || '',
            numero_cuenta: c.numero_cuenta || '',
            numero_cuenta_interbancaria: c.numero_cuenta_interbancaria || '',
            moneda: c.moneda || 'PEN',
        });
    };

    const handleBorrar = (id) => {
        if (!window.confirm('¿Borrar esta cuenta?')) return;
        fetchData(Request, "club_cuenta_bancaria_del", [
            { nombre: "vit_institucion_cuenta_bancaria_id", envio: id }
        ]).then(() => { Alerta('success', 'Cuenta borrada'); refrescar(); })
          .catch(() => Alerta('error', 'Error al borrar'));
    };

    if (!institucionId) return <div className="text-secondary">Complete los datos básicos primero</div>;

    return (
        <div>
            <h5 className="mb-3">Cuentas bancarias</h5>

            <div className="row g-2 mb-3">
                <div className="col-md-4">
                    <input className="form-control" placeholder="Banco *"
                           value={form.nombre_banco}
                           onChange={e => setForm({ ...form, nombre_banco: e.target.value })} />
                </div>
                <div className="col-md-3">
                    <input className="form-control" placeholder="Número de cuenta *"
                           value={form.numero_cuenta}
                           onChange={e => setForm({ ...form, numero_cuenta: e.target.value })} />
                </div>
                <div className="col-md-3">
                    <input className="form-control" placeholder="Interbancaria (CCI)"
                           value={form.numero_cuenta_interbancaria}
                           onChange={e => setForm({ ...form, numero_cuenta_interbancaria: e.target.value })} />
                </div>
                <div className="col-md-2">
                    <select className="form-select" value={form.moneda}
                            onChange={e => setForm({ ...form, moneda: e.target.value })}>
                        <option value="PEN">PEN</option>
                        <option value="USD">USD</option>
                    </select>
                </div>
            </div>
            <div className="d-flex gap-2 mb-3">
                <button className="btn btn-primary" disabled={guardando} onClick={handleGuardar}>
                    {editandoId ? 'Actualizar' : '+ Agregar cuenta'}
                </button>
                {editandoId && (
                    <button className="btn btn-secondary" onClick={limpiar}>Cancelar</button>
                )}
            </div>

            <table className="table table-sm">
                <thead>
                    <tr>
                        <th>Banco</th><th>Número</th><th>Interbancaria</th><th>Moneda</th><th></th>
                    </tr>
                </thead>
                <tbody>
                    {cuentas.length === 0 && (
                        <tr><td colSpan={5} className="text-secondary text-center">Sin cuentas registradas</td></tr>
                    )}
                    {cuentas.map(c => (
                        <tr key={c.vit_institucion_cuenta_bancaria_id}>
                            <td>{c.nombre_banco}</td>
                            <td>{c.numero_cuenta}</td>
                            <td>{c.numero_cuenta_interbancaria || '-'}</td>
                            <td>{c.moneda || '-'}</td>
                            <td className="text-end">
                                <button className="btn btn-sm btn-link" onClick={() => handleEditar(c)}>Editar</button>
                                <button className="btn btn-sm btn-link text-danger" onClick={() => handleBorrar(c.vit_institucion_cuenta_bancaria_id)}>Borrar</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ClubCuentasBancarias;
