import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
	test: {
		include: ['../../tests/unit/**/*.{test,spec}.{js,ts}'],
		environment: 'node',
	},
	resolve: {
		alias: {
			'@extension/shared': resolve(__dirname, './index.mts'),
		},
	},
})
