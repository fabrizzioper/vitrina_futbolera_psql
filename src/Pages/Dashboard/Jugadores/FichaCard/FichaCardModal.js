import React, { useRef, useState, useCallback, useEffect } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import FichaCardEstilo1 from './FichaCardEstilo1';
import FichaCardEstilo2 from './FichaCardEstilo2';
import './fichaCard.css';

/**
 * Convierte una URL de imagen a base64 usando fetch + blob.
 * Esto resuelve el problema de CORS con html2canvas al tener
 * las imágenes como data URIs inline.
 */
const imgToBase64 = (url) => {
    if (!url || url.startsWith('data:')) return Promise.resolve(url);
    return fetch(url, { mode: 'cors', credentials: 'include' })
        .then(res => {
            if (!res.ok) throw new Error('fetch failed');
            return res.blob();
        })
        .then(blob => new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        }))
        .catch(() => null); // retorna null si falla
};

const FichaCardModal = ({ show, onClose, jugador, caracteristicas, instituciones, logros, randomImg, comentarios }) => {
    const [estiloSeleccionado, setEstiloSeleccionado] = useState(null);
    const [generando, setGenerando] = useState(false);
    const [cargandoImagenes, setCargandoImagenes] = useState(false);
    const [imagenesBase64, setImagenesBase64] = useState(null);
    const cardRef = useRef(null);

    const handleClose = useCallback(() => {
        setEstiloSeleccionado(null);
        setGenerando(false);
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

            // Convertir foto de cuerpo y perfil del jugador
            const [fotoCuerpoB64, fotoPerfilB64] = await Promise.all([
                jugador.foto_cuerpo ? imgToBase64(jugador.foto_cuerpo + suffix) : Promise.resolve(null),
                jugador.foto_perfil ? imgToBase64(jugador.foto_perfil + suffix) : Promise.resolve(null),
            ]);

            // Convertir logos de instituciones
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
                    logos: logosB64,
                });
                setCargandoImagenes(false);
            }
        };

        convertir();
        return () => { cancelled = true; };
    }, [estiloSeleccionado, jugador, instituciones, randomImg]);

    const handleDescargarImagen = async () => {
        if (!cardRef.current) return;
        setGenerando(true);
        try {
            const canvas = await html2canvas(cardRef.current, {
                scale: 2,
                useCORS: false,
                allowTaint: false,
                backgroundColor: null,
                logging: false,
            });
            const link = document.createElement('a');
            const nombre = `${jugador.jugador_nombres || 'jugador'}_${jugador.jugador_apellidos || ''}_ficha`.replace(/\s+/g, '_');
            link.download = `${nombre}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (err) {
            console.error('Error al generar imagen:', err);
        } finally {
            setGenerando(false);
        }
    };

    const handleDescargarPDF = async () => {
        if (!cardRef.current) return;
        setGenerando(true);
        try {
            const canvas = await html2canvas(cardRef.current, {
                scale: 2,
                useCORS: false,
                allowTaint: false,
                backgroundColor: null,
                logging: false,
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            const pdfW = pdf.internal.pageSize.getWidth();
            const pdfH = pdf.internal.pageSize.getHeight();
            pdf.addImage(imgData, 'PNG', 0, 0, pdfW, pdfH);
            const nombre = `${jugador.jugador_nombres || 'jugador'}_${jugador.jugador_apellidos || ''}_ficha`.replace(/\s+/g, '_');
            pdf.save(`${nombre}.pdf`);
        } catch (err) {
            console.error('Error al generar PDF:', err);
        } finally {
            setGenerando(false);
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

                            {/* Estilo B */}
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
                        </div>
                    </div>
                ) : (
                    <div className="fcm-body">
                        {/* Action buttons */}
                        <div className="fcm-actions">
                            <button className="fcm-btn fcm-btn-back" onClick={() => { setEstiloSeleccionado(null); setImagenesBase64(null); }} disabled={generando}>
                                <i className="fa-solid fa-arrow-left"></i> Cambiar estilo
                            </button>
                            <div className="fcm-actions-right">
                                <button className="fcm-btn fcm-btn-img" onClick={handleDescargarImagen} disabled={generando || cargandoImagenes}>
                                    {generando ? <span className="spinner-border spinner-border-sm"></span> : <i className="fa-solid fa-image"></i>}
                                    {' '}Descargar PNG
                                </button>
                                <button className="fcm-btn fcm-btn-pdf" onClick={handleDescargarPDF} disabled={generando || cargandoImagenes}>
                                    {generando ? <span className="spinner-border spinner-border-sm"></span> : <i className="fa-solid fa-file-pdf"></i>}
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
