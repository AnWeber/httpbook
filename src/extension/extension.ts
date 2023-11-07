import * as vscode from 'vscode';
import * as notebook from './notebook';
import { HttpYacExtensionApi } from './httpyacExtensionApi';
import { HttpBookApi, HttpOutputProvider } from './extensionApi';
import { AppConfig, watchConfigSettings } from './config';

export function activate(context: vscode.ExtensionContext): HttpBookApi | false {
  const config: AppConfig = {};
  const httpyacExtension = vscode.extensions.getExtension<HttpYacExtensionApi>('anweber.vscode-httpyac');
  if (httpyacExtension?.isActive) {
    const httpNotebookOutputFactory = new notebook.HttpNotebookOutputFactory(config, httpyacExtension.exports.httpyac);
    const httpNotebookSerializer = new notebook.HttpNotebookSerializer(
      httpNotebookOutputFactory,
      httpyacExtension.exports,
      config
    );
    const environmentChanged = notebook.environmentChangedFactory(httpyacExtension.exports, httpNotebookSerializer);
    httpyacExtension.exports.environmentChanged(environmentChanged);
    context.subscriptions.push(
      ...[
        watchConfigSettings(current => Object.assign(config, current)),
        vscode.workspace.onDidCloseNotebookDocument(notebook => {
          for (const cell of notebook.getCells()) {
            httpyacExtension.exports.documentStore.remove(cell.document);
          }
          httpyacExtension.exports.documentStore.httpFileStore.remove(notebook.uri);
        }),
        httpNotebookSerializer,
        new notebook.HttpNotebookKernel(
          config,
          httpNotebookOutputFactory,
          httpNotebookSerializer,
          httpyacExtension.exports
        ),
      ]
    );
    return {
      registerHttpOutputProvider: (obj: HttpOutputProvider) => {
        httpNotebookOutputFactory.httpOutputProvider.push(obj);
      },
    };
  }
  return false;
}
