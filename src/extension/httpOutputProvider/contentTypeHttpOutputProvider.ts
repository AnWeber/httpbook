import * as vscode from 'vscode';
import { AppConfig } from '../config';
import { HttpOutputProvider, HttpOutputResult, HttpOutputPriority } from '../extensionApi';
import type { HttpResponse } from 'httpyac';

export class ContentTypeHttpOutputProvider implements HttpOutputProvider {
  id = 'httpbook-contenttype';

  constructor(readonly config: AppConfig) {}

  getResponseOutputResult(response: HttpResponse): HttpOutputResult | false {
    if (response?.contentType && response.rawBody) {
      const rawBody = response.rawBody;
      const outputItems: Array<vscode.NotebookCellOutputItem> = [];
      if (this.config.useContentTypeAsNotebookOutputRendererMime) {
        outputItems.push(vscode.NotebookCellOutputItem.bytes(rawBody, response.contentType.mimeType));
      }
      if (this.config.mapContentTypeToNotebookOutputRendererMime) {
        for (const [regex, mimes] of Object.entries(this.config.mapContentTypeToNotebookOutputRendererMime)) {
          const regexp = new RegExp(regex, 'ui');
          if (regexp.test(response.contentType.mimeType)) {
            if (Array.isArray(mimes)) {
              outputItems.push(...mimes.map(mime => vscode.NotebookCellOutputItem.bytes(rawBody, mime)));
            } else if (typeof mimes === 'string') {
              outputItems.push(vscode.NotebookCellOutputItem.bytes(rawBody, mimes));
            }
          }
        }
      }
      return {
        outputItems,
        priority: HttpOutputPriority.Default
      };
    }
    return false;
  }
}
