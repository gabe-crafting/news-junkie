# TODO

## Features

- **Lazy/dynamic loading on scrolling**
  - Implement infinite scroll / pagination for posts feed(s).
  - Preserve scroll position and avoid jank when appending new pages.

## Optimization

- **Memoize posts between page navigations**
  - Keep posts cached across route changes (Home/Profile/etc.) to avoid refetch on every navigation.
  - Add a **Refresh** button to explicitly fetch new posts.
  - Future direction: replace refresh polling with **SSE + notifications**.

- **Optimize editing/deleting/creating posts**
  - Avoid refetching the entire feed after mutations.
  - Apply local optimistic updates (insert/update/remove) to cached post lists.
  - Only refetch minimally if needed (e.g., the affected post or page).


