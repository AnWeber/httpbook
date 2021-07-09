import type * as Httpyac from 'httpyac';
import * as vscode from 'vscode';
import { AppConfig } from '../config';
import { HttpOutputProvider, HttpOutputResult, HttpOutputPriority } from '../extensionApi';


export class MonacoEditorHttpOutputProvider implements HttpOutputProvider {
  id = 'httpbook-monaco';


  constructor(readonly config: AppConfig, readonly httpyac: typeof Httpyac) { }

  getResponseOutputResult(response: Httpyac.HttpResponse): HttpOutputResult | false {
    let mimeType: string | undefined;
    if (response.contentType) {
      if (this.httpyac.utils.isMimeTypeJSON(response.contentType)) {
        mimeType = 'x-httpbook/json';
      } else if (this.httpyac.utils.isMimeTypeXml(response.contentType)) {
        mimeType = 'x-httpbook/xml';
      } else if (this.httpyac.utils.isMimeTypeCSS(response.contentType)) {
        mimeType = 'x-httpbook/css';
      } else if (this.httpyac.utils.isMimeTypeHtml(response.contentType)) {
        mimeType = 'x-httpbook/html';
      } else if (this.httpyac.utils.isMimeTypeJavascript(response.contentType)) {
        mimeType = 'x-httpbook/javascript';
      } else if (this.httpyac.utils.isMimeTypeMarkdown(response.contentType)) {
        mimeType = 'x-httpbook/markdown';
      } else if (response.contentType.mimeType.startsWith('text')) {
        mimeType = 'x-httpbook/plain';
      }
    }

    if (mimeType
      && response.body
      && typeof response.body === 'string'
      && response.body.length > 0) {
      return {
        outputItems: vscode.NotebookCellOutputItem.text(response.body, mimeType),
        priority: HttpOutputPriority.Default,
      };
    }

    return false;
  }
}
