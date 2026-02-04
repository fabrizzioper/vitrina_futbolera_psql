import React from 'react';

const EditarLogros = ({ Paises, Tipo_instituciones, Tipo_institucion, setTipo_institucion, Categorias, Categoria, setCategoria, Pais, setPais, NombreTorneo, setNombreTorneo, NombreLogro, setNombreLogro, Fecha, setFecha, setViewAgregar }) => {
    return (
        <div>
            <div className='d-flex flex-column'>
                <div className="d-flex">
                    <div className='header-return' onClick={() => setViewAgregar(0)}>
                        <i className='icon-flecha2'></i>
                        <h5>Editar logro</h5>
                    </div>
                </div>
                <div className='row mt-2'>
                    <div className="mt-3 col-12 centrar-input">
                        <label htmlFor="NombreInstitucion" className="form-label">Torneo</label>
                        <input type="text" className="form-control" id="NombreInstitucion" placeholder="Nombre de el torneo" required="" value={NombreTorneo} onChange={(e) => setNombreTorneo(e.target.value)} />
                    </div>
                    <div className="col-lg-6 mt-3 col-sm-12 centrar-input">
                        <label htmlFor="country" className="form-label">Categoria</label>
                        <select className="form-select tomselected ts-hidden-accessible" id="Categoria" value={Categoria} onChange={(e) => setCategoria(e.target.value)} required="" autoComplete="off" data-select="{&quot;placeholder&quot;: &quot;Choose...&quot;}" data-option-template="<span className=&quot;d-flex align-items-center py-2&quot;><span className=&quot;avatar avatar-circle avatar-xxs&quot;><img className=&quot;avatar-img shadow-sm&quot; src=&quot;./assets/images/flags/1x1/[[value]].svg&quot; /></span><span className=&quot;text-truncate ms-2&quot;>[[text]]</span></span>" data-item-template="<span className=&quot;d-flex align-items-center&quot;><span className=&quot;avatar avatar-circle avatar-xxs&quot;><img className=&quot;avatar-img shadow-sm&quot; src=&quot;./assets/images/flags/1x1/[[value]].svg&quot; /></span><span className=&quot;text-truncate ms-2&quot;>[[text]]</span></span>">
                            <option value="" disabled label="Seleccione la categoria"></option>
                            {Categorias.map(c => {
                                return <option key={c.categoria_codigo} value={c.categoria_id}>{c.categoria_nombre}</option>
                            })}
                        </select>
                    </div>
                    <div className="col-lg-6 mt-3 col-sm-12 centrar-input">
                        <label htmlFor="country" className="form-label">Tipo de institucion</label>
                        <select className="form-select tomselected ts-hidden-accessible" id="tipoInstitucion" value={Tipo_institucion} onChange={(e) => setTipo_institucion(e.target.value)} required="" autoComplete="off" data-select="{&quot;placeholder&quot;: &quot;Choose...&quot;}" data-option-template="<span className=&quot;d-flex align-items-center py-2&quot;><span className=&quot;avatar avatar-circle avatar-xxs&quot;><img className=&quot;avatar-img shadow-sm&quot; src=&quot;./assets/images/flags/1x1/[[value]].svg&quot; /></span><span className=&quot;text-truncate ms-2&quot;>[[text]]</span></span>" data-item-template="<span className=&quot;d-flex align-items-center&quot;><span className=&quot;avatar avatar-circle avatar-xxs&quot;><img className=&quot;avatar-img shadow-sm&quot; src=&quot;./assets/images/flags/1x1/[[value]].svg&quot; /></span><span className=&quot;text-truncate ms-2&quot;>[[text]]</span></span>">
                            <option value="" disabled label="Seleccione el tipo de institución"></option>
                            {Tipo_instituciones.map(ti => {
                                return <option key={ti.vit_tipo_institucion_codigo} value={ti.vit_tipo_institucion_id}>{ti.vit_tipo_institucion_nombre}</option>
                            })}
                        </select>
                    </div>
                    <div className="col-lg-4 mt-3 col-sm-12 centrar-input">
                        <label htmlFor="country" className="form-label">Pais</label>
                        <select className="form-select tomselected ts-hidden-accessible" id="country" value={Pais} onChange={(e) => setPais(e.target.value)} required="" autoComplete="off" data-select="{&quot;placeholder&quot;: &quot;Choose...&quot;}" data-option-template="<span className=&quot;d-flex align-items-center py-2&quot;><span className=&quot;avatar avatar-circle avatar-xxs&quot;><img className=&quot;avatar-img shadow-sm&quot; src=&quot;./assets/images/flags/1x1/[[value]].svg&quot; /></span><span className=&quot;text-truncate ms-2&quot;>[[text]]</span></span>" data-item-template="<span className=&quot;d-flex align-items-center&quot;><span className=&quot;avatar avatar-circle avatar-xxs&quot;><img className=&quot;avatar-img shadow-sm&quot; src=&quot;./assets/images/flags/1x1/[[value]].svg&quot; /></span><span className=&quot;text-truncate ms-2&quot;>[[text]]</span></span>">
                            <option value="" disabled label="Seleccione el pais"></option>
                            {Paises.map(p => {
                                return <option key={p.pais_id} value={p.pais_id}>{p.pais_nombre}</option>
                            })}
                        </select>
                    </div>
                    <div className="col-lg-4 mt-3 col-sm-6 centrar-input">
                        <label htmlFor="NombreInstitucion" className="form-label">Logro</label>
                        <input type="text" className="form-control" id="NombreInstitucion" placeholder="Nombre de el logro" required="" value={NombreLogro} onChange={(e) => setNombreLogro(e.target.value)} />
                    </div>
                    {/* <div className="col-lg-4 mt-3 col-sm-6 centrar-input">
                        <label htmlFor="FechaFin" className="form-label">Fecha</label>
                        <input type="date" className="form-control" id="FechaFin" required="" value={Fecha} onChange={(e) => { setFecha(e.target.value); }} />
                    </div> */}
                    <div className="col-lg-4 mt-3 col-sm-6 centrar-input">
                        <label htmlFor="FechaFin" className="form-label">Año</label>
                        <input type="number" placeholder='Año del torneo' className="form-control" id="FechaFin" name="year" min="1900" max="2100" step="1" value={Fecha.split("-")[0]} onChange={(e) => { setFecha(`${e.target.value}-01-01`); }} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EditarLogros;
