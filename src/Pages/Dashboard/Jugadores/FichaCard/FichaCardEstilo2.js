import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

const RED = '#c41e3a';
const RED_LIGHT = '#c41e3a18';

// Silueta de jugador SVG inline (funciona sin CORS)
const PLAYER_SILHOUETTE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 400' fill='%23bbb'%3E%3Cellipse cx='100' cy='55' rx='35' ry='42'/%3E%3Cpath d='M60 95 C40 100 30 130 35 170 L45 170 50 140 55 170 40 280 55 380 75 380 80 260 100 200 120 260 125 380 145 380 160 280 145 170 150 140 155 170 165 170 170 130 160 100 140 95Z'/%3E%3C/svg%3E";

// Escudo placeholder inline (sin CORS)
const ESCUDO_PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 48' fill='%23666'%3E%3Cpath d='M20 2 L38 10 L38 28 C38 38 20 46 20 46 C20 46 2 38 2 28 L2 10Z' stroke='%23999' stroke-width='1' fill='%23ddd'/%3E%3C/svg%3E";

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

const formatFechaDDMMYYYY = (fecha) => {
    if (!fecha) return '-';
    const d = new Date(fecha);
    return d.toLocaleDateString('es', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const BarStat = ({ label, value, max = 5 }) => {
    const pct = Math.round((value / max) * 100);
    return (
        <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: '#333', fontWeight: 500 }}>{label}</span>
                <span style={{ fontSize: 12, color: RED, fontWeight: 700 }}>{pct}%</span>
            </div>
            <div style={{ height: 5, background: '#e0e0e0', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: RED, borderRadius: 3 }} />
            </div>
        </div>
    );
};

const CircleGauge = ({ value, max = 5, size = 130 }) => {
    const pct = Math.round((value / max) * 100);
    const r = (size - 16) / 2;
    const cx = size / 2;
    const cy = size / 2;
    const circumference = 2 * Math.PI * r;
    const offset = circumference - (pct / 100) * circumference;

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e8e8e8" strokeWidth={10} />
            <circle cx={cx} cy={cy} r={r} fill="none" stroke={RED} strokeWidth={10}
                strokeDasharray={circumference} strokeDashoffset={offset}
                strokeLinecap="round" transform={`rotate(-90 ${cx} ${cy})`}
            />
            <text x={cx} y={cy + 7} textAnchor="middle" fill="#222" fontSize={28} fontWeight="900">{pct}%</text>
        </svg>
    );
};

const SectionTitle = ({ children }) => (
    <h3 style={{
        fontSize: 13, fontWeight: 800, margin: '0 0 14px 0',
        textTransform: 'uppercase', letterSpacing: 1.5, color: '#1a1a1a',
        borderBottom: `2px solid ${RED}`, paddingBottom: 8,
        display: 'flex', alignItems: 'center', gap: 6
    }}>
        <div style={{ width: 4, height: 16, background: RED, borderRadius: 2 }} />
        {children}
    </h3>
);

