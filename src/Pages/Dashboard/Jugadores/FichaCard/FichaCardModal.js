import React, { useRef, useState, useCallback, useEffect } from 'react';
import jsPDF from 'jspdf';
import FichaCardEstilo1 from './FichaCardEstilo1';
import FichaCardEstilo2 from './FichaCardEstilo2';
import './fichaCard.css';

/**
 * Convierte URL absoluta a relativa para pasar por el proxy de dev.
 * Ej: http://localhost:8080/uploads/foto.png -> /uploads/foto.png
 */
const toProxyUrl = (url) => {
    if (!url) return url;
    try {
        const u = new URL(url, window.location.origin);
        // Si la URL apunta a localhost:8080 (Tomcat), convertir a relativa para el proxy
        if (u.hostname === 'localhost' && u.port === '8080') {
            return u.pathname + u.search;
        }
        if (u.pathname.startsWith('/uploads')) return u.pathname + u.search;
    } catch (e) { /* no es URL válida */ }
    return url;
};

/**
 * Convierte una URL de imagen a base64 usando fetch + blob.
 */
const fetchAsBase64 = (fetchUrl) =>
    fetch(fetchUrl)
        .then(res => {
            if (!res.ok) throw new Error('fetch failed');
            return res.blob();
        })
        .then(blob => new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        }));

const imgToBase64 = (url) => {
    if (!url || url.startsWith('data:')) return Promise.resolve(url);
    const proxyUrl = toProxyUrl(url);
    // Intentar con proxy primero, luego URL original
    return fetchAsBase64(proxyUrl)
        .catch(() => proxyUrl !== url ? fetchAsBase64(url) : null)
        .catch(() => null);
};

