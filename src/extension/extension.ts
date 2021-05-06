import * as vscode from 'vscode';
import { HttpNotebookKernel, HttpNotebookContentProvider } from './notebook';
import { HttpyacExtensionApi } from './models';
import { HttpOutputProvider } from './httpOutputProvider';
import { AppConfig, watchConfigSettings } from './config';

export interface HttpBookApi{
  registerHttpOutputProvider(obj: HttpOutputProvider): void;
}


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
      vscode.notebook.registerNotebookContentProvider('http', new HttpNotebookContentProvider(httpyacExtension.exports.httpFileStore)),
    ]);
    return {
      registerHttpOutputProvider: (obj: HttpOutputProvider) => {
        httpNotebookKernel.httpOutputProvider.push(obj);
      }
    };
  }
  return false;
}
