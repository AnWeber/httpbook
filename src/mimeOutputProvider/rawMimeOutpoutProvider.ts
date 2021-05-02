import * as Httpyac from 'httpyac';
import * as vscode from 'vscode';
import { MimeOutputProvider } from '../models/mimeOutputProvider';
import { HttpOutputRendererMimes } from '../config';

export class RawMimeOutputProvider implements MimeOutputProvider {

  constructor(private readonly httpyac: typeof Httpyac) {}

  getNotebookCellOutputItem(mime: string, httpRegion: Httpyac.HttpRegion): vscode.NotebookCellOutputItem | false {
    if (mime === HttpOutputRendererMimes.mime && httpRegion.response) {
      return new vscode.NotebookCellOutputItem(this.getContentType(httpRegion.response.contentType),
        httpRegion.response.parsedBody || httpRegion.response.body);
    }
    return false;
  }

  private getContentType(contentType: Httpyac.ContentType | undefined) {
    if (this.httpyac.utils.isMimeTypeJSON(contentType)) {
      return 'application/json';
    }

    if (contentType?.mimeType === 'image/png') {
      return 'image/png';
    }
    if (contentType?.mimeType === 'image/svg+xml') {
      return 'image/svg+xml';
    }

    if (contentType?.mimeType === 'image/jpeg') {
      return 'image/jpeg';
    }
    if (this.httpyac.utils.isMimeTypeXml(contentType) || this.httpyac.utils.isMimeTypeHtml(contentType)) {
      return 'text/html';
    }
    if (this.httpyac.utils.isMimeTypeJavascript(contentType)) {
      return 'application/javascript';
    }
    return 'text/plain';
  }

}
