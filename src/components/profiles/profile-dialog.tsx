import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface ProfileDialogProps {
  onCreate: (title: string) => Promise<void>
  onOpenChange: (open: boolean) => void
  open: boolean
}

function ProfileDialog(props: ProfileDialogProps) {
  const [title, setTitle] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (props.open) setTitle('')
  }, [props.open])

  function handleTitleChange(event: ChangeEvent<HTMLInputElement>) {
    setTitle(event.target.value)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!title.trim()) return

    setIsSaving(true)
    try {
      await props.onCreate(title)
      props.onOpenChange(false)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog onOpenChange={props.onOpenChange} open={props.open}>
      <DialogContent className="w-[calc(100svw-2rem)] max-w-[calc(100svw-2rem)] overflow-hidden rounded-2xl border-4 border-game-ink bg-white p-6 text-game-ink shadow-[0_8px_0_0_#16171d] sm:max-w-md">
        <DialogHeader className="pr-10">
          <DialogTitle className="text-2xl font-black tracking-[-0.04em]">Ajouter un profil</DialogTitle>
        </DialogHeader>
        <form className="mt-4 min-w-0" onSubmit={handleSubmit}>
          <label className="grid gap-2 text-sm font-bold">
            Nom du profil
            <input
              autoFocus
              className="h-12 w-full min-w-0 rounded-xl border-4 border-game-ink px-3 text-base font-semibold shadow-[0_4px_0_0_#16171d] outline-none focus:ring-4 focus:ring-game-blue/30"
              onChange={handleTitleChange}
              value={title}
            />
          </label>
          <Button className="cartoon-press mt-5 w-full rounded-xl border-4 border-game-ink bg-game-green px-4 py-3 font-black text-white hover:bg-game-green" disabled={!title.trim() || isSaving} type="submit">
            {isSaving ? 'Ajout...' : 'Ajouter le profil'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export { ProfileDialog }
