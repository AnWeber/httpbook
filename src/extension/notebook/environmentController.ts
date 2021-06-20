import * as vscode from 'vscode';
import { HttpyacExtensionApi } from '../httpyacExtensionApi';
import { isNotebookDocument } from './notebookUtils';

export function environementChangedFactory(httpyacExtensionApi: HttpyacExtensionApi) {
  return async function environementChanged(env: string[] | undefined): Promise<void> {
    try {
      const notebookDocument = vscode.window.activeTextEditor?.document;
      if (notebookDocument && isNotebookDocument(notebookDocument)) {
        if (notebookDocument) {
          for (const cell of notebookDocument.notebook.getCells()) {
            const httpFile = await httpyacExtensionApi.documentStore.getHttpFile(cell.document);
            httpFile.activeEnvironment = env;
          }
          httpyacExtensionApi.refreshCodeLens.fire();
        }
      }
    } catch (err) {
      httpyacExtensionApi.httpyac.log.error(err);
    }
  };
}
