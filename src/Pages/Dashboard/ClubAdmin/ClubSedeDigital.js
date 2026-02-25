import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../Context/AuthContext';
import { fetchData } from '../../../Funciones/Funciones';
import ModalCrop from '../MiPerfil/Componentes/ModalCrop';

const ClubSedeDigital = ({ institucionId }) => {
    const { Request, Alerta, RandomNumberImg } = useAuth();

    const [ruc, setRuc] = useState('');
    const [colores, setColores] = useState(['#000000', '#FFFFFF', '#FF0000']);
    const [historia, setHistoria] = useState('');
    const [guardando, setGuardando] = useState(false);
    const [cargando, setCargando] = useState(true);
    const [estadoAprobacion, setEstadoAprobacion] = useState(0);
    const [observacionAdmin, setObservacionAdmin] = useState('');

    // Vigencia de poderes upload
    const [vigenciaBase64, setVigenciaBase64] = useState(null);
    const [fileVigencia, setFileVigencia] = useState(null);
    const [formatoVigencia, setFormatoVigencia] = useState('');
    const [vigenciaUrl, setVigenciaUrl] = useState('');

    useEffect(() => {
        if (!institucionId) return;
        fetchData(Request, "club_sede_digital_get", [
            { nombre: "vit_institucion_id", envio: institucionId }
        ]).then(data => {
            if (data && data[0]) {
                const d = data[0];
                setRuc(d.ruc || '');
                setVigenciaUrl(d.vigencia_poderes || '');
                if (d.colores_institucionales) {
                    setColores(d.colores_institucionales.split(',').filter(c => c));
                }
                setHistoria(d.historia || '');
                setEstadoAprobacion(d.estado_aprobacion || 0);
                setObservacionAdmin(d.observacion_admin || '');
            }
        }).catch(() => {}).finally(() => setCargando(false));
    }, [institucionId, Request]);

    const handleColorChange = (index, value) => {
        const newColores = [...colores];
        newColores[index] = value;
        setColores(newColores);
    };

    const addColor = () => {
        if (colores.length < 5) setColores([...colores, '#000000']);
    };

    const removeColor = (index) => {
        if (colores.length > 1) setColores(colores.filter((_, i) => i !== index));
    };

    const handleGuardar = () => {
        setGuardando(true);
        fetchData(Request, "club_sede_digital_upd", [
            { nombre: "vit_institucion_id", envio: institucionId },
            { nombre: "ruc", envio: ruc },
            { nombre: "vigencia_poderes", envio: formatoVigencia },
            { nombre: "colores_institucionales", envio: colores.join(',') },
            { nombre: "historia", envio: historia }
        ]).then(() => {
            Alerta('success', 'Sede digital actualizada');
            setFormatoVigencia('');
        }).catch(() => {
            Alerta('error', 'Error al guardar');
        }).finally(() => setGuardando(false));
    };

    const badgeEstado = () => {
        if (estadoAprobacion === 1) return <span className="badge bg-success ms-2">Aprobado</span>;
        if (estadoAprobacion === 2) return <span className="badge bg-danger ms-2">Rechazado</span>;
        return <span className="badge bg-warning text-dark ms-2">Pendiente de revision</span>;
    };

    if (cargando) return <div className="text-center py-4"><i className="fa-solid fa-circle-notch fa-spin"></i> Cargando...</div>;

    return (
        <div>
            <div className="d-flex align-items-center mb-3">
                <h5 className="mb-0">Sede Digital</h5>
                {badgeEstado()}
            </div>

            {observacionAdmin && estadoAprobacion === 2 && (
                <div className="alert alert-warning py-2 mb-3" style={{ fontSize: '0.875rem' }}>
                    <i className="fa-solid fa-triangle-exclamation me-1"></i>
                    <strong>Observacion del admin:</strong> {observacionAdmin}
                </div>
            )}

            <div className="mb-3">
                <label className="form-label">RUC</label>
                <input
                    type="text"
                    className="form-control"
                    value={ruc}
                    onChange={e => setRuc(e.target.value)}
                    placeholder="Ej: 20123456789"
                    maxLength={20}
                />
            </div>

            <div className="mb-3">
                <label className="form-label">Vigencia de Poderes</label>
                <div className="vigencia-poderes-block">
                    <div className="vigencia-poderes-preview">
                        {(fileVigencia || vigenciaUrl) ? (
                            <img
                                src={fileVigencia || vigenciaUrl + "?random=" + RandomNumberImg}
                                alt="Vigencia de poderes"
                                className="vigencia-poderes-img"
                            />
                        ) : (
                            <div className="vigencia-poderes-placeholder">
                                <i className="fa-solid fa-file-pdf"></i>
                                <span>Sin documento</span>
                            </div>
                        )}
                    </div>
                    <div className="vigencia-poderes-actions">
                        <button
                            type="button"
                            className="btn vigencia-poderes-btn"
                            data-bs-toggle="modal"
                            data-bs-target="#FVigencia"
                        >
                            <i className="fa-solid fa-upload me-1"></i>
                            {vigenciaUrl || fileVigencia ? 'Cambiar' : 'Subir documento'}
                        </button>
                        <small className="vigencia-poderes-hint">PDF o imagen (PNG, JPG, WebP)</small>
                    </div>
                </div>
            </div>

            <div className="mb-3">
                <label className="form-label">Colores Institucionales</label>
                <div className="d-flex flex-wrap gap-2 align-items-center">
                    {colores.map((color, i) => (
                        <div key={i} className="d-flex align-items-center gap-1">
                            <input
                                type="color"
                                value={color}
                                onChange={e => handleColorChange(i, e.target.value)}
                                style={{ width: 40, height: 34, border: 'none', cursor: 'pointer' }}
                            />
                            {colores.length > 1 && (
                                <button type="button" className="btn btn-sm text-danger p-0" onClick={() => removeColor(i)} title="Quitar">
                                    <i className="fa-solid fa-times"></i>
                                </button>
                            )}
                        </div>
                    ))}
                    {colores.length < 5 && (
                        <button type="button" className="btn btn-outline-secondary btn-sm" onClick={addColor}>
                            <i className="fa-solid fa-plus"></i>
                        </button>
                    )}
                </div>
            </div>

            <div className="mb-3">
                <label className="form-label">Historia del Club</label>
                <textarea
                    className="form-control"
                    rows={5}
                    value={historia}
                    onChange={e => setHistoria(e.target.value)}
                    placeholder="Describe la historia, logros y trayectoria del club..."
                />
            </div>

            <div className="d-flex justify-content-end">
                <button className="btn btn-primary" onClick={handleGuardar} disabled={guardando}>
                    {guardando ? 'Guardando...' : 'Guardar Sede Digital'}
                </button>
            </div>

            <ModalCrop
                NombreModal="FVigencia"
                Base64={vigenciaBase64}
                setBase64={setVigenciaBase64}
                setFile={setFileVigencia}
                setFormato={setFormatoVigencia}
                AspectRatio={null}
                id_jugador={institucionId}
            />
        </div>
    );
};

export default ClubSedeDigital;
