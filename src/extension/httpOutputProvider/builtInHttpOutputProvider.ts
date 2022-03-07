import type * as Httpyac from 'httpyac';
import * as vscode from 'vscode';
import { AppConfig } from '../config';
import { HttpOutputProvider, HttpOutputResult, HttpOutputPriority } from '../extensionApi';

export class BuiltInHttpOutputProvider implements HttpOutputProvider {
  id = 'httpbook-builtin';
  vscodeLanguages = new Set<string>();
  constructor(readonly config: AppConfig, readonly httpyac: typeof Httpyac) {}

  async getResponseOutputResult(response: Httpyac.HttpResponse): Promise<HttpOutputResult | false> {
    if (!response.contentType || !response.body || typeof response.body !== 'string' || response.body.length === 0) {
      return false;
    }

    if (this.httpyac.utils.isMimeTypeJSON(response.contentType)) {
      return {
        outputItems: vscode.NotebookCellOutputItem.json(response.parsedBody, 'text/x-json'),
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
      responseMimeType = 'text/javascript';
    } else if (this.httpyac.utils.isMimeTypeMarkdown(response.contentType)) {
      responseMimeType = 'text/markdown';
    }

    if (responseMimeType.startsWith('text')) {
      const currentMime = response.contentType.mimeType.toLowerCase();
      const lang =
        currentMime.indexOf('/') >= 0
          ? currentMime
              .slice(currentMime.indexOf('/') + 1)
              .trim()
              .toLowerCase()
          : '';
      if (this.vscodeLanguages.size === 0) {
        const languages = await vscode.languages.getLanguages();
        languages.forEach(lang => this.vscodeLanguages.add(lang.toLowerCase()));
      }
      const mimeType = this.vscodeLanguages.has(lang) ? `text/x-${lang}` : 'text/plain';
      return {
        outputItems: vscode.NotebookCellOutputItem.text(response.body, mimeType),
        priority: HttpOutputPriority.Default,
      };
    }

    return false;
  }
}
