import * as vscode from 'vscode';
import { HttpYacExtensionApi } from '../httpyacExtensionApi';
import { HttpNotebookSerializer } from './httpNotebookSerializer';

export function environmentChangedFactory(
  httpyacExtensionApi: HttpYacExtensionApi,
  httpNotebookSerializer: HttpNotebookSerializer
) {
  return async function environmentChanged(env: string[] | undefined): Promise<void> {
    try {
      const notebook = vscode.window.activeNotebookEditor?.notebook;
      if (notebook) {
        const httpFile = await httpNotebookSerializer.getNotebookHttpFile(notebook);
        if (httpFile) {
          httpyacExtensionApi.documentStore.setActiveEnvironment(httpFile, env);
        }
      }
    } catch (err) {
      httpyacExtensionApi.httpyac.io.log.error(err);
    }
  };
}
