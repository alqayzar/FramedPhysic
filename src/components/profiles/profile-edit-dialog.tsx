import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { type GameProfile } from '@/lib/game-profiles'
import { Download, Trash2, Upload } from 'lucide-react'

interface ProfileEditDialogProps {
  contentLabel: string
  onClear: (profileId: string) => Promise<void>
  onDelete: (profileId: string) => Promise<void>
  onExport: (profileId: string, title: string) => Promise<void>
  onImport: (profileId: string, file: File) => Promise<void>
  onOpenChange: (open: boolean) => void
  onRename: (profileId: string, title: string) => Promise<void>
  open: boolean
  profile?: GameProfile
}

function ProfileEditDialog(props: ProfileEditDialogProps) {
  const importInput = useRef<HTMLInputElement>(null)
  const [title, setTitle] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (props.open) {
      setTitle(props.profile?.title ?? '')
      setErrorMessage('')
    }
  }, [props.open, props.profile])

  function handleTitleChange(event: ChangeEvent<HTMLInputElement>) {
    const nextTitle = event.target.value
    setTitle(nextTitle)
    if (props.profile && nextTitle.trim()) void props.onRename(props.profile.id, nextTitle)
  }

  async function clearProfile() {
    if (!props.profile) return
    setIsSaving(true)
    try {
      await props.onClear(props.profile.id)
    } finally {
      setIsSaving(false)
    }
  }

  async function deleteProfile() {
    if (!props.profile) return
    setIsSaving(true)
    try {
      await props.onDelete(props.profile.id)
      props.onOpenChange(false)
    } finally {
      setIsSaving(false)
    }
  }

  async function exportProfile() {
    if (!props.profile) return
    setIsSaving(true)
    try {
      await props.onExport(props.profile.id, title)
    } finally {
      setIsSaving(false)
    }
  }

  function openImportPicker() {
    importInput.current?.click()
  }

  async function importProfile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!props.profile || !file) return

    setIsSaving(true)
    setErrorMessage('')
    try {
      await props.onImport(props.profile.id, file)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Impossible d’importer ce profil.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog onOpenChange={props.onOpenChange} open={props.open}>
      <DialogContent className="w-[calc(100svw-2rem)] max-w-[calc(100svw-2rem)] rounded-2xl border-4 border-game-ink bg-white p-6 text-game-ink shadow-[0_8px_0_0_#16171d] sm:max-w-md">
        <DialogHeader className="pr-10">
          <DialogTitle className="text-2xl font-black tracking-[-0.04em]">Modifier le profil</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <label className="grid gap-2 text-sm font-bold">
            Nom du profil
            <input
              className="h-12 w-full min-w-0 rounded-xl border-4 border-game-ink px-3 text-base font-semibold shadow-[0_4px_0_0_#16171d] outline-none focus:ring-4 focus:ring-game-blue/30"
              onChange={handleTitleChange}
              value={title}
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <Button className="cartoon-press h-auto rounded-xl border-4 border-game-ink bg-game-blue px-4 py-3 font-black text-white hover:bg-game-blue" disabled={isSaving} onClick={exportProfile} type="button">
              <Download aria-hidden="true" className="size-5" />
              Exporter
            </Button>
            <Button className="cartoon-press h-auto rounded-xl border-4 border-game-ink bg-game-purple px-4 py-3 font-black text-white hover:bg-game-purple" disabled={isSaving} onClick={openImportPicker} type="button">
              <Upload aria-hidden="true" className="size-5" />
              Importer
            </Button>
          </div>
          <input accept="application/json,.json" className="sr-only" onChange={importProfile} ref={importInput} type="file" />
          <Button className="cartoon-press cartoon-press-md h-auto w-full rounded-xl border-4 border-game-ink bg-game-red px-5 py-4 text-base font-black text-white hover:bg-game-red" disabled={isSaving} onClick={clearProfile} type="button">
            <Trash2 aria-hidden="true" className="size-5" />
            Supprimer les {props.contentLabel}
          </Button>
          <Button className="cartoon-press cartoon-press-md h-auto w-full rounded-xl border-4 border-game-ink bg-game-red/15 px-5 py-4 text-base font-black text-game-red hover:bg-game-red/15" disabled={isSaving} onClick={deleteProfile} type="button">
            <Trash2 aria-hidden="true" className="size-5" />
            Supprimer le profil
          </Button>
          {errorMessage && <p className="text-sm font-bold text-game-red">{errorMessage}</p>}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { ProfileEditDialog }
