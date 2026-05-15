import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import { fetchData } from '../../Funciones/Funciones';
import user_logo from '../../imagenes/user_logo.png';
import CompletarPerfilHeader from './CompletarPerfilHeader';
import ModalCrop from '../Dashboard/MiPerfil/Componentes/ModalCrop';
import UbigeoSelector from '../../Componentes/Ubigeo/UbigeoSelector';
import '../Dashboard/MiPerfil/Jugador/miPerfil.css';
import './completarPerfil.css';

const CARGOS_DIRECTIVOS = ['PRESIDENTE', 'VICEPRESIDENTE', 'SECRETARIO', 'TESORERO', 'VOCAL', 'ADMINISTRATIVO'];

const CompletarPerfilClub = () => {
    const navigate = useNavigate();
    const { Alerta, Request, currentUser, clubData, fetchClubData, logOut, marcarPerfilCompletado, RandomNumberImg } = useAuth();

    // Ya no esperamos aprobacion: siempre editable
    const perfilCompletado = currentUser?.flag_perfil_completado === 1 || currentUser?.flag_perfil_completado === true;
    const camposEditables = true;

    // Wizard de pasos
    const TOTAL_PASOS = 4;
    const TITULOS_PASOS = [
        'Datos del Club',
        'Ubicación',
        'Documentación',
        'Cuentas y Directiva',
    ];
    const [pasoActual, setPasoActual] = useState(1);
    // Key de draft por usuario para persistir al cambiar de paso
    const draftKey = `clubDraft_${currentUser?.vit_jugador_id || currentUser?.email || 'guest'}`;

    // Datos basicos
    const [nombreClub, setNombreClub] = useState('');
    const [tipoInstitucion, setTipoInstitucion] = useState('');
    const [pais, setPais] = useState('');
    const [nombresResponsable, setNombresResponsable] = useState('');
    const [apellidosResponsable, setApellidosResponsable] = useState('');
    const [tiposInstitucion, setTiposInstitucion] = useState([]);
    const [paises, setPaises] = useState([]);
    const [guardando, setGuardando] = useState(false);
    const [cargando, setCargando] = useState(true);
    const [institucionId, setInstitucionId] = useState(null);

    // Logo
    const [logoBase64, setLogoBase64] = useState(null);
    const [fileLogo, setFileLogo] = useState(null);
    const [formatoLogo, setFormatoLogo] = useState('');

    // Sede Digital
    const [ruc, setRuc] = useState('');
    const [colores, setColores] = useState(['#000000', '#FFFFFF', '#FF0000']);
    const [historia, setHistoria] = useState('');

    // Color picker: abrir al añadir o al hacer clic en un cuadrado
    const colorPickerRef = useRef(null);
    const [openPickerForIndex, setOpenPickerForIndex] = useState(null);

    // Vigencia de poderes
    const [fileVigencia, setFileVigencia] = useState(null);
    const [formatoVigencia, setFormatoVigencia] = useState('');
    const [nombreVigencia, setNombreVigencia] = useState('');

    // Datos ampliados
    const [nombreCorto, setNombreCorto] = useState('');
    const [nombreLargo, setNombreLargo] = useState('');
    const [statusClub, setStatusClub] = useState('A'); // 'A' Aficionado / 'P' Profesional
    const [fbDistritoId, setFbDistritoId] = useState('');
    const [fbProvinciaId, setFbProvinciaId] = useState('');
    const [fbDepartamentoId, setFbDepartamentoId] = useState('');
    const [fechaFundacion, setFechaFundacion] = useState('');
    const [numeroPartidaSunarp, setNumeroPartidaSunarp] = useState('');
    const [archivoPartidaSunarp, setArchivoPartidaSunarp] = useState('');
    const [subiendoPartida, setSubiendoPartida] = useState(false);
    const [fechaInicioVigencia, setFechaInicioVigencia] = useState('');
    const [fechaFinVigencia, setFechaFinVigencia] = useState('');
    const [direccion, setDireccion] = useState('');
    const [correoClub, setCorreoClub] = useState('');

    // Cuentas bancarias (lista local)
    const [cuentas, setCuentas] = useState([]); // [{nombre_banco, numero_cuenta, numero_cuenta_interbancaria, moneda}]
    const [cuentaForm, setCuentaForm] = useState({ nombre_banco: '', numero_cuenta: '', numero_cuenta_interbancaria: '', moneda: 'PEN' });

    // Junta directiva (lista local)
    const [directivos, setDirectivos] = useState([]); // [{cargo_directivo, nombres, apellidos, dni, correo, telefono}]
    const [directivoForm, setDirectivoForm] = useState({ cargo_directivo: 'PRESIDENTE', nombres: '', apellidos: '', dni: '', correo: '', telefono: '' });

    // Logs en consola del navegador para debuggear creacion del club
    const dbgPush = (endpoint, status, msg = '') => {
        const tag = status === 'ok' ? '✅' : status === 'err' ? '❌' : '⏳';
        const fn = status === 'err' ? console.error : console.log;
        fn(`%c[CrearClub]%c ${tag} ${endpoint}`, 'background:#0e3769;color:#fbbf24;padding:2px 6px;border-radius:3px;font-weight:bold', 'color:inherit', msg);
    };

    // Carga el draft del localStorage al montar.
    // Sin auto-guardar en cada keystroke (eso causa lag).
    // Solo guarda al cambiar de paso (Siguiente/Anterior).
    const cargadoRef = useRef(false);
    useEffect(() => {
        if (cargadoRef.current || !draftKey) return;
        cargadoRef.current = true;
        try {
            const raw = localStorage.getItem(draftKey);
            if (!raw) return;
            const d = JSON.parse(raw);
            if (d.pasoActual) setPasoActual(d.pasoActual);
            if (d.nombreClub) setNombreClub(d.nombreClub);
            if (d.nombreCorto) setNombreCorto(d.nombreCorto);
            if (d.nombreLargo) setNombreLargo(d.nombreLargo);
            if (d.statusClub) setStatusClub(d.statusClub);
            if (d.fbDistritoId) setFbDistritoId(d.fbDistritoId);
            if (d.fbProvinciaId) setFbProvinciaId(d.fbProvinciaId);
            if (d.fbDepartamentoId) setFbDepartamentoId(d.fbDepartamentoId);
            if (d.fechaFundacion) setFechaFundacion(d.fechaFundacion);
            if (d.numeroPartidaSunarp) setNumeroPartidaSunarp(d.numeroPartidaSunarp);
            if (d.archivoPartidaSunarp) setArchivoPartidaSunarp(d.archivoPartidaSunarp);
            if (d.fechaInicioVigencia) setFechaInicioVigencia(d.fechaInicioVigencia);
            if (d.fechaFinVigencia) setFechaFinVigencia(d.fechaFinVigencia);
            if (d.direccion) setDireccion(d.direccion);
            if (d.correoClub) setCorreoClub(d.correoClub);
            if (d.ruc) setRuc(d.ruc);
            if (d.historia) setHistoria(d.historia);
            if (Array.isArray(d.colores) && d.colores.length) setColores(d.colores);
            if (Array.isArray(d.cuentas)) setCuentas(d.cuentas);
            if (Array.isArray(d.directivos)) setDirectivos(d.directivos);
        } catch { /* corrupto, ignorar */ }
    }, [draftKey]);

    // Guarda el draft con los valores actuales del state.
    const guardarDraft = (pasoOverride) => {
        if (!draftKey) return;
        try {
            const draft = {
                pasoActual: pasoOverride ?? pasoActual,
                nombreClub, nombreCorto, nombreLargo, statusClub,
                fbDistritoId, fbProvinciaId, fbDepartamentoId,
                fechaFundacion, numeroPartidaSunarp, archivoPartidaSunarp,
                fechaInicioVigencia, fechaFinVigencia,
                direccion, correoClub, ruc, historia,
                colores, cuentas, directivos,
            };
            localStorage.setItem(draftKey, JSON.stringify(draft));
        } catch { /* quota, ignorar */ }
    };

    const irSiguiente = () => {
        const nuevo = Math.min(pasoActual + 1, TOTAL_PASOS);
        guardarDraft(nuevo);
        setPasoActual(nuevo);
    };
    const irAnterior = () => {
        const nuevo = Math.max(pasoActual - 1, 1);
        guardarDraft(nuevo);
        setPasoActual(nuevo);
    };

    useEffect(() => {
        if (!Request) return;
        fetchData(Request, "tipo_institucion_list", [{ nombre: "dato", envio: 1 }])
            .then(data => setTiposInstitucion(data || []))
            .catch(() => {});
        fetchData(Request, "pais", [{ nombre: "dato", envio: 1 }])
            .then(data => setPaises(data || []))
            .catch(() => {});
    }, [Request]);

    // Pre-llenar responsable y correo del club desde la cuenta del usuario
    useEffect(() => {
        if (currentUser && currentUser.vit_jugador_id) {
            setNombresResponsable(currentUser.jugador_nombres || currentUser.nombre_jugador || '');
            setApellidosResponsable(currentUser.jugador_apellidos || '');
            // Correo del club = correo verificado de la cuenta (readonly, no editable)
            if (currentUser.email && !correoClub) {
                setCorreoClub(currentUser.email);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser]);

    // Pre-llenar desde clubData
    useEffect(() => {
        if (clubData) {
            setNombreClub(clubData.nombre_institucion || clubData.nombre || '');
            setTipoInstitucion(clubData.vit_tipo_institucion_id || '');
            setPais(clubData.fb_pais_id || '');
            setInstitucionId(clubData.vit_institucion_id);
            if (clubData.ruc) setRuc(clubData.ruc);
            if (clubData.historia) setHistoria(clubData.historia);
            if (clubData.colores_institucionales) {
                setColores(clubData.colores_institucionales.split(',').filter(Boolean));
            }
            if (clubData.nombres_responsable) setNombresResponsable(clubData.nombres_responsable);
            if (clubData.apellidos_responsable) setApellidosResponsable(clubData.apellidos_responsable);
            setCargando(false);
        }
    }, [clubData]);

    // Si clubData no llega, buscar directamente
    useEffect(() => {
        if (!clubData && currentUser?.vit_jugador_id) {
            const timer = setTimeout(() => {
                fetchData(Request, "institucion_usuario_get", [
                    { nombre: "vit_jugador_id", envio: currentUser.vit_jugador_id }
                ]).then(data => {
                    if (data && data[0]) {
                        setInstitucionId(data[0].vit_institucion_id);
                        setNombreClub(data[0].nombre_institucion || data[0].nombre || '');
                        setTipoInstitucion(data[0].vit_tipo_institucion_id || '');
                        setPais(data[0].fb_pais_id || '');
                    }
                }).catch(() => {}).finally(() => setCargando(false));
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [clubData, currentUser, Request]);

    // Abrir el selector de color al añadir uno nuevo
    useEffect(() => {
        if (openPickerForIndex === null) return;
        const t = setTimeout(() => {
            colorPickerRef.current?.click();
            setOpenPickerForIndex(null);
        }, 50);
        return () => clearTimeout(t);
    }, [openPickerForIndex]);

    // Color handlers
    const handleColorChange = (index, value) => {
        const updated = [...colores];
        updated[index] = value;
        setColores(updated);
    };
    const addColor = () => {
        if (colores.length >= 5) return;
        const newIndex = colores.length;
        setColores([...colores, '#000000']);
        setOpenPickerForIndex(newIndex);
    };
    const removeColor = (index) => { if (colores.length > 1) setColores(colores.filter((_, i) => i !== index)); };

    // Vigencia handler
    const idVigencia = institucionId || clubData?.vit_institucion_id || 0;
    const handleVigenciaFile = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.type.startsWith('video/')) {
            Alerta('error', 'No se permiten vídeos. Suba PDF o imagen (PNG, JPG, WebP).');
            e.target.value = '';
            return;
        }
        const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            Alerta('error', 'Formato no permitido. Use PDF o imagen (PNG, JPG, WebP).');
            e.target.value = '';
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            const dataUrl = reader.result;
            setFileVigencia(dataUrl);
            setNombreVigencia(file.name);
            const base64 = dataUrl.split(',')[1];
            const ext = file.type === 'application/pdf' ? 'pdf' : file.type.split('/')[1];
            setFormatoVigencia(`${idVigencia}-vigencia.${ext};${base64}`);
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    };
    const clearVigencia = () => { setFileVigencia(null); setFormatoVigencia(''); setNombreVigencia(''); };

    // Upload PDF SUNARP (sube via endpoint Java club_upload_partida_sunarp)
    const handlePartidaSunarpFile = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!institucionId && !clubData?.vit_institucion_id) {
            Alerta('error', 'Primero guarde los datos básicos del club');
            e.target.value = '';
            return;
        }
        if (file.type !== 'application/pdf') {
            Alerta('error', 'El archivo de Partida SUNARP debe ser un PDF');
            e.target.value = '';
            return;
        }
        const fd = new FormData();
        fd.append("vit_institucion_id", institucionId || clubData.vit_institucion_id);
        fd.append("archivo", file);
        setSubiendoPartida(true);
        axios({
            method: "post",
            url: `${Request.Dominio}/club_upload_partida_sunarp`,
            headers: {
                "userLogin": Request.userLogin,
                "userPassword": Request.userPassword,
                "systemRoot": Request.Empresa,
            },
            data: fd,
        }).then(res => {
            if (res.data?.success) {
                setArchivoPartidaSunarp(res.data.url || res.data.path);
                Alerta('success', 'PDF de Partida SUNARP cargado');
            } else {
                Alerta('error', res.data?.message || 'Error al subir el PDF');
            }
        }).catch(() => Alerta('error', 'Error de red al subir el PDF'))
          .finally(() => { setSubiendoPartida(false); e.target.value = ''; });
    };

    // Handlers de UBIGEO
    const handleUbigeo = (u) => {
        setFbDepartamentoId(u.fb_departamento_id || '');
        setFbProvinciaId(u.fb_provincia_id || '');
        setFbDistritoId(u.fb_distrito_id || '');
    };

    // Handlers de cuentas bancarias (lista local, se persiste al guardar)
    const agregarCuenta = () => {
        if (!cuentaForm.nombre_banco.trim()) { Alerta('warning', 'Falta el nombre del banco'); return; }
        if (!cuentaForm.numero_cuenta.trim()) { Alerta('warning', 'Falta el número de cuenta'); return; }
        if (!cuentaForm.numero_cuenta_interbancaria.trim()) { Alerta('warning', 'Falta el código interbancario (CCI)'); return; }
        if (!cuentaForm.moneda) { Alerta('warning', 'Selecciona la moneda'); return; }
        setCuentas(prev => [...prev, { ...cuentaForm }]);
        setCuentaForm({ nombre_banco: '', numero_cuenta: '', numero_cuenta_interbancaria: '', moneda: 'PEN' });
    };
    const quitarCuenta = (idx) => setCuentas(prev => prev.filter((_, i) => i !== idx));

    // Handlers de junta directiva: TODOS los 5 campos son obligatorios para agregar
    const agregarDirectivo = () => {
        if (!directivoForm.nombres.trim()) { Alerta('warning', 'Falta el nombre del directivo'); return; }
        if (!directivoForm.apellidos.trim()) { Alerta('warning', 'Falta el apellido del directivo'); return; }
        if (!directivoForm.dni.trim()) { Alerta('warning', 'Falta el DNI'); return; }
        if (directivoForm.dni.length !== 8) { Alerta('warning', 'El DNI debe tener exactamente 8 dígitos'); return; }
        if (!directivoForm.correo.trim()) { Alerta('warning', 'Falta el correo del directivo'); return; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(directivoForm.correo.trim())) {
            Alerta('warning', 'El correo del directivo no es válido');
            return;
        }
        if (!directivoForm.telefono.trim()) { Alerta('warning', 'Falta el teléfono del directivo'); return; }
        setDirectivos(prev => [...prev, { ...directivoForm }]);
        setDirectivoForm({ cargo_directivo: 'PRESIDENTE', nombres: '', apellidos: '', dni: '', correo: '', telefono: '' });
    };
    const quitarDirectivo = (idx) => setDirectivos(prev => prev.filter((_, i) => i !== idx));

    const handleGuardar = async () => {
        // Validaciones basicas
        if (!nombreClub.trim()) { Alerta('error', 'Ingrese el nombre del club'); return; }
        if (!tipoInstitucion) { Alerta('error', 'Seleccione el tipo de institución'); return; }
        if (!pais) { Alerta('error', 'Seleccione el país'); return; }
        const tieneLogo = (formatoLogo && String(formatoLogo).trim() !== '') || (clubData?.logo && String(clubData.logo).trim() !== '');
        if (!tieneLogo) { Alerta('error', 'El logo del club es obligatorio'); return; }
        if (!nombresResponsable.trim()) { Alerta('error', 'Ingrese los nombres del responsable'); return; }
        if (!apellidosResponsable.trim()) { Alerta('error', 'Ingrese los apellidos del responsable'); return; }
        // Validar RUC peruano: 11 digitos numericos (solo si se ingreso)
        if (ruc && ruc.trim() !== '' && !/^\d{11}$/.test(ruc.trim())) {
            Alerta('error', 'El RUC debe tener exactamente 11 dígitos numéricos');
            return;
        }
        // Validar correo del club si se ingreso
        if (correoClub && correoClub.trim() !== '') {
            // eslint-disable-next-line no-useless-escape
            const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoClub.trim());
            if (!ok) { Alerta('error', 'El correo del club no es válido'); return; }
        }
        // Validar rango de fechas de vigencia
        if (fechaInicioVigencia && fechaFinVigencia && fechaInicioVigencia > fechaFinVigencia) {
            Alerta('error', 'La fecha de inicio de vigencia no puede ser posterior a la fecha de fin');
            setPasoActual(3); // saltar al paso de Documentación
            return;
        }

        setGuardando(true);
        console.log('%c[CrearClub] === INICIO ===', 'background:#0e3769;color:#fbbf24;padding:4px 8px;font-weight:bold');

        // CRITICO: obtener vit_institucion_id ANTES de cualquier insert.
        // Si no esta en state, refrescar clubData primero. Sin id correcto,
        // las cuentas y directivos quedan huerfanos (vit_institucion_id=0).
        let instId = institucionId || clubData?.vit_institucion_id || 0;
        if (!instId && currentUser?.vit_jugador_id) {
            console.log('[CrearClub] sin institucionId, intentando recuperar...');
            try {
                const data = await fetchData(Request, "institucion_usuario_get", [
                    { nombre: "vit_jugador_id", envio: currentUser.vit_jugador_id }
                ]);
                if (data && data[0]?.vit_institucion_id) {
                    instId = data[0].vit_institucion_id;
                    setInstitucionId(instId);
                }
            } catch (e) {
                console.error('[CrearClub] no se pudo recuperar institucion_id', e);
            }
        }
        if (!instId || instId === 0) {
            Alerta('error', 'No se pudo identificar el club. Cierra sesión y vuelve a entrar.');
            console.error('[CrearClub] ABORT: institucionId invalido =', instId);
            setGuardando(false);
            return;
        }
        dbgPush('inicio', 'ok', `vit_institucion_id = ${instId}`);

        const llamar = async (endpoint, params) => {
            dbgPush(endpoint, 'pending', 'enviando...');
            try {
                const res = await fetchData(Request, endpoint, params);
                dbgPush(endpoint, 'ok', JSON.stringify(res?.[0] || res || 'sin data').slice(0, 120));
                return res;
            } catch (e) {
                dbgPush(endpoint, 'err', e?.message || 'fallo');
                throw e;
            }
        };

        try {
            // 1) Datos base + logo
            await llamar("club_perfil_upd", [
                { nombre: "vit_institucion_id", envio: instId },
                { nombre: "nombre", envio: nombreClub },
                { nombre: "vit_tipo_institucion_id", envio: tipoInstitucion },
                { nombre: "fb_pais_id", envio: pais },
                { nombre: "logo", envio: formatoLogo },
                { nombre: "vit_jugador_id", envio: currentUser?.vit_jugador_id || 0 },
                { nombre: "nombres_responsable", envio: nombresResponsable },
                { nombre: "apellidos_responsable", envio: apellidosResponsable }
            ]);
            // 2) Sede Digital
            await llamar("club_sede_digital_upd", [
                { nombre: "vit_institucion_id", envio: instId },
                { nombre: "ruc", envio: ruc },
                { nombre: "vigencia_poderes", envio: formatoVigencia },
                { nombre: "colores_institucionales", envio: colores.join(',') },
                { nombre: "historia", envio: historia }
            ]);
            // 3) Datos ampliados
            try {
                await llamar("club_datos_basicos_upd", [
                    { nombre: "vit_institucion_id", envio: instId },
                    { nombre: "nombre_corto", envio: nombreCorto || '' },
                    { nombre: "nombre_largo", envio: nombreLargo || nombreClub || '' },
                    { nombre: "status_club", envio: statusClub || '' },
                    { nombre: "fb_distrito_id", envio: fbDistritoId || 0 },
                    { nombre: "fecha_fundacion", envio: fechaFundacion || '' },
                    { nombre: "numero_partida_sunarp", envio: numeroPartidaSunarp || '' },
                    { nombre: "archivo_partida_sunarp", envio: archivoPartidaSunarp || '' },
                    { nombre: "fecha_inicio_vigencia", envio: fechaInicioVigencia || '' },
                    { nombre: "fecha_fin_vigencia", envio: fechaFinVigencia || '' },
                    { nombre: "ruc", envio: ruc || '' },
                    { nombre: "direccion", envio: direccion || '' },
                    { nombre: "correo_club", envio: correoClub || '' }
                ]);
            } catch { /* continuar */ }
            // 4 y 5) Cuentas + Directivos EN PARALELO para acelerar
            console.log(`[CrearClub] guardando ${cuentas.length} cuentas y ${directivos.length} directivos en paralelo...`);
            const promesas = [];
            cuentas.forEach((cta, i) => {
                promesas.push(
                    llamar(`club_cuenta_bancaria_ins[${i + 1}/${cuentas.length}]`, [
                        { nombre: "vit_institucion_id", envio: instId },
                        { nombre: "nombre_banco", envio: cta.nombre_banco },
                        { nombre: "numero_cuenta", envio: cta.numero_cuenta },
                        { nombre: "numero_cuenta_interbancaria", envio: cta.numero_cuenta_interbancaria || '' },
                        { nombre: "moneda", envio: cta.moneda || 'PEN' }
                    ]).catch(e => console.error('cuenta fallo:', e))
                );
            });
            directivos.forEach((d, i) => {
                promesas.push(
                    llamar(`club_directivo_ins[${i + 1}/${directivos.length}]`, [
                        { nombre: "vit_institucion_id", envio: instId },
                        { nombre: "cargo_directivo", envio: d.cargo_directivo },
                        { nombre: "nombres", envio: d.nombres },
                        { nombre: "apellidos", envio: d.apellidos },
                        { nombre: "dni", envio: d.dni || '' },
                        { nombre: "correo", envio: d.correo || '' },
                        { nombre: "telefono", envio: d.telefono || '' },
                        { nombre: "fecha_inicio_cargo", envio: '' },
                        { nombre: "fecha_fin_cargo", envio: '' }
                    ]).catch(e => console.error('directivo fallo:', e))
                );
            });
            // ESPERAR a que TODAS terminen antes de redirigir
            await Promise.all(promesas);
            console.log('[CrearClub] todas las cuentas y directivos guardadas');
            try { localStorage.removeItem(draftKey); } catch {}
            console.log('%c[CrearClub] === FIN OK ===', 'background:#22c55e;color:#fff;padding:4px 8px;font-weight:bold');
            Alerta('success', 'Club creado correctamente');
            // Actualizar state global Y esperar para que el reload encuentre todo en BD
            if (!perfilCompletado) marcarPerfilCompletado();
            if (currentUser?.vit_jugador_id) fetchClubData(currentUser.vit_jugador_id);
            setTimeout(() => {
                window.location.href = window.location.origin + '/#/inicio';
                window.location.reload();
            }, 1500);
        } catch {
            Alerta('error', 'Ocurrió un error al guardar');
        } finally {
            setGuardando(false);
        }
    };

    const handleCerrarSesion = () => { logOut(); navigate('/login'); };

    const headerAction = currentUser ? (
        <div className="dropdown completar-perfil-dropdown">
            <button type="button" className="div-avatar completar-perfil-avatar" data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-haspopup="true" aria-expanded="false" data-bs-offset="0,8">
                <div className="avatar avatar-circle avatar-sm avatar-online">
                    <img src={currentUser.foto_perfil ? currentUser.foto_perfil + "?random=" + RandomNumberImg : user_logo} alt="" className="rounded-circle" width="40" height="40" />
                </div>
            </button>
            <div className="dropdown-menu dropdown-menu-end bg-dark" data-popper-placement="bottom-end">
                <div className="dropdown-item-text">
                    <div className="d-flex align-items-center">
                        <div className="avatar">
                            <img src={currentUser.foto_perfil ? currentUser.foto_perfil + "?random=" + RandomNumberImg : user_logo} alt="" className="rounded-circle" width="40" height="40" />
                        </div>
                        <div className="flex-grow-1 ms-3">
                            <h4 className="mb-0 card-name text-truncate">{currentUser.nombre_jugador}</h4>
                            <p className="card-text text-truncate">{currentUser.usuario}</p>
                        </div>
                    </div>
                </div>
                <hr className="dropdown-divider" />
                <button type="button" className="dropdown-item" onClick={handleCerrarSesion}><i className="fa-solid icon-cerrar1"></i> Cerrar sesión</button>
            </div>
        </div>
    ) : null;

    // Logo: ignorar lo que venga del back (URLs relativas que el front no puede resolver).
    // Solo usar lo que el usuario sube en esta sesion (fileLogo).
    // Si no hay, mostrar la imagen default (user_logo).
    const logoUrl = fileLogo;

    // Nombre del tipo de institución para mostrar en readonly
    const nombreTipoInstitucion = tiposInstitucion.find(
        ti => String(ti.vit_tipo_institucion_id) === String(tipoInstitucion)
    )?.vit_tipo_institucion_nombre || clubData?.tipo_institucion || '';

    const nombrePais = paises.find(
        p => String(p.pais_id ?? p.fb_pais_id) === String(pais)
    )?.pais_nombre || paises.find(
        p => String(p.pais_id ?? p.fb_pais_id) === String(pais)
    )?.nombre || clubData?.nombre_pais || '';

    return (
        <div className='div-main div-completar-perfil'>
            <header className="completar-perfil-club__header">
                <CompletarPerfilHeader
                    titulo={perfilCompletado ? "Mi Club" : "Crear Club"}
                    headerAction={headerAction}
                />
            </header>
            <div className="completar-perfil-club__wrap">
                <p className="completar-perfil-club__subtitle">Complete los datos de su institución</p>

                <div className="completar-perfil-club__card">
                    {cargando ? (
                        <div className="completar-perfil-club__loading">
                            <div className="completar-perfil-club__spinner" role="status" aria-label="Cargando">
                                <i className="fa-solid fa-circle-notch fa-spin"></i>
                            </div>
                            <p className="completar-perfil-club__loading-text">Cargando datos del club...</p>
                        </div>
                    ) : (
                        <form className="completar-perfil-club__form"
                            onSubmit={(e) => { e.preventDefault(); }}
                            onKeyDown={(e) => {
                                // BLOQUEO TOTAL de Enter excepto en textarea.
                                // El "Crear Club" solo se dispara al hacer CLICK en el boton.
                                if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
                                    e.preventDefault();
                                    e.stopPropagation();
                                }
                            }}>
                            {/* Indicador de progreso wizard */}
                            <div className="wizard-progress" style={{ marginBottom: 24 }}>
                                <div className="wizard-progress__bar" style={{
                                    height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 999, overflow: 'hidden',
                                }}>
                                    <div style={{
                                        height: '100%',
                                        width: `${(pasoActual / TOTAL_PASOS) * 100}%`,
                                        background: 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)',
                                        borderRadius: 999,
                                        transition: 'width .3s ease',
                                    }} />
                                </div>
                                <div className="wizard-progress__steps d-flex justify-content-between flex-wrap mt-2" style={{ gap: 4 }}>
                                    {TITULOS_PASOS.map((t, i) => {
                                        const n = i + 1;
                                        const active = pasoActual === n;
                                        const done = pasoActual > n;
                                        return (
                                            <button
                                                key={t} type="button"
                                                onClick={() => setPasoActual(n)}
                                                className="d-flex align-items-center gap-2"
                                                style={{
                                                    background: 'transparent',
                                                    border: 'none',
                                                    color: active ? '#fbbf24' : done ? '#fff' : 'rgba(255,255,255,0.5)',
                                                    fontSize: 13,
                                                    fontWeight: active ? 700 : 500,
                                                    cursor: 'pointer',
                                                    padding: '4px 6px',
                                                }}
                                                title={`Paso ${n}: ${t}`}
                                            >
                                                <span style={{
                                                    width: 24, height: 24, borderRadius: '50%',
                                                    background: active ? '#fbbf24' : done ? '#22c55e' : 'rgba(255,255,255,0.15)',
                                                    color: active || done ? '#0e3769' : '#fff',
                                                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                                    fontWeight: 700, fontSize: 12,
                                                }}>{done ? <i className="fa-solid fa-check" /> : n}</span>
                                                <span className="d-none d-sm-inline">{t}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* PASO 1: Identidad */}
                            {pasoActual === 1 && (
                            <>
                            <div className="completar-perfil-club__form-cols">
                                <div className="completar-perfil-club__form-col">
                                    <div className="completar-perfil-club__section-title">
                                        <i className="fa-solid fa-building"></i> Datos del Club
                                    </div>

                                    {/* Logo */}
                                    <div className="completar-perfil-club__logo-section" style={{ textAlign: 'center' }}>
                                        <div
                                            className="completar-perfil-club__logo-container"
                                            data-bs-toggle="modal" data-bs-target={camposEditables ? "#FLogo" : undefined}
                                            style={{
                                                position: 'relative',
                                                width: 140, height: 140, borderRadius: 16,
                                                margin: '0 auto 12px',
                                                background: (fileLogo || logoUrl) ? 'transparent' : 'rgba(255,255,255,0.08)',
                                                border: '2px dashed rgba(251,191,36,0.5)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                overflow: 'hidden', cursor: camposEditables ? 'pointer' : 'default',
                                                transition: 'all .2s',
                                            }}
                                            title={camposEditables ? 'Click para subir logo' : ''}
                                        >
                                            <img
                                                src={fileLogo || logoUrl || user_logo}
                                                alt="Logo del club"
                                                className="completar-perfil-club__logo-img"
                                                style={{
                                                    width: '100%', height: '100%', objectFit: 'cover',
                                                    opacity: (fileLogo || logoUrl) ? 1 : 0.6,
                                                }}
                                            />
                                            {!(fileLogo || logoUrl) && (
                                                <div style={{
                                                    position: 'absolute', inset: 0,
                                                    background: 'linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(14,55,105,0.85) 100%)',
                                                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end',
                                                    color: '#fbbf24', padding: '0 0 10px 0',
                                                    textAlign: 'center', pointerEvents: 'none',
                                                }}>
                                                    <i className="fa-solid fa-camera" style={{ fontSize: 20, marginBottom: 2 }}></i>
                                                    <small style={{ fontWeight: 700 }}>Subir logo</small>
                                                </div>
                                            )}
                                            {camposEditables && (fileLogo || logoUrl) && (
                                                <span
                                                    className="completar-perfil-club__logo-btn"
                                                    style={{
                                                        position: 'absolute', bottom: 6, right: 6,
                                                        width: 32, height: 32, borderRadius: '50%',
                                                        background: '#fbbf24', color: '#0e3769',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    }}
                                                >
                                                    <i className="fa-solid fa-camera"></i>
                                                </span>
                                            )}
                                        </div>
                                        <span className="completar-perfil-club__logo-label" style={{ display: 'block', color: '#fff', fontWeight: 600 }}>
                                            Logo del Club *
                                        </span>
                                    </div>

                                    <div className="completar-perfil-club__field">
                                        <label className="completar-perfil-club__label">Nombre del Club / Academia (Nombre Largo) *</label>
                                        <input type="text" className="completar-perfil-club__input" value={nombreClub}
                                            onChange={e => { setNombreClub(e.target.value); setNombreLargo(e.target.value); }}
                                            disabled={!camposEditables}
                                            placeholder="Ej: Club Deportivo Los Halcones" autoComplete="organization" />
                                    </div>
                                    <div className="completar-perfil-club__field">
                                        <label className="completar-perfil-club__label">Nombre Corto</label>
                                        <input type="text" className="completar-perfil-club__input"
                                            maxLength={60} value={nombreCorto}
                                            onChange={e => setNombreCorto(e.target.value)} disabled={!camposEditables}
                                            placeholder="Ej: Los Halcones" autoComplete="off" />
                                    </div>

                                    <div className="completar-perfil-club__row">
                                        <div className="completar-perfil-club__field completar-perfil-club__field--half">
                                            <label className="completar-perfil-club__label">Tipo de Institución *</label>
                                            {camposEditables ? (
                                                <select className="completar-perfil-club__select" value={tipoInstitucion}
                                                    onChange={e => setTipoInstitucion(e.target.value)}>
                                                    <option value="">Seleccionar...</option>
                                                    {tiposInstitucion.map(ti => (
                                                        <option key={ti.vit_tipo_institucion_id} value={ti.vit_tipo_institucion_id}>
                                                            {ti.vit_tipo_institucion_nombre}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <input type="text" className="completar-perfil-club__input" value={nombreTipoInstitucion} disabled />
                                            )}
                                        </div>
                                        <div className="completar-perfil-club__field completar-perfil-club__field--half">
                                            <label className="completar-perfil-club__label">País *</label>
                                            {camposEditables ? (
                                                <select className="completar-perfil-club__select" value={pais}
                                                    onChange={e => setPais(e.target.value)}>
                                                    <option value="">Seleccionar...</option>
                                                    {paises.map(p => (
                                                        <option key={p.pais_id ?? p.fb_pais_id} value={p.pais_id ?? p.fb_pais_id}>
                                                            {p.pais_nombre ?? p.nombre}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <input type="text" className="completar-perfil-club__input" value={nombrePais} disabled />
                                            )}
                                        </div>
                                    </div>

                                    <div className="completar-perfil-club__row">
                                        <div className="completar-perfil-club__field completar-perfil-club__field--half">
                                            <label className="completar-perfil-club__label">
                                                Nombres del Responsable
                                                <small style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: 400 }}>
                                                    Autocompletado con tus datos de cuenta
                                                </small>
                                            </label>
                                            <input type="text" className="completar-perfil-club__input" value={nombresResponsable}
                                                readOnly disabled
                                                style={{ opacity: 0.7, cursor: 'not-allowed' }} />
                                        </div>
                                        <div className="completar-perfil-club__field completar-perfil-club__field--half">
                                            <label className="completar-perfil-club__label">
                                                Apellidos del Responsable
                                                <small style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: 400 }}>
                                                    Autocompletado con tus datos de cuenta
                                                </small>
                                            </label>
                                            <input type="text" className="completar-perfil-club__input" value={apellidosResponsable}
                                                readOnly disabled
                                                style={{ opacity: 0.7, cursor: 'not-allowed' }} />
                                        </div>
                                    </div>
                                </div>

                                {/* Columna 2: Sede Digital + Identidad */}
                                <div className="completar-perfil-club__form-col">
                                    <div className="completar-perfil-club__divider"></div>

                                    <div className="completar-perfil-club__section-title">
                                        <i className="fa-solid fa-file-certificate"></i> Sede Digital - Acreditación
                                    </div>

                                    <div className="completar-perfil-club__row completar-perfil-club__row--stacked">
                                        <div className="completar-perfil-club__field completar-perfil-club__field--full">
                                            <label className="completar-perfil-club__label">RUC</label>
                                            <input type="text" inputMode="numeric" className="completar-perfil-club__input"
                                                value={ruc}
                                                onChange={e => setRuc(e.target.value.replace(/\D/g, '').slice(0, 11))}
                                                disabled={!camposEditables}
                                                placeholder="11 dígitos (Ej: 20123456789)"
                                                maxLength={11} />
                                        </div>
                                        <div className="completar-perfil-club__field completar-perfil-club__field--full">
                                            <label className="completar-perfil-club__label">Vigencia de Poderes</label>
                                            {camposEditables ? (
                                                <>
                                                    <input type="file" id="vigencia-poderes"
                                                        style={{ display: 'none' }}
                                                        accept=".pdf,image/png,image/jpeg,image/jpg,image/webp"
                                                        onChange={handleVigenciaFile} />
                                                    <label htmlFor="vigencia-poderes"
                                                        style={{
                                                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                                            width: '100%', minHeight: 140, borderRadius: 12,
                                                            border: '2px dashed rgba(251,191,36,0.5)',
                                                            background: fileVigencia ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.08)',
                                                            color: '#fbbf24', cursor: 'pointer', padding: 16,
                                                            position: 'relative', overflow: 'hidden',
                                                            transition: 'all .2s',
                                                        }}
                                                        title={fileVigencia ? 'Click para cambiar documento' : 'Click para subir documento'}>
                                                        {fileVigencia ? (
                                                            fileVigencia.startsWith('data:image/') ? (
                                                                <img src={fileVigencia} alt="Vigencia"
                                                                    style={{ maxHeight: 120, maxWidth: '100%', borderRadius: 8, objectFit: 'contain' }} />
                                                            ) : (
                                                                <div style={{ textAlign: 'center', color: '#fff' }}>
                                                                    <i className="fa-solid fa-file-pdf" style={{ fontSize: 40, color: '#fbbf24', display: 'block', marginBottom: 8 }}></i>
                                                                    <small style={{ display: 'block', wordBreak: 'break-all' }}>{nombreVigencia || 'Documento PDF'}</small>
                                                                </div>
                                                            )
                                                        ) : (
                                                            <div style={{ textAlign: 'center' }}>
                                                                <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: 32, display: 'block', marginBottom: 6 }}></i>
                                                                <strong>Subir PDF o imagen</strong>
                                                                <small style={{ display: 'block', color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>
                                                                    PDF, PNG, JPG (no vídeos)
                                                                </small>
                                                            </div>
                                                        )}
                                                    </label>
                                                    {fileVigencia && (
                                                        <button type="button" onClick={clearVigencia}
                                                            style={{
                                                                marginTop: 8, background: 'transparent',
                                                                border: '1px solid rgba(255,255,255,0.2)', color: '#fff',
                                                                borderRadius: 6, padding: '4px 12px', fontSize: 12, cursor: 'pointer',
                                                            }}>
                                                            <i className="fa-solid fa-times me-1"></i> Quitar documento
                                                        </button>
                                                    )}
                                                </>
                                            ) : (
                                                <input type="text" className="completar-perfil-club__input"
                                                    value={clubData?.vigencia_poderes ? 'Documento enviado' : 'No enviado'} disabled />
                                            )}
                                        </div>
                                    </div>

                                    <div className="completar-perfil-club__divider"></div>
                                    <div className="completar-perfil-club__section-title">
                                        <i className="fa-solid fa-palette"></i> Identidad Visual
                                    </div>

                                    <div className="completar-perfil-club__field">
                                        <label className="completar-perfil-club__label">Colores Institucionales</label>
                                        <div className="completar-perfil-club__colors-row">
                                            {colores.map((color, i) => (
                                                <div key={i} className="completar-perfil-club__color-item">
                                                    <label className="completar-perfil-club__color-swatch-wrap" title="Clic para cambiar color">
                                                        <input
                                                            type="color"
                                                            value={color}
                                                            onChange={e => handleColorChange(i, e.target.value)}
                                                            className="completar-perfil-club__color-input"
                                                            disabled={!camposEditables}
                                                            ref={openPickerForIndex === i ? colorPickerRef : undefined}
                                                            aria-label={`Color ${i + 1}`}
                                                        />
                                                        <span className="completar-perfil-club__color-swatch" style={{ backgroundColor: color }} />
                                                    </label>
                                                    {camposEditables && colores.length > 1 && (
                                                        <button type="button" className="completar-perfil-club__color-remove" onClick={() => removeColor(i)} title="Quitar color">
                                                            <i className="fa-solid fa-times"></i>
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                            {camposEditables && colores.length < 5 && (
                                                <button type="button" className="completar-perfil-club__color-add" onClick={addColor} title="Añadir color">
                                                    <i className="fa-solid fa-plus"></i>
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="completar-perfil-club__field">
                                        <label className="completar-perfil-club__label">Historia del Club</label>
                                        <textarea className="completar-perfil-club__textarea" rows={4} value={historia}
                                            onChange={e => setHistoria(e.target.value)} disabled={!camposEditables}
                                            placeholder="Describe la historia, logros y trayectoria del club..." />
                                    </div>
                                </div>
                            </div>

                            <div className="row g-3 mt-2">
                                <div className="col-12 col-md-6">
                                    <label className="completar-perfil-club__label">Status</label>
                                    <div className="d-flex gap-3 mt-1" style={{ color: '#fff' }}>
                                        <label><input type="radio" name="statusclub" value="A"
                                            checked={statusClub === 'A'} disabled={!camposEditables}
                                            onChange={() => setStatusClub('A')} /> Aficionado</label>
                                        <label><input type="radio" name="statusclub" value="P"
                                            checked={statusClub === 'P'} disabled={!camposEditables}
                                            onChange={() => setStatusClub('P')} /> Profesional</label>
                                    </div>
                                </div>
                                <div className="col-12 col-md-6">
                                    <label className="completar-perfil-club__label">Fecha de Fundación</label>
                                    <input type="date" className="completar-perfil-club__input"
                                        value={fechaFundacion} disabled={!camposEditables}
                                        max={new Date().toISOString().slice(0, 10)}
                                        onChange={e => {
                                            const v = e.target.value;
                                            const hoy = new Date().toISOString().slice(0, 10);
                                            if (v && v > hoy) {
                                                Alerta('warning', 'La fecha de fundación no puede ser posterior al día de hoy');
                                                return;
                                            }
                                            setFechaFundacion(v);
                                        }} />
                                </div>
                            </div>
                            </>
                            )}

                            {/* PASO 2: Ubicación + Contacto */}
                            {pasoActual === 2 && (
                            <div>
                                <div className="completar-perfil-club__section-title">
                                    <i className="fa-solid fa-map-location-dot"></i> Ubicación y Contacto
                                </div>
                                <div className="row g-3">
                                    <div className="col-12">
                                        <label className="completar-perfil-club__label">Ubicación (Departamento / Provincia / Distrito)</label>
                                        <UbigeoSelector
                                            value={{ fb_departamento_id: fbDepartamentoId, fb_provincia_id: fbProvinciaId, fb_distrito_id: fbDistritoId }}
                                            onChange={handleUbigeo}
                                            disabled={!camposEditables}
                                        />
                                    </div>
                                    <div className="col-12">
                                        <label className="completar-perfil-club__label">Dirección del Club</label>
                                        <input type="text" className="completar-perfil-club__input"
                                            maxLength={300} value={direccion}
                                            onChange={e => setDireccion(e.target.value)} disabled={!camposEditables}
                                            placeholder="Av. Principal 123, urbanización..." />
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <label className="completar-perfil-club__label">
                                            Correo del Club
                                            <small style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: 400 }}>
                                                Correo verificado de la cuenta
                                            </small>
                                        </label>
                                        <input type="email" className="completar-perfil-club__input"
                                            value={correoClub}
                                            readOnly disabled
                                            style={{ opacity: 0.7, cursor: 'not-allowed' }} />
                                    </div>
                                </div>
                            </div>
                            )}

                            {/* PASO 3: Documentación legal */}
                            {pasoActual === 3 && (
                            <div>
                                <div className="completar-perfil-club__section-title">
                                    <i className="fa-solid fa-file-shield"></i> Documentación Legal
                                </div>
                                <div className="row g-3">
                                    <div className="col-12 col-md-6">
                                        <label className="completar-perfil-club__label">N° Partida SUNARP</label>
                                        <input type="text" className="completar-perfil-club__input"
                                            maxLength={60} value={numeroPartidaSunarp}
                                            onChange={e => setNumeroPartidaSunarp(e.target.value)} disabled={!camposEditables}
                                            placeholder="Ej: 12345678" />
                                    </div>
                                    <div className="col-12">
                                        <label className="completar-perfil-club__label">PDF de la Partida SUNARP</label>
                                        <input type="file" id="partida-sunarp-pdf"
                                            accept="application/pdf"
                                            style={{ display: 'none' }}
                                            disabled={!camposEditables || subiendoPartida}
                                            onChange={handlePartidaSunarpFile} />
                                        <label htmlFor="partida-sunarp-pdf"
                                            style={{
                                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                                width: '100%', minHeight: 140, borderRadius: 12,
                                                border: '2px dashed rgba(251,191,36,0.5)',
                                                background: archivoPartidaSunarp ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.08)',
                                                color: '#fbbf24', cursor: camposEditables ? 'pointer' : 'not-allowed',
                                                padding: 16, transition: 'all .2s',
                                                opacity: subiendoPartida ? 0.6 : 1,
                                            }}
                                            title={archivoPartidaSunarp ? 'Click para cambiar PDF' : 'Click para subir PDF'}>
                                            {subiendoPartida ? (
                                                <div style={{ textAlign: 'center' }}>
                                                    <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: 32, display: 'block', marginBottom: 6 }}></i>
                                                    <small>Subiendo PDF...</small>
                                                </div>
                                            ) : archivoPartidaSunarp ? (
                                                <div style={{ textAlign: 'center', color: '#fff' }}>
                                                    <i className="fa-solid fa-file-pdf" style={{ fontSize: 44, color: '#22c55e', display: 'block', marginBottom: 6 }}></i>
                                                    <strong style={{ color: '#22c55e' }}>PDF cargado correctamente</strong>
                                                    <small style={{ display: 'block', wordBreak: 'break-all', marginTop: 4, color: 'rgba(255,255,255,0.7)' }}>
                                                        {archivoPartidaSunarp.split('/').pop()}
                                                    </small>
                                                    <small style={{ display: 'inline-block', marginTop: 6, color: '#fbbf24' }}>
                                                        <i className="fa-solid fa-arrows-rotate me-1"></i> Click para cambiar
                                                    </small>
                                                </div>
                                            ) : (
                                                <div style={{ textAlign: 'center' }}>
                                                    <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: 32, display: 'block', marginBottom: 6 }}></i>
                                                    <strong>Subir PDF de la Partida</strong>
                                                    <small style={{ display: 'block', color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>
                                                        Solo formato PDF
                                                    </small>
                                                </div>
                                            )}
                                        </label>
                                        {archivoPartidaSunarp && !subiendoPartida && (
                                            <button type="button"
                                                onClick={() => setArchivoPartidaSunarp('')}
                                                style={{
                                                    marginTop: 8, background: 'transparent',
                                                    border: '1px solid rgba(255,255,255,0.2)', color: '#fff',
                                                    borderRadius: 6, padding: '4px 12px', fontSize: 12, cursor: 'pointer',
                                                }}>
                                                <i className="fa-solid fa-times me-1"></i> Quitar PDF
                                            </button>
                                        )}
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <label className="completar-perfil-club__label">Fecha Inicio de Vigencia</label>
                                        <input type="date" className="completar-perfil-club__input"
                                            value={fechaInicioVigencia} disabled={!camposEditables}
                                            max={fechaFinVigencia || undefined}
                                            onChange={e => {
                                                const v = e.target.value;
                                                if (fechaFinVigencia && v && v > fechaFinVigencia) {
                                                    Alerta('warning', 'La fecha de inicio no puede ser posterior a la fecha de fin');
                                                    return;
                                                }
                                                setFechaInicioVigencia(v);
                                            }} />
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <label className="completar-perfil-club__label">Fecha Fin de Vigencia</label>
                                        <input type="date" className="completar-perfil-club__input"
                                            value={fechaFinVigencia} disabled={!camposEditables}
                                            min={fechaInicioVigencia || undefined}
                                            onChange={e => {
                                                const v = e.target.value;
                                                if (fechaInicioVigencia && v && v < fechaInicioVigencia) {
                                                    Alerta('warning', 'La fecha de fin no puede ser anterior a la fecha de inicio');
                                                    return;
                                                }
                                                setFechaFinVigencia(v);
                                            }} />
                                    </div>
                                </div>
                            </div>
                            )}

                            {/* PASO 4: Cuentas + Directiva */}
                            {pasoActual === 4 && (
                            <div>

                            {/* ====== CUENTAS BANCARIAS ====== */}
                            <div className="completar-perfil-club__divider"></div>
                            <div className="completar-perfil-club__section-title">
                                <i className="fa-solid fa-piggy-bank"></i> Cuentas Bancarias
                            </div>
                            <div className="row g-2">
                                <div className="col-12 col-md-6">
                                    <input className="completar-perfil-club__input" placeholder="Banco *"
                                        value={cuentaForm.nombre_banco}
                                        disabled={!camposEditables}
                                        onChange={e => setCuentaForm({ ...cuentaForm, nombre_banco: e.target.value })} />
                                </div>
                                <div className="col-12 col-md-6">
                                    <input className="completar-perfil-club__input" placeholder="N° de cuenta *"
                                        value={cuentaForm.numero_cuenta}
                                        disabled={!camposEditables}
                                        onChange={e => setCuentaForm({ ...cuentaForm, numero_cuenta: e.target.value })} />
                                </div>
                                <div className="col-12 col-md-8">
                                    <input className="completar-perfil-club__input" placeholder="Interbancaria CCI *"
                                        value={cuentaForm.numero_cuenta_interbancaria}
                                        disabled={!camposEditables}
                                        onChange={e => setCuentaForm({ ...cuentaForm, numero_cuenta_interbancaria: e.target.value })} />
                                </div>
                                <div className="col-12 col-md-4">
                                    <select className="completar-perfil-club__select"
                                        value={cuentaForm.moneda}
                                        disabled={!camposEditables}
                                        onChange={e => setCuentaForm({ ...cuentaForm, moneda: e.target.value })}>
                                        <option value="PEN">PEN</option>
                                        <option value="USD">USD</option>
                                    </select>
                                </div>
                                <div className="col-12">
                                    <button type="button" className="completar-perfil-club__submit"
                                        disabled={!camposEditables}
                                        style={{ width: '100%', padding: '0.6rem' }}
                                        onClick={agregarCuenta}>
                                        <i className="fa-solid fa-plus me-1"></i> Agregar cuenta bancaria
                                    </button>
                                </div>
                            </div>
                            {cuentas.length > 0 && (
                                <ul className="mt-3" style={{ color: '#fff', listStyle: 'none', padding: 0, margin: 0 }}>
                                    {cuentas.map((c, i) => (
                                        <li key={i} style={{
                                            background: 'rgba(255,255,255,0.06)',
                                            padding: '10px 12px',
                                            borderRadius: 8,
                                            marginBottom: 8,
                                            display: 'grid',
                                            gridTemplateColumns: 'auto 1fr auto',
                                            gap: 10,
                                            alignItems: 'center',
                                        }}>
                                            <div style={{
                                                background: 'rgba(34,197,94,0.2)',
                                                color: '#22c55e',
                                                padding: '4px 10px',
                                                borderRadius: 6,
                                                fontSize: 11,
                                                fontWeight: 700,
                                                whiteSpace: 'nowrap',
                                            }}>{c.moneda}</div>
                                            <div style={{ minWidth: 0, overflow: 'hidden' }}>
                                                <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {c.nombre_banco}
                                                </div>
                                                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    Cta {c.numero_cuenta}
                                                    {c.numero_cuenta_interbancaria && <> · CCI {c.numero_cuenta_interbancaria}</>}
                                                </div>
                                            </div>
                                            <button type="button"
                                                onClick={() => quitarCuenta(i)}
                                                style={{
                                                    background: 'transparent', border: 'none',
                                                    color: '#ef4444', cursor: 'pointer', fontSize: 18,
                                                    width: 32, height: 32, borderRadius: 6,
                                                }}
                                                title="Quitar"
                                            >
                                                <i className="fa-solid fa-times"></i>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {/* ====== JUNTA DIRECTIVA ====== */}
                            <div className="completar-perfil-club__divider"></div>
                            <div className="completar-perfil-club__section-title">
                                <i className="fa-solid fa-people-roof"></i> Junta Directiva y Administrativos
                            </div>
                            <div className="row g-2">
                                <div className="col-12 col-md-4">
                                    <select className="completar-perfil-club__select"
                                        value={directivoForm.cargo_directivo}
                                        disabled={!camposEditables}
                                        onChange={e => setDirectivoForm({ ...directivoForm, cargo_directivo: e.target.value })}>
                                        {CARGOS_DIRECTIVOS.map(cg => <option key={cg} value={cg}>{cg}</option>)}
                                    </select>
                                </div>
                                <div className="col-12 col-md-4">
                                    <input className="completar-perfil-club__input" placeholder="Nombres *"
                                        value={directivoForm.nombres}
                                        disabled={!camposEditables}
                                        onChange={e => setDirectivoForm({ ...directivoForm, nombres: e.target.value })} />
                                </div>
                                <div className="col-12 col-md-4">
                                    <input className="completar-perfil-club__input" placeholder="Apellidos *"
                                        value={directivoForm.apellidos}
                                        disabled={!camposEditables}
                                        onChange={e => setDirectivoForm({ ...directivoForm, apellidos: e.target.value })} />
                                </div>
                                <div className="col-12 col-md-4">
                                    <input className="completar-perfil-club__input" placeholder="DNI (8 dígitos) *"
                                        inputMode="numeric"
                                        maxLength={8}
                                        value={directivoForm.dni}
                                        disabled={!camposEditables}
                                        onChange={e => setDirectivoForm({ ...directivoForm, dni: e.target.value.replace(/\D/g, '').slice(0, 8) })} />
                                </div>
                                <div className="col-12 col-md-4">
                                    <input type="email" className="completar-perfil-club__input" placeholder="Correo *"
                                        value={directivoForm.correo}
                                        disabled={!camposEditables}
                                        onChange={e => setDirectivoForm({ ...directivoForm, correo: e.target.value })} />
                                </div>
                                <div className="col-12 col-md-4">
                                    <input className="completar-perfil-club__input" placeholder="Teléfono *"
                                        inputMode="tel"
                                        value={directivoForm.telefono}
                                        disabled={!camposEditables}
                                        onChange={e => setDirectivoForm({ ...directivoForm, telefono: e.target.value })} />
                                </div>
                                <div className="col-12">
                                    <button type="button" className="completar-perfil-club__submit"
                                        disabled={!camposEditables}
                                        style={{ width: '100%', padding: '0.6rem' }}
                                        onClick={agregarDirectivo}>
                                        <i className="fa-solid fa-plus me-1"></i> Agregar directivo
                                    </button>
                                </div>
                            </div>
                            {directivos.length > 0 && (
                                <ul className="mt-3" style={{ color: '#fff', listStyle: 'none', padding: 0, margin: 0 }}>
                                    {directivos.map((d, i) => (
                                        <li key={i} style={{
                                            background: 'rgba(255,255,255,0.06)',
                                            padding: '10px 12px',
                                            borderRadius: 8,
                                            marginBottom: 8,
                                            display: 'grid',
                                            gridTemplateColumns: 'auto 1fr auto',
                                            gap: 10,
                                            alignItems: 'center',
                                        }}>
                                            <div style={{
                                                background: 'rgba(251,191,36,0.2)',
                                                color: '#fbbf24',
                                                padding: '4px 10px',
                                                borderRadius: 6,
                                                fontSize: 11,
                                                fontWeight: 700,
                                                whiteSpace: 'nowrap',
                                            }}>{d.cargo_directivo}</div>
                                            <div style={{ minWidth: 0, overflow: 'hidden' }}>
                                                <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {d.nombres} {d.apellidos}
                                                </div>
                                                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {d.dni && <>DNI {d.dni}</>}
                                                    {d.correo && <> · {d.correo}</>}
                                                    {d.telefono && <> · {d.telefono}</>}
                                                </div>
                                            </div>
                                            <button type="button"
                                                onClick={() => quitarDirectivo(i)}
                                                style={{
                                                    background: 'transparent', border: 'none',
                                                    color: '#ef4444', cursor: 'pointer', fontSize: 18,
                                                    width: 32, height: 32, borderRadius: 6,
                                                }}
                                                title="Quitar"
                                            >
                                                <i className="fa-solid fa-times"></i>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            </div>
                            )}

                            {/* Botones de navegación del wizard */}
                            <div className="completar-perfil-club__actions d-flex justify-content-between flex-wrap gap-2 mt-3">
                                <button type="button" className="completar-perfil-club__submit"
                                    style={{ background: 'rgba(255,255,255,0.12)', flex: '0 0 auto', minWidth: 120 }}
                                    onClick={irAnterior}
                                    disabled={pasoActual === 1}>
                                    <i className="fa-solid fa-arrow-left" aria-hidden></i> Anterior
                                </button>
                                {pasoActual < TOTAL_PASOS ? (
                                    <button type="button" className="completar-perfil-club__submit"
                                        style={{ flex: '0 0 auto', minWidth: 120 }}
                                        onClick={irSiguiente}>
                                        Siguiente <i className="fa-solid fa-arrow-right" aria-hidden></i>
                                    </button>
                                ) : (
                                    <button type="button" className="completar-perfil-club__submit"
                                        style={{ flex: '0 0 auto', minWidth: 140 }}
                                        disabled={guardando || !camposEditables}
                                        onClick={() => { if (camposEditables && pasoActual === TOTAL_PASOS) handleGuardar(); }}>
                                        {guardando ? (
                                            <><i className="fa-solid fa-circle-notch fa-spin" aria-hidden></i> Creando club...</>
                                        ) : (
                                            <><i className="fa-solid fa-check" aria-hidden></i> Crear Club</>
                                        )}
                                    </button>
                                )}
                            </div>
                        </form>
                    )}
                </div>
            </div>

            <ModalCrop
                NombreModal="FLogo"
                Base64={logoBase64}
                setBase64={setLogoBase64}
                setFile={setFileLogo}
                setFormato={setFormatoLogo}
                AspectRatio={1 / 1}
                id_jugador={institucionId || clubData?.vit_institucion_id || 0}
            />

        </div>
    );
};

export default CompletarPerfilClub;
