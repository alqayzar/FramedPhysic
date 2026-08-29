import { parseActionTemplate } from '@/lib/action-template'

interface ActionTemplatePreviewProps {
  template: string
}

function ActionTemplatePreview(props: ActionTemplatePreviewProps) {
  const segments = parseActionTemplate(props.template)

  if (segments.length === 0) {
    return <p className="text-sm font-bold text-game-ink/50">L’aperçu apparaîtra ici.</p>
  }

  return (
    <p className="flex flex-wrap items-center gap-1.5 text-sm font-bold leading-7 text-game-ink">
      {segments.map((segment, index) => {
        if (segment.type === 'text') return <span key={`${segment.value}-${index}`}>{segment.value}</span>

        return (
          <span className="inline-flex flex-wrap items-center gap-1 rounded-lg border-2 border-game-ink bg-game-yellow px-2 py-1" key={`${segment.filter.raw}-${index}`}>
            {segment.filter.alternatives.map((alternative, alternativeIndex) => (
              <span className="inline-flex items-center gap-1" key={alternative.join('&')}>
                {alternativeIndex > 0 && <span className="text-xs text-game-ink/60">ou</span>}
                {alternative.map((tag, tagIndex) => (
                  <span className="inline-flex items-center gap-1" key={tag}>
                    {tagIndex > 0 && <span className="text-xs text-game-ink/60">et</span>}
                    <span className="rounded-full bg-game-purple px-1.5 py-0.5 text-xs text-white">{tag}</span>
                  </span>
                ))}
              </span>
            ))}
          </span>
        )
      })}
    </p>
  )
}

export { ActionTemplatePreview }
