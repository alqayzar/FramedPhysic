import { useRef, useState, type ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EmojiPickerDialog } from '@/components/settings/emoji-picker-dialog';
import { type GamePlayer } from '@/lib/game-session';
import { createEmojiImage } from '@/lib/emoji-image';
import { createSquareImage } from '@/lib/square-image';
import { Camera, Smile, Trash2 } from 'lucide-react';

const PORTRAIT_BUTTON_CLASS = 'cartoon-press h-14 flex-1 rounded-xl border-4 border-game-ink p-0';

interface GamePlayerPortraitDialogProps {
  onImageChange: (image: Blob | undefined) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  player: GamePlayer;
}

function GamePlayerPortraitDialog(props: GamePlayerPortraitDialogProps) {
  const cameraInput = useRef<HTMLInputElement>(null);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);

  function openCamera() {
    cameraInput.current?.click();
  }

  function openEmojiPicker() {
    setIsEmojiPickerOpen(true);
  }

  function handleEmojiPickerOpenChange(open: boolean) {
    setIsEmojiPickerOpen(open);
  }

  async function selectEmoji(emoji: string) {
    props.onImageChange(await createEmojiImage(emoji));
  }

  async function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const image = event.target.files?.[0];
    event.target.value = '';
    if (!image) return;

    try {
      props.onImageChange(await createSquareImage(image));
    } catch {
      props.onImageChange(image);
    }
  }

  function removePortrait() {
    props.onImageChange(undefined);
  }

  return (
    <>
      <Dialog onOpenChange={props.onOpenChange} open={props.open}>
        <DialogContent className="w-[calc(100svw-2rem)] max-w-[calc(100svw-2rem)] rounded-2xl border-4 border-game-ink bg-white p-6 text-game-ink shadow-[0_8px_0_0_#16171d] sm:max-w-md">
          <DialogHeader className="pr-10">
            <DialogTitle className="break-words text-center text-2xl font-black tracking-[-0.04em]">{props.player.name}</DialogTitle>
          </DialogHeader>
          <div className="mt-4 flex gap-3">
            <Button aria-label="Prendre une photo" className={`${PORTRAIT_BUTTON_CLASS} bg-game-blue text-white hover:bg-game-blue`} onClick={openCamera} type="button">
              <Camera aria-hidden="true" className="size-6" />
            </Button>
            <Button aria-label="Choisir un emoji" className={`${PORTRAIT_BUTTON_CLASS} bg-game-purple text-white hover:bg-game-purple`} onClick={openEmojiPicker} type="button">
              <Smile aria-hidden="true" className="size-6" />
            </Button>
            {props.player.image && (
              <Button aria-label="Supprimer le portrait" className={`${PORTRAIT_BUTTON_CLASS} bg-game-red text-white hover:bg-game-red`} onClick={removePortrait} type="button">
                <Trash2 aria-hidden="true" className="size-6" />
              </Button>
            )}
          </div>
          <input accept="image/*" capture="environment" className="sr-only" onChange={handleImageChange} ref={cameraInput} type="file" />
        </DialogContent>
      </Dialog>
      <EmojiPickerDialog onOpenChange={handleEmojiPickerOpenChange} onSelect={selectEmoji} open={isEmojiPickerOpen} />
    </>
  );
}

export { GamePlayerPortraitDialog };
