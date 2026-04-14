import type { Plugin } from 'vite';
import { createApiMiddleware } from './api.js';
import type { MenuPluginOptions } from './api.js';
import { getHtmlInterface } from './ui.js';

export default function menuVisualizerPlugin(options: MenuPluginOptions): Plugin {
    return {
        name: 'vite-plugin-menu-visualizer',
        apply: 'serve', // 仅在开发环境应用

        configureServer(server) {
            // 1. 注册中间件，拦截特定 API 请求
            server.middlewares.use('/__menu-api', createApiMiddleware(options));

            // 2. 注册可视化页面的入口路由
            server.middlewares.use('/__menu-editor', (_req, res) => {
                res.setHeader('Content-Type', 'text/html; charset=utf-8');
                res.end(getHtmlInterface());
            });
        },

        // 监听文件变动实现 HMR
        handleHotUpdate({ file, server }) {
            // 如果 menu.config.ts 发生变动
            if (file.endsWith('menu.config.ts')) {
                // 向前端发送自定义事件
                server.ws.send({
                    type: 'custom',
                    event: 'menu-config-update',
                    data: {}
                });
            }
        }
    };
}
