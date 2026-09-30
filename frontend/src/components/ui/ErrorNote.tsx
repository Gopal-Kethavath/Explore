import { Button } from './Button.tsx'

export function ErrorNote({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rounded-2xl border border-sand-200 bg-white p-6">
      <p>{message}</p>
      <Button className="mt-4" type="button" onClick={onRetry}>
        Try again
      </Button>
    </div>
  )
}
