import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../Context/AuthContext';
import { fetchData } from '../../../Funciones/Funciones';
import ModalCrop from '../MiPerfil/Componentes/ModalCrop';
import Swal from 'sweetalert2';

const ClubFotos = ({ institucionId }) => {
    const { Request, Alerta, RandomNumberImg } = useAuth();

    const [fotos, setFotos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [descripcion, setDescripcion] = useState('');

    // Upload states
    const [fotoBase64, setFotoBase64] = useState(null);
    const [fileFoto, setFileFoto] = useState(null);
    const [formatoFoto, setFormatoFoto] = useState('');

    const cargarFotos = () => {
        if (!institucionId) return;
        fetchData(Request, "club_fotos_list", [
            { nombre: "vit_institucion_id", envio: institucionId }
        ]).then(data => {
            setFotos(data || []);
        }).catch(() => {}).finally(() => setCargando(false));
    };

    useEffect(() => {
        cargarFotos();
    }, [institucionId]);

    // Cuando se selecciona una foto nueva, subirla directamente
    useEffect(() => {
        if (formatoFoto) {
            fetchData(Request, "club_fotos_add", [
                { nombre: "vit_institucion_id", envio: institucionId },
                { nombre: "foto", envio: formatoFoto },
                { nombre: "descripcion", envio: descripcion }
            ]).then(() => {
                Alerta('success', 'Foto agregada');
                setFormatoFoto('');
                setFileFoto(null);
                setDescripcion('');
                cargarFotos();
            }).catch(() => {
                Alerta('error', 'Error al subir foto');
            });
        }
    }, [formatoFoto]);

    const handleEliminar = (fotoId) => {
        Swal.fire({
            title: 'Eliminar foto',
            text: 'Esta accion no se puede deshacer',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Eliminar',
            cancelButtonText: 'Cancelar',
            background: 'var(--bg-card)',
            color: 'var(--text-primary)'
        }).then((result) => {
            if (result.isConfirmed) {
                fetchData(Request, "club_fotos_del", [
                    { nombre: "vit_institucion_foto_id", envio: fotoId }
                ]).then(() => {
                    Alerta('success', 'Foto eliminada');
                    cargarFotos();
                }).catch(() => {
                    Alerta('error', 'Error al eliminar');
                });
            }
        });
    };

    if (cargando) return <div className="text-center py-4"><i className="fa-solid fa-circle-notch fa-spin"></i> Cargando...</div>;

    return (
        <div>
            <div className="d-flex align-items-center justify-content-between mb-3">
                <h5 className="mb-0">Fotos de Instalaciones</h5>
                <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    data-bs-toggle="modal"
                    data-bs-target="#FFotoInst"
                >
                    <i className="fa-solid fa-plus me-1"></i> Agregar Foto
                </button>
            </div>

            {fotos.length === 0 ? (
                <div className="text-center py-4 text-secondary">
                    <i className="fa-solid fa-images" style={{ fontSize: '2rem' }}></i>
                    <p className="mt-2 mb-0">No hay fotos de instalaciones</p>
                    <small>Sube fotos de las canchas, gimnasio, oficinas, etc.</small>
                </div>
            ) : (
                <div className="row g-3">
                    {fotos.map(foto => (
                        <div key={foto.vit_institucion_foto_id} className="col-6 col-md-4">
                            <div style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                                <img
                                    src={foto.foto + "?random=" + RandomNumberImg}
                                    alt={foto.descripcion || 'Instalacion'}
                                    style={{ width: '100%', height: 160, objectFit: 'cover' }}
                                />
                                <button
                                    type="button"
                                    className="btn btn-sm btn-danger"
                                    style={{ position: 'absolute', top: 6, right: 6, borderRadius: '50%', width: 28, height: 28, padding: 0, fontSize: '0.7rem' }}
                                    onClick={() => handleEliminar(foto.vit_institucion_foto_id)}
                                    title="Eliminar"
                                >
                                    <i className="fa-solid fa-trash"></i>
                                </button>
                                {foto.descripcion && (
                                    <div style={{ padding: '6px 8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                        {foto.descripcion}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <ModalCrop
                NombreModal="FFotoInst"
                Base64={fotoBase64}
                setBase64={setFotoBase64}
                setFile={setFileFoto}
                setFormato={setFormatoFoto}
                AspectRatio={16 / 9}
                id_jugador={institucionId}
            />
        </div>
    );
};

export default ClubFotos;
