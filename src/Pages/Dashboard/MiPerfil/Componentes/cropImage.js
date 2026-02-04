export const createImage = (url) =>
    new Promise((resolve, reject) => {
        const image = new Image()
        image.addEventListener('load', () => resolve(image))
        image.addEventListener('error', (error) => reject(error))
        image.setAttribute('crossOrigin', 'anonymous') // necesario para evitar problemas de origen cruzado
        image.src = url
    })

export function getRadianAngle(degreeValue) {
    return (degreeValue * Math.PI) / 180
}

/**
 * Devuelve la nueva área delimitada de un rectángulo girado.
 */
export function rotateSize(width, height, rotation) {
    const rotRad = getRadianAngle(rotation)

    return {
        width:
            Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
        height:
            Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
    }
}

/**
 * Funcion Adapatada
 */
export default async function getCroppedImg(
    imageSrc,
    pixelCrop,
    rotation = 0,
    flip = { horizontal: false, vertical: false }
) {
    const image = await createImage(imageSrc)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
        return null
    }

    const rotRad = getRadianAngle(rotation)

    // calcular el cuadro delimitador de la imagen girada
    let { width: bBoxWidth, height: bBoxHeight } = rotateSize(
        image.width,
        image.height,
        rotation
    )

    // establecer el tamaño del lienzo para que coincida con el cuadro delimitador
    canvas.width = bBoxWidth
    canvas.height = bBoxHeight

    // traducir el contexto del lienzo a una ubicación central para permitir rotar y voltear alrededor del centro
    ctx.translate(bBoxWidth / 2, bBoxHeight / 2)
    ctx.rotate(rotRad)
    ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1)
    ctx.translate(-image.width / 2, -image.height / 2)

    // dibujar imagen girada si se manda rotación
    ctx.drawImage(image, 0, 0)

    // Los valores de croppedAreaPixels son relativos al cuadro delimitador
    // extraer la imagen recortada usando estos valores
    const data = ctx.getImageData(
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height
    )

    // establezca el ancho del lienzo en el tamaño de recorte final deseado; esto borrará el contexto existente
    canvas.width = pixelCrop.width
    canvas.height = pixelCrop.height

    
    // pegar la imagen rotada generada en la esquina superior izquierda
    ctx.putImageData(data, 0, 0)

    // Como cadena Base64


    return canvas.toDataURL()
}