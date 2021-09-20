import * as vscode from 'vscode';
import { HttpYacExtensionApi } from '../httpyacExtensionApi';
import { isNotebookDocument } from './notebookUtils';

export function environementChangedFactory(httpyacExtensionApi: HttpYacExtensionApi) {
  return async function environementChanged(env: string[] | undefined): Promise<void> {
    try {
      const notebookDocument = vscode.window.activeTextEditor?.document;
      if (notebookDocument && isNotebookDocument(notebookDocument)) {
        if (notebookDocument) {
          for (const cell of notebookDocument.notebook.getCells()) {
            const httpFile = await httpyacExtensionApi.documentStore.getHttpFile(cell.document);
            httpFile.activeEnvironment = env;
          }
        }
      }
    } catch (err) {
      httpyacExtensionApi.httpyac.io.log.error(err);
    }
  };
}
