import * as vscode from 'vscode';
import { HttpYacExtensionApi } from '../httpyacExtensionApi';

export function environmentChangedFactory(httpyacExtensionApi: HttpYacExtensionApi) {
  return async function environmentChanged(env: string[] | undefined): Promise<void> {
    try {
      const notebook = vscode.window.activeNotebookEditor?.notebook;
      if (notebook) {
        for (const cell of notebook.getCells()) {
          const httpFile = await httpyacExtensionApi.documentStore.getHttpFile(cell.document);
          if (httpFile) {
            httpFile.activeEnvironment = env;
          }
        }
      }
    } catch (err) {
      httpyacExtensionApi.httpyac.io.log.error(err);
    }
  };
}
