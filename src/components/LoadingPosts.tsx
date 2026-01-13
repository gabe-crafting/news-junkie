import { cn } from '@/lib/utils'

export function LoadingPosts(props: { text?: string; className?: string }) {
  const { text = 'Loading posts...', className } = props
  return <div className={cn('text-muted-foreground', className)}>{text}</div>
}

