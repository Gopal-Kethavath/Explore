export function Rating({ value }: { value: number }) {
  const label = `Rated ${value.toFixed(1)} out of 5`
  return (
    <span className="inline-flex items-center gap-1 text-sm font-medium text-ink" aria-label={label}>
      <svg viewBox="0 0 20 20" className="h-4 w-4 fill-clay" aria-hidden="true">
        <path d="M10 1.8 12.4 7l5.6.5-4.2 3.7 1.3 5.5L10 13.8 4.9 16.7 6.2 11.2 2 7.5 7.6 7 10 1.8Z" />
      </svg>
      {value.toFixed(1)}
    </span>
  )
}
