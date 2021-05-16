import * as vscode from 'vscode';
import * as notebook from './notebook';
import { HttpyacExtensionApi } from './models';
import { HttpBookApi, HttpOutputProvider } from './extensionApi';
import { AppConfig, watchConfigSettings } from './config';


export function activate(context: vscode.ExtensionContext): HttpBookApi | false {

  const config: AppConfig = {};

  const httpyacExtension = vscode.extensions.getExtension<HttpyacExtensionApi>('anweber.vscode-httpyac');
  if (httpyacExtension?.isActive) {
    const environementChanged = notebook.environementChangedFactory(httpyacExtension.exports.httpFileStore, httpyacExtension.exports.refreshCodeLens);
    httpyacExtension.exports.environementChanged.event(environementChanged);

    const httpNotebookKernel = new notebook.HttpNotebookKernel(
      httpyacExtension.exports.httpyac,
      httpyacExtension.exports.httpFileStore,
      httpyacExtension.exports.refreshCodeLens,
      config
    );

    context.subscriptions.push(...[
      new notebook.HttpNotebookContentProvider(
        config,
        httpyacExtension.exports.httpFileStore,
        httpyacExtension.exports.httpyac,
      ),
      watchConfigSettings(current => Object.assign(config, current)),
      httpNotebookKernel,
    ]);
    return {
      registerHttpOutputProvider: (obj: HttpOutputProvider) => {
        httpNotebookKernel.httpOutputProvider.push(obj);
      }
    };
  }
  return false;
}
