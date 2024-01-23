/// <reference types="vitest" />
import { defineConfig, mergeConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { compression } from 'vite-plugin-compression2';
import { createHtmlPlugin } from 'vite-plugin-html';
import { visualizer } from 'rollup-plugin-visualizer';
import path from 'path';
import './src/vite-env';
// 自动引入naive-ui 组件
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers';
import Unocss from 'unocss/vite';
export default defineConfig(({ command }) => {
  // 通用配置
  const common = {
    plugins: [
      vue(),
      vueJsx(),
      AutoImport({
        imports: [
          'vue',
          {
            'naive-ui': [
              'useDialog',
              'useMessage',
              'useNotification',
              'useLoadingBar',
            ],
          },
        ],
      }),
      Components({
        resolvers: [NaiveUiResolver()],
      }),
      Unocss(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@admin': path.resolve(__dirname, './src/instances/admin'),
        '@login': path.resolve(__dirname, './src/instances/login'),
      },
    },
    envDir: './env',
    test: {},
  };
  if (command === 'serve') {
    return mergeConfig(common, {
      // dev 独有配置
      plugins: [
        createHtmlPlugin({
          inject: {
            data: {
              title: import.meta.env.VITE_APP_TITLE,
            },
          },
        }),
      ],
    });
  } else {
    // command === 'build'
    console.log('build');
    return mergeConfig(common, {
      // build 独有配置
      plugins: [
        compression({ include: [/\.(js)$/, /\.(css)$/, /\.(html)$/] }), // 构建产物压缩 gzip
        createHtmlPlugin({
          minify: true,
          inject: {
            data: {
              title: 'ADMINS-PROD',
            },
          },
        }), // index.html 插入数据
        visualizer({
          emitFile: true,
          filename: 'stats.html',
        }), // 构建产物文件大小分析
      ],
      build: {
        sourcemap: true,
      },
    });
  }
});
