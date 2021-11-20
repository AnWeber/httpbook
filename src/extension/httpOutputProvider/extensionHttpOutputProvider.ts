import * as vscode from 'vscode';
import { HttpOutputPriority, HttpOutputProvider, HttpOutputResult } from '../extensionApi';
import type { HttpResponse } from 'httpyac';

export class ExtensionHttpOutputProvider implements HttpOutputProvider {
  id = 'httpbook-extension';

  getResponseOutputResult(response: HttpResponse): HttpOutputResult | false {
    if (response.contentType?.mimeType && response.rawBody) {
      const rawBody = response.rawBody;
      const outputItems: Array<vscode.NotebookCellOutputItem> = [];
      for (const extension of vscode.extensions.all) {
        if (extension.isActive && extension.packageJSON?.contributes?.notebookRenderer) {
          for (const notebookRenderer of extension.packageJSON.contributes.notebookRenderer) {
            if (!notebookRenderer.id || notebookRenderer.id.indexOf('httpbook') < 0) {
              if (notebookRenderer.mimeTypes.indexOf(response.contentType.mimeType) >= 0) {
                outputItems.push(new vscode.NotebookCellOutputItem(rawBody, response.contentType?.mimeType));
              }
            }
          }
        }
      }
      return {
        outputItems,
        priority: HttpOutputPriority.Default,
      };
    }

    return false;
  }
}
