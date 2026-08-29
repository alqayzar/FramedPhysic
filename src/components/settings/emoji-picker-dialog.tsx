import {
  type EmojiPickerListCategoryHeaderProps,
  type EmojiPickerListEmojiProps,
  type EmojiPickerListRowProps,
  EmojiPicker as EmojiPickerPrimitive,
} from 'frimousse'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Search } from 'lucide-react'

interface EmojiPickerDialogProps {
  onOpenChange: (open: boolean) => void
  onSelect: (emoji: string) => Promise<void>
  open: boolean
}

function EmojiRow(props: EmojiPickerListRowProps) {
  return <div {...props} className="scroll-my-1 px-1" />
}

function EmojiButton(props: EmojiPickerListEmojiProps) {
  return (
    <button
      {...props}
      className="flex aspect-square flex-1 items-center justify-center rounded-xl text-2xl transition-colors hover:bg-game-pink/20 data-[active]:bg-game-pink/30"
      type="button"
    >
      {props.emoji.emoji}
    </button>
  )
}

function EmojiCategoryHeader(props: EmojiPickerListCategoryHeaderProps) {
  return (
    <div {...props} className="px-2 pb-2 pt-4 text-xs font-black text-game-ink/60">
      {props.category.label}
    </div>
  )
}

function EmojiPickerDialog(props: EmojiPickerDialogProps) {
  async function handleEmojiSelect(selection: { emoji: string }) {
    await props.onSelect(selection.emoji)
    props.onOpenChange(false)
  }

  return (
    <Dialog onOpenChange={props.onOpenChange} open={props.open}>
      <DialogContent className="flex h-[calc(100svh-2rem)] w-[calc(100svw-2rem)] max-h-[calc(100svh-2rem)] max-w-[calc(100svw-2rem)] flex-col gap-0 overflow-hidden rounded-2xl border-4 border-game-ink bg-white p-5 text-game-ink shadow-[0_8px_0_0_#16171d] sm:w-full sm:max-w-lg sm:p-7">
        <DialogHeader className="shrink-0 pr-12">
          <DialogTitle className="text-xl font-black tracking-[-0.06em]">Choisir un emoji</DialogTitle>
        </DialogHeader>

        <EmojiPickerPrimitive.Root
          className="mt-3 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
          columns={8}
          onEmojiSelect={handleEmojiSelect}
        >
          <div className="flex h-12 shrink-0 items-center gap-2 border-b-4 border-game-ink px-3">
            <Search aria-hidden="true" className="size-5 text-game-ink/60" />
            <EmojiPickerPrimitive.Search
              className="h-full min-w-0 flex-1 bg-transparent text-base font-semibold outline-none placeholder:text-game-ink/50"
              placeholder="Rechercher un emoji"
            />
          </div>
          <EmojiPickerPrimitive.Viewport className="relative min-h-0 flex-1 outline-none">
            <EmojiPickerPrimitive.Loading className="absolute inset-0 grid place-items-center text-sm font-bold text-game-ink/60">
              Chargement...
            </EmojiPickerPrimitive.Loading>
            <EmojiPickerPrimitive.Empty className="absolute inset-0 grid place-items-center text-sm font-bold text-game-ink/60">
              Aucun emoji trouvé.
            </EmojiPickerPrimitive.Empty>
            <EmojiPickerPrimitive.List
              className="select-none pb-2"
              components={{
                CategoryHeader: EmojiCategoryHeader,
                Emoji: EmojiButton,
                Row: EmojiRow,
              }}
            />
          </EmojiPickerPrimitive.Viewport>
        </EmojiPickerPrimitive.Root>
      </DialogContent>
    </Dialog>
  )
}

export { EmojiPickerDialog }