const FichaCardEstilo2 = React.forwardRef(({ jugador, caracteristicas, instituciones, logros, randomImg, imagenesBase64 }, ref) => {
    const cat = obtenerCategoria(jugador.jugador_fecha_nacimiento);
    const estatura = jugador.jugador_estatura_cm ? (jugador.jugador_estatura_cm / 100).toFixed(2) + ' m' : '-';
    const jugadorId = jugador.vit_jugador_id || '0000000';
    const fichaUrl = `${window.location.origin}/#/ficha/${jugadorId}`;

    const avgPct = caracteristicas && caracteristicas.length > 0
        ? caracteristicas.reduce((s, c) => s + c.puntaje, 0) / caracteristicas.length
        : 0;

    const tieneInstituciones = instituciones && instituciones.length > 0;
    const tieneLogros = logros && logros.length > 0;

    // Usar imágenes base64 si están disponibles (resuelve CORS para html2canvas)
    const fotoCuerpo = (imagenesBase64 && imagenesBase64.fotoCuerpo)
        || (jugador.foto_cuerpo ? jugador.foto_cuerpo + '?random=' + (randomImg || 1) : null)
        || PLAYER_SILHOUETTE;
    const tieneFotoCuerpo = !!(imagenesBase64 && imagenesBase64.fotoCuerpo) || !!jugador.foto_cuerpo;

    return (
        <div ref={ref} className="fc-estilo2" style={{
            width: 794, height: 1123, position: 'relative', overflow: 'hidden',
            background: '#f8f8f8',
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", color: '#222',
            boxSizing: 'border-box'
        }}>
            {/* Red border frame */}
            <div style={{
                position: 'absolute', inset: 14,
                border: `3px solid ${RED}`, pointerEvents: 'none', zIndex: 10
            }} />

            {/* ===== HEADER ===== */}
            <div style={{
                height: 270, position: 'relative', overflow: 'hidden',
                background: `linear-gradient(135deg, ${RED}15 0%, ${RED}08 100%)`
            }}>
                {/* Player body photo (left) */}
                <div style={{
                    position: 'absolute', left: 25, top: 15, bottom: 0,
                    width: 300, display: 'flex', alignItems: 'flex-end', zIndex: 3,
                    filter: tieneFotoCuerpo ? 'drop-shadow(4px 4px 10px rgba(0,0,0,0.15))' : 'none',
                    opacity: tieneFotoCuerpo ? 1 : 0.3
                }}>
                    <img src={fotoCuerpo} alt=""
                        style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                        onError={(e) => { e.target.src = PLAYER_SILHOUETTE; }}
                    />
                </div>

                {/* Background faded name */}
                <div style={{
                    position: 'absolute', right: -30, top: 20, fontSize: 70, fontWeight: 900,
                    color: `${RED}08`, textTransform: 'uppercase', lineHeight: 1, zIndex: 1,
                    whiteSpace: 'nowrap', letterSpacing: -2
                }}>
                    {jugador.jugador_apellidos || ''}
                </div>

                {/* Name + position badge (right) */}
                <div style={{
                    position: 'absolute', right: 40, top: 35, zIndex: 4,
                    textAlign: 'right', maxWidth: 400
                }}>
                    <h1 style={{
                        fontSize: 36, fontWeight: 900, margin: 0, lineHeight: 1.1,
                        textTransform: 'uppercase', color: '#1a1a1a', letterSpacing: 1
                    }}>
                        {jugador.jugador_nombres || ''}<br />{jugador.jugador_apellidos || ''}
                    </h1>
                    <div style={{
                        display: 'inline-block', marginTop: 14,
                        background: RED, color: '#fff', padding: '8px 22px',
                        borderRadius: 4, fontSize: 14, fontWeight: 700, letterSpacing: 0.5
                    }}>
                        {cat}{cat && ' | '}{jugador.posicion || ''}{jugador.subposicion ? ` ${jugador.subposicion}` : ''} | {estatura}
                    </div>
                </div>

                {/* Red separator */}
                <div style={{ position: 'absolute', bottom: 0, left: 25, right: 25, height: 3, background: RED }} />
            </div>

            {/* ===== CONTENT TWO COLUMNS ===== */}
            <div style={{
                display: 'flex', padding: '22px 30px 20px 30px', gap: 24,
                height: 'calc(100% - 270px)', boxSizing: 'border-box'
            }}>
                {/* LEFT COLUMN */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 18 }}>

                    {/* DATOS BIOMETRICOS */}
                    <div>
                        <SectionTitle>Datos Biom&eacute;tricos</SectionTitle>
                        <div style={{
                            background: '#fff', borderRadius: 8, padding: '14px 16px',
                            boxShadow: '0 1px 6px rgba(0,0,0,0.06)'
                        }}>
                            {caracteristicas && caracteristicas.length > 0 ? (
                                caracteristicas.slice(0, 3).map((c, i) => (
                                    <BarStat key={i} label={c.nombre} value={c.puntaje} />
                                ))
                            ) : (
                                <>
                                    <div style={{ fontSize: 11, color: '#555', marginBottom: 6 }}>
                                        Nacimiento: {formatFechaDDMMYYYY(jugador.jugador_fecha_nacimiento)}
                                    </div>
                                    <div style={{ fontSize: 11, color: '#555', marginBottom: 6 }}>
                                        Nacionalidad: {[jugador.pais, jugador.pais2].filter(Boolean).join('/') || '-'}
                                    </div>
                                    <div style={{ fontSize: 11, color: '#555', marginBottom: 6 }}>
                                        Altura: {estatura} | Peso: {jugador.jugador_peso_kg ? jugador.jugador_peso_kg + ' kg' : '-'}
                                    </div>
                                    <div style={{ fontSize: 11, color: '#555' }}>
                                        Pie: {jugador.perfil === 'Derecho' ? 'Diestro' : jugador.perfil === 'Izquierdo' ? 'Zurdo' : jugador.perfil || '-'}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* TRAYECTORIA PROFESIONAL */}
                    <div style={{ flex: 1 }}>
                        <SectionTitle>Trayectoria Profesional</SectionTitle>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {(instituciones || []).slice(0, 5).map((inst, i) => {
                                const anioInicio = inst.fecha_inicio ? new Date(inst.fecha_inicio).getFullYear() : '';
                                const anioFin = inst.flag_actual === 1 || !inst.fecha_fin ? 'Actualidad' : new Date(inst.fecha_fin).getFullYear();
                                return (
                                    <div key={i} style={{
                                        display: 'flex', alignItems: 'center', gap: 10,
                                        background: '#fff', borderRadius: 8, padding: '10px 12px',
                                        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                                        borderLeft: `3px solid ${RED}`
                                    }}>
                                        <img
                                            src={inst.logo || ESCUDO_PLACEHOLDER}
                                            alt=""
                                            style={{ width: 32, height: 32, objectFit: 'contain', flexShrink: 0 }}
                                            onError={(e) => { e.target.src = ESCUDO_PLACEHOLDER; }}
                                        />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: 12, fontWeight: 700, color: '#1a1a1a', textTransform: 'uppercase' }}>
                                                {inst.nombre_institucion || '-'}
                                            </div>
                                            <div style={{ fontSize: 10, color: '#888' }}>
                                                {anioInicio}{anioFin ? ` - ${anioFin}` : ''}{inst.nombre_nivel ? ` \u00b7 ${inst.nombre_nivel}` : ''}{inst.nombre_pais ? ` \u00b7 ${inst.nombre_pais}` : ''}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            {!tieneInstituciones && (
                                <div style={{ fontSize: 11, color: '#888', fontStyle: 'italic' }}>Sin trayectoria registrada</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 18 }}>

                    {/* PERFIL TECNICO */}
                    <div>
                        <SectionTitle>Perfil T&eacute;cnico</SectionTitle>
                        <div style={{
                            background: '#fff', borderRadius: 8, padding: '16px',
                            boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
                            display: 'flex', flexDirection: 'column', alignItems: 'center'
                        }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>
                                SKILLS
                            </div>
                            <CircleGauge value={avgPct} max={5} />
                            {caracteristicas && caracteristicas.length > 0 && (
                                <div style={{
                                    display: 'flex', flexWrap: 'wrap', gap: 5, justifyContent: 'center', marginTop: 10
                                }}>
                                    {caracteristicas.slice(0, 6).map((c, i) => (
                                        <span key={i} style={{
                                            fontSize: 9, background: '#f5f5f5', padding: '4px 10px',
                                            borderRadius: 12, color: '#444', fontWeight: 600,
                                            border: '1px solid #e0e0e0'
                                        }}>
                                            {c.nombre}: {Math.round((c.puntaje / 5) * 100)}%
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* PALMARES */}
                    <div style={{ flex: 1 }}>
                        <SectionTitle>Palmar&eacute;s</SectionTitle>
                        {tieneLogros ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {logros.slice(0, 4).map((l, i) => (
                                    <div key={i} style={{
                                        display: 'flex', alignItems: 'center', gap: 10,
                                        background: '#fff', borderRadius: 8, padding: '10px 12px',
                                        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                                        borderLeft: `3px solid ${RED}`
                                    }}>
                                        <div style={{
                                            width: 30, height: 30, borderRadius: '50%',
                                            background: RED_LIGHT, display: 'flex', alignItems: 'center',
                                            justifyContent: 'center', flexShrink: 0, fontSize: 14
                                        }}>
                                            &#127942;
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: 12, fontWeight: 700, color: '#1a1a1a', textTransform: 'uppercase' }}>
                                                {l.logro || '-'}
                                            </div>
                                            <div style={{ fontSize: 10, color: '#888' }}>
                                                {l.anno} &middot; {l.torneo}{l.nombre_pais ? ` \u00b7 ${l.nombre_pais}` : ''}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ fontSize: 11, color: '#888', fontStyle: 'italic' }}>Sin logros registrados</div>
                        )}
                    </div>

                    {/* QR + BRAND */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', gap: 12, marginTop: 'auto' }}>
                        <div style={{
                            background: RED, color: '#fff', fontWeight: 900, fontSize: 9,
                            padding: '3px 10px', borderRadius: 3, textTransform: 'uppercase', letterSpacing: 1.5,
                            alignSelf: 'flex-end'
                        }}>
                            VITRINA FUTBOLERA
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                            <div style={{ background: '#fff', padding: 4, borderRadius: 4, border: `1px solid ${RED}` }}>
                                <QRCodeSVG value={fichaUrl} size={70} level="L" fgColor="#1a1a1a" />
                            </div>
                            <div style={{
                                background: RED, color: '#fff', fontWeight: 900, fontSize: 8,
                                padding: '2px 8px', borderRadius: 2, textTransform: 'uppercase', letterSpacing: 1
                            }}>
                                HIGHLIGHTS
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

FichaCardEstilo2.displayName = 'FichaCardEstilo2';
export default FichaCardEstilo2;
