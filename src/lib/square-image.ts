export async function createSquareImage(image: Blob): Promise<Blob> {
  const source = URL.createObjectURL(image)
  const imageElement = new Image()

  try {
    await new Promise<void>((resolve, reject) => {
      imageElement.onload = () => resolve()
      imageElement.onerror = () => reject(new Error('Unable to load image.'))
      imageElement.src = source
    })

    const cropSize = Math.min(imageElement.naturalWidth, imageElement.naturalHeight)
    const sourceX = (imageElement.naturalWidth - cropSize) / 2
    const sourceY = (imageElement.naturalHeight - cropSize) / 2
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Canvas is unavailable.')

    context.drawImage(imageElement, sourceX, sourceY, cropSize, cropSize, 0, 0, 512, 512)

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((result) => {
        if (result) resolve(result)
        else reject(new Error('Unable to create square image.'))
      }, 'image/png')
    })
  } finally {
    URL.revokeObjectURL(source)
  }
}
