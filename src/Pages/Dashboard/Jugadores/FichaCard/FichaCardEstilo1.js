import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

const ORANGE = '#ef8700';
const BG_PLOMO = 'linear-gradient(160deg, #5a5a5a 0%, #4a4a4a 40%, #3d3d3d 100%)';
const TEXT_WHITE = '#ffffff';

const FONDO_FICHA_URL = (typeof process !== 'undefined' && process.env && process.env.PUBLIC_URL ? process.env.PUBLIC_URL : '') + '/fondo1.png';

const PROFILE_PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Ccircle fill='%23404a4a' cx='50' cy='50' r='50'/%3E%3Ccircle fill='%23666' cx='50' cy='38' r='14'/%3E%3Cellipse fill='%23666' cx='50' cy='82' rx='28' ry='24'/%3E%3C/svg%3E";

const ESCUDO_PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 48' fill='%23666'%3E%3Cpath d='M20 2 L38 10 L38 28 C38 38 20 46 20 46 C20 46 2 38 2 28 L2 10Z' stroke='%23888' stroke-width='1' fill='%23333'/%3E%3C/svg%3E";

const formatFechaDDMMYYYY = (fecha) => {
    if (!fecha) return '-';
    const d = new Date(fecha);
    return d.toLocaleDateString('es', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const SemiCircleGauge = ({ value, max = 5, label, size = 96 }) => {
    const pct = Math.round((value / max) * 100);
    const r = (size - 12) / 2;
    const cx = size / 2;
    const cy = size / 2 + 8;
    const circumference = Math.PI * r;
    const offset = circumference - (pct / 100) * circumference;
    return (
        <div style={{ textAlign: 'center', width: size }}>
            <div style={{ fontSize: 10, color: '#fff', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {label}: {pct}%
            </div>
            <svg width={size} height={size / 2 + 16} viewBox={`0 0 ${size} ${size / 2 + 16}`}>
                <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
                    fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth={7} />
                <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
                    fill="none" stroke={ORANGE} strokeWidth={7}
                    strokeDasharray={circumference} strokeDashoffset={offset}
                    strokeLinecap="round" />
                <text x={cx} y={cy - 4} textAnchor="middle" fill="#fff" fontSize={19} fontWeight="bold">{pct}%</text>
            </svg>
        </div>
    );
};

const obtenerCategoria = (fechaNac) => {
    if (!fechaNac) return '';
    const nac = new Date(fechaNac);
    const hoy = new Date();
    let edad = hoy.getFullYear() - nac.getFullYear();
    const dm = hoy.getMonth() - nac.getMonth();
    if (dm < 0 || (dm === 0 && hoy.getDate() < nac.getDate())) edad--;
    if (edad < 15) return 'Sub-15';
    if (edad < 17) return 'Sub-17';
    if (edad < 18) return 'Sub-18';
    if (edad < 20) return 'Sub-20';
    if (edad < 21) return 'Sub-21';
    if (edad < 23) return 'Sub-23';
    return 'Senior';
};

const formatFechaComentario = (fecha) => {
    if (!fecha) return '';
    const d = new Date(fecha);
    return d.toLocaleDateString('es', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' + d.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
};

const FichaCardEstilo1 = React.forwardRef(({ jugador, caracteristicas, instituciones, logros, randomImg, imagenesBase64, imagenFondoUrl, comentarios }, ref) => {
    const jugadorId = jugador.vit_jugador_id || '0000000';
    const fichaUrl = `${window.location.origin}/#/ficha/${jugadorId}`;
    const urlFondo = imagenFondoUrl || FONDO_FICHA_URL;
    const cat = obtenerCategoria(jugador.jugador_fecha_nacimiento);
    const estatura = jugador.jugador_estatura_cm ? (jugador.jugador_estatura_cm / 100).toFixed(2) + ' m' : '-';
    const fotoPerfil = (imagenesBase64 && imagenesBase64.fotoPerfil)
        || (jugador.foto_perfil ? jugador.foto_perfil + '?random=' + (randomImg || 1) : null)
        || PROFILE_PLACEHOLDER;
    const topSkills = (caracteristicas || []).slice(0, 3);
    const bottomSkills = (caracteristicas || []).slice(3, 6);
    const tieneInstituciones = instituciones && instituciones.length > 0;
    const tieneLogros = logros && logros.length > 0;

    return (
        <div ref={ref} className="fc-estilo1" style={{
            width: 794, height: 1123, position: 'relative', overflow: 'hidden',
            background: BG_PLOMO,
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", color: TEXT_WHITE,
            boxSizing: 'border-box'
        }}>
            {/* Imagen de fondo */}
            <div style={{
                position: 'absolute', inset: 0, zIndex: 0,
                backgroundImage: urlFondo ? `url(${urlFondo})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }} />
            <div style={{
                position: 'absolute', inset: 0, zIndex: 1,
                background: 'rgba(0,0,0,0.2)',
            }} />
            <div style={{
                position: 'absolute', inset: 0, opacity: 0.06, zIndex: 2,
                backgroundImage: `
                    linear-gradient(45deg, rgba(255,255,255,0.04) 25%, transparent 25%),
                    linear-gradient(-45deg, rgba(255,255,255,0.04) 25%, transparent 25%),
                    linear-gradient(45deg, transparent 75%, rgba(255,255,255,0.04) 75%),
                    linear-gradient(-45deg, transparent 75%, rgba(255,255,255,0.04) 75%)
                `,
                backgroundSize: '60px 60px',
                backgroundPosition: '0 0, 0 30px, 30px -30px, -30px 0px',
            }} />

            {/* Bordes naranjas */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: ORANGE, zIndex: 10 }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, background: ORANGE, zIndex: 10 }} />
            <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: `linear-gradient(to bottom, ${ORANGE}, transparent 50%)`, zIndex: 10 }} />
            <div style={{ position: 'absolute', top: 0, right: 0, width: 4, height: '100%', background: `linear-gradient(to bottom, ${ORANGE}, transparent 50%)`, zIndex: 10 }} />

            {/* Nombre y detalles del jugador en la cabecera */}
            <div style={{
                position: 'absolute', top: 0, left: 40, right: 120,
                padding: '32px 0 28px 0', zIndex: 5
            }}>
                <h1 style={{
                    fontSize: 46, fontWeight: 900, margin: 0, lineHeight: 1.1,
                    textTransform: 'uppercase', letterSpacing: 2, fontStyle: 'italic',
                    color: ORANGE,
                    textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                }}>
                    {jugador.jugador_nombres || ''}<br />{jugador.jugador_apellidos || ''}
                </h1>
                <div style={{ display: 'flex', gap: 10, marginTop: 18, alignItems: 'center', flexWrap: 'wrap' }}>
                    {cat && <span style={{ color: TEXT_WHITE, fontSize: 17, fontWeight: 600 }}>{cat}</span>}
                    {cat && <span style={{ color: 'rgba(255,255,255,0.6)' }}>|</span>}
                    <span style={{ color: TEXT_WHITE, fontSize: 17 }}>{jugador.posicion || ''} {jugador.subposicion || ''}</span>
                    <span style={{ color: 'rgba(255,255,255,0.6)' }}>|</span>
                    <span style={{ color: TEXT_WHITE, fontSize: 17 }}>{estatura}</span>
                </div>
                <div style={{ color: TEXT_WHITE, fontSize: 14, marginTop: 12, letterSpacing: 1 }}>
                    ID: {String(jugadorId).padStart(7, '0')}
                </div>
            </div>

            {/* Foto de perfil en la esquina superior derecha */}
            <div style={{
                position: 'absolute', top: 55, right: 35, zIndex: 10,
                width: 130, height: 130, borderRadius: '50%', overflow: 'hidden',
                border: `4px solid ${ORANGE}`, background: '#404040',
                boxShadow: '0 0 20px rgba(239,135,0,0.3)'
            }}>
                <img src={fotoPerfil} alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.target.src = PROFILE_PLACEHOLDER; }}
                />
            </div>

            {/* Columna izquierda: solo Datos biométricos, Perfil técnico, Resumen de perfil */}
            <div style={{
                position: 'absolute', top: 285, left: 40, width: '44%', maxWidth: 340, bottom: 20,
                display: 'flex', flexDirection: 'column', gap: 14, zIndex: 5
            }}>
                {/* DATOS BIOMÉTRICOS */}
                <div style={{ padding: '10px 0' }}>
                    <h3 style={{ fontSize: 18, color: ORANGE, fontWeight: 800, margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: 1.5 }}>
                        Datos Biom&eacute;tricos
                    </h3>
                    <div style={{ fontSize: 14, lineHeight: 2, color: TEXT_WHITE }}>
                        {[
                            { label: 'Nacimiento', value: formatFechaDDMMYYYY(jugador.jugador_fecha_nacimiento) },
                            { label: 'Nacionalidad', value: [jugador.pais, jugador.pais2].filter(Boolean).join('/') || '-' },
                            { label: 'Talla', value: estatura },
                            { label: 'Peso', value: jugador.jugador_peso_kg ? jugador.jugador_peso_kg + ' kg' : '-' },
                            { label: 'Pie Dominante', value: jugador.perfil === 'Derecho' ? 'Diestro' : jugador.perfil === 'Izquierdo' ? 'Zurdo' : jugador.perfil || '-' },
                        ].map((item, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ color: ORANGE, fontSize: 11 }}>&#9679;</span>
                                <span style={{ color: TEXT_WHITE }}>{item.label}: {item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Línea divisoria naranja */}
                <div style={{ height: 2, background: ORANGE, width: '100%' }} />

                {/* PERFIL TÉCNICO */}
                {caracteristicas && caracteristicas.length > 0 && (
                    <div style={{ padding: '10px 0' }}>
                        <h3 style={{ fontSize: 18, color: ORANGE, fontWeight: 800, margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: 1.5 }}>
                            Perfil T&eacute;cnico
                        </h3>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
                            {topSkills.map((c, i) => (
                                <SemiCircleGauge key={i} value={c.puntaje} label={c.nombre} size={96} />
                            ))}
                        </div>
                        {bottomSkills.length > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
                                {bottomSkills.map((c, i) => (
                                    <SemiCircleGauge key={i + 3} value={c.puntaje} label={c.nombre} size={96} />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Línea divisoria naranja */}
                <div style={{ height: 2, background: ORANGE, width: '100%' }} />

                {/* RESUMEN DE PERFIL */}
                <div style={{ padding: '10px 0', flex: 1, minHeight: 60 }}>
                    <h3 style={{ fontSize: 18, color: ORANGE, fontWeight: 800, margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: 1.5 }}>
                        Resumen de Perfil
                    </h3>
                    <p style={{ fontSize: 13, lineHeight: 1.8, color: TEXT_WHITE, margin: 0 }}>
                        Jugador de {jugador.posicion || 'campo'}{jugador.subposicion ? ` (${jugador.subposicion})` : ''} de nacionalidad {jugador.pais || '-'}.
                        {jugador.jugador_estatura_cm ? ` Mide ${estatura}` : ''}
                        {jugador.jugador_peso_kg ? ` y pesa ${jugador.jugador_peso_kg} kg.` : '.'}
                        {jugador.perfil ? ` Pie dominante: ${jugador.perfil === 'Derecho' ? 'diestro' : jugador.perfil === 'Izquierdo' ? 'zurdo' : jugador.perfil}.` : ''}
                        {tieneInstituciones ? ` Cuenta con experiencia en ${instituciones.length} instituci${instituciones.length === 1 ? '\u00f3n' : 'ones'}.` : ''}
                        {tieneLogros ? ` Ha obtenido ${logros.length} logro${logros.length === 1 ? '' : 's'} en su carrera.` : ''}
                        {jugador.jugador_grupo_sanguineo ? ` Grupo sangu\u00edneo: ${jugador.jugador_grupo_sanguineo}.` : ''}
                    </p>
                </div>
            </div>

            {/* Línea vertical separadora: centrada en el espacio entre ambas columnas */}
            <div style={{
                position: 'absolute', top: 400, bottom: 20, left: '49.5%', width: 2, marginLeft: -1,
                background: `linear-gradient(to bottom, ${ORANGE}, rgba(239,135,0,0.4))`,
                zIndex: 5
            }} />

            {/* Columna derecha: Trayectoria Profesional y Comentarios (más a la derecha y empieza más abajo) */}
            <div style={{
                position: 'absolute', top: 400, left: '50%', right: 50, bottom: 20,
                paddingLeft: 24,
                display: 'flex', flexDirection: 'column', gap: 14, zIndex: 5
            }}>
                {/* TRAYECTORIA PROFESIONAL */}
                <div style={{ padding: '10px 0' }}>
                    <h3 style={{ fontSize: 18, color: ORANGE, fontWeight: 800, margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: 1.5 }}>
                        Trayectoria Profesional
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, position: 'relative' }}>
                        {tieneInstituciones && instituciones.length > 1 && (
                            <div style={{
                                position: 'absolute', left: 5, top: 10, bottom: 10, width: 2,
                                background: `linear-gradient(to bottom, ${ORANGE}, rgba(255,255,255,0.2))`
                            }} />
                        )}
                        {(instituciones || []).slice(0, 6).map((inst, i) => {
                            const anioInicio = inst.fecha_inicio ? new Date(inst.fecha_inicio).getFullYear() : '';
                            const anioFin = inst.flag_actual === 1 || !inst.fecha_fin ? 'Actualidad' : new Date(inst.fecha_fin).getFullYear();
                            return (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{
                                        width: 12, height: 12, borderRadius: '50%', flexShrink: 0,
                                        background: ORANGE, border: '2px solid #fff', zIndex: 1
                                    }} />
                                    <div style={{ flex: 1, paddingBottom: 6 }}>
                                        <div style={{ fontSize: 12, fontWeight: 700, color: TEXT_WHITE }}>
                                            {anioInicio}{anioFin ? ` - ${anioFin}` : ''}: {inst.nombre_institucion || '-'}
                                        </div>
                                        <div style={{ fontSize: 10, color: TEXT_WHITE }}>
                                            {[inst.nombre_nivel, inst.nombre_pais].filter(Boolean).join(' · ')}
                                        </div>
                                    </div>
                                    <img
                                        src={inst.logo || ESCUDO_PLACEHOLDER}
                                        alt=""
                                        style={{ width: 28, height: 28, objectFit: 'contain', borderRadius: 4, flexShrink: 0 }}
                                        onError={(e) => { e.target.src = ESCUDO_PLACEHOLDER; }}
                                    />
                                </div>
                            );
                        })}
                        {!tieneInstituciones && (
                            <div style={{ fontSize: 12, color: TEXT_WHITE, padding: '10px 0' }}>
                                Sin trayectoria registrada
                            </div>
                        )}
                    </div>
                </div>

                {/* Línea divisoria naranja */}
                <div style={{ height: 2, background: ORANGE, width: '100%' }} />

                {/* COMENTARIOS / NOTAS DEL CLUB */}
                <div style={{ padding: '10px 0', flex: 1, minHeight: 60, overflow: 'auto' }}>
                    <h3 style={{ fontSize: 18, color: ORANGE, fontWeight: 800, margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: 1.5 }}>
                        Comentarios
                    </h3>
                    {(comentarios && comentarios.length > 0) ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {comentarios.slice(0, 5).map((c) => (
                                <div
                                    key={c.vit_jugador_comentario_club_id}
                                    style={{
                                        padding: '10px 12px',
                                        background: 'transparent',
                                        borderRadius: 8,
                                        borderLeft: `3px solid ${ORANGE}`,
                                        color: '#fff',
                                        textShadow: '0 1px 2px rgba(0,0,0,0.55)',
                                    }}
                                >
                                    {/* Línea 1: comentario (izq) + fecha (der) */}
                                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 }}>
                                        <div style={{ fontSize: 13, color: '#fff', lineHeight: 1.35, flex: 1, minWidth: 0 }}>
                                            {c.comentario}
                                        </div>
                                        {c.fecha && (
                                            <div style={{ fontSize: 10, color: '#fff', whiteSpace: 'nowrap', flexShrink: 0 }}>
                                                {formatFechaComentario(c.fecha)}
                                            </div>
                                        )}
                                    </div>

                                    {/* Línea 2: autor */}
                                    <div style={{ marginTop: 8, fontSize: 11, color: '#fff', lineHeight: 1.35 }}>
                                        <div style={{ fontWeight: 600, color: '#fff' }}>
                                            {[c.autor_nombres, c.autor_apellidos].filter(Boolean).join(' ')}
                                        </div>
                                        {/* Línea 3: rol · club */}
                                        {(c.rol_nombre || c.nombre_club) && (
                                            <div style={{ marginTop: 2, color: '#fff' }}>
                                                {c.rol_nombre && <span style={{ color: '#fff' }}>{c.rol_nombre}</span>}
                                                {c.rol_nombre && c.nombre_club && <span style={{ color: '#fff' }}> · </span>}
                                                {c.nombre_club && <span style={{ color: '#fff' }}>{c.nombre_club}</span>}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ fontSize: 13, color: '#fff', padding: '16px 0', textShadow: '0 1px 2px rgba(0,0,0,0.55)' }}>
                            Sin comentarios
                        </div>
                    )}
                </div>
            </div>

            {/* QR abajo */}
            <div style={{
                position: 'absolute', bottom: 30, right: 40, zIndex: 10,
                display: 'flex', flexDirection: 'column', alignItems: 'center'
            }}>
                <div style={{ background: '#fff', padding: 6, borderRadius: 6 }}>
                    <QRCodeSVG value={fichaUrl} size={80} level="L" />
                </div>
            </div>
        </div>
    );
});

FichaCardEstilo1.displayName = 'FichaCardEstilo1';
export default FichaCardEstilo1;
