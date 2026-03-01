import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../Context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import { obtenerTorneo, obtenerTablaPosiciones } from '../../Funciones/TorneoService';

const TablaPosiciones = () => {
    const { Request } = useAuth();
    const { id } = useParams();
    const navigate = useNavigate();

    const [torneo, setTorneo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [categorias, setCategorias] = useState([]);
    const [categoriaActiva, setCategoriaActiva] = useState('');
    const [posiciones, setPosiciones] = useState([]);
    const [loadingTabla, setLoadingTabla] = useState(false);

    const cargarPosiciones = useCallback(async (categoria) => {
        setLoadingTabla(true);
        try {
            const res = await obtenerTablaPosiciones(Request, id, categoria);
            setPosiciones(res.data.data || []);
        } catch (err) {
            console.error('Error cargando posiciones:', err);
            setPosiciones([]);
        }
        setLoadingTabla(false);
    }, [Request, id]);

    const cargarTorneo = useCallback(async () => {
        setLoading(true);
        try {
            const res = await obtenerTorneo(Request, id);
            const data = res.data.data;
            if (data && data.length > 0) {
                const t = data[0];
                setTorneo(t);
                if (t.categorias) {
                    const cats = t.categorias.split(',').map(c => c.trim()).filter(c => c);
                    setCategorias(cats);
                    if (cats.length > 0) {
                        setCategoriaActiva(cats[0]);
                        cargarPosiciones(cats[0]);
                    }
                }
            }
        } catch (err) {
            console.error('Error cargando torneo:', err);
        }
        setLoading(false);
    }, [Request, id, cargarPosiciones]);

    useEffect(() => {
        cargarTorneo();
    }, [cargarTorneo]);

    const handleCambiarCategoria = (cat) => {
        setCategoriaActiva(cat);
        cargarPosiciones(cat);
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '40px', color: '#7f8c8d' }}>Cargando...</div>;
    if (!torneo) return <div style={{ textAlign: 'center', padding: '40px', color: '#e74c3c' }}>Torneo no encontrado</div>;

    const cellStyle = { padding: '8px 6px', textAlign: 'center', fontSize: '13px', borderBottom: '1px solid #f0f0f0' };
    const headerCell = { ...cellStyle, fontWeight: 'bold', color: '#fff', background: '#2c3e50', fontSize: '12px' };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <button onClick={() => navigate(`/torneo/${id}`)} style={{
                    padding: '8px 16px', background: 'transparent', color: '#3498db',
                    border: '1px solid #3498db', borderRadius: '4px', cursor: 'pointer'
                }}>
                    Volver al Torneo
                </button>
                <button onClick={() => navigate(`/torneo/${id}/fixture`)} style={{
                    padding: '8px 16px', background: 'transparent', color: '#2c3e50',
                    border: '1px solid #2c3e50', borderRadius: '4px', cursor: 'pointer'
                }}>
                    Ver Fixture
                </button>
            </div>

            <h2 style={{ color: '#2c3e50', marginBottom: '5px' }}>Tabla de Posiciones</h2>
            <p style={{ color: '#7f8c8d', marginBottom: '20px' }}>{torneo.nombre}</p>

            {/* Tabs de categorías */}
            <div style={{ display: 'flex', gap: '4px', marginBottom: '15px', overflowX: 'auto' }}>
                {categorias.map(cat => (
                    <button key={cat} onClick={() => handleCambiarCategoria(cat)} style={{
                        padding: '8px 18px', borderRadius: '6px 6px 0 0', cursor: 'pointer',
                        fontWeight: '600', fontSize: '13px', border: 'none',
                        background: categoriaActiva === cat ? '#3498db' : '#ecf0f1',
                        color: categoriaActiva === cat ? '#fff' : '#555'
                    }}>
                        {cat}
                    </button>
                ))}
            </div>

            {loadingTabla && <p style={{ textAlign: 'center', color: '#7f8c8d' }}>Cargando tabla...</p>}

            {!loadingTabla && posiciones.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: '#7f8c8d' }}>
                    <p>No hay partidos jugados aún en esta categoría.</p>
                </div>
            )}

            {!loadingTabla && posiciones.length > 0 && (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
                        <thead>
                            <tr>
                                <th style={{ ...headerCell, width: '30px' }}>#</th>
                                <th style={{ ...headerCell, textAlign: 'left', minWidth: '150px' }}>Club</th>
                                <th style={headerCell}>PJ</th>
                                <th style={headerCell}>PG</th>
                                <th style={headerCell}>PE</th>
                                <th style={headerCell}>PP</th>
                                <th style={headerCell}>GF</th>
                                <th style={headerCell}>GC</th>
                                <th style={headerCell}>DIF</th>
                                <th style={{ ...headerCell, background: '#e67e22' }}>PTS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {posiciones.map((equipo, idx) => (
                                <tr key={equipo.vit_institucion_id} style={{
                                    background: idx < 1 ? '#eafaf1' : idx === posiciones.length - 1 ? '#fdedec' : '#fff'
                                }}>
                                    <td style={{ ...cellStyle, fontWeight: 'bold', color: '#2c3e50' }}>{equipo.posicion}</td>
                                    <td style={{ ...cellStyle, textAlign: 'left' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            {equipo.club_logo && (
                                                <img src={equipo.club_logo} alt="" style={{ width: 24, height: 24, borderRadius: '50%' }} />
                                            )}
                                            <span style={{ fontWeight: 'bold', color: '#2c3e50' }}>{equipo.club_nombre}</span>
                                        </div>
                                    </td>
                                    <td style={cellStyle}>{equipo.PJ}</td>
                                    <td style={{ ...cellStyle, color: '#27ae60' }}>{equipo.PG}</td>
                                    <td style={cellStyle}>{equipo.PE}</td>
                                    <td style={{ ...cellStyle, color: '#e74c3c' }}>{equipo.PP}</td>
                                    <td style={cellStyle}>{equipo.GF}</td>
                                    <td style={cellStyle}>{equipo.GC}</td>
                                    <td style={{ ...cellStyle, fontWeight: 'bold', color: equipo.DIF > 0 ? '#27ae60' : equipo.DIF < 0 ? '#e74c3c' : '#555' }}>
                                        {equipo.DIF > 0 ? '+' : ''}{equipo.DIF}
                                    </td>
                                    <td style={{ ...cellStyle, fontWeight: 'bold', fontSize: '16px', color: '#e67e22' }}>{equipo.PTS}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default TablaPosiciones;