const FichaCardModal = ({ show, onClose, jugador, caracteristicas, instituciones, logros, randomImg, comentarios }) => {
    const [estiloSeleccionado, setEstiloSeleccionado] = useState(1);
    const [generandoPng, setGenerandoPng] = useState(false);
    const [generandoPdf, setGenerandoPdf] = useState(false);
    const [cargandoImagenes, setCargandoImagenes] = useState(false);
    const [imagenesBase64, setImagenesBase64] = useState(null);
    const cardRef = useRef(null);

    const handleClose = useCallback(() => {
        setEstiloSeleccionado(1);
        setGenerandoPng(false);
        setGenerandoPdf(false);
        setCargandoImagenes(false);
        setImagenesBase64(null);
        onClose();
    }, [onClose]);

    // Pre-convertir imágenes cuando se selecciona un estilo
    useEffect(() => {
        if (!estiloSeleccionado || !jugador) return;

        let cancelled = false;
        setCargandoImagenes(true);

        const convertir = async () => {
            const suffix = '?random=' + (randomImg || 1);
            const fondoUrl = (process.env.PUBLIC_URL || '') + '/fondo1.png';

            const [fotoCuerpoB64, fotoPerfilB64, fondoB64] = await Promise.all([
                jugador.foto_cuerpo ? imgToBase64(jugador.foto_cuerpo + suffix) : Promise.resolve(null),
                jugador.foto_perfil ? imgToBase64(jugador.foto_perfil + suffix) : Promise.resolve(null),
                imgToBase64(fondoUrl),
            ]);

            const logosB64 = {};
            if (instituciones && instituciones.length > 0) {
                const promises = instituciones.map(async (inst, i) => {
                    if (inst.logo) {
                        const b64 = await imgToBase64(inst.logo);
                        if (b64) logosB64[i] = b64;
                    }
                });
                await Promise.all(promises);
            }

            if (!cancelled) {
                setImagenesBase64({
                    fotoCuerpo: fotoCuerpoB64,
                    fotoPerfil: fotoPerfilB64,
                    fondo: fondoB64,
                    logos: logosB64,
                });
                setCargandoImagenes(false);
            }
        };

        convertir();
        return () => { cancelled = true; };
    }, [estiloSeleccionado, jugador, instituciones, randomImg]);

    const loadImg = (src) => new Promise((resolve) => {
        if (!src) return resolve(null);

        // Data URLs: no necesitan CORS
        if (src.startsWith('data:')) {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => resolve(null);
            img.src = src;
            return;
        }

        // URLs normales: intentar con crossOrigin, si falla convertir vía fetch
        const proxiedSrc = toProxyUrl(src);
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => {
            // Fallback: convertir a base64 vía fetch para evitar CORS
            fetch(proxiedSrc)
                .then(res => {
                    if (!res.ok) throw new Error('fetch failed');
                    return res.blob();
                })
                .then(blob => new Promise((res) => {
                    const reader = new FileReader();
                    reader.onloadend = () => res(reader.result);
                    reader.readAsDataURL(blob);
                }))
                .then(dataUrl => {
                    const img2 = new Image();
                    img2.onload = () => resolve(img2);
                    img2.onerror = () => resolve(null);
                    img2.src = dataUrl;
                })
                .catch(() => resolve(null));
        };
        img.src = proxiedSrc;
    });

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

    const formatFecha = (fecha) => {
        if (!fecha) return '-';
        const d = new Date(fecha);
        return d.toLocaleDateString('es', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const generarCanvas = async () => {
        const W = 794, H = 1123;
        const canvas = document.createElement('canvas');
        canvas.width = W * 2;
        canvas.height = H * 2;
        const ctx = canvas.getContext('2d');
        ctx.scale(2, 2);

        const ORANGE = '#ef8700';
        const WHITE = '#ffffff';

        // === FONDO ===
        const grd = ctx.createLinearGradient(0, 0, W * 0.6, H);
        grd.addColorStop(0, '#5a5a5a');
        grd.addColorStop(0.4, '#4a4a4a');
        grd.addColorStop(1, '#3d3d3d');
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, W, H);

        // Imagen de fondo si existe
        if (imagenesBase64?.fondo) {
            const fondoImg = await loadImg(imagenesBase64.fondo);
            if (fondoImg) {
                ctx.globalAlpha = 1;
                ctx.drawImage(fondoImg, 0, 0, W, H);
                ctx.globalAlpha = 1;
            }
        }

        // === BORDES NARANJAS ===
        ctx.fillStyle = ORANGE;
        ctx.fillRect(0, 0, W, 4); // top
        ctx.fillRect(0, H - 4, W, 4); // bottom

        // === NOMBRE ===
        const nombres = (jugador.jugador_nombres || '').toUpperCase();
        const apellidos = (jugador.jugador_apellidos || '').toUpperCase();

        ctx.fillStyle = ORANGE;
        ctx.font = 'bold 46px Arial, Helvetica, sans-serif';
        ctx.textBaseline = 'top';
        ctx.fillText(nombres, 40, 32);
        ctx.fillText(apellidos, 40, 82);

        // === SUB-CATEGORÍA | POSICIÓN | ESTATURA ===
        const cat = obtenerCategoria(jugador.jugador_fecha_nacimiento);
        const posicion = jugador.posicion || '';
        const subpos = jugador.subposicion && jugador.subposicion !== jugador.posicion ? ` ${jugador.subposicion}` : '';
        const estatura = jugador.jugador_estatura_cm ? (jugador.jugador_estatura_cm / 100).toFixed(2) + ' m' : '-';
        const jugadorId = jugador.vit_jugador_id || '0000000';

        let lineX = 40;
        const lineY = 140;

        ctx.font = 'bold 17px Arial, Helvetica, sans-serif';
        ctx.fillStyle = WHITE;
        if (cat) {
            ctx.fillText(cat, lineX, lineY);
            lineX += ctx.measureText(cat).width + 10;
            ctx.fillStyle = 'rgba(255,255,255,0.6)';
            ctx.fillText('|', lineX, lineY);
            lineX += ctx.measureText('|').width + 10;
        }
        ctx.fillStyle = WHITE;
        ctx.font = '17px Arial, Helvetica, sans-serif';
        const posText = posicion + subpos;
        ctx.fillText(posText, lineX, lineY);
        lineX += ctx.measureText(posText).width + 10;
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.fillText('|', lineX, lineY);
        lineX += ctx.measureText('|').width + 10;
        ctx.fillStyle = WHITE;
        ctx.fillText(estatura, lineX, lineY);

        // === ID ===
        ctx.fillStyle = WHITE;
        ctx.font = '14px Arial, Helvetica, sans-serif';
        ctx.fillText('ID: ' + String(jugadorId).padStart(7, '0'), 40, 170);

        // === FOTO DE PERFIL (círculo) ===
        const fotoSrc = imagenesBase64?.fotoPerfil
            || (jugador.foto_perfil ? jugador.foto_perfil + '?random=' + (randomImg || 1) : null);
        const fotoCuerpoSrc = imagenesBase64?.fotoCuerpo
            || (jugador.foto_cuerpo ? jugador.foto_cuerpo + '?random=' + (randomImg || 1) : null);
        const tieneFotoCuerpo = !!fotoCuerpoSrc;

        if (fotoSrc) {
            let fotoImg = await loadImg(fotoSrc);
            if (!fotoImg && jugador.foto_perfil) {
                fotoImg = await loadImg(jugador.foto_perfil);
            }
            if (fotoImg) {
                // Si tiene foto de cuerpo: círculo normal (65). Si no: 50% más grande (98)
                const r = tieneFotoCuerpo ? 65 : 98;
                const cx = W - 35 - r, cy = 55 + r;
                ctx.save();
                ctx.beginPath();
                ctx.arc(cx, cy, r, 0, Math.PI * 2);
                ctx.clip();
                ctx.drawImage(fotoImg, cx - r, cy - r, r * 2, r * 2);
                ctx.restore();
                ctx.strokeStyle = ORANGE;
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.arc(cx, cy, r, 0, Math.PI * 2);
                ctx.stroke();
            }
        }

        // === FOTO DE CUERPO ===
        if (fotoCuerpoSrc) {
            let cuerpoImg = await loadImg(fotoCuerpoSrc);
            if (!cuerpoImg && jugador.foto_cuerpo) {
                cuerpoImg = await loadImg(jugador.foto_cuerpo);
            }
            if (cuerpoImg) {
                const imgW = 340, imgH = 400;
                const imgX = W - 120 - imgW;
                const imgY = 80;
                const scale = Math.min(imgW / cuerpoImg.width, imgH / cuerpoImg.height);
                const drawW = cuerpoImg.width * scale;
                const drawH = cuerpoImg.height * scale;
                const drawX = imgX + (imgW - drawW) / 2;
                const drawY = imgY + (imgH - drawH) / 2;
                ctx.drawImage(cuerpoImg, drawX, drawY, drawW, drawH);
            }
        }

        // === DATOS BIOMÉTRICOS ===
        const secY = 285;
        ctx.fillStyle = ORANGE;
        ctx.font = 'bold 18px Arial, Helvetica, sans-serif';
        ctx.fillText('DATOS BIOMÉTRICOS', 40, secY);

        ctx.fillStyle = WHITE;
        ctx.font = '14px Arial, Helvetica, sans-serif';
        const datos = [
            { label: 'Nacimiento', value: formatFecha(jugador.jugador_fecha_nacimiento) },
            { label: 'Nacionalidad', value: [jugador.pais, jugador.pais2].filter(Boolean).join('/') || '-' },
            { label: 'Talla', value: estatura },
            { label: 'Peso', value: jugador.jugador_peso_kg ? jugador.jugador_peso_kg + ' kg' : '-' },
            { label: 'Pie Dominante', value: jugador.perfil === 'Derecho' ? 'Diestro' : jugador.perfil === 'Izquierdo' ? 'Zurdo' : jugador.perfil || '-' },
        ];
        datos.forEach((d, i) => {
            const y = secY + 30 + i * 28;
            ctx.fillStyle = ORANGE;
            ctx.fillText('●', 40, y);
            ctx.fillStyle = WHITE;
            ctx.fillText(`${d.label}: ${d.value}`, 58, y);
        });

        // Línea naranja divisoria
        let curY = secY + 30 + datos.length * 28 + 10;
        ctx.fillStyle = ORANGE;
        ctx.fillRect(40, curY, 300, 2);
        curY += 20;

        // === PERFIL TÉCNICO (gauges semicirculares) ===
        if (caracteristicas && caracteristicas.length > 0) {
            ctx.fillStyle = ORANGE;
            ctx.font = 'bold 18px Arial, Helvetica, sans-serif';
            ctx.fillText('PERFIL TÉCNICO', 40, curY);
            curY += 36;

            const gaugeSize = 90;
            const gaugeGap = 18;
            const rows = [caracteristicas.slice(0, 3), caracteristicas.slice(3, 6)];

            rows.forEach((row) => {
                if (row.length === 0) return;
                const rowStartX = 40;
                row.forEach((c, i) => {
                    const cx = rowStartX + i * (gaugeSize + gaugeGap) + gaugeSize / 2;
                    const cy = curY + gaugeSize / 2 + 18;
                    const r = (gaugeSize - 12) / 2;
                    const pct = Math.round((c.puntaje / 5) * 100);
                    // Label
                    ctx.fillStyle = WHITE;
                    ctx.font = '10px Arial, Helvetica, sans-serif';
                    ctx.textAlign = 'center';
                    const labelText = (c.nombre || '').length > 12 ? (c.nombre || '').substring(0, 12) + '…' : (c.nombre || '');
                    ctx.fillText(`${labelText}: ${pct}%`, cx, curY);

                    // Fondo del arco
                    ctx.beginPath();
                    ctx.arc(cx, cy, r, Math.PI, 0);
                    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
                    ctx.lineWidth = 7;
                    ctx.stroke();

                    // Arco de progreso
                    if (pct > 0) {
                        ctx.beginPath();
                        const startAngle = Math.PI;
                        const endAngle = Math.PI + (Math.PI * pct / 100);
                        ctx.arc(cx, cy, r, startAngle, endAngle);
                        ctx.strokeStyle = ORANGE;
                        ctx.lineWidth = 7;
                        ctx.lineCap = 'round';
                        ctx.stroke();
                        ctx.lineCap = 'butt';
                    }

                    // Porcentaje central
                    ctx.fillStyle = WHITE;
                    ctx.font = 'bold 19px Arial, Helvetica, sans-serif';
                    ctx.fillText(`${pct}%`, cx, cy - 4);
                });
                curY += gaugeSize / 2 + 50;
            });

            ctx.textAlign = 'left';

            // Línea naranja
            ctx.fillStyle = ORANGE;
            ctx.fillRect(40, curY, 300, 2);
            curY += 20;
        }

        // === RESUMEN DE PERFIL ===
        ctx.fillStyle = ORANGE;
        ctx.font = 'bold 18px Arial, Helvetica, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('RESUMEN DE PERFIL', 40, curY);
        curY += 26;

        const tieneInst = instituciones && instituciones.length > 0;
        const tieneLog = logros && logros.length > 0;
        let resumen = `Jugador de ${jugador.posicion || 'campo'}${jugador.subposicion ? ` (${jugador.subposicion})` : ''} de nacionalidad ${jugador.pais || '-'}.`;
        if (jugador.jugador_estatura_cm) resumen += ` Mide ${estatura}`;
        if (jugador.jugador_peso_kg) resumen += ` y pesa ${jugador.jugador_peso_kg} kg.`;
        else resumen += '.';
        if (jugador.perfil) resumen += ` Pie dominante: ${jugador.perfil === 'Derecho' ? 'diestro' : jugador.perfil === 'Izquierdo' ? 'zurdo' : jugador.perfil}.`;
        if (tieneInst) resumen += ` Cuenta con experiencia en ${instituciones.length} institución${instituciones.length === 1 ? '' : 'es'}.`;
        if (tieneLog) resumen += ` Ha obtenido ${logros.length} logro${logros.length === 1 ? '' : 's'} en su carrera.`;
        if (jugador.jugador_grupo_sanguineo) resumen += ` Grupo sanguíneo: ${jugador.jugador_grupo_sanguineo}.`;

        // Word wrap del resumen
        ctx.fillStyle = WHITE;
        ctx.font = '13px Arial, Helvetica, sans-serif';
        const maxResWidth = 300;
        const resumenLines = [];
        const words = resumen.split(' ');
        let currentLine = '';
        words.forEach(word => {
            const test = currentLine ? currentLine + ' ' + word : word;
            if (ctx.measureText(test).width > maxResWidth) {
                resumenLines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = test;
            }
        });
        if (currentLine) resumenLines.push(currentLine);
        resumenLines.forEach((line, i) => {
            ctx.fillText(line, 40, curY + i * 20);
        });

        // === LÍNEA VERTICAL SEPARADORA ===
        const colDivX = W * 0.495;
        const grdVert = ctx.createLinearGradient(0, 400, 0, H - 20);
        grdVert.addColorStop(0, ORANGE);
        grdVert.addColorStop(1, 'rgba(239,135,0,0.4)');
        ctx.fillStyle = grdVert;
        ctx.fillRect(colDivX, 400, 2, H - 420);

        // === COLUMNA DERECHA ===
        const rightX = W * 0.5 + 24;
        const rightMaxW = W - rightX - 50;
        let rightY = 400;

        // === TRAYECTORIA PROFESIONAL ===
        ctx.fillStyle = ORANGE;
        ctx.font = 'bold 18px Arial, Helvetica, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('TRAYECTORIA PROFESIONAL', rightX, rightY);
        rightY += 28;

        if (instituciones && instituciones.length > 0) {
            const instSlice = instituciones.slice(0, 6);

            // Línea vertical del timeline
            if (instSlice.length > 1) {
                ctx.fillStyle = ORANGE;
                ctx.fillRect(rightX + 5, rightY, 2, instSlice.length * 42 - 10);
            }

            for (let i = 0; i < instSlice.length; i++) {
                const inst = instSlice[i];
                const iy = rightY + i * 42;

                // Dot
                ctx.fillStyle = ORANGE;
                ctx.beginPath();
                ctx.arc(rightX + 6, iy + 6, 6, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = WHITE;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(rightX + 6, iy + 6, 6, 0, Math.PI * 2);
                ctx.stroke();

                // Logo de institución (dibujar primero para reservar espacio)
                const logoSize = 28;
                const logoGap = 8;
                const logoSrc = (imagenesBase64?.logos && imagenesBase64.logos[i]) || inst.logo;
                const hasLogo = !!logoSrc;
                const textMaxW = hasLogo ? rightMaxW - 22 - logoSize - logoGap : rightMaxW - 22;

                if (logoSrc) {
                    const logoImg = await loadImg(logoSrc);
                    if (logoImg) {
                        ctx.drawImage(logoImg, rightX + rightMaxW - logoSize, iy - 2, logoSize, logoSize);
                    }
                }

                // Texto con word-wrap si es muy largo
                const anioInicio = inst.fecha_inicio ? new Date(inst.fecha_inicio).getFullYear() : '';
                const anioFin = inst.flag_actual === 1 || !inst.fecha_fin ? 'Actualidad' : new Date(inst.fecha_fin).getFullYear();
                const instText = `${anioInicio}${anioFin ? ' - ' + anioFin : ''}: ${inst.nombre_institucion || '-'}`;
                ctx.fillStyle = WHITE;
                ctx.font = 'bold 12px Arial, Helvetica, sans-serif';

                // Word-wrap: dividir en líneas si excede el ancho
                const instWords = instText.split(' ');
                const instLines = [];
                let instLine = '';
                instWords.forEach(w => {
                    const test = instLine ? instLine + ' ' + w : w;
                    if (ctx.measureText(test).width > textMaxW) {
                        if (instLine) instLines.push(instLine);
                        instLine = w;
                    } else {
                        instLine = test;
                    }
                });
                if (instLine) instLines.push(instLine);
                instLines.slice(0, 2).forEach((line, li) => {
                    ctx.fillText(line, rightX + 22, iy + 5 + li * 14);
                });

                const subText = [inst.nombre_nivel, inst.nombre_pais].filter(Boolean).join(' · ');
                if (subText) {
                    ctx.font = '10px Arial, Helvetica, sans-serif';
                    const subY = instLines.length > 1 ? iy + 5 + 14 + 12 : iy + 20;
                    ctx.fillText(subText, rightX + 22, subY);
                }
            }
            rightY += instSlice.length * 42 + 10;
        } else {
            ctx.fillStyle = WHITE;
            ctx.font = '12px Arial, Helvetica, sans-serif';
            ctx.fillText('Sin trayectoria registrada', rightX, rightY);
            rightY += 30;
        }

        // Línea naranja
        ctx.fillStyle = ORANGE;
        ctx.fillRect(rightX, rightY, rightMaxW, 2);
        rightY += 20;

        // === COMENTARIOS (solo si hay) ===
        if (comentarios && comentarios.length > 0) {
            ctx.fillStyle = ORANGE;
            ctx.font = 'bold 18px Arial, Helvetica, sans-serif';
            ctx.fillText('COMENTARIOS', rightX, rightY);
            rightY += 26;

            comentarios.slice(0, 5).forEach((c) => {
                if (rightY > H - 80) return;

                // Borde izquierdo naranja
                ctx.fillStyle = ORANGE;
                ctx.fillRect(rightX, rightY, 3, 50);

                // Texto del comentario (word wrap)
                ctx.fillStyle = WHITE;
                ctx.font = '12px Arial, Helvetica, sans-serif';
                const comentText = c.comentario || '';
                const comLines = [];
                const comWords = comentText.split(' ');
                let comLine = '';
                comWords.forEach(w => {
                    const test = comLine ? comLine + ' ' + w : w;
                    if (ctx.measureText(test).width > rightMaxW - 20) {
                        comLines.push(comLine);
                        comLine = w;
                    } else {
                        comLine = test;
                    }
                });
                if (comLine) comLines.push(comLine);
                comLines.slice(0, 2).forEach((line, li) => {
                    ctx.fillText(line, rightX + 10, rightY + 12 + li * 16);
                });

                // Fecha
                if (c.fecha) {
                    ctx.font = '9px Arial, Helvetica, sans-serif';
                    ctx.fillStyle = 'rgba(255,255,255,0.7)';
                    const fechaStr = formatFecha(c.fecha);
                    ctx.textAlign = 'right';
                    ctx.fillText(fechaStr, rightX + rightMaxW, rightY + 12);
                    ctx.textAlign = 'left';
                }

                // Autor
                const autorNombre = [c.autor_nombres, c.autor_apellidos].filter(Boolean).join(' ');
                if (autorNombre) {
                    ctx.font = 'bold 10px Arial, Helvetica, sans-serif';
                    ctx.fillStyle = WHITE;
                    ctx.fillText(autorNombre, rightX + 10, rightY + 42);
                }
                const rolClub = [c.rol_nombre, c.nombre_club].filter(Boolean).join(' · ');
                if (rolClub) {
                    ctx.font = '9px Arial, Helvetica, sans-serif';
                    ctx.fillStyle = 'rgba(255,255,255,0.7)';
                    ctx.fillText(rolClub, rightX + 10, rightY + 54);
                }

                rightY += 66;
            });
        }

        // === QR CODE ===
        // Dibujamos un QR simple usando un canvas temporal con la librería qrcode
        const qrSize = 80;
        const qrX = W - 40 - qrSize - 6;
        const qrY = H - 30 - qrSize - 12;

        // Fondo blanco para el QR
        ctx.fillStyle = '#ffffff';
        const qrPad = 6;
        ctx.fillRect(qrX - qrPad, qrY - qrPad, qrSize + qrPad * 2, qrSize + qrPad * 2);

        // Generamos QR como imagen desde un canvas temporal
        try {
            const QRCode = await import('qrcode');
            const fichaUrl = `${window.location.origin}/#/ficha/${jugador.vit_jugador_id || '0000000'}`;
            const qrCanvas = document.createElement('canvas');
            await QRCode.toCanvas(qrCanvas, fichaUrl, { width: qrSize, margin: 0, color: { dark: '#000000', light: '#ffffff' } });
            ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize);
        } catch (e) {
            // Fallback: dibujamos texto con la URL
            ctx.fillStyle = '#333';
            ctx.font = '8px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('QR Code', qrX + qrSize / 2, qrY + qrSize / 2);
            ctx.textAlign = 'left';
        }

        return canvas;
    };

    const handleDescargarImagen = async () => {
        if (!cardRef.current) return;
        setGenerandoPng(true);
        try {
            const canvas = await generarCanvas();
            const link = document.createElement('a');
            const nombre = `${jugador.jugador_nombres || 'jugador'}_${jugador.jugador_apellidos || ''}_ficha`.replace(/\s+/g, '_');
            link.download = `${nombre}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (err) {
            console.error('Error al generar imagen:', err);
            alert('Error al generar imagen: ' + (err?.message || JSON.stringify(err)));
        } finally {
            setGenerandoPng(false);
        }
    };

    const handleDescargarPDF = async () => {
        if (!cardRef.current) return;
        setGenerandoPdf(true);
        try {
            const canvas = await generarCanvas();
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            const pdfW = pdf.internal.pageSize.getWidth();
            const pdfH = pdf.internal.pageSize.getHeight();
            pdf.addImage(imgData, 'PNG', 0, 0, pdfW, pdfH);
            const nombre = `${jugador.jugador_nombres || 'jugador'}_${jugador.jugador_apellidos || ''}_ficha`.replace(/\s+/g, '_');
            pdf.save(`${nombre}.pdf`);
        } catch (err) {
            console.error('Error al generar PDF:', err);
            alert('Error al generar PDF: ' + (err?.message || JSON.stringify(err)));
        } finally {
            setGenerandoPdf(false);
        }
    };

    if (!show) return null;

    const CardComponent = estiloSeleccionado === 1 ? FichaCardEstilo1 : estiloSeleccionado === 2 ? FichaCardEstilo2 : null;

    // Preparar instituciones con logos en base64
    const institucionesConBase64 = (instituciones || []).map((inst, i) => ({
        ...inst,
        logo: (imagenesBase64 && imagenesBase64.logos[i]) || inst.logo,
    }));

    return (
        <div className="fcm-overlay" onClick={handleClose}>
            <div className="fcm-modal" onClick={(e) => e.stopPropagation()}>
                <div className="fcm-header">
                    <h2 className="fcm-title">
                        <i className="fa-solid fa-id-card"></i>
                        {estiloSeleccionado ? 'Vista previa de Ficha' : 'Selecciona un estilo de Ficha'}
                    </h2>
                    <button className="fcm-close" onClick={handleClose}>
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>

                {!estiloSeleccionado ? (
                    <div className="fcm-body">
                        <div className="fcm-estilos-grid">
                            {/* Estilo A */}
                            <div className="fcm-estilo-option" onClick={() => setEstiloSeleccionado(1)}>
                                <div className="fcm-estilo-preview fcm-preview-1">
                                    <div className="fcm-preview-icon">
                                        <i className="fa-solid fa-id-card"></i>
                                    </div>
                                    <div className="fcm-preview-label">Estilo A</div>
                                    <div className="fcm-preview-desc">Fondo plomo, letras en blanco</div>
                                </div>
                                <div className="fcm-estilo-name">Estilo A</div>
                            </div>

                            {/* Estilo B - comentado por ahora */}
                            {/*
                            <div className="fcm-estilo-option" onClick={() => setEstiloSeleccionado(2)}>
                                <div className="fcm-estilo-preview fcm-preview-2">
                                    <div className="fcm-preview-icon">
                                        <i className="fa-solid fa-id-card"></i>
                                    </div>
                                    <div className="fcm-preview-label">Estilo B</div>
                                    <div className="fcm-preview-desc">Tema clásico</div>
                                </div>
                                <div className="fcm-estilo-name">Estilo B</div>
                            </div>
                            */}
                        </div>
                    </div>
                ) : (
                    <div className="fcm-body">
                        {/* Action buttons */}
                        <div className="fcm-actions">
                            {/* Botón cambiar estilo - comentado mientras hay un solo estilo */}
                            {/*
                            <button className="fcm-btn fcm-btn-back" onClick={() => { setEstiloSeleccionado(null); setImagenesBase64(null); }} disabled={generandoPng || generandoPdf}>
                                <i className="fa-solid fa-arrow-left"></i> Cambiar estilo
                            </button>
                            */}
                            <div className="fcm-actions-right">
                                <button className="fcm-btn fcm-btn-img" onClick={handleDescargarImagen} disabled={generandoPng || generandoPdf || cargandoImagenes}>
                                    {generandoPng ? <span className="spinner-border spinner-border-sm"></span> : <i className="fa-solid fa-image"></i>}
                                    {' '}Descargar PNG
                                </button>
                                <button className="fcm-btn fcm-btn-pdf" onClick={handleDescargarPDF} disabled={generandoPng || generandoPdf || cargandoImagenes}>
                                    {generandoPdf ? <span className="spinner-border spinner-border-sm"></span> : <i className="fa-solid fa-file-pdf"></i>}
                                    {' '}Descargar PDF
                                </button>
                            </div>
                        </div>

                        {/* Card preview */}
                        <div className="fcm-preview-container">
                            {cargandoImagenes ? (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0', gap: 12 }}>
                                    <span className="spinner-border" style={{ width: 40, height: 40 }}></span>
                                    <span style={{ fontSize: 14, color: '#888' }}>Cargando im&aacute;genes...</span>
                                </div>
                            ) : (
                                <div className="fcm-card-wrapper">
                                    {CardComponent && (
                                    <CardComponent
                                        ref={cardRef}
                                        jugador={jugador}
                                        caracteristicas={caracteristicas}
                                        instituciones={institucionesConBase64}
                                        logros={logros}
                                        randomImg={randomImg}
                                        imagenesBase64={imagenesBase64}
                                        imagenFondoUrl={imagenesBase64?.fondo || undefined}
                                        comentarios={comentarios}
                                    />
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FichaCardModal;
