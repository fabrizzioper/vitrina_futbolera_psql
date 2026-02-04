import React, { useEffect, useState } from 'react'

const AgregarInstitucion = ({ Paises, Instituciones, Institucion_id, setInstitucion_id, Pais, setPais, Nombre, setNombre, FechaInicio, setFechaInicio, FechaFin, setFechaFin, setViewAgregar, NivelInstitucion, setNivelInstitucion, isEnabledCheck, setisEnabledCheck, Posición, setPosición }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [NuevoArrInstituciones, setNuevoArrInstituciones] = useState(Instituciones);

    const handleOptionClick = (id, nombre, e) => {
        document.getElementById("NombreInstitucion").focus()
        setNombre(nombre)
        setInstitucion_id(id)
        setIsOpen(false);
    };

    function OnNombreChange(e, array) {
        setNombre(e.target.value)
        let parametro = e.target.value.toLowerCase()
        let arr = array.filter(data => {
            let nombre = (data.nombre).toLowerCase().includes(parametro)
            return nombre
        })
        setNuevoArrInstituciones(arr)

    }

    useEffect(() => {
        setNuevoArrInstituciones(Instituciones)
    }, [Instituciones]);

    useEffect(() => {
        let input = document.getElementById("NombreInstitucion")
        if (Institucion_id === 0) {
            input.disabled = false
            input.focus()
        } else {
            input.disabled = true
        }
    }, [Institucion_id]);

    return (
        <div>
            <div className='d-flex flex-column'>
                <div className="d-flex">
                    <div className='header-return' onClick={() => setViewAgregar(0)}>
                        <i className='icon-flecha2'></i>
                        <h5>Nueva institución</h5>
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
                    <div className="col-lg-6 mt-3 col-sm-6 col-sm-6 centrar-input">
                        <label htmlFor="country" className="form-label">Pais</label>
                        <select className="form-select tomselected ts-hidden-accessible" onFocus={() => setIsOpen(false)} id="country" value={Pais} onChange={(e) => { setPais(e.target.value) }} required="" autoComplete="off" data-select="{&quot;placeholder&quot;: &quot;Choose...&quot;}" data-option-template="<span className=&quot;d-flex align-items-center py-2&quot;><span className=&quot;avatar avatar-circle avatar-xxs&quot;><img className=&quot;avatar-img shadow-sm&quot; src=&quot;./assets/images/flags/1x1/[[value]].svg&quot; /></span><span className=&quot;text-truncate ms-2&quot;>[[text]]</span></span>" data-item-template="<span className=&quot;d-flex align-items-center&quot;><span className=&quot;avatar avatar-circle avatar-xxs&quot;><img className=&quot;avatar-img shadow-sm&quot; src=&quot;./assets/images/flags/1x1/[[value]].svg&quot; /></span><span className=&quot;text-truncate ms-2&quot;>[[text]]</span></span>">
                            <option value="" disabled label="Seleccione un pais"></option>
                            {Paises.map(p => {
                                return <option key={p.pais_id} value={p.pais_id}>{p.pais_nombre}</option>
                            })}
                        </select>
                    </div>
                    <div className="mt-3 col-sm-12 col-md-6 centrar-input position-relative" >
                        <label htmlFor="NombreInstitucion" className="form-label">Institución</label>
                        <input type="text" onClick={() => setIsOpen(!isOpen)} autoComplete="off" className="form-control" id="NombreInstitucion" placeholder="Nombre de la institucion" required="" value={Nombre} onChange={(e) => OnNombreChange(e, Instituciones)} />
                        {isOpen && (
                            <ul className="select-options" >
                                <li onClick={(e) => handleOptionClick(0, Nombre, e)}>
                                    No esta en la lista...
                                </li>
                                {NuevoArrInstituciones.map((i) => {
                                    return (
                                        <li key={i.vit_institucion_id} onClick={() => handleOptionClick(i.vit_institucion_id, i.nombre)}>
                                            {i.nombre} - <img className='px-2' height="20px" src={i.Logo} alt="..." />
                                        </li>
                                    )
                                })}
                            </ul>
                        )}
                    </div>
                    <div className="col-sm-6 centrar-input mt-3">
                        <label htmlFor="posicionInicial" className="form-label">Posición</label>
                        <select className='form-select' value={Posición} onChange={(e) => setPosición(e.target.value)}>
                            <option value="" disabled>Seleccione tu posición</option>
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
                        <input type="date" className="form-control" id="FechaInicio" onFocus={() => setIsOpen(false)} required="" value={FechaInicio} onChange={(e) => { setFechaInicio(e.target.value); }} />
                    </div>
                    <div className="col-lg-4 mt-3 col-sm-6 centrar-input">
                        <label htmlFor="FechaFin" className="form-label">Finalización</label>
                        <input type="date" className="form-control" id="FechaFin" onFocus={() => setIsOpen(false)} required="" value={FechaFin} onChange={(e) => { setFechaFin(e.target.value); }} disabled={isEnabledCheck} />
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
