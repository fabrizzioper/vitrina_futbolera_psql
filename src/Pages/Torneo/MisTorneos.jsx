import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../Context/AuthContext';
import { listarMisTorneos, publicarTorneo } from '../../Funciones/TorneoService';
import { useNavigate } from 'react-router-dom';

const MisTorneos = () => {
    const { Request, currentUser } = useAuth();
    const navigate = useNavigate();
    const [torneos, setTorneos] = useState([]);
    const [loading, setLoading] = useState(true);

    const cargarTorneos = useCallback(async () => {
        setLoading(true);
        try {
            const userId = currentUser ? currentUser.SC_USER_ID : null;
            const res = await listarMisTorneos(Request, userId);
            setTorneos(res.data.data || []);
        } catch (err) {
            console.error('Error cargando torneos:', err);
        }
        setLoading(false);
    }, [Request, currentUser]);

    useEffect(() => {
        cargarTorneos();
    }, [cargarTorneos]);

    const handlePublicar = async (torneoId) => {
        if (!window.confirm('El torneo se publicará en el Marketplace. ¿Desea continuar?')) return;
        try {
            const res = await publicarTorneo(Request, torneoId);
            const data = res.data.data;
            if (data && data.length > 0 && data[0].success === 1) {
                alert(data[0].mensaje);
                cargarTorneos();
            } else {
                alert(data && data.length > 0 ? data[0].mensaje : 'Error al publicar');
            }
        } catch (err) {
            alert('Error al publicar: ' + (err.message || ''));
        }
    };

    const getEstadoLegalizacion = (flag) => {
        switch (flag) {
            case 0: return { texto: 'Pendiente', color: '#f39c12', bg: '#fef9e7' };
            case 1: return { texto: 'Legalizado', color: '#27ae60', bg: '#eafaf1' };
            case 2: return { texto: 'Rechazado', color: '#e74c3c', bg: '#fdedec' };
            default: return { texto: 'Desconocido', color: '#95a5a6', bg: '#f2f3f4' };
        }
    };

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ color: '#2c3e50', margin: 0 }}>Mis Torneos</h2>
                <button onClick={() => navigate('/torneo/crear')} style={{
                    padding: '10px 25px', background: '#3498db', color: '#fff',
                    border: 'none', borderRadius: '6px', fontSize: '14px', cursor: 'pointer'
                }}>
                    + Crear Torneo
                </button>
            </div>

            {loading && <p style={{ textAlign: 'center', color: '#7f8c8d' }}>Cargando torneos...</p>}

            {!loading && torneos.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: '#7f8c8d' }}>
                    <p style={{ fontSize: '18px' }}>No tienes torneos creados</p>
                    <p>Crea tu primer torneo para comenzar</p>
                </div>
            )}

            {torneos.map((torneo) => {
                const estado = getEstadoLegalizacion(torneo.flag_legalizado);
                return (
                    <div key={torneo.vit_torneo_id} style={{
                        border: '1px solid #e0e0e0', borderRadius: '10px', padding: '20px',
                        marginBottom: '15px', background: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ margin: '0 0 8px 0', color: '#2c3e50' }}>{torneo.nombre}</h3>
                                <p style={{ color: '#7f8c8d', margin: '0 0 8px 0' }}>{torneo.descripcion || 'Sin descripción'}</p>
                                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '13px', color: '#555' }}>
                                    {torneo.lugar && <span>Lugar: {torneo.lugar}</span>}
                                    {torneo.categorias && <span>Categorías: {torneo.categorias}</span>}
                                    {torneo.costo_inscripcion && <span>Costo: {torneo.moneda || 'PEN'} {torneo.costo_inscripcion}</span>}
                                    <span>Inscritos: {torneo.total_inscritos || 0}</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                                <span style={{
                                    padding: '4px 12px', borderRadius: '12px', fontSize: '12px',
                                    fontWeight: 'bold', color: estado.color, background: estado.bg
                                }}>
                                    {estado.texto}
                                </span>
                                {torneo.flag_publicado === 1 && (
                                    <span style={{
                                        padding: '4px 12px', borderRadius: '12px', fontSize: '12px',
                                        fontWeight: 'bold', color: '#27ae60', background: '#eafaf1'
                                    }}>
                                        Publicado
                                    </span>
                                )}
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '15px', borderTop: '1px solid #f0f0f0', paddingTop: '12px' }}>
                            <button onClick={() => navigate(`/torneo/${torneo.vit_torneo_id}`)} style={{
                                padding: '6px 16px', background: '#ecf0f1', color: '#2c3e50',
                                border: '1px solid #bdc3c7', borderRadius: '4px', cursor: 'pointer', fontSize: '13px'
                            }}>
                                Ver Detalle
                            </button>
                            {torneo.flag_legalizado === 1 && torneo.flag_publicado !== 1 && (
                                <button onClick={() => handlePublicar(torneo.vit_torneo_id)} style={{
                                    padding: '6px 16px', background: '#2ecc71', color: '#fff',
                                    border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px'
                                }}>
                                    Publicar en Marketplace
                                </button>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default MisTorneos;
