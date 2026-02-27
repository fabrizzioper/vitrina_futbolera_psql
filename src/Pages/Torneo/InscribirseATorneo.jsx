import React, { useState, useEffect } from 'react';
import { useAuth } from '../../Context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import { obtenerTorneo, obtenerJugadoresDisponibles, crearInscripcion } from '../../Funciones/TorneoService';
import Swal from 'sweetalert2';

const InscribirseATorneo = () => {
    const { Request, currentUser, clubData } = useAuth();
    const { torneoId } = useParams();
    const navigate = useNavigate();

    const [torneo, setTorneo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [paso, setPaso] = useState(1);

    // Paso 1: categoria
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
    const [categorias, setCategorias] = useState([]);

    // Paso 2: jugadores
    const [jugadores, setJugadores] = useState([]);
    const [seleccionados, setSeleccionados] = useState([]);
    const [loadingJugadores, setLoadingJugadores] = useState(false);

    // Paso 3: contacto
    const [nombreContacto, setNombreContacto] = useState('');
    const [telefonoContacto, setTelefonoContacto] = useState('');
    const [enviando, setEnviando] = useState(false);

    useEffect(() => {
        cargarTorneo();
    }, [torneoId]);

    const cargarTorneo = async () => {
        setLoading(true);
        try {
            const res = await obtenerTorneo(Request, torneoId);
            const data = res.data.data;
            if (data && data.length > 0) {
                const t = data[0];
                setTorneo(t);
                if (t.categorias) {
                    const cats = t.categorias.split(',').map(c => c.trim()).filter(c => c);
                    setCategorias(cats);
                }
            }
        } catch (err) {
            console.error('Error cargando torneo:', err);
        }
        setLoading(false);
    };

    const cargarJugadores = async (categoria) => {
        if (!clubData?.vit_institucion_id) return;
        setLoadingJugadores(true);
        try {
            const res = await obtenerJugadoresDisponibles(Request, clubData.vit_institucion_id, torneoId, categoria);
            setJugadores(res.data.data || []);
        } catch (err) {
            console.error('Error cargando jugadores:', err);
            setJugadores([]);
        }
        setLoadingJugadores(false);
    };

    const handleSeleccionarCategoria = () => {
        if (!categoriaSeleccionada) {
            Swal.fire({ icon: 'warning', title: 'Selecciona una categoría', background: '#0e3769', color: '#fff' });
            return;
        }
        cargarJugadores(categoriaSeleccionada);
        setPaso(2);
    };

    const toggleJugador = (id) => {
        setSeleccionados(prev =>
            prev.includes(id) ? prev.filter(j => j !== id) : [...prev, id]
        );
    };

    const seleccionarTodos = () => {
        if (seleccionados.length === jugadores.length) {
            setSeleccionados([]);
        } else {
            setSeleccionados(jugadores.map(j => j.vit_jugador_id));
        }
    };

    const handleConfirmarJugadores = () => {
        if (seleccionados.length === 0) {
            Swal.fire({ icon: 'warning', title: 'Selecciona al menos un jugador', background: '#0e3769', color: '#fff' });
            return;
        }
        setPaso(3);
    };

    const handleEnviarInscripcion = async () => {
        if (!nombreContacto.trim()) {
            Swal.fire({ icon: 'warning', title: 'Ingresa el nombre de contacto', background: '#0e3769', color: '#fff' });
            return;
        }
        setEnviando(true);
        try {
            const res = await crearInscripcion(Request, {
                vit_torneo_id: torneoId,
                vit_institucion_id: clubData.vit_institucion_id,
                categoria: categoriaSeleccionada,
                jugador_ids: seleccionados.join(','),
                nombre_contacto: nombreContacto.trim(),
                telefono_contacto: telefonoContacto.trim()
            });
            const data = res.data.data?.[0];
            if (data?.resultado === 'OK') {
                await Swal.fire({
                    icon: 'success',
                    title: 'Inscripción enviada',
                    text: 'Tu Lista de Buena Fe fue enviada correctamente. El organizador la revisará pronto.',
                    background: '#0e3769',
                    color: '#fff',
                    confirmButtonColor: '#27ae60'
                });
                navigate('/club/inscripciones');
            } else {
                Swal.fire({ icon: 'error', title: 'Error', text: data?.mensaje || 'No se pudo enviar la inscripción', background: '#0e3769', color: '#fff' });
            }
        } catch (err) {
            console.error('Error enviando inscripción:', err);
            Swal.fire({ icon: 'error', title: 'Error', text: 'Ocurrió un error al enviar la inscripción', background: '#0e3769', color: '#fff' });
        }
        setEnviando(false);
    };

    const badgeEdad = (j) => {
        const cumple = j.cumple_edad === 1 || j.cumple_edad === '1';
        return (
            <span style={{
                padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold',
                background: cumple ? '#eafaf1' : '#fdedec',
                color: cumple ? '#27ae60' : '#e74c3c'
            }}>
                {j.edad_calculada} años {cumple ? '- Cumple' : '- No cumple'}
            </span>
        );
    };

    const formatFecha = (f) => {
        if (!f) return '-';
        return new Date(f).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '40px', color: '#7f8c8d' }}>Cargando torneo...</div>;
    if (!torneo) return <div style={{ textAlign: 'center', padding: '40px', color: '#e74c3c' }}>Torneo no encontrado</div>;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            <button onClick={() => navigate(-1)} style={{
                padding: '8px 16px', background: 'transparent', color: '#3498db',
                border: '1px solid #3498db', borderRadius: '4px', cursor: 'pointer', marginBottom: '20px'
            }}>
                Volver
            </button>

            <h2 style={{ color: '#2c3e50', marginBottom: '5px' }}>Inscribirse al Torneo</h2>
            <p style={{ color: '#7f8c8d', marginBottom: '20px' }}>{torneo.nombre}</p>

            {/* Stepper */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '25px' }}>
                {['Categoría', 'Jugadores', 'Confirmar'].map((label, i) => (
                    <div key={i} style={{
                        flex: 1, textAlign: 'center', padding: '10px', borderRadius: '6px',
                        background: paso === i + 1 ? '#3498db' : paso > i + 1 ? '#27ae60' : '#ecf0f1',
                        color: paso >= i + 1 ? '#fff' : '#7f8c8d', fontWeight: 'bold', fontSize: '13px'
                    }}>
                        {i + 1}. {label}
                    </div>
                ))}
            </div>

            {/* Paso 1: Selección de categoría */}
            {paso === 1 && (
                <div style={{ background: '#fff', padding: '25px', borderRadius: '10px', border: '1px solid #e0e0e0' }}>
                    <h4 style={{ color: '#2c3e50', marginTop: 0 }}>Selecciona la categoría</h4>
                    <p style={{ color: '#7f8c8d', fontSize: '14px' }}>
                        Inscripción abierta: {formatFecha(torneo.fecha_inicio_inscripcion)} - {formatFecha(torneo.fecha_fin_inscripcion)}
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                        {categorias.map(cat => (
                            <label key={cat} style={{
                                display: 'flex', alignItems: 'center', gap: '10px',
                                padding: '12px 16px', borderRadius: '8px', cursor: 'pointer',
                                border: categoriaSeleccionada === cat ? '2px solid #3498db' : '1px solid #e0e0e0',
                                background: categoriaSeleccionada === cat ? '#ebf5fb' : '#fff'
                            }}>
                                <input
                                    type="radio"
                                    name="categoria"
                                    value={cat}
                                    checked={categoriaSeleccionada === cat}
                                    onChange={(e) => setCategoriaSeleccionada(e.target.value)}
                                />
                                <span style={{ fontWeight: '600', color: '#2c3e50' }}>{cat}</span>
                            </label>
                        ))}
                    </div>
                    {categorias.length === 0 && (
                        <p style={{ color: '#e74c3c' }}>Este torneo no tiene categorías definidas.</p>
                    )}
                    <button onClick={handleSeleccionarCategoria} disabled={!categoriaSeleccionada} style={{
                        padding: '10px 24px', background: categoriaSeleccionada ? '#3498db' : '#bdc3c7',
                        color: '#fff', border: 'none', borderRadius: '6px', cursor: categoriaSeleccionada ? 'pointer' : 'not-allowed',
                        fontWeight: 'bold', fontSize: '14px'
                    }}>
                        Continuar
                    </button>
                </div>
            )}

            {/* Paso 2: Selección de jugadores */}
            {paso === 2 && (
                <div style={{ background: '#fff', padding: '25px', borderRadius: '10px', border: '1px solid #e0e0e0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <div>
                            <h4 style={{ color: '#2c3e50', margin: 0 }}>Selecciona los jugadores</h4>
                            <p style={{ color: '#7f8c8d', fontSize: '13px', margin: '4px 0 0' }}>
                                Categoría: <strong>{categoriaSeleccionada}</strong> — {seleccionados.length} seleccionados
                            </p>
                        </div>
                        <button onClick={seleccionarTodos} style={{
                            padding: '6px 12px', background: '#ecf0f1', border: '1px solid #bdc3c7',
                            borderRadius: '4px', cursor: 'pointer', fontSize: '12px'
                        }}>
                            {seleccionados.length === jugadores.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
                        </button>
                    </div>

                    {loadingJugadores ? (
                        <p style={{ textAlign: 'center', color: '#7f8c8d' }}>Cargando jugadores...</p>
                    ) : jugadores.length === 0 ? (
                        <p style={{ textAlign: 'center', color: '#e74c3c' }}>No hay jugadores disponibles para esta categoría.</p>
                    ) : (
                        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                                <thead>
                                    <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #e0e0e0' }}>
                                        <th style={{ padding: '8px', width: '40px' }}></th>
                                        <th style={{ padding: '8px', textAlign: 'left' }}>Jugador</th>
                                        <th style={{ padding: '8px', textAlign: 'center' }}>Posición</th>
                                        <th style={{ padding: '8px', textAlign: 'center' }}>Edad</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {jugadores.map(j => (
                                        <tr key={j.vit_jugador_id} style={{
                                            borderBottom: '1px solid #f0f0f0',
                                            background: seleccionados.includes(j.vit_jugador_id) ? '#ebf5fb' : 'transparent'
                                        }}>
                                            <td style={{ padding: '8px', textAlign: 'center' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={seleccionados.includes(j.vit_jugador_id)}
                                                    onChange={() => toggleJugador(j.vit_jugador_id)}
                                                />
                                            </td>
                                            <td style={{ padding: '8px' }}>
                                                <div style={{ fontWeight: '600' }}>{j.nombres} {j.apellidos}</div>
                                                <div style={{ fontSize: '11px', color: '#95a5a6' }}>{j.pais || ''}</div>
                                            </td>
                                            <td style={{ padding: '8px', textAlign: 'center', color: '#555' }}>{j.posicion || '-'}</td>
                                            <td style={{ padding: '8px', textAlign: 'center' }}>{badgeEdad(j)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                        <button onClick={() => setPaso(1)} style={{
                            padding: '10px 24px', background: 'transparent', color: '#3498db',
                            border: '1px solid #3498db', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'
                        }}>
                            Atrás
                        </button>
                        <button onClick={handleConfirmarJugadores} style={{
                            padding: '10px 24px', background: seleccionados.length > 0 ? '#3498db' : '#bdc3c7',
                            color: '#fff', border: 'none', borderRadius: '6px',
                            cursor: seleccionados.length > 0 ? 'pointer' : 'not-allowed', fontWeight: 'bold'
                        }}>
                            Continuar ({seleccionados.length} jugadores)
                        </button>
                    </div>
                </div>
            )}

            {/* Paso 3: Confirmación */}
            {paso === 3 && (
                <div style={{ background: '#fff', padding: '25px', borderRadius: '10px', border: '1px solid #e0e0e0' }}>
                    <h4 style={{ color: '#2c3e50', marginTop: 0 }}>Confirmar inscripción</h4>

                    <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                        <div style={{ marginBottom: '8px' }}><strong>Torneo:</strong> {torneo.nombre}</div>
                        <div style={{ marginBottom: '8px' }}><strong>Categoría:</strong> {categoriaSeleccionada}</div>
                        <div style={{ marginBottom: '8px' }}><strong>Jugadores:</strong> {seleccionados.length}</div>
                        <div><strong>Club:</strong> {clubData?.nombre_institucion || '-'}</div>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ fontWeight: '600', color: '#2c3e50', display: 'block', marginBottom: '5px' }}>
                            Nombre de contacto *
                        </label>
                        <input
                            type="text"
                            value={nombreContacto}
                            onChange={(e) => setNombreContacto(e.target.value)}
                            placeholder="Nombre del responsable"
                            style={{
                                width: '100%', padding: '10px', border: '1px solid #e0e0e0',
                                borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box'
                            }}
                        />
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ fontWeight: '600', color: '#2c3e50', display: 'block', marginBottom: '5px' }}>
                            Teléfono de contacto
                        </label>
                        <input
                            type="text"
                            value={telefonoContacto}
                            onChange={(e) => setTelefonoContacto(e.target.value)}
                            placeholder="Teléfono (opcional)"
                            style={{
                                width: '100%', padding: '10px', border: '1px solid #e0e0e0',
                                borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => setPaso(2)} style={{
                            padding: '10px 24px', background: 'transparent', color: '#3498db',
                            border: '1px solid #3498db', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'
                        }}>
                            Atrás
                        </button>
                        <button onClick={handleEnviarInscripcion} disabled={enviando} style={{
                            padding: '10px 24px', background: '#27ae60', color: '#fff',
                            border: 'none', borderRadius: '6px', cursor: enviando ? 'not-allowed' : 'pointer',
                            fontWeight: 'bold', fontSize: '14px'
                        }}>
                            {enviando ? 'Enviando...' : 'Enviar Inscripción'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InscribirseATorneo;
