import React, { useCallback } from 'react'
import AsyncSelect from 'react-select/async'
import axios from 'axios'
import { useAuth } from '../../../../../Context/AuthContext'

const selectDarkStyles = {
    control: (base) => ({
        ...base,
        backgroundColor: '#0a1929',
        borderColor: '#1e3a5f',
        color: '#fff',
        minHeight: '38px',
        '&:hover': { borderColor: '#2196f3' }
    }),
    menu: (base) => ({
        ...base,
        backgroundColor: '#0a1929',
        border: '1px solid #1e3a5f',
        zIndex: 9999
    }),
    menuList: (base) => ({
        ...base,
        maxHeight: '200px'
    }),
    option: (base, { isFocused, isSelected }) => ({
        ...base,
        backgroundColor: isSelected ? '#1e3a5f' : isFocused ? '#132f4c' : 'transparent',
        color: '#fff',
        cursor: 'pointer',
        '&:active': { backgroundColor: '#1e3a5f' }
    }),
    singleValue: (base) => ({
        ...base,
        color: '#fff'
    }),
    input: (base) => ({
        ...base,
        color: '#fff'
    }),
    placeholder: (base) => ({
        ...base,
        color: '#6c757d'
    }),
    noOptionsMessage: (base) => ({
        ...base,
        color: '#6c757d'
    }),
    loadingMessage: (base) => ({
        ...base,
        color: '#6c757d'
    })
};

const AgregarInstitucion = ({ Paises, Institucion_id, setInstitucion_id, Pais, setPais, Nombre, setNombre, FechaInicio, setFechaInicio, FechaFin, setFechaFin, setViewAgregar, NivelInstitucion, setNivelInstitucion, isEnabledCheck, setisEnabledCheck, Posición, setPosición }) => {
    const { Request } = useAuth();

    const selectedInstitucion = Institucion_id > 0 && Nombre
        ? { value: Institucion_id, label: Nombre }
        : null;

    const formatOptionLabel = ({ label, logo }) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {logo && <img src={logo} alt="" height="20px" style={{ borderRadius: '2px' }} />}
            <span>{label}</span>
        </div>
    );

    const buscarInstituciones = useCallback((inputValue, callback) => {
        if (!inputValue || inputValue.length < 2) {
            callback([]);
            return;
        }

        const formdata = new FormData();
        formdata.append("nombre", inputValue);

        axios({
            method: "post",
            url: `${Request.Dominio}/institucion_buscar`,
            headers: {
                "userLogin": Request.userLogin,
                "userPassword": Request.userPassword,
                "systemRoot": Request.Empresa
            },
            data: formdata
        }).then(res => {
            const opciones = (res.data.data || []).map(i => ({
                value: i.vit_institucion_id,
                label: i.nombre,
                logo: i.Logo,
                fb_pais_id: i.fb_pais_id
            }));
            callback(opciones);
        }).catch(() => {
            callback([]);
        });
    }, [Request]);

    const handleInstitucionChange = (option) => {
        if (option) {
            setInstitucion_id(option.value);
            setNombre(option.label);
            if (option.fb_pais_id) {
                setPais(String(option.fb_pais_id));
            }
        } else {
            setInstitucion_id(0);
            setNombre("");
            setPais("");
        }
    };

    return (
        <div>
            <div className='d-flex flex-column'>
                <div className="d-flex">
                    <div className='header-return' onClick={() => setViewAgregar(0)}>
                        <i className='icon-flecha2'></i>
                        <h5>Nueva institucion</h5>
                    </div>
                </div>
                <div className='row mt-2'>
                    <div className="col-md-6 col-sm-6 centrar-input mt-3">
                        <label htmlFor="projectName" className="form-label">Nivel institucion</label>
                        <select className='form-select' value={NivelInstitucion} onChange={(e) => setNivelInstitucion(e.target.value)}>
                            <option value="" disabled>Seleccione el nivel</option>
                            <option value="1">Aficionado</option>
                            <option value="2">Profesional</option>
                        </select>
                    </div>
                    <div className="mt-3 col-sm-12 col-md-6 centrar-input">
                        <label className="form-label">Institucion</label>
                        <AsyncSelect
                            value={selectedInstitucion}
                            loadOptions={buscarInstituciones}
                            onChange={handleInstitucionChange}
                            formatOptionLabel={formatOptionLabel}
                            placeholder="Escribe para buscar..."
                            noOptionsMessage={({ inputValue }) => inputValue.length < 2 ? "Escribe al menos 2 caracteres" : "No se encontraron instituciones"}
                            loadingMessage={() => "Buscando..."}
                            isClearable
                            isSearchable
                            styles={selectDarkStyles}
                            cacheOptions
                        />
                    </div>
                    <div className="col-lg-6 mt-3 col-sm-6 centrar-input">
                        <label htmlFor="country" className="form-label">Pais</label>
                        <select className="form-select" id="country" value={Pais} onChange={(e) => { setPais(e.target.value) }} required="" autoComplete="off" disabled>
                            <option value="" disabled label="Seleccione un pais"></option>
                            {Paises.map(p => {
                                return <option key={p.pais_id} value={p.pais_id}>{p.pais_nombre}</option>
                            })}
                        </select>
                    </div>
                    <div className="col-sm-6 centrar-input mt-3">
                        <label htmlFor="posicionInicial" className="form-label">Posicion</label>
                        <select className='form-select' value={Posición} onChange={(e) => setPosición(e.target.value)}>
                            <option value="" disabled>Seleccione tu posicion</option>
                            <optgroup label='Portero'>
                                <option value="1">Portero</option>
                            </optgroup>
                            <optgroup label='Defensa'>
                                <option value="2">Lateral Derecho</option>
                                <option value="3">Central Derecho</option>
                                <option value="4">Central Izquierdo</option>
                                <option value="5">Lateral Izquierdo</option>
                            </optgroup>
                            <optgroup label='MedioCampo'>
                                <option value="6">MedioCampo Defensivo</option>
                                <option value="7">Mediocampo Derecho</option>
                                <option value="8">Mediocampo Izquierda</option>
                                <option value="9">MedioCampo Ofensivo</option>
                            </optgroup>
                            <optgroup label='Delantero'>
                                <option value="10">Extremo Derecho</option>
                                <option value="11">Segundo Delantero</option>
                                <option value="12">Extremo Izquierdo</option>
                                <option value="13">Central Delantero</option>
                            </optgroup>
                        </select>
                    </div>
                    <div className="col-lg-4 mt-3 col-sm-6 centrar-input">
                        <label htmlFor="FechaInicio" className="form-label">Comienzo</label>
                        <input type="date" className="form-control" id="FechaInicio" required="" value={FechaInicio} onChange={(e) => { setFechaInicio(e.target.value); }} />
                    </div>
                    <div className="col-lg-4 mt-3 col-sm-6 centrar-input">
                        <label htmlFor="FechaFin" className="form-label">Finalizacion</label>
                        <input type="date" className="form-control" id="FechaFin" required="" value={FechaFin} onChange={(e) => { setFechaFin(e.target.value); }} disabled={isEnabledCheck} />
                    </div>
                    <div className="form-check col-lg-4 mt-3 col-sm-6">
                        <div className='in-form-check'>
                            <input className="form-check-input" type="checkbox" id="checkFechaFin" checked={isEnabledCheck} onChange={() => setisEnabledCheck(!isEnabledCheck)} />
                            <label className="form-check-label" htmlFor="checkFechaFin">
                                Actualmente en el equipo
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )

}
export default AgregarInstitucion
