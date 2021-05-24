import type * as Httpyac from 'httpyac';
import * as vscode from 'vscode';
import { AppConfig } from '../config';
import { HttpOutputProvider, HttpOutputResult, HttpOutputPriority } from '../extensionApi';


export class MonacoEditorHttpOutputProvider implements HttpOutputProvider {
  id = 'httpbook-monaco';


  constructor(readonly config: AppConfig, readonly httpyac: typeof Httpyac) { }

  getResponseOutputResult(response: Httpyac.HttpResponse): HttpOutputResult | false {
    const metaData: Record<string, unknown> = {
      colorThemeKind: vscode.window.activeColorTheme.kind,
      editorOptions: this.config.monacoEditorOptions,
    };

    let mimeType: string | undefined;

    if (response.contentType) {
      if (this.httpyac.utils.isMimeTypeJSON(response.contentType)) {
        mimeType = 'application/json';
      } else if (this.httpyac.utils.isMimeTypeXml(response.contentType)) {
        mimeType = 'application/xml';
      } else if (this.httpyac.utils.isMimeTypeCSS(response.contentType)) {
        mimeType = 'text/css';
      } else if (this.httpyac.utils.isMimeTypeHtml(response.contentType)) {
        mimeType = 'text/html';
      } else if (this.httpyac.utils.isMimeTypeJavascript(response.contentType)) {
        mimeType = 'application/javascript';
      } else if (this.httpyac.utils.isMimeTypeMarkdown(response.contentType)) {
        mimeType = 'text/markdown';
      } else if (response.contentType.mimeType.startsWith('text')) {
        mimeType = 'text/plain';
      }
    }

    if (mimeType && typeof response.body === 'string') {
      const outputItem = vscode.NotebookCellOutputItem.text(response.body, mimeType);
      outputItem.metadata = metaData;
      return {
        outputItems: outputItem,
        priority: HttpOutputPriority.Default,
      };
    }

    return false;
  }
}
