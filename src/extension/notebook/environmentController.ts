import type { HttpFileStore } from 'httpyac';
import * as vscode from 'vscode';

export function environementChangedFactory(httpFileStore: HttpFileStore, refreshCodeLens: vscode.EventEmitter<void>) {
  return async function environementChanged(env: string[] | undefined): Promise<void> {
    const notebookDocument = vscode.window.activeNotebookEditor?.document;

    if (notebookDocument) {
      for (const cell of notebookDocument.getCells()) {
        const httpFile = await httpFileStore.getOrCreate(cell.document.uri, () => Promise.resolve(cell.document.getText()), cell.document.version);
        httpFile.activeEnvironment = env;
      }
      refreshCodeLens.fire();
    }
  };
}
