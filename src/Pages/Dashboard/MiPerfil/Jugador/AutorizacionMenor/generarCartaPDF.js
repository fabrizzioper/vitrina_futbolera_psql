import { jsPDF } from 'jspdf';

/**
 * Genera el PDF de la Carta de Autorización para Registro de Menor de Edad.
 * Todos los datos se llenan desde el frontend. Solo la firma queda vacía.
 */
export function generarCartaPDF(datos) {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'letter'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const marginLeft = 25;
    const marginRight = 25;
    const contentWidth = pageWidth - marginLeft - marginRight;
    const lh = 5.5;
    let y = 28;

    // Datos
    const nombreApod = datos.nombreApoderado || '';
    const tipoDocApod = datos.tipoDocApoderado || 'DNI';
    const docApod = datos.docApoderado || '';
    const parentesco = (datos.parentescoApoderado || 'apoderado legal').toLowerCase();
    const nombreJugador = ((datos.nombreJugador || '') + ' ' + (datos.apellidoJugador || '')).trim();
    const tipoDocJug = datos.tipoDocJugador || 'DNI';
    const docJug = datos.docJugador || '';
    const fechaNac = formatearFecha(datos.fechaNacimiento);

    // Fecha actual
    const hoy = new Date();
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const fechaHoy = hoy.getDate() + ' de ' + meses[hoy.getMonth()] + ' de ' + hoy.getFullYear();

    // --- TÍTULO ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('CARTA DE AUTORIZACI\u00D3N PARA REGISTRO', pageWidth / 2, y, { align: 'center' });
    y += 6;
    doc.text('DE MENOR DE EDAD', pageWidth / 2, y, { align: 'center' });
    y += 8;
    doc.setFontSize(11);
    doc.text('VITRINA FUTBOLERA', pageWidth / 2, y, { align: 'center' });
    y += 14;

    // --- FECHA ---
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Fecha: ' + fechaHoy, pageWidth - marginRight, y, { align: 'right' });
    y += 12;

    // --- PÁRRAFO 1: Datos del apoderado (todo junto como texto corrido) ---
    doc.setFontSize(10.5);
    const parrafo1 = 'Yo, ' + nombreApod + ', identificado(a) con ' + tipoDocApod + ' N.\u00B0 ' + docApod + ', en mi condici\u00F3n de ' + parentesco + ' del menor:';
    const lineas1 = doc.splitTextToSize(parrafo1, contentWidth);
    doc.text(lineas1, marginLeft, y);
    y += lineas1.length * lh + 5;

    // --- Nombre del menor ---
    doc.text('Nombre completo del menor: ', marginLeft, y);
    const xNombre = marginLeft + doc.getTextWidth('Nombre completo del menor: ');
    doc.setFont('helvetica', 'bold');
    doc.text(nombreJugador, xNombre, y);
    doc.setFont('helvetica', 'normal');
    y += lh + 2;

    // --- Doc del menor y fecha nacimiento ---
    const labelDoc = 'Documento de identidad: ' + tipoDocJug + ' N.\u00B0 ';
    doc.text(labelDoc, marginLeft, y);
    const xDoc = marginLeft + doc.getTextWidth(labelDoc);
    doc.setFont('helvetica', 'bold');
    doc.text(docJug, xDoc, y);
    doc.setFont('helvetica', 'normal');

    const espacio = xDoc + doc.getTextWidth(docJug) + 8;
    doc.text('Fecha de nacimiento: ', espacio, y);
    const xFn = espacio + doc.getTextWidth('Fecha de nacimiento: ');
    doc.setFont('helvetica', 'bold');
    doc.text(fechaNac, xFn, y);
    doc.setFont('helvetica', 'normal');
    y += lh + 7;

    // --- PÁRRAFO 2: Autorización ---
    const parrafo2 = 'Por medio de la presente, AUTORIZO de manera libre, voluntaria e informada el registro y participaci\u00F3n del menor antes mencionado en la plataforma Vitrina Futbolera, que comprende:';
    const lineas2 = doc.splitTextToSize(parrafo2, contentWidth);
    doc.text(lineas2, marginLeft, y);
    y += lineas2.length * lh + 4;

    // --- LISTA NUMERADA ---
    const items = [
        'Creaci\u00F3n de perfil deportivo con datos personales y deportivos del menor.',
        'Publicaci\u00F3n de fotograf\u00EDas, videos y estad\u00EDsticas deportivas.',
        'Participaci\u00F3n en torneos, campeonatos y eventos organizados por la plataforma.',
        'Contacto por parte de clubes, academias o representantes deportivos.'
    ];

    items.forEach(function (item, index) {
        const textoItem = (index + 1) + '. ' + item;
        const lineasItem = doc.splitTextToSize(textoItem, contentWidth - 8);
        doc.text(lineasItem, marginLeft + 5, y);
        y += lineasItem.length * lh + 1;
    });

    y += 4;

    // --- PÁRRAFO 3: Tratamiento de datos ---
    const parrafo3 = 'Asimismo, autorizo el tratamiento de los datos personales del menor conforme a la normativa vigente en materia de protecci\u00F3n de datos personales, exclusivamente para los fines relacionados con la plataforma Vitrina Futbolera.';
    const lineas3 = doc.splitTextToSize(parrafo3, contentWidth);
    doc.text(lineas3, marginLeft, y);
    y += lineas3.length * lh + 4;

    // --- PÁRRAFO 4: Declaración ---
    const parrafo4 = 'Declaro que la informaci\u00F3n proporcionada es ver\u00EDdica y asumo plena responsabilidad sobre la participaci\u00F3n del menor en la plataforma. Manifiesto haber le\u00EDdo y aceptado los t\u00E9rminos y condiciones y la pol\u00EDtica de privacidad de Vitrina Futbolera. La presente autorizaci\u00F3n podr\u00E1 ser revocada en cualquier momento mediante comunicaci\u00F3n escrita.';
    const lineas4 = doc.splitTextToSize(parrafo4, contentWidth);
    doc.text(lineas4, marginLeft, y);
    y += lineas4.length * lh + 4;

    // --- FIRMA (vacía para firmar manualmente) ---
    const firmaY = Math.max(y + 20, 220);

    doc.setLineWidth(0.3);
    doc.line(marginLeft, firmaY, marginLeft + 70, firmaY);

    doc.setFontSize(10);
    y = firmaY + 5;
    doc.text('Firma del Apoderado', marginLeft, y);
    y += 7;
    doc.text('Nombre: ' + nombreApod, marginLeft, y);
    y += 7;
    doc.text(tipoDocApod + ': ' + docApod, marginLeft, y);
    y += 7;
    doc.text('Fecha: ' + fechaHoy, marginLeft, y);

    return doc;
}

export function descargarCartaPDF(datos) {
    const doc = generarCartaPDF(datos);
    doc.save('Carta_Autorizacion_Menor.pdf');
}

export function obtenerCartaPDFBlob(datos) {
    const doc = generarCartaPDF(datos);
    return doc.output('blob');
}

function formatearFecha(fecha) {
    if (!fecha) return '____________';
    const parts = fecha.split('-');
    if (parts.length === 3) {
        return parts[2] + '/' + parts[1] + '/' + parts[0];
    }
    return fecha;
}
