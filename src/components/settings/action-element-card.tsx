import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { type ActionElement } from '@/lib/action-elements'
import { Copy, Tag, Trash2 } from 'lucide-react'

interface ActionElementCardProps {
  element: ActionElement
  onDelete: (element: ActionElement) => Promise<void>
  onDuplicate: (element: ActionElement) => Promise<void>
  onSelect: (element: ActionElement) => void
}

function ActionElementCard(props: ActionElementCardProps) {
  const { element } = props
  const [imageSource, setImageSource] = useState(element.imageUrl ?? '')

  useEffect(() => {
    if (!element.image) {
      setImageSource(element.imageUrl ?? '')
      return
    }

    const source = URL.createObjectURL(element.image)
    setImageSource(source)
    return () => URL.revokeObjectURL(source)
  }, [element.image, element.imageUrl])

  function handleClick() {
    props.onSelect(element)
  }

  function handleDelete() {
    void props.onDelete(element)
  }

  function handleDuplicate() {
    void props.onDuplicate(element)
  }

  return (
    <article className="flex w-full min-w-0 flex-col rounded-2xl border-4 border-game-ink bg-white p-4 shadow-[0_5px_0_0_#16171d]">
      <div className="flex min-w-0 items-start gap-2">
        <button
          aria-label={`Modifier ${element.title}`}
          className="min-w-0 flex-1 break-words text-left text-lg font-black leading-tight"
          onClick={handleClick}
          type="button"
        >
          {element.title}
        </button>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            aria-label={`Dupliquer ${element.title}`}
            className="cartoon-press cartoon-press-sm size-8 rounded-lg border-2 border-game-ink bg-game-green p-0 text-white hover:bg-game-green"
            onClick={handleDuplicate}
            type="button"
          >
            <Copy aria-hidden="true" className="size-3.5" />
          </Button>
          <Button
            aria-label={`Supprimer ${element.title}`}
            className="cartoon-press cartoon-press-sm size-8 rounded-lg border-2 border-game-ink bg-game-red p-0 text-white hover:bg-game-red"
            onClick={handleDelete}
            type="button"
          >
            <Trash2 aria-hidden="true" className="size-3.5" />
          </Button>
        </div>
      </div>

      {imageSource ? (
        <button
          aria-label={`Modifier ${element.title}`}
          className="relative mt-3 h-40 w-full overflow-hidden text-left"
          onClick={handleClick}
          type="button"
        >
          <img
            alt=""
            className="size-full object-cover [mask-image:linear-gradient(to_bottom,#000_55%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,#000_55%,transparent_100%)]"
            src={imageSource}
          />
        </button>
      ) : null}

      {element.tags.length > 0 && (
        <ul className="mt-1 flex min-w-0 flex-nowrap gap-1.5 overflow-x-auto" aria-label="Tags">
          {element.tags.map((tag) => (
            <li
              className="inline-flex shrink-0 items-center gap-1 rounded-full bg-game-purple px-2 py-1 text-xs font-bold text-white"
              key={tag}
            >
              <Tag aria-hidden="true" className="size-3" />
              {tag}
            </li>
          ))}
        </ul>
      )}
    </article>
  )
}

export { ActionElementCard }
