export function createEmojiImage(emoji: string): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512

  const context = canvas.getContext('2d')
  if (!context) return Promise.reject(new Error('Canvas is unavailable.'))

  context.font = '400px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillText(emoji, 256, 272)

  return new Promise((resolve, reject) => {
    canvas.toBlob((image) => {
      if (image) resolve(image)
      else reject(new Error('Unable to create the emoji image.'))
    }, 'image/png')
  })
}
