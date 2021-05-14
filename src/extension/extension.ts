import * as vscode from 'vscode';
import { HttpNotebookKernel, HttpNotebookContentProvider } from './notebook';
import { HttpyacExtensionApi } from './models';
import { HttpBookApi, HttpOutputProvider } from './extensionApi';
import { AppConfig, watchConfigSettings } from './config';


export function activate(context: vscode.ExtensionContext): HttpBookApi | false {

  const config: AppConfig = {};

  const httpyacExtension = vscode.extensions.getExtension<HttpyacExtensionApi>('anweber.vscode-httpyac');
  if (httpyacExtension?.isActive) {
    const httpNotebookKernel = new HttpNotebookKernel(
      httpyacExtension.exports.httpyac,
      httpyacExtension.exports.httpFileStore,
      config
    );
    context.subscriptions.push(...[
      watchConfigSettings(current => Object.assign(config, current)),
      httpNotebookKernel,
      vscode.notebook.registerNotebookContentProvider(
        'http',
        new HttpNotebookContentProvider(
          config,
          httpyacExtension.exports.httpFileStore,
          httpyacExtension.exports.httpyac,
        ), {
          transientOutputs: false,
          transientCellMetadata: {
            inputCollapsed: true,
            outputCollapsed: true,
          }
        }
      ),
    ]);
    return {
      registerHttpOutputProvider: (obj: HttpOutputProvider) => {
        httpNotebookKernel.httpOutputProvider.push(obj);
      }
    };
  }
  return false;
}
