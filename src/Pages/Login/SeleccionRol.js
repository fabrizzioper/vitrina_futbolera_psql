import React from "react";

/**
 * Modal que aparece tras el login cuando un mismo correo tiene varios perfiles
 * (Jugador + Club, por ejemplo). El usuario elige a cuál entrar.
 *
 * Props:
 *  - perfiles: [{ vit_jugador_id, vit_jugador_tipo_id, jugador_tipo, nombre_jugador, foto_perfil, ... }]
 *  - onSelect: (perfil) => void
 *  - onCancel: () => void
 */
const TIPO_LABEL = {
    1: "Jugador",
    2: "Tecnico",
    3: "Club / Academia",
    4: "Organizador de Torneo",
    5: "Veedor",
};

export default function SeleccionRol({ perfiles, onSelect, onCancel }) {
    if (!perfiles || perfiles.length === 0) return null;

    return (
        <div
            className="seleccion-rol__overlay"
            style={{
                position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                background: "rgba(14,55,105,0.75)",
                display: "flex", alignItems: "center", justifyContent: "center",
                zIndex: 9999,
            }}
        >
            <div
                className="seleccion-rol__card"
                style={{
                    background: "#fff", borderRadius: 12, padding: 24,
                    minWidth: 320, maxWidth: 520, width: "90%",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                }}
            >
                <h2 style={{ marginTop: 0, color: "#0e3769" }}>Elige tu perfil</h2>
                <p style={{ color: "#555", fontSize: 14 }}>
                    Este correo tiene varios perfiles. Selecciona con cuál quieres ingresar.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
                    {perfiles.map(p => {
                        const tipoLabel = p.jugador_tipo || TIPO_LABEL[p.vit_jugador_tipo_id] || "Cuenta";
                        return (
                            <button
                                key={p.vit_jugador_id}
                                onClick={() => onSelect(p)}
                                style={{
                                    display: "flex", alignItems: "center", gap: 12,
                                    padding: 12, border: "1px solid #ddd", borderRadius: 8,
                                    background: "#fafbff", cursor: "pointer",
                                    textAlign: "left",
                                }}
                            >
                                {p.foto_perfil ? (
                                    <img
                                        src={p.foto_perfil}
                                        alt=""
                                        style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover" }}
                                    />
                                ) : (
                                    <div style={{
                                        width: 48, height: 48, borderRadius: "50%",
                                        background: "#0e3769", color: "#fff",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontSize: 18, fontWeight: 600,
                                    }}>
                                        {(p.nombre_jugador || tipoLabel)?.slice(0, 1).toUpperCase()}
                                    </div>
                                )}
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, color: "#0e3769" }}>{p.nombre_jugador || tipoLabel}</div>
                                    <div style={{ fontSize: 13, color: "#666" }}>Entrar como {tipoLabel}</div>
                                </div>
                                <span style={{ color: "#0e3769", fontSize: 24 }}>›</span>
                            </button>
                        );
                    })}
                </div>
                {onCancel && (
                    <button
                        onClick={onCancel}
                        style={{
                            marginTop: 16, background: "transparent", border: "none",
                            color: "#666", cursor: "pointer", padding: 8, width: "100%",
                        }}
                    >
                        Cancelar
                    </button>
                )}
            </div>
        </div>
    );
}
