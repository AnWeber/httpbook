import * as vscode from 'vscode';
import * as notebook from './notebook';
import { HttpyacExtensionApi } from './models';
import { HttpBookApi, HttpOutputProvider } from './extensionApi';
import { AppConfig, watchConfigSettings } from './config';


export function activate(context: vscode.ExtensionContext): HttpBookApi | false {

  const config: AppConfig = {};
  const httpyacExtension = vscode.extensions.getExtension<HttpyacExtensionApi>('anweber.vscode-httpyac');
  if (httpyacExtension?.isActive) {
    httpyacExtension.exports.documentStore.getDocumentPathLike = document => {
      if (document.notebook) {
        return {
          uri: document.uri,
          fileUri: document.notebook.uri,
          toString: () => document.uri.toString(),
        };
      }
      return document.uri;
    };
    const environementChanged = notebook.environementChangedFactory(httpyacExtension.exports.httpFileStore, httpyacExtension.exports.refreshCodeLens);
    httpyacExtension.exports.environementChanged.event(environementChanged);

    const httpNotebookOutputFactory = new notebook.HttpNotebookOutputFactory(config, httpyacExtension.exports.httpyac);

    context.subscriptions.push(...[
      watchConfigSettings(current => Object.assign(config, current)),
      vscode.notebook.onDidCloseNotebookDocument(notebook => {
        for (const cell of notebook.getCells()) {
          httpyacExtension.exports.httpFileStore.remove(cell.document.uri);
        }
        httpyacExtension.exports.httpFileStore.remove(notebook.uri);
      }),
      new notebook.HttpNotebookContentProvider(
        httpNotebookOutputFactory,
        httpyacExtension.exports.httpyac,
        httpyacExtension.exports.httpFileStore,
        config,
      ),
      new notebook.HttpNotebookKernel(
        httpNotebookOutputFactory,
        httpyacExtension.exports.httpyac,
        httpyacExtension.exports.httpFileStore,
        httpyacExtension.exports.refreshCodeLens
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
