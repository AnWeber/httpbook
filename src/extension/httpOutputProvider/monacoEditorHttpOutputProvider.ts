import type * as Httpyac from 'httpyac';
import * as vscode from 'vscode';
import { AppConfig } from '../config';
import { HttpOutputProvider, HttpOutputResult, HttpOutputPriority } from '../extensionApi';


export class MonacoEditorHttpOutputProvider implements HttpOutputProvider {
  id = 'httpbook-monaco';


  constructor(readonly config: AppConfig, readonly httpyac: typeof Httpyac) {}

  getResponseOutputResult(response: Httpyac.HttpResponse): HttpOutputResult | false {
    const metaData: Record<string, unknown> = {
      colorThemeKind: vscode.window.activeColorTheme.kind,
      response,
    };


    if (response.contentType) {
      if (['image/png', 'image/jpeg', 'application/pdf'].indexOf(response.contentType.mimeType) >= 0) {
        return false;
      }
      if (['image/svg+xml',
        'text/html',
        'text/markdown',
        'text/plain',
        'application/javascript'].indexOf(response?.contentType.mimeType) >= 0) {
        return {
          outputItems: new vscode.NotebookCellOutputItem(
            response?.contentType.mimeType,
            response?.body,
            metaData
          ),
          priority: HttpOutputPriority.Default
        };
      }
      if (/^(application|json)\/(.*\+|x-amz-)?json.*$/u.test(response.contentType.mimeType)) {
        return {
          outputItems: new vscode.NotebookCellOutputItem(
            'application/json',
            response.body,
            metaData
          ),
          priority: HttpOutputPriority.Default
        };
      }

    }
    return {
      outputItems: [new vscode.NotebookCellOutputItem(
        'text/plain',
        response.body,
        metaData
      )],
      priority: HttpOutputPriority.Default,
    };
  }
}
