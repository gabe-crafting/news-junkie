import type { StorybookConfig } from '@storybook/react-vite'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'
import { mergeConfig } from 'vite'

const projectRoot = fileURLToPath(new URL('..', import.meta.url))

const config: StorybookConfig = {
  // Keep this TS/TSX-only for now; the default template MDX can break the build.
  // We can re-enable MDX once we add/verify our own MDX docs.
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: [
    '@chromatic-com/storybook',
    '@storybook/addon-vitest',
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  async viteFinal(existingConfig) {
    const basePlugins = existingConfig.plugins ?? []
    return mergeConfig(existingConfig, {
      plugins: [...basePlugins, tailwindcss()],
      resolve: {
        alias: {
          '@': path.resolve(projectRoot, 'src'),
        },
      },
    })
  },
}

export default config