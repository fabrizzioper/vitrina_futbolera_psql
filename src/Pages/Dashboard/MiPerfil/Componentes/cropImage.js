export const createImage = (url) =>
    new Promise((resolve, reject) => {
        const image = new Image()
        image.addEventListener('load', () => resolve(image))
        image.addEventListener('error', (error) => reject(error))
        image.setAttribute('crossOrigin', 'anonymous')
        image.src = url
    })

export function getRadianAngle(degreeValue) {
    return (degreeValue * Math.PI) / 180
}

export function rotateSize(width, height, rotation) {
    const rotRad = getRadianAngle(rotation)
    return {
        width:
            Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
        height:
            Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
    }
}

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

    const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
        image.width,
        image.height,
        rotation
    )

    // Canvas temporal para dibujar la imagen rotada
    const tempCanvas = document.createElement('canvas')
    const tempCtx = tempCanvas.getContext('2d')
    tempCanvas.width = Math.ceil(bBoxWidth)
    tempCanvas.height = Math.ceil(bBoxHeight)

    tempCtx.translate(tempCanvas.width / 2, tempCanvas.height / 2)
    tempCtx.rotate(rotRad)
    tempCtx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1)
    tempCtx.translate(-image.width / 2, -image.height / 2)
    tempCtx.drawImage(image, 0, 0)

    // Canvas final: recortar usando drawImage (no getImageData)
    const cropX = Math.round(pixelCrop.x)
    const cropY = Math.round(pixelCrop.y)
    const cropW = Math.round(pixelCrop.width)
    const cropH = Math.round(pixelCrop.height)

    canvas.width = cropW
    canvas.height = cropH

    ctx.drawImage(
        tempCanvas,
        cropX, cropY, cropW, cropH,
        0, 0, cropW, cropH
    )

    return canvas.toDataURL()
}
