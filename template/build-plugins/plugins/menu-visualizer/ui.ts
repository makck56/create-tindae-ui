import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function getHtmlInterface() {
    const uiDir = path.resolve(__dirname, 'ui');
    
    try {
        const html = fs.readFileSync(path.join(uiDir, 'index.html'), 'utf-8');
        const css = fs.readFileSync(path.join(uiDir, 'style.css'), 'utf-8');
        const js = fs.readFileSync(path.join(uiDir, 'client.js'), 'utf-8');

        return html
            .replace('<!--INJECT_STYLE-->', `<style>${css}</style>`)
            .replace('<!--INJECT_SCRIPT-->', `<script>${js}</script>`);
    } catch (e: any) {
        console.error('Failed to load menu visualizer UI files', e);
        return `<h1>Error loading UI: ${e.message}</h1>`;
    }
}