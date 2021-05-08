import * as Httpyac from 'httpyac';
import * as vscode from 'vscode';
import { HttpOutputProvider, HttpOutputResult, HttpOutputPriority } from './httpOutputProvider';

export class BuiltInHttpOutputProvider implements HttpOutputProvider {
  id = 'httpbook-builtin';

  getOutputResult(httpRegion: Httpyac.HttpRegion): HttpOutputResult | false {

    if (httpRegion.response?.contentType) {
      if (['image/svg+xml',
        'text/html',
        'text/markdown',
        'text/plain',
        'application/javascript'].indexOf(httpRegion.response?.contentType.mimeType) >= 0) {
        return {
          outputItems: new vscode.NotebookCellOutputItem(
            httpRegion.response?.contentType.mimeType,
            httpRegion.response?.body
          ),
          priority: HttpOutputPriority.Low
        };
      }
      if (httpRegion.response.parsedBody
        && /^(application|json)\/(.*\+|x-amz-)?json.*$/u.test(httpRegion.response.contentType.mimeType)) {
        return {
          outputItems: new vscode.NotebookCellOutputItem(
            httpRegion.response?.contentType.mimeType,
            httpRegion.response.parsedBody
          ),
          priority: HttpOutputPriority.Low
        };
      }
      if (typeof httpRegion.response.body === 'string') {
        return {
          outputItems: new vscode.NotebookCellOutputItem(
            'text/plain',
            httpRegion.response.body
          ),
          priority: HttpOutputPriority.Low
        };
      }
    }
    return false;
  }
}
