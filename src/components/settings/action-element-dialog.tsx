import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type MouseEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { EmojiPickerDialog } from '@/components/settings/emoji-picker-dialog'
import { createActionElement, type ActionElement } from '@/lib/action-elements'
import { createEmojiImage } from '@/lib/emoji-image'
import { Camera, ImagePlus, Smile, Trash2, X } from 'lucide-react'

const ICON_BUTTON_CLASS =
  'cartoon-press h-14 w-full rounded-xl border-4 border-game-ink p-0'

const SUBMIT_BUTTON_CLASS =
  'cartoon-press mt-6 h-auto w-full rounded-xl border-4 border-game-ink px-5 py-3 text-base font-black text-white'

const INPUT_CLASS =
  'h-12 w-full min-w-0 max-w-full rounded-xl border-4 border-game-ink px-3 text-base font-semibold shadow-[0_4px_0_0_#16171d] outline-none transition-transform placeholder:text-game-ink/50 focus:translate-y-[2px] focus:shadow-[0_2px_0_0_#16171d] focus:ring-4 focus:ring-game-blue/30'

interface ActionElementDialogProps {
  availableTags: string[]
  element?: ActionElement
  onOpenChange: (open: boolean) => void
  onSave: (element: ActionElement) => Promise<void>
  open: boolean
  profileId: string
}

