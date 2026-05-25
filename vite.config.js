import { fileURLToPath, URL } from 'node:url'
import path from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const baseUrl = env.VITE_APP_BASE_URL
  const port = Number(env.PORT || process.env.npm_config_port || 9528)

  return {
    base: '/admin/',
    plugins: [
      vue(),
      createSvgIconsPlugin({
        iconDirs: [path.resolve(process.cwd(), 'src/icons/svg')],
        symbolId: 'icon-[name]'
      })
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
    },
    define: {
      'process.env': {}
    },
    server: {
      host: '0.0.0.0',
      port,
      open: true,
      proxy: {
        '/dev-api': {
          target: baseUrl,
          rewrite: path => path.replace(/^\/dev-api/, '/'),
          secure: false,
          changeOrigin: true
        },
        '/upload': {
          target: baseUrl,
          secure: false,
          changeOrigin: true
        }
      }
    },
    build: {
      outDir: 'dist',
      assetsDir: 'static',
      sourcemap: false,
      chunkSizeWarningLimit: 30000,
      rollupOptions: {
        onwarn(warning, warn) {
          if (
            warning.code === 'INVALID_ANNOTATION' &&
            warning.id &&
            warning.id.includes('node_modules/@vueuse/core/')
          ) {
            return
          }
          warn(warning)
        },
        output: {
          manualChunks: {
            vue: ['vue', 'vue-router', 'vuex'],
            elementPlus: ['element-plus'],
            echarts: ['echarts']
          }
        }
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler'
        }
      }
    },
    test: {
      globals: true,
      environment: 'jsdom'
    }
  }
})
