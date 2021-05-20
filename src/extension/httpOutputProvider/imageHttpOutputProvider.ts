import * as vscode from 'vscode';
import { HttpOutputProvider, HttpOutputResult, HttpOutputPriority } from '../extensionApi';
import type { HttpResponse } from 'httpyac';

export class ImageHttpOutputProvider implements HttpOutputProvider {
  id = 'httpbook-image';

  getResponseOutputResult(response: HttpResponse): HttpOutputResult | false {

    if (response?.contentType
      && response.rawBody
      && ['image/png', 'image/jpeg'].indexOf(response?.contentType.mimeType) >= 0) {
      return {
        outputItems: new vscode.NotebookCellOutputItem(
          response?.contentType.mimeType,
          response.rawBody.toString('base64')
        ),
        priority: HttpOutputPriority.Low
      };
    }
    return false;
  }
}
