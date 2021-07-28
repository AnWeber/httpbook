import type * as Httpyac from 'httpyac';
import * as vscode from 'vscode';
import { AppConfig } from '../config';
import { HttpOutputProvider, HttpOutputResult, HttpOutputPriority } from '../extensionApi';


export class BuiltInHttpOutputProvider implements HttpOutputProvider {
  id = 'httpbook-builtin';
  vscodeLanguages = new Set<string>();
  constructor(readonly config: AppConfig, readonly httpyac: typeof Httpyac) { }

  async initialize(): Promise<void> {
    await vscode.languages.getLanguages().then(languages => languages.forEach(lang => this.vscodeLanguages.add(lang.toLowerCase())));
  }

  getResponseOutputResult(response: Httpyac.HttpResponse): HttpOutputResult | false {
    if (!response.contentType
      || !response.body
      || typeof response.body !== 'string'
      || response.body.length === 0) {
      return false;
    }

    if (this.httpyac.utils.isMimeTypeJSON(response.contentType)) {
      return {
        outputItems: vscode.NotebookCellOutputItem.json(JSON.parse(response.body)),
        priority: HttpOutputPriority.Default,
      };
    }

    let responseMimeType = response.contentType.mimeType;
    if (this.httpyac.utils.isMimeTypeXml(response.contentType)) {
      responseMimeType = 'text/xml';
    } else if (this.httpyac.utils.isMimeTypeCSS(response.contentType)) {
      responseMimeType = 'text/css';
    } else if (this.httpyac.utils.isMimeTypeHtml(response.contentType)) {
      responseMimeType = 'text/html';
    } else if (this.httpyac.utils.isMimeTypeJavascript(response.contentType)) {
      responseMimeType = 'texxt/javascript';
    } else if (this.httpyac.utils.isMimeTypeMarkdown(response.contentType)) {
      responseMimeType = 'texxt/markdown';
    }

    if (responseMimeType.startsWith('text')) {
      // Check if VSCode can render this output.
      const currentMime = response.contentType.mimeType.toLowerCase();
      const lang = currentMime.indexOf('/') >= 0 ? currentMime.slice(currentMime.indexOf('/') + 1).trim().toLowerCase() : '';
      // VS Code can render languages if the format of the mime type is `text/x-<language>`.
      const mimeType = this.vscodeLanguages.has(lang) ? `text/x-${lang}` : 'text/plain';

      return {
        outputItems: vscode.NotebookCellOutputItem.text(response.body, mimeType),
        priority: HttpOutputPriority.Default,
      };
    }

    return false;
  }
}
