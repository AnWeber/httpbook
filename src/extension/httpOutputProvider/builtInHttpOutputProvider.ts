import * as vscode from 'vscode';
import { HttpOutputProvider, HttpOutputResult, HttpOutputPriority } from '../extensionApi';
import type { HttpResponse } from 'httpyac';
import { AppConfig } from '../config';
export class BuiltInHttpOutputProvider implements HttpOutputProvider {
  id = 'httpbook-builtin';

  constructor(readonly config: AppConfig) { }

  getResponseOutputResult(response: HttpResponse): HttpOutputResult | false {

    if (this.config.useBuiltInNotebookOutputRendererer && response?.contentType) {
      if (['image/svg+xml',
        'text/html',
        'text/markdown',
        'text/plain',
        'application/javascript'].indexOf(response?.contentType.mimeType) >= 0) {
        return {
          outputItems: new vscode.NotebookCellOutputItem(
            response?.contentType.mimeType,
            response?.body
          ),
          priority: HttpOutputPriority.Low
        };
      }
      if (response.parsedBody
        && /^(application|json)\/(.*\+|x-amz-)?json.*$/u.test(response.contentType.mimeType)) {
        return {
          outputItems: new vscode.NotebookCellOutputItem(
            'application/json',
            response.parsedBody
          ),
          priority: HttpOutputPriority.Low
        };
      }
      if (typeof response.body === 'string') {
        return {
          outputItems: new vscode.NotebookCellOutputItem(
            'text/plain',
            response.body
          ),
          priority: HttpOutputPriority.Low
        };
      }
    }
    return false;
  }
}
