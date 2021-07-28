import * as vscode from 'vscode';
import * as notebook from './notebook';
import { HttpYacExtensionApi } from './httpyacExtensionApi';
import { HttpBookApi, HttpOutputProvider } from './extensionApi';
import { AppConfig, watchConfigSettings } from './config';


export function activate(context: vscode.ExtensionContext): HttpBookApi | false {

  const config: AppConfig = {};
  const httpyacExtension = vscode.extensions.getExtension<HttpYacExtensionApi>('anweber.vscode-httpyac');
  if (httpyacExtension?.isActive) {
    httpyacExtension.exports.documentStore.getDocumentPathLike = document => {
      if (notebook.isNotebookDocument(document)) {
        return {
          uri: document.uri,
          fileUri: document.notebook.uri,
          toString: () => document.uri.toString(),
        };
      }
      return document.uri;
    };
    const environementChanged = notebook.environementChangedFactory(httpyacExtension.exports);
    httpyacExtension.exports.environementChanged.event(environementChanged);

    const httpNotebookOutputFactory = new notebook.HttpNotebookOutputFactory(config, httpyacExtension.exports.httpyac);
    httpNotebookOutputFactory.initiailze();
    const httpNotebookSerialier = new notebook.HttpNotebookSerializer(
      httpNotebookOutputFactory,
      httpyacExtension.exports,
      config
    );
    context.subscriptions.push(...[
      watchConfigSettings(current => Object.assign(config, current)),
      vscode.workspace.onDidCloseNotebookDocument(notebook => {
        for (const cell of notebook.getCells()) {
          httpyacExtension.exports.httpFileStore.remove(cell.document.uri);
        }
        httpyacExtension.exports.httpFileStore.remove(notebook.uri);
      }),
      httpNotebookSerialier,
      new notebook.HttpNotebookKernel(
        httpNotebookOutputFactory,
        httpNotebookSerialier,
        httpyacExtension.exports
      )
    ]);
    return {
      registerHttpOutputProvider: (obj: HttpOutputProvider) => {
        httpNotebookOutputFactory.httpOutputProvider.push(obj);
      }
    };
  }
  return false;
}
