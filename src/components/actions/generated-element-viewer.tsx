import { useEffect, useState, type MouseEvent, type ReactNode } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'

interface GeneratedElementViewerProps {
  children?: ReactNode
  emoji?: string
  image?: Blob
  imageSource?: string
  onOpenChange: (open: boolean) => void
  open: boolean
  title?: string
}

function GeneratedElementViewer(props: GeneratedElementViewerProps) {
  const [blobSource, setBlobSource] = useState('')

  useEffect(() => {
    if (!props.image) {
      setBlobSource('')
      return
    }

    const source = URL.createObjectURL(props.image)
    setBlobSource(source)
    return () => URL.revokeObjectURL(source)
  }, [props.image])

  function close(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) props.onOpenChange(false)
  }

  const imageSource = props.imageSource || blobSource
  const imageHeightClassName = props.children ? 'max-h-[45svh]' : 'max-h-[70svh]'

  return (
    <Dialog onOpenChange={props.onOpenChange} open={props.open}>
      <DialogContent className="flex h-svh w-svw max-w-none flex-col items-center justify-center gap-6 rounded-none border-0 bg-game-yellow p-8 text-game-ink shadow-none" onClick={close}>
        {imageSource ? (
          <img alt="" className={`${imageHeightClassName} max-w-full rounded-2xl border-4 border-game-ink object-contain shadow-[0_8px_0_0_#16171d]`} src={imageSource} />
        ) : (
          <span aria-hidden="true" className="flex size-56 items-center justify-center rounded-2xl border-4 border-game-ink bg-white text-9xl shadow-[0_8px_0_0_#16171d]">
            {props.emoji || '?'}
          </span>
        )}
          <DialogTitle className="max-w-full break-words text-center text-3xl font-black tracking-[-0.04em] sm:text-5xl">
            {props.title}
          </DialogTitle>
          {props.children}
      </DialogContent>
    </Dialog>
  )
}

export { GeneratedElementViewer }
