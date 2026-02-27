import React, { useState } from 'react';
import { useAuth } from '../../Context/AuthContext';
import { crearTorneo, uploadReglamento, uploadDocLegalizacion } from '../../Funciones/TorneoService';
import { useNavigate } from 'react-router-dom';

const CrearTorneo = () => {
    const { Request, currentUser } = useAuth();
    const navigate = useNavigate();
    const [paso, setPaso] = useState(1);
    const [loading, setLoading] = useState(false);
    const [torneoId, setTorneoId] = useState(null);
    const [mensaje, setMensaje] = useState('');

    const [form, setForm] = useState({
        nombre: '', descripcion: '', lugar: '',
        fecha_inicio_inscripcion: '', fecha_fin_inscripcion: '',
        fecha_inicio_torneo: '', fecha_fin_torneo: '',
        sedes: '', costo_inscripcion: '', moneda: 'PEN',
        max_equipos: '', categorias: '',
        entidad_organizadora: '', ruc_organizadora: '',
        responsable_legal: '', telefono_contacto: '', email_contacto: ''
    });

    const [archivos, setArchivos] = useState({
        reglamento: null, docLegalizacion: null, docPermiso: null
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setArchivos({ ...archivos, [e.target.name]: e.target.files[0] });
    };

    const handleCrear = async () => {
        if (!form.nombre) { setMensaje('El nombre del torneo es obligatorio'); return; }
        setLoading(true);
        setMensaje('');
        try {
            const data = { ...form };
            if (currentUser && currentUser.SC_USER_ID) data.sc_user_id = currentUser.SC_USER_ID;
            const res = await crearTorneo(Request, data);
            const resultado = res.data.data;
            if (resultado && resultado.length > 0) {
                const id = resultado[0].vit_torneo_id;
                setTorneoId(id);
                setPaso(3);
                setMensaje('Torneo creado exitosamente');
            }
        } catch (err) {
            setMensaje('Error al crear el torneo: ' + (err.message || ''));
        }
        setLoading(false);
    };

    const handleUploadArchivos = async () => {
        if (!torneoId) return;
        setLoading(true);
        setMensaje('');
        try {
            if (archivos.reglamento) {
                await uploadReglamento(Request, torneoId, archivos.reglamento);
            }
            if (archivos.docLegalizacion || archivos.docPermiso) {
                await uploadDocLegalizacion(Request, torneoId, archivos.docLegalizacion, archivos.docPermiso);
            }
            setMensaje('Archivos subidos exitosamente. El torneo queda pendiente de legalización.');
            setTimeout(() => navigate('/torneo/mis-torneos'), 2000);
        } catch (err) {
            setMensaje('Error al subir archivos: ' + (err.message || ''));
        }
        setLoading(false);
    };

    const inputStyle = {
        width: '100%', padding: '10px', border: '1px solid #ddd',
        borderRadius: '6px', fontSize: '14px', marginBottom: '12px'
    };

    const labelStyle = { fontWeight: 'bold', display: 'block', marginBottom: '4px', color: '#333' };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            <h2 style={{ color: '#2c3e50', borderBottom: '2px solid #3498db', paddingBottom: '10px' }}>
                Crear Nuevo Torneo
            </h2>

            {/* Indicador de pasos */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px', gap: '10px' }}>
                {['Datos Básicos', 'Legalización', 'Documentos'].map((label, i) => (
                    <div key={i} style={{
                        padding: '8px 20px', borderRadius: '20px',
                        background: paso === i + 1 ? '#3498db' : paso > i + 1 ? '#2ecc71' : '#ecf0f1',
                        color: paso >= i + 1 ? '#fff' : '#7f8c8d', fontWeight: 'bold', fontSize: '13px'
                    }}>
                        {i + 1}. {label}
                    </div>
                ))}
            </div>

            {mensaje && (
                <div style={{
                    padding: '12px', marginBottom: '15px', borderRadius: '6px',
                    background: mensaje.includes('Error') ? '#fee' : '#efe',
                    color: mensaje.includes('Error') ? '#c0392b' : '#27ae60',
                    border: `1px solid ${mensaje.includes('Error') ? '#e74c3c' : '#2ecc71'}`
                }}>
                    {mensaje}
                </div>
            )}

            {/* PASO 1: Datos básicos + Bases */}
            {paso === 1 && (
                <div>
                    <h3>Datos del Torneo</h3>
                    <label style={labelStyle}>Nombre del Torneo *</label>
                    <input name="nombre" value={form.nombre} onChange={handleChange} style={inputStyle} placeholder="Ej: Copa Verano 2026" />

                    <label style={labelStyle}>Descripción</label>
                    <textarea name="descripcion" value={form.descripcion} onChange={handleChange} style={{ ...inputStyle, height: '80px' }} placeholder="Breve descripción del torneo" />

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div>
                            <label style={labelStyle}>Lugar</label>
                            <input name="lugar" value={form.lugar} onChange={handleChange} style={inputStyle} placeholder="Ciudad o distrito" />
                        </div>
                        <div>
                            <label style={labelStyle}>Sedes / Canchas</label>
                            <input name="sedes" value={form.sedes} onChange={handleChange} style={inputStyle} placeholder="Ej: Cancha Municipal, Club Deportivo" />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div>
                            <label style={labelStyle}>Fecha Inicio Inscripción</label>
                            <input type="date" name="fecha_inicio_inscripcion" value={form.fecha_inicio_inscripcion} onChange={handleChange} style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>Fecha Fin Inscripción</label>
                            <input type="date" name="fecha_fin_inscripcion" value={form.fecha_fin_inscripcion} onChange={handleChange} style={inputStyle} />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div>
                            <label style={labelStyle}>Fecha Inicio Torneo</label>
                            <input type="date" name="fecha_inicio_torneo" value={form.fecha_inicio_torneo} onChange={handleChange} style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>Fecha Fin Torneo</label>
                            <input type="date" name="fecha_fin_torneo" value={form.fecha_fin_torneo} onChange={handleChange} style={inputStyle} />
                        </div>
                    </div>

                    <label style={labelStyle}>Categorías</label>
                    <input name="categorias" value={form.categorias} onChange={handleChange} style={inputStyle} placeholder="Ej: Sub-8, Sub-10, Sub-12, Libre" />

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                        <div>
                            <label style={labelStyle}>Costo Inscripción</label>
                            <input type="number" name="costo_inscripcion" value={form.costo_inscripcion} onChange={handleChange} style={inputStyle} placeholder="0.00" />
                        </div>
                        <div>
                            <label style={labelStyle}>Moneda</label>
                            <select name="moneda" value={form.moneda} onChange={handleChange} style={inputStyle}>
                                <option value="PEN">PEN (Soles)</option>
                                <option value="USD">USD (Dólares)</option>
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Máx. Equipos</label>
                            <input type="number" name="max_equipos" value={form.max_equipos} onChange={handleChange} style={inputStyle} placeholder="Ej: 16" />
                        </div>
                    </div>

                    <div style={{ textAlign: 'right', marginTop: '20px' }}>
                        <button onClick={() => setPaso(2)} style={{
                            padding: '12px 30px', background: '#3498db', color: '#fff',
                            border: 'none', borderRadius: '6px', fontSize: '15px', cursor: 'pointer'
                        }}>
                            Siguiente: Legalización
                        </button>
                    </div>
                </div>
            )}

            {/* PASO 2: Legalización */}
            {paso === 2 && (
                <div>
                    <h3>Datos de la Entidad Organizadora</h3>
                    <label style={labelStyle}>Entidad Organizadora *</label>
                    <input name="entidad_organizadora" value={form.entidad_organizadora} onChange={handleChange} style={inputStyle} placeholder="Nombre legal de la entidad" />

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div>
                            <label style={labelStyle}>RUC / NIT</label>
                            <input name="ruc_organizadora" value={form.ruc_organizadora} onChange={handleChange} style={inputStyle} placeholder="Número de RUC o NIT" />
                        </div>
                        <div>
                            <label style={labelStyle}>Responsable Legal</label>
                            <input name="responsable_legal" value={form.responsable_legal} onChange={handleChange} style={inputStyle} placeholder="Nombre completo" />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div>
                            <label style={labelStyle}>Teléfono de Contacto</label>
                            <input name="telefono_contacto" value={form.telefono_contacto} onChange={handleChange} style={inputStyle} placeholder="+51 999 999 999" />
                        </div>
                        <div>
                            <label style={labelStyle}>Email de Contacto</label>
                            <input type="email" name="email_contacto" value={form.email_contacto} onChange={handleChange} style={inputStyle} placeholder="contacto@organizacion.com" />
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                        <button onClick={() => setPaso(1)} style={{
                            padding: '12px 30px', background: '#95a5a6', color: '#fff',
                            border: 'none', borderRadius: '6px', fontSize: '15px', cursor: 'pointer'
                        }}>
                            Anterior
                        </button>
                        <button onClick={handleCrear} disabled={loading} style={{
                            padding: '12px 30px', background: loading ? '#bdc3c7' : '#2ecc71', color: '#fff',
                            border: 'none', borderRadius: '6px', fontSize: '15px', cursor: loading ? 'not-allowed' : 'pointer'
                        }}>
                            {loading ? 'Creando...' : 'Crear Torneo y Continuar'}
                        </button>
                    </div>
                </div>
            )}

            {/* PASO 3: Documentos */}
            {paso === 3 && (
                <div>
                    <h3>Subir Documentos</h3>
                    <p style={{ color: '#7f8c8d' }}>Suba los documentos requeridos para la legalización. Una vez enviados, el Admin de Vitrina los revisará.</p>

                    <label style={labelStyle}>Reglamento del Torneo (PDF)</label>
                    <input type="file" name="reglamento" accept=".pdf" onChange={handleFileChange} style={inputStyle} />

                    <label style={labelStyle}>Acta Constitutiva / Documento de Legalización (PDF)</label>
                    <input type="file" name="docLegalizacion" accept=".pdf" onChange={handleFileChange} style={inputStyle} />

                    <label style={labelStyle}>Permiso Municipal / Autorización (PDF)</label>
                    <input type="file" name="docPermiso" accept=".pdf" onChange={handleFileChange} style={inputStyle} />

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                        <button onClick={() => navigate('/torneo/mis-torneos')} style={{
                            padding: '12px 30px', background: '#95a5a6', color: '#fff',
                            border: 'none', borderRadius: '6px', fontSize: '15px', cursor: 'pointer'
                        }}>
                            Omitir por ahora
                        </button>
                        <button onClick={handleUploadArchivos} disabled={loading} style={{
                            padding: '12px 30px', background: loading ? '#bdc3c7' : '#3498db', color: '#fff',
                            border: 'none', borderRadius: '6px', fontSize: '15px', cursor: loading ? 'not-allowed' : 'pointer'
                        }}>
                            {loading ? 'Subiendo...' : 'Subir Documentos y Finalizar'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CrearTorneo;
