export function createEmojiImage(emoji: string): Promise<Blob> {
  const avatarSize = 512
  const canvas = document.createElement('canvas')
  canvas.width = avatarSize
  canvas.height = avatarSize

  const context = canvas.getContext('2d')
  if (!context) return Promise.reject(new Error('Canvas is unavailable.'))

  context.font = `${avatarSize * 0.5}px sans-serif`
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillText(emoji, avatarSize / 2, avatarSize / 2 + avatarSize * 0.05)

  return new Promise((resolve, reject) => {
    canvas.toBlob((image) => {
      if (image) resolve(image)
      else reject(new Error('Unable to create the emoji image.'))
    }, 'image/png')
  })
}
