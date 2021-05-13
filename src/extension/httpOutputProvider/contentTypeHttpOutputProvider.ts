import { HttpRegion } from 'httpyac';
import * as vscode from 'vscode';
import { AppConfig } from '../config';
import { HttpOutputProvider, HttpOutputResult, HttpOutputPriority, HttpOutputContext } from '../extensionApi';
import { HttpOutputContext as InternalHttpOutputContext } from './httpOutputContext';
import type { HttpResponse } from 'httpyac';

export class ContentTypeHttpOutputProvider implements HttpOutputProvider {
  id = 'httpbook-contenttype';

  constructor(readonly config: AppConfig) {}

  getResponseOutputResult(response: HttpResponse, { httpRegion }: HttpOutputContext & InternalHttpOutputContext): HttpOutputResult | false {
    if (response?.contentType) {
      const outputItems: Array<vscode.NotebookCellOutputItem> = [];
      if (this.config.useContentTypeAsNotebookOutputRendererMime) {
        outputItems.push(this.createUnknownNotebookCellOutputItem(response.contentType.mimeType, httpRegion));
      }
      if (this.config.mapContentTypeToNotebookOutputRendererMime) {
        for (const [regex, mimes] of Object.entries(this.config.mapContentTypeToNotebookOutputRendererMime)) {
          const regexp = new RegExp(regex, 'ui');
          if (regexp.test(response.contentType.mimeType)) {
            if (Array.isArray(mimes)) {
              outputItems.push(...mimes.map(mime => this.createUnknownNotebookCellOutputItem(mime, httpRegion)));
            } else if (typeof mimes === 'string') {
              outputItems.push(this.createUnknownNotebookCellOutputItem(mimes, httpRegion));
            }
          }
        }
      }
      return {
        outputItems,
        priority: HttpOutputPriority.Low
      };
    }
    return false;
  }

  private createUnknownNotebookCellOutputItem(mime: string, httpRegion: HttpRegion) {
    return new vscode.NotebookCellOutputItem(
      mime,
      httpRegion.response?.body,
      {
        response: httpRegion.response,
        testResults: httpRegion.testResults,
      }
    );
  }
}
