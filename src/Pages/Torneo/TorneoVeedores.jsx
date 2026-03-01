import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../Context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import { obtenerTorneo, crearInvitacionTorneo, listarInvitacionesTorneo, cancelarInvitacionTorneo, listarVeedoresTorneo, eliminarVeedorTorneo } from '../../Funciones/TorneoService';
import Swal from 'sweetalert2';

const TorneoVeedores = () => {
    const { Request, currentUser, Alerta } = useAuth();
    const { id } = useParams();
    const navigate = useNavigate();

    const [torneo, setTorneo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tabActivo, setTabActivo] = useState('veedores');
    const [veedores, setVeedores] = useState([]);
    const [invitaciones, setInvitaciones] = useState([]);

    const cargarDatos = useCallback(async () => {
        setLoading(true);
        try {
            const resTorneo = await obtenerTorneo(Request, id);
            const data = resTorneo.data.data;
            if (data && data.length > 0) setTorneo(data[0]);

            const [resVeedores, resInvitaciones] = await Promise.all([
                listarVeedoresTorneo(Request, id),
                listarInvitacionesTorneo(Request, id)
            ]);
            setVeedores(resVeedores.data.data || []);
            setInvitaciones(resInvitaciones.data.data || []);
        } catch (err) {
            console.error('Error cargando datos:', err);
        }
        setLoading(false);
    }, [Request, id]);

    useEffect(() => {
        cargarDatos();
    }, [cargarDatos]);

    const handleInvitar = async () => {
        const { value: formValues } = await Swal.fire({
            title: 'Invitar Veedor',
            html:
                '<input id="swal-nombres" class="swal2-input" placeholder="Nombres *" style="font-size:14px">' +
                '<input id="swal-apellidos" class="swal2-input" placeholder="Apellidos" style="font-size:14px">' +
                '<input id="swal-email" class="swal2-input" placeholder="Email *" type="email" style="font-size:14px">' +
                '<input id="swal-telefono" class="swal2-input" placeholder="Teléfono" style="font-size:14px">',
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Enviar Invitación',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#8e44ad',
            preConfirm: () => {
                const nombres = document.getElementById('swal-nombres').value.trim();
                const email = document.getElementById('swal-email').value.trim();
                if (!nombres || !email) {
                    Swal.showValidationMessage('Nombres y Email son obligatorios');
                    return false;
                }
                return {
                    invitado_nombres: nombres,
                    invitado_apellidos: document.getElementById('swal-apellidos').value.trim(),
                    invitado_email: email,
                    invitado_telefono: document.getElementById('swal-telefono').value.trim()
                };
            }
        });

        if (formValues) {
            try {
                const res = await crearInvitacionTorneo(Request, {
                    vit_torneo_id: id,
                    invitado_por_jugador_id: currentUser.vit_jugador_id,
                    ...formValues
                });
                const resultado = res.data.data?.[0];
                if (resultado?.success === 1) {
                    const link = `${window.location.origin}/#/invitacion-torneo/${resultado.token}`;
                    await Swal.fire({
                        icon: 'success',
                        title: 'Invitación creada',
                        html: `<p>Comparte este enlace con <strong>${formValues.invitado_nombres}</strong>:</p>
                               <input type="text" value="${link}" class="swal2-input" style="font-size:12px" readonly onclick="this.select()">`,
                        confirmButtonColor: '#8e44ad'
                    });
                    cargarDatos();
                } else {
                    Alerta("error", resultado?.resultado || 'Error al crear invitación');
                }
            } catch {
                Alerta("error", "Error al enviar invitación");
            }
        }
    };

    const handleCancelarInvitacion = async (inv) => {
        const confirm = await Swal.fire({
            title: '¿Cancelar invitación?',
            text: `Se cancelará la invitación de ${inv.invitado_nombres}`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e74c3c',
            confirmButtonText: 'Sí, cancelar',
            cancelButtonText: 'No'
        });
        if (confirm.isConfirmed) {
            try {
                await cancelarInvitacionTorneo(Request, inv.vit_invitacion_torneo_id);
                Alerta("success", "Invitación cancelada");
                cargarDatos();
            } catch {
                Alerta("error", "Error al cancelar");
            }
        }
    };

    const handleEliminarVeedor = async (v) => {
        const confirm = await Swal.fire({
            title: '¿Eliminar veedor?',
            text: `Se desvinculará a ${v.jugador_nombres} ${v.jugador_apellidos || ''} y sus partidos asignados quedarán sin delegado.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e74c3c',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'No'
        });
        if (confirm.isConfirmed) {
            try {
                await eliminarVeedorTorneo(Request, v.vit_torneo_responsable_id);
                Alerta("success", "Veedor eliminado");
                cargarDatos();
            } catch {
                Alerta("error", "Error al eliminar");
            }
        }
    };

    const getEstadoColor = (estado, expirada) => {
        if (expirada) return { color: '#e67e22', bg: '#fef9e7' };
        switch (estado) {
            case 0: return { color: '#f39c12', bg: '#fef9e7' };
            case 1: return { color: '#27ae60', bg: '#eafaf1' };
            case 2: return { color: '#e67e22', bg: '#fef9e7' };
            case 3: return { color: '#e74c3c', bg: '#fdedec' };
            default: return { color: '#95a5a6', bg: '#f2f3f4' };
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '40px', color: '#7f8c8d' }}>Cargando...</div>;
    if (!torneo) return <div style={{ textAlign: 'center', padding: '40px', color: '#e74c3c' }}>Torneo no encontrado</div>;

    const tabStyle = (active) => ({
        padding: '10px 20px', cursor: 'pointer', fontWeight: '600', fontSize: '14px',
        border: 'none', borderBottom: active ? '3px solid #8e44ad' : '3px solid transparent',
        background: 'transparent', color: active ? '#8e44ad' : '#7f8c8d'
    });

    const cellStyle = { padding: '10px 8px', fontSize: '13px', borderBottom: '1px solid #f0f0f0' };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            <button onClick={() => navigate(`/torneo/${id}`)} style={{
                padding: '8px 16px', background: 'transparent', color: '#3498db',
                border: '1px solid #3498db', borderRadius: '4px', cursor: 'pointer', marginBottom: '20px'
            }}>
                Volver al Torneo
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                    <h2 style={{ color: '#2c3e50', margin: 0 }}>Gestionar Veedores</h2>
                    <p style={{ color: '#7f8c8d', margin: '4px 0 0 0' }}>{torneo.nombre}</p>
                </div>
                <button onClick={handleInvitar} style={{
                    padding: '10px 20px', background: '#8e44ad', color: '#fff',
                    border: 'none', borderRadius: '6px', cursor: 'pointer',
                    fontWeight: 'bold', fontSize: '14px'
                }}>
                    <i className="fa-solid fa-user-plus" style={{ marginRight: '6px' }}></i>
                    Invitar Veedor
                </button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #e0e0e0', marginBottom: '20px' }}>
                <button style={tabStyle(tabActivo === 'veedores')} onClick={() => setTabActivo('veedores')}>
                    Veedores Activos ({veedores.length})
                </button>
                <button style={tabStyle(tabActivo === 'invitaciones')} onClick={() => setTabActivo('invitaciones')}>
                    Invitaciones ({invitaciones.length})
                </button>
            </div>

            {/* Tab: Veedores Activos */}
            {tabActivo === 'veedores' && (
                <>
                    {veedores.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#7f8c8d' }}>
                            <i className="fa-solid fa-user-tie" style={{ fontSize: '2.5rem', marginBottom: '10px', display: 'block' }}></i>
                            <p>No hay veedores vinculados aún.</p>
                            <p style={{ fontSize: '13px' }}>Invita veedores para que operen la planilla de partidos.</p>
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: '#f8f9fa' }}>
                                        <th style={{ ...cellStyle, fontWeight: 'bold' }}>Nombre</th>
                                        <th style={{ ...cellStyle, fontWeight: 'bold' }}>Email</th>
                                        <th style={{ ...cellStyle, fontWeight: 'bold', textAlign: 'center' }}>Partidos</th>
                                        <th style={{ ...cellStyle, fontWeight: 'bold', textAlign: 'center' }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {veedores.map(v => (
                                        <tr key={v.vit_torneo_responsable_id}>
                                            <td style={cellStyle}>
                                                <strong style={{ color: '#2c3e50' }}>{v.jugador_nombres} {v.jugador_apellidos || ''}</strong>
                                            </td>
                                            <td style={{ ...cellStyle, color: '#7f8c8d' }}>{v.jugador_email}</td>
                                            <td style={{ ...cellStyle, textAlign: 'center' }}>
                                                <span style={{
                                                    background: '#8e44ad', color: '#fff', padding: '2px 10px',
                                                    borderRadius: '12px', fontSize: '12px', fontWeight: 'bold'
                                                }}>
                                                    {v.partidos_asignados}
                                                </span>
                                            </td>
                                            <td style={{ ...cellStyle, textAlign: 'center' }}>
                                                <button onClick={() => handleEliminarVeedor(v)} style={{
                                                    padding: '4px 12px', background: '#e74c3c', color: '#fff',
                                                    border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px'
                                                }}>
                                                    <i className="fa-solid fa-trash"></i> Eliminar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}

            {/* Tab: Invitaciones */}
            {tabActivo === 'invitaciones' && (
                <>
                    {invitaciones.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#7f8c8d' }}>
                            <p>No hay invitaciones enviadas.</p>
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: '#f8f9fa' }}>
                                        <th style={{ ...cellStyle, fontWeight: 'bold' }}>Nombre</th>
                                        <th style={{ ...cellStyle, fontWeight: 'bold' }}>Email</th>
                                        <th style={{ ...cellStyle, fontWeight: 'bold', textAlign: 'center' }}>Estado</th>
                                        <th style={{ ...cellStyle, fontWeight: 'bold', textAlign: 'center' }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invitaciones.map(inv => {
                                        const ec = getEstadoColor(inv.estado, inv.expirada);
                                        const estadoTexto = inv.expirada ? 'Expirada' : inv.estado_nombre;
                                        return (
                                            <tr key={inv.vit_invitacion_torneo_id}>
                                                <td style={cellStyle}>
                                                    <strong style={{ color: '#2c3e50' }}>{inv.invitado_nombres} {inv.invitado_apellidos || ''}</strong>
                                                </td>
                                                <td style={{ ...cellStyle, color: '#7f8c8d' }}>{inv.invitado_email}</td>
                                                <td style={{ ...cellStyle, textAlign: 'center' }}>
                                                    <span style={{
                                                        padding: '3px 10px', borderRadius: '12px', fontSize: '11px',
                                                        fontWeight: 'bold', color: ec.color, background: ec.bg
                                                    }}>
                                                        {estadoTexto}
                                                    </span>
                                                </td>
                                                <td style={{ ...cellStyle, textAlign: 'center' }}>
                                                    {inv.estado === 0 && !inv.expirada && (
                                                        <button onClick={() => handleCancelarInvitacion(inv)} style={{
                                                            padding: '4px 12px', background: '#e74c3c', color: '#fff',
                                                            border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px'
                                                        }}>
                                                            Cancelar
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default TorneoVeedores;
