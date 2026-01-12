import type { Post } from '@/hooks/usePosts'

type Listener = (post: Post) => void
type DeleteListener = (postId: string) => void

const updatedListeners = new Set<Listener>()
const deletedListeners = new Set<DeleteListener>()

export function emitPostUpdated(post: Post) {
  for (const listener of updatedListeners) listener(post)
}

export function onPostUpdated(listener: Listener): () => void {
  updatedListeners.add(listener)
  return () => {
    updatedListeners.delete(listener)
  }
}

export function emitPostDeleted(postId: string) {
  for (const listener of deletedListeners) listener(postId)
}

export function onPostDeleted(listener: DeleteListener): () => void {
  deletedListeners.add(listener)
  return () => {
    deletedListeners.delete(listener)
  }
}

