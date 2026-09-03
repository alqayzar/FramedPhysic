import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type MouseEvent } from 'react'
import { ActionTemplatePreview } from '@/components/actions/action-template-preview'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { validateActionTemplate } from '@/lib/action-template'
import { createGameAction, type GameAction } from '@/lib/game-actions'
import { Braces, Copy, Tag, Trash2 } from 'lucide-react'

interface ActionDialogProps {
  action?: GameAction
  availableTags: string[]
  onDelete?: (action: GameAction) => Promise<void>
  onDuplicate?: (action: GameAction) => Promise<void>
  onOpenChange: (open: boolean) => void
  onSave: (action: GameAction) => Promise<void>
  open: boolean
  profileId: string
}

function ActionDialog(props: ActionDialogProps) {
  const templateInput = useRef<HTMLTextAreaElement>(null)
  const [title, setTitle] = useState('')
  const [template, setTemplate] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!props.open) return
    setTitle(props.action?.title ?? '')
    setTemplate(props.action?.template ?? '')
    setErrorMessage('')
  }, [props.action, props.open])

  function resetForm() {
    setTitle('')
    setTemplate('')
    setErrorMessage('')
  }

  function handleOpenChange(open: boolean) {
    props.onOpenChange(open)
    if (!open) resetForm()
  }

  function handleTemplateChange(event: ChangeEvent<HTMLTextAreaElement>) {
    setTemplate(event.target.value)
    setErrorMessage('')
  }

  function handleTitleChange(event: ChangeEvent<HTMLInputElement>) {
    setTitle(event.target.value)
  }

  function handleTagInsert(event: MouseEvent<HTMLButtonElement>) {
    const tag = event.currentTarget.dataset.tag
    const input = templateInput.current
    if (!tag || !input) return

    const start = input.selectionStart
    const end = input.selectionEnd
    const before = template.slice(0, start)
    const after = template.slice(end)
    const isInsideFilter = before.lastIndexOf('{') > before.lastIndexOf('}')
    const filterContents = before.slice(before.lastIndexOf('{') + 1).trim()
    const insertion = isInsideFilter ? `${filterContents ? ',' : ''}${tag}` : `{${tag}}`
    const nextTemplate = `${before}${insertion}${after}`

    setTemplate(nextTemplate)
    requestAnimationFrame(() => {
      const cursor = start + insertion.length
      input.focus()
      input.setSelectionRange(cursor, cursor)
    })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const validationError = validateActionTemplate(template)
    if (validationError) {
      setErrorMessage(validationError)
      return
    }

    setIsSaving(true)
    setErrorMessage('')
    try {
      const nextAction = createGameAction(template, title, props.profileId)
      await props.onSave(props.action ? { ...nextAction, id: props.action.id } : nextAction)
      handleOpenChange(false)
    } catch {
      setErrorMessage('Impossible d’enregistrer cette action.')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDuplicate() {
    if (!props.action || !props.onDuplicate) return
    await props.onDuplicate(props.action)
    handleOpenChange(false)
  }

  async function handleDelete() {
    if (!props.action || !props.onDelete) return
    await props.onDelete(props.action)
    handleOpenChange(false)
  }

  return (
    <Dialog onOpenChange={handleOpenChange} open={props.open}>
      <DialogContent className="flex h-[calc(100svh-2rem)] w-[calc(100svw-2rem)] max-h-[calc(100svh-2rem)] max-w-[calc(100svw-2rem)] flex-col gap-0 overflow-hidden rounded-2xl border-4 border-game-ink bg-white p-5 text-game-ink shadow-[0_8px_0_0_#16171d] sm:w-full sm:max-w-xl sm:p-7">
        <DialogHeader className="min-w-0 shrink-0 pr-12">
          <DialogTitle className="text-2xl font-black tracking-[-0.06em]">
            {props.action ? 'Modifier l’action' : 'Ajouter une action'}
          </DialogTitle>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-1 pb-4">
          <form className="mt-4" onSubmit={handleSubmit}>
            <label className="grid gap-2 text-sm font-bold">
              Titre optionnel
              <input
                className="h-12 w-full rounded-xl border-4 border-game-ink px-3 text-base font-semibold shadow-[0_4px_0_0_#16171d] outline-none transition-transform placeholder:text-game-ink/50 focus:translate-y-[2px] focus:shadow-[0_2px_0_0_#16171d] focus:ring-4 focus:ring-game-blue/30"
                onChange={handleTitleChange}
                placeholder="Ex. Ranger la cuisine"
                value={title}
              />
            </label>
            <label className="mt-5 grid gap-2 text-sm font-bold">
              Action
              <textarea
                className="min-h-32 w-full resize-y rounded-xl border-4 border-game-ink px-3 py-3 text-base font-semibold shadow-[0_4px_0_0_#16171d] outline-none transition-transform placeholder:text-game-ink/50 focus:translate-y-[2px] focus:shadow-[0_2px_0_0_#16171d] focus:ring-4 focus:ring-game-blue/30"
                onChange={handleTemplateChange}
                placeholder="Ex. Déplacer {objet} dans {pièce}"
                ref={templateInput}
                value={template}
              />
            </label>

            <section className="mt-6" aria-labelledby="syntax-title">
              <div className="flex items-center gap-2">
                <Braces aria-hidden="true" className="size-5 text-game-purple" />
                <h3 id="syntax-title" className="text-base font-black">Syntaxe des filtres</h3>
              </div>
              <p className="mt-2 text-sm leading-6 text-game-ink/70">
                 <code className="font-bold text-game-purple">{'{tag1,tag2}'}</code> accepte tag1 ou tag2.{' '}
                 <code className="font-bold text-game-purple">{'{tag1&tag3,tag2}'}</code> accepte tag1 avec tag3, ou tag2.{' '}
                 <code className="font-bold text-game-purple">{'{tag1&-tag2}'}</code> accepte tag1 sans tag2.
              </p>
            </section>

            {props.availableTags.length > 0 && (
              <section className="mt-5" aria-labelledby="available-tags-title">
                <div className="flex items-center gap-2">
                  <Tag aria-hidden="true" className="size-4 text-game-purple" />
                  <h3 id="available-tags-title" className="text-sm font-black">Tags existants</h3>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {props.availableTags.map((tag) => (
                    <button
                      className="rounded-full border-2 border-game-ink bg-white px-3 py-1.5 text-sm font-bold text-game-ink hover:bg-game-blue hover:text-white"
                      data-tag={tag}
                      key={tag}
                      onClick={handleTagInsert}
                      type="button"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </section>
            )}

            <section className="mt-6 rounded-xl border-2 border-game-ink bg-game-yellow/35 p-4" aria-labelledby="preview-title">
              <h3 id="preview-title" className="text-sm font-black">Aperçu</h3>
              <div className="mt-2">
                <ActionTemplatePreview template={template} />
              </div>
            </section>

            {errorMessage && <p className="mt-4 font-bold text-red-700">{errorMessage}</p>}

            {props.action && (
              <div className="mt-6 grid grid-cols-2 gap-3">
                <Button
                  className="cartoon-press h-auto rounded-xl border-4 border-game-ink bg-game-green px-4 py-3 font-black text-white hover:bg-game-green"
                  onClick={handleDuplicate}
                  type="button"
                >
                  <Copy aria-hidden="true" className="size-4" />
                  Dupliquer
                </Button>
                <Button
                  className="cartoon-press h-auto rounded-xl border-4 border-game-ink bg-game-red px-4 py-3 font-black text-white hover:bg-game-red"
                  onClick={handleDelete}
                  type="button"
                >
                  <Trash2 aria-hidden="true" className="size-4" />
                  Supprimer
                </Button>
              </div>
            )}

            <Button
              className="cartoon-press mt-3 h-auto w-full rounded-xl border-4 border-game-ink bg-game-green px-5 py-3 text-base font-black text-white hover:bg-game-green"
              disabled={isSaving}
              type="submit"
            >
              {isSaving ? 'Enregistrement...' : props.action ? 'Enregistrer' : 'Ajouter l’action'}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { ActionDialog }
