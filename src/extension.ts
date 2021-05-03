import * as vscode from 'vscode';
import { HttpNotebookKernel, HttpNotebookContentProvider } from './notebook';
import { HttpyacExtensionApi, MimeOutputProvider } from './models';

export interface HttpBookApi{
  mimeOutputProvider: Array<MimeOutputProvider>;
}


export function activate(context: vscode.ExtensionContext): HttpBookApi | false {

  const httpyacExtension = vscode.extensions.getExtension<HttpyacExtensionApi>('anweber.vscode-httpyac');
  if (httpyacExtension?.isActive) {
    const httpNotebookKernel = new HttpNotebookKernel(httpyacExtension.exports.httpyac, httpyacExtension.exports.httpFileStore);
    context.subscriptions.push(...[
      httpNotebookKernel,
      vscode.notebook.registerNotebookContentProvider('http', new HttpNotebookContentProvider(httpyacExtension.exports.httpFileStore)),
    ]);
    return {
      mimeOutputProvider: httpNotebookKernel.mimeOutputProvider
    };
  }
  return false;
}
