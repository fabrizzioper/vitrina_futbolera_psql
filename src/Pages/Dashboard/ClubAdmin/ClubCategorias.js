import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../Context/AuthContext';
import { fetchData } from '../../../Funciones/Funciones';
import Swal from 'sweetalert2';

const ClubCategorias = ({ institucionId }) => {
    const { Request, Alerta } = useAuth();

    const [categorias, setCategorias] = useState([]);
    const [cargando, setCargando] = useState(true);

    // Form para agregar
    const [rama, setRama] = useState('masculino');
    const [anio, setAnio] = useState('');
    const [nombreCategoria, setNombreCategoria] = useState('');
    const [agregando, setAgregando] = useState(false);

    const cargarCategorias = () => {
        if (!institucionId) return;
        fetchData(Request, "club_categorias_list", [
            { nombre: "vit_institucion_id", envio: institucionId }
        ]).then(data => {
            setCategorias(data || []);
        }).catch(() => {}).finally(() => setCargando(false));
    };

    useEffect(() => {
        cargarCategorias();
    }, [institucionId]);

    const handleAgregar = () => {
        if (!rama) {
            Alerta('error', 'Seleccione una rama');
            return;
        }

        setAgregando(true);
        fetchData(Request, "club_categorias_add", [
            { nombre: "vit_institucion_id", envio: institucionId },
            { nombre: "rama", envio: rama },
            { nombre: "anio_nacimiento", envio: anio || 0 },
            { nombre: "nombre_categoria", envio: nombreCategoria }
        ]).then(data => {
            if (data && data[0] && data[0].resultado === 'Ya existe esta categoria') {
                Alerta('warning', 'Ya existe esta categoria');
            } else {
                Alerta('success', 'Categoria agregada');
                setAnio('');
                setNombreCategoria('');
                cargarCategorias();
            }
        }).catch(() => {
            Alerta('error', 'Error al agregar');
        }).finally(() => setAgregando(false));
    };

    const handleEliminar = (catId) => {
        Swal.fire({
            title: 'Eliminar categoria',
            text: 'Se eliminara esta categoria del club',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Eliminar',
            cancelButtonText: 'Cancelar',
            background: 'var(--bg-card)',
            color: 'var(--text-primary)'
        }).then((result) => {
            if (result.isConfirmed) {
                fetchData(Request, "club_categorias_del", [
                    { nombre: "vit_institucion_categoria_id", envio: catId }
                ]).then(() => {
                    Alerta('success', 'Categoria eliminada');
                    cargarCategorias();
                }).catch(() => {
                    Alerta('error', 'Error al eliminar');
                });
            }
        });
    };

    // Generar opciones de año (desde 2005 hasta actual)
    const currentYear = new Date().getFullYear();
    const anios = [];
    for (let y = currentYear; y >= 2005; y--) anios.push(y);

    // Agrupar por rama
    const masculino = categorias.filter(c => c.rama === 'masculino');
    const femenino = categorias.filter(c => c.rama === 'femenino');

    if (cargando) return <div className="text-center py-4"><i className="fa-solid fa-circle-notch fa-spin"></i> Cargando...</div>;

    return (
        <div>
            <h5 className="mb-3">Categorias</h5>

            {/* Formulario agregar */}
            <div className="card p-3 mb-4" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)' }}>
                <div className="row g-2 align-items-end">
                    <div className="col-auto">
                        <label className="form-label mb-1" style={{ fontSize: '0.8rem' }}>Rama</label>
                        <select className="form-select form-select-sm" value={rama} onChange={e => setRama(e.target.value)}>
                            <option value="masculino">Masculino</option>
                            <option value="femenino">Femenino</option>
                        </select>
                    </div>
                    <div className="col-auto">
                        <label className="form-label mb-1" style={{ fontSize: '0.8rem' }}>Año nacimiento</label>
                        <select className="form-select form-select-sm" value={anio} onChange={e => setAnio(e.target.value)}>
                            <option value="">Absoluta</option>
                            {anios.map(a => <option key={a} value={a}>{a}</option>)}
                        </select>
                    </div>
                    <div className="col">
                        <label className="form-label mb-1" style={{ fontSize: '0.8rem' }}>Nombre (opcional)</label>
                        <input
                            type="text"
                            className="form-control form-control-sm"
                            value={nombreCategoria}
                            onChange={e => setNombreCategoria(e.target.value)}
                            placeholder="Ej: Sub-17, Primera, Reserva"
                        />
                    </div>
                    <div className="col-auto">
                        <button className="btn btn-primary btn-sm" onClick={handleAgregar} disabled={agregando}>
                            {agregando ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <><i className="fa-solid fa-plus me-1"></i>Agregar</>}
                        </button>
                    </div>
                </div>
            </div>

            {categorias.length === 0 ? (
                <div className="text-center py-4 text-secondary">
                    <i className="fa-solid fa-layer-group" style={{ fontSize: '2rem' }}></i>
                    <p className="mt-2 mb-0">No hay categorias registradas</p>
                    <small>Agrega las ramas y años de nacimiento del club</small>
                </div>
            ) : (
                <div className="row g-4">
                    {/* Masculino */}
                    {masculino.length > 0 && (
                        <div className="col-md-6">
                            <h6><i className="fa-solid fa-mars me-1 text-info"></i> Masculino</h6>
                            <div className="list-group">
                                {masculino.map(c => (
                                    <div key={c.vit_institucion_categoria_id} className="list-group-item d-flex justify-content-between align-items-center" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
                                        <span>
                                            {c.nombre_categoria || (c.anio_nacimiento ? `Año ${c.anio_nacimiento}` : 'Absoluta')}
                                            {c.anio_nacimiento && !c.nombre_categoria && <small className="text-secondary ms-1">(Nac. {c.anio_nacimiento})</small>}
                                            {c.nombre_categoria && c.anio_nacimiento && <small className="text-secondary ms-1">(Nac. {c.anio_nacimiento})</small>}
                                        </span>
                                        <button className="btn btn-sm text-danger p-0" onClick={() => handleEliminar(c.vit_institucion_categoria_id)} title="Eliminar">
                                            <i className="fa-solid fa-trash-can"></i>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Femenino */}
                    {femenino.length > 0 && (
                        <div className="col-md-6">
                            <h6><i className="fa-solid fa-venus me-1 text-danger"></i> Femenino</h6>
                            <div className="list-group">
                                {femenino.map(c => (
                                    <div key={c.vit_institucion_categoria_id} className="list-group-item d-flex justify-content-between align-items-center" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
                                        <span>
                                            {c.nombre_categoria || (c.anio_nacimiento ? `Año ${c.anio_nacimiento}` : 'Absoluta')}
                                            {c.anio_nacimiento && !c.nombre_categoria && <small className="text-secondary ms-1">(Nac. {c.anio_nacimiento})</small>}
                                            {c.nombre_categoria && c.anio_nacimiento && <small className="text-secondary ms-1">(Nac. {c.anio_nacimiento})</small>}
                                        </span>
                                        <button className="btn btn-sm text-danger p-0" onClick={() => handleEliminar(c.vit_institucion_categoria_id)} title="Eliminar">
                                            <i className="fa-solid fa-trash-can"></i>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ClubCategorias;