function ActionElementDialog(props: ActionElementDialogProps) {
  const cameraInput = useRef<HTMLInputElement>(null)
  const galleryInput = useRef<HTMLInputElement>(null)
  const tagInputElement = useRef<HTMLInputElement>(null)
  const [title, setTitle] = useState('')
  const [emoji, setEmoji] = useState('')
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [image, setImage] = useState<Blob>()
  const [imageUrl, setImageUrl] = useState('')
  const [previewSource, setPreviewSource] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!image) {
      setPreviewSource(imageUrl)
      return
    }

    const source = URL.createObjectURL(image)
    setPreviewSource(source)
    return () => URL.revokeObjectURL(source)
  }, [image, imageUrl])

  useEffect(() => {
    if (!props.open) return
    setTitle(props.element?.title ?? '')
    setEmoji(props.element?.emoji ?? '')
    setTagInput('')
    setTags(props.element?.tags ?? [])
    setImage(props.element?.image)
    setImageUrl(props.element?.imageUrl ?? '')
    setErrorMessage('')
  }, [props.element, props.open])

  function resetForm() {
    setTitle('')
    setEmoji('')
    setTagInput('')
    setTags([])
    setImage(undefined)
    setImageUrl('')
    setErrorMessage('')
  }

  function handleOpenChange(open: boolean) {
    props.onOpenChange(open)
    if (!open) resetForm()
  }

  function handleTitleChange(event: ChangeEvent<HTMLInputElement>) {
    setTitle(event.target.value)
  }

  function handleTagChange(event: ChangeEvent<HTMLInputElement>) {
    setTagInput(event.target.value)
  }

  function addTag(tagValue: string) {
    const tag = tagValue.trim()
    if (!tag || tags.includes(tag)) return
    setTags([...tags, tag])
    setTagInput('')
  }

  function removeTag(tagToRemove: string) {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  function handleTagClick(event: MouseEvent<HTMLButtonElement>) {
    const tag = event.currentTarget.dataset.tag
    if (tag) removeTag(tag)
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedImage = event.target.files?.[0]
    if (selectedImage) {
      setImage(selectedImage)
      setImageUrl('')
      setEmoji('')
    }
    event.target.value = ''
  }

  function openCamera() {
    cameraInput.current?.click()
  }

  function openGallery() {
    galleryInput.current?.click()
  }

  function openEmojiPicker() {
    setIsEmojiPickerOpen(true)
  }

  async function selectEmoji(selectedEmoji: string): Promise<void> {
    const emojiImage = await createEmojiImage(selectedEmoji)
    setEmoji(selectedEmoji)
    setImage(emojiImage)
    setImageUrl('')
  }

  function removeImage() {
    setImage(undefined)
    setImageUrl('')
    setEmoji('')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const tagInput = tagInputElement.current
    if (document.activeElement === tagInput && tagInput) {
      addTag(tagInput.value)
      return
    }
    if (!title.trim()) return

    setIsSaving(true)
    setErrorMessage('')
    try {
      const nextElement = createActionElement({ emoji, image, imageUrl, profileId: props.profileId, tags, title })
      await props.onSave(props.element ? { ...nextElement, id: props.element.id } : nextElement)
      handleOpenChange(false)
    } catch {
      setErrorMessage('Impossible d’enregistrer cet élément.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog onOpenChange={handleOpenChange} open={props.open}>
      <DialogContent
        className="flex h-[calc(100svh-2rem)] w-[calc(100svw-2rem)] max-h-[calc(100svh-2rem)] max-w-[calc(100svw-2rem)] flex-col gap-0 overflow-hidden rounded-2xl border-4 border-game-ink bg-white p-5 text-game-ink shadow-[0_8px_0_0_#16171d] sm:w-full sm:max-w-xl sm:p-7"
      >
        <DialogHeader className="min-w-0 shrink-0 pr-12">
          <DialogTitle className="text-2xl font-black tracking-[-0.06em]">
            {props.element ? 'Modifier l’élément' : 'Ajouter un élément'}
          </DialogTitle>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-1 pb-4">
          <form className="mt-3 min-w-0" onSubmit={handleSubmit}>
          <label className="grid min-w-0 gap-2 text-sm font-bold">
            Titre
            <input
              className={INPUT_CLASS}
              onChange={handleTitleChange}
              placeholder="Ex. Porte rouge"
              required
              value={title}
            />
          </label>

          <input
            accept="image/*"
            capture="environment"
            className="sr-only"
            onChange={handleImageChange}
            ref={cameraInput}
            type="file"
          />
          <input
            accept="image/*"
            className="sr-only"
            onChange={handleImageChange}
            ref={galleryInput}
            type="file"
          />

          <div className={`mt-6 grid min-w-0 gap-3 ${image || imageUrl ? 'grid-cols-4' : 'grid-cols-3'}`}>
            <Button
              aria-label="Prendre une photo"
              className={`${ICON_BUTTON_CLASS} bg-game-blue text-white hover:bg-game-blue`}
              onClick={openCamera}
              type="button"
            >
              <Camera aria-hidden="true" className="size-6" />
            </Button>
            <Button
              aria-label="Choisir un emoji"
              className={`${ICON_BUTTON_CLASS} bg-game-purple text-white hover:bg-game-purple`}
              onClick={openEmojiPicker}
              type="button"
            >
              {emoji ? <span className="text-2xl">{emoji}</span> : <Smile aria-hidden="true" className="size-6" />}
            </Button>
            <Button
              aria-label="Choisir dans la galerie"
              className={`${ICON_BUTTON_CLASS} bg-game-pink text-white hover:bg-game-pink`}
              onClick={openGallery}
              type="button"
            >
              <ImagePlus aria-hidden="true" className="size-6" />
            </Button>
            {(image || imageUrl) && (
              <Button
                aria-label="Supprimer l’image"
                className={`${ICON_BUTTON_CLASS} bg-game-red text-white hover:bg-game-red`}
                onClick={removeImage}
                type="button"
              >
                <Trash2 aria-hidden="true" className="size-6" />
              </Button>
            )}
          </div>

          {previewSource && (
            <div className="mt-5 min-w-0">
              <img
                alt="Aperçu de la photo sélectionnée"
                className="h-auto w-full rounded-xl border-4 border-game-ink"
                src={previewSource}
              />
            </div>
          )}

          <label className="mt-6 grid min-w-0 gap-2 text-sm font-bold">
            Tags
            <input
              className={INPUT_CLASS}
              onChange={handleTagChange}
              list="existing-tags"
              placeholder="Ex. salon, puis Entrée"
              ref={tagInputElement}
              value={tagInput}
            />
          </label>
          <datalist id="existing-tags">
            {props.availableTags.filter((tag) => !tags.includes(tag)).map((tag) => (
              <option key={tag} value={tag} />
            ))}
          </datalist>

          {tags.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-2" aria-label="Tags ajoutés">
              {tags.map((tag) => (
                <li key={tag}>
                  <button
                    aria-label={`Supprimer le tag ${tag}`}
                    className="inline-flex items-center gap-1 rounded-full bg-game-purple px-3 py-1.5 text-sm font-bold text-white transition-transform hover:-translate-y-px"
                    data-tag={tag}
                    onClick={handleTagClick}
                    type="button"
                  >
                    {tag}
                    <X aria-hidden="true" className="size-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {errorMessage && <p className="mt-4 font-bold text-red-700">{errorMessage}</p>}

          <Button
            className={`${SUBMIT_BUTTON_CLASS} bg-game-purple hover:bg-game-purple`}
            disabled={isSaving}
            type="submit"
          >
            {isSaving ? 'Enregistrement...' : props.element ? 'Enregistrer' : 'Ajouter l’élément'}
          </Button>
          </form>
        </div>
      </DialogContent>
      <EmojiPickerDialog onOpenChange={setIsEmojiPickerOpen} onSelect={selectEmoji} open={isEmojiPickerOpen} />
    </Dialog>
  )
}

export { ActionElementDialog }
