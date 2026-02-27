import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../Context/AuthContext';
import { fetchData } from '../../../Funciones/Funciones';
import { DEFAULT_IMAGES } from '../../../Funciones/DefaultImages';
import ModalCrop from '../MiPerfil/Componentes/ModalCrop';
import ClubSedeDigital from './ClubSedeDigital';
import ClubFotos from './ClubFotos';
import ClubCategorias from './ClubCategorias';

const ClubPerfil = () => {
    const { Request, clubData, currentUser, Alerta, RandomNumberImg, fetchClubData } = useAuth();
    const tipoUsuario = Number(clubData?.tipo_usuario || 0);
    const [activeTab, setActiveTab] = useState('basicos');

    const [nombreClub, setNombreClub] = useState('');
    const [tipoInstitucion, setTipoInstitucion] = useState('');
    const [pais, setPais] = useState('');
    const [tiposInstitucion, setTiposInstitucion] = useState([]);
    const [paises, setPaises] = useState([]);
    const [guardando, setGuardando] = useState(false);

    // Logo upload states
    const [logoBase64, setLogoBase64] = useState(null);
    const [fileLogo, setFileLogo] = useState(null);
    const [formatoLogo, setFormatoLogo] = useState('');

    useEffect(() => {
        fetchData(Request, "tipo_institucion_list", [{ nombre: "dato", envio: 1 }])
            .then(data => setTiposInstitucion(data || []))
            .catch(() => {});

        fetchData(Request, "pais", [{ nombre: "dato", envio: 1 }])
            .then(data => setPaises(data || []))
            .catch(() => {});
    }, [Request]);

    useEffect(() => {
        if (clubData) {
            setNombreClub(clubData.nombre_institucion || '');
            setTipoInstitucion(String(clubData.vit_tipo_institucion_id || ''));
            setPais(String(clubData.fb_pais_id || ''));
        }
    }, [clubData]);

    // Guardar logo automáticamente cuando se recorta una imagen
    useEffect(() => {
        if (formatoLogo && clubData?.vit_institucion_id) {
            fetchData(Request, "club_perfil_upd", [
                { nombre: "vit_institucion_id", envio: clubData.vit_institucion_id },
                { nombre: "nombre", envio: clubData.nombre_institucion || '' },
                { nombre: "vit_tipo_institucion_id", envio: clubData.vit_tipo_institucion_id || 0 },
                { nombre: "fb_pais_id", envio: clubData.fb_pais_id || 0 },
                { nombre: "logo", envio: formatoLogo },
                { nombre: "vit_jugador_id", envio: 0 },
                { nombre: "nombres_responsable", envio: '' },
                { nombre: "apellidos_responsable", envio: '' }
            ]).then(() => {
                Alerta('success', 'Logo actualizado');
                setFormatoLogo('');
                if (currentUser?.vit_jugador_id) {
                    fetchClubData(currentUser.vit_jugador_id);
                }
            }).catch(() => {
                Alerta('error', 'Error al guardar el logo');
            });
        }
    }, [formatoLogo]);

    const handleGuardar = () => {
        if (!nombreClub.trim()) {
            Alerta('error', 'Ingrese el nombre del club');
            return;
        }

        setGuardando(true);

        fetchData(Request, "club_perfil_upd", [
            { nombre: "vit_institucion_id", envio: clubData?.vit_institucion_id || 0 },
            { nombre: "nombre", envio: nombreClub },
            { nombre: "vit_tipo_institucion_id", envio: tipoInstitucion },
            { nombre: "fb_pais_id", envio: pais },
            { nombre: "logo", envio: formatoLogo },
            { nombre: "vit_jugador_id", envio: 0 },
            { nombre: "nombres_responsable", envio: '' },
            { nombre: "apellidos_responsable", envio: '' }
        ]).then(() => {
            Alerta('success', 'Perfil actualizado correctamente');
            setFormatoLogo('');
            if (currentUser?.vit_jugador_id) {
                fetchClubData(currentUser.vit_jugador_id);
            }
        }).catch(() => {
            Alerta('error', 'Ocurrió un error al guardar');
        }).finally(() => {
            setGuardando(false);
        });
    };

    const logoSrc = fileLogo || (clubData?.logo ? clubData.logo + "?random=" + RandomNumberImg : DEFAULT_IMAGES.ESCUDO_CLUB);
    const institucionId = clubData?.vit_institucion_id;

    // Tipo 3 (Registrador/DT) no tiene acceso al perfil del club
    if (tipoUsuario === 3) {
        return (
            <div className='out-div-seccion' data-aos="zoom-in">
                <div className="text-center py-5">
                    <i className="fa-solid fa-lock" style={{ fontSize: '3rem', color: '#dc3545' }}></i>
                    <h3 className="mt-3">Acceso Restringido</h3>
                    <p className="text-secondary">No tienes permisos para editar el perfil del club.</p>
                </div>
            </div>
        );
    }

    const handleLogoClick = () => {
        const modalEl = document.getElementById('FLogo');
        if (modalEl && window.bootstrap) {
            const modal = window.bootstrap.Modal.getOrCreateInstance(modalEl);
            modal.show();
        }
    };

    const tabs = [
        { id: 'basicos', label: 'Datos Basicos', icon: 'fa-building' },
        // Sede Digital (RUC/datos legales) solo visible para Responsable (tipo 1)
        ...(tipoUsuario === 1 ? [{ id: 'sede', label: 'Sede Digital', icon: 'fa-id-card' }] : []),
        { id: 'fotos', label: 'Instalaciones', icon: 'fa-images' },
        { id: 'categorias', label: 'Categorias', icon: 'fa-layer-group' },
    ];

    return (
        <div className='out-div-seccion' data-aos="zoom-in">
            {/* Header */}
            <div className="d-flex align-items-center gap-3 mb-4">
                <div style={{ position: 'relative' }}>
                    <img
                        src={logoSrc}
                        alt={clubData?.nombre_institucion}
                        style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover' }}
                    />
                    <button
                        type="button"
                        className="btn btn-sm btn-primary"
                        style={{ position: 'absolute', bottom: -4, right: -4, borderRadius: '50%', width: 24, height: 24, padding: 0, fontSize: '0.65rem', lineHeight: 1 }}
                        onClick={handleLogoClick}
                        title="Cambiar logo"
                    >
                        <i className="fa-solid fa-camera"></i>
                    </button>
                </div>
                <div>
                    <h2 className="h4 fw-semibold mb-0">Perfil del Club</h2>
                    <small className="text-secondary">Gestiona la informacion de tu institucion</small>
                </div>
            </div>

            {/* Tabs */}
            <ul className="nav nav-tabs mb-3" style={{ borderColor: 'var(--border-color)' }}>
                {tabs.map(tab => (
                    <li className="nav-item" key={tab.id}>
                        <button
                            className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                                background: activeTab === tab.id ? 'var(--bg-card)' : 'transparent',
                                borderColor: activeTab === tab.id ? 'var(--border-color)' : 'transparent',
                                borderBottom: activeTab === tab.id ? '1px solid var(--bg-card)' : 'none'
                            }}
                        >
                            <i className={`fa-solid ${tab.icon} me-1`}></i>
                            <span className="d-none d-sm-inline">{tab.label}</span>
                        </button>
                    </li>
                ))}
            </ul>

            {/* Tab Content */}
            <div className="card p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                {activeTab === 'basicos' && (
                    <div style={{ maxWidth: '550px' }}>
                        <div className="mb-3">
                            <label className="form-label">Nombre del Club / Academia</label>
                            <input
                                type="text"
                                className="form-control"
                                value={nombreClub}
                                onChange={e => setNombreClub(e.target.value)}
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Tipo de Institucion</label>
                            <select className="form-select" value={tipoInstitucion} onChange={e => setTipoInstitucion(e.target.value)}>
                                <option value="">Seleccionar...</option>
                                {tiposInstitucion.map(ti => (
                                    <option key={ti.vit_tipo_institucion_id} value={ti.vit_tipo_institucion_id}>
                                        {ti.vit_tipo_institucion_nombre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Pais</label>
                            <select className="form-select" value={pais} onChange={e => setPais(e.target.value)}>
                                <option value="">Seleccionar...</option>
                                {paises.map(p => (
                                    <option key={p.pais_id} value={p.pais_id}>
                                        {p.pais_nombre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="d-flex justify-content-end mt-3">
                            <button
                                className="btn btn-primary"
                                onClick={handleGuardar}
                                disabled={guardando}
                            >
                                {guardando ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'sede' && institucionId && (
                    <ClubSedeDigital institucionId={institucionId} />
                )}

                {activeTab === 'fotos' && institucionId && (
                    <ClubFotos institucionId={institucionId} />
                )}

                {activeTab === 'categorias' && institucionId && (
                    <ClubCategorias institucionId={institucionId} />
                )}

                {!institucionId && activeTab !== 'basicos' && (
                    <div className="text-center py-4 text-secondary">
                        <p>Complete los datos basicos primero</p>
                    </div>
                )}
            </div>

            {/* Modal Subir Logo */}
            <ModalCrop
                NombreModal="FLogo"
                Base64={logoBase64}
                setBase64={setLogoBase64}
                setFile={setFileLogo}
                setFormato={setFormatoLogo}
                AspectRatio={1 / 1}
                id_jugador={clubData?.vit_institucion_id || 0}
            />
        </div>
    );
};

export default ClubPerfil;
