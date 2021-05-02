import * as vscode from 'vscode';
import { HttpNotebookKernel } from './httpNotebookKernel';
import { HttpNotebookContentProvider } from './httpNotebookContentProvider';
import { HttpyacExtensionApi } from './models';


export function activate(context: vscode.ExtensionContext): void {

  const httpyacExtension = vscode.extensions.getExtension<HttpyacExtensionApi>('anweber.vscode-httpyac');
  if (httpyacExtension?.isActive) {
    context.subscriptions.push(...[
      new HttpNotebookKernel(httpyacExtension.exports.httpyac, httpyacExtension.exports.httpFileStore),
      vscode.notebook.registerNotebookContentProvider('http', new HttpNotebookContentProvider(httpyacExtension.exports.httpFileStore)),
    ]);
  }
}
