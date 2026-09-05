export function TemplateThumb({ accent }: { accent: string }) {
  return (
    <div
      className="flex h-20 items-center justify-center"
      style={{ background: `linear-gradient(135deg, ${accent}22, ${accent}55)` }}
    >
      <div
        className="h-8 w-8 rounded-lg shadow-inner"
        style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}
      />
    </div>
  )
}
