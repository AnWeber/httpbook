import * as Httpyac from 'httpyac';
import * as vscode from 'vscode';
import { HttpOutputProvider, HttpOutputResult, HttpOutputPriority } from '../httpOutputProvider';

export class ImageHttpOutputProvider implements HttpOutputProvider {
  id = 'httpbook-image';

  getOutputResult(httpRegion: Httpyac.HttpRegion): HttpOutputResult | false {

    if (httpRegion.response?.contentType
      && httpRegion.response.rawBody
      && ['image/png', 'image/jpeg'].indexOf(httpRegion.response?.contentType.mimeType) >= 0) {
      return {
        outputItems: new vscode.NotebookCellOutputItem(
          httpRegion.response?.contentType.mimeType,
          httpRegion.response.rawBody.toString('base64')
        ),
        priority: HttpOutputPriority.Low
      };
    }
    return false;
  }
}
