import style from './style.css';
import type { NotebookRendererApi } from 'vscode-notebook-renderer';

interface IRenderInfo {
  container: HTMLElement;
  mimeType: string;
  data: string;
  notebookApi: NotebookRendererApi<unknown>;
}

export function render({ container, mimeType, data }: IRenderInfo) : void {

  const pre = document.createElement('pre');
  pre.classList.add(style.json);
  const code = document.createElement('code');
  code.textContent = `mime type: ${mimeType}\n\n${JSON.stringify(data, null, 2)}`;
  pre.appendChild(code);
  container.appendChild(pre);
}
