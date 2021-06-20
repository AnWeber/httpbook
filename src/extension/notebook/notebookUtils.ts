import * as vscode from 'vscode';

export function isNotebookDocument(document: vscode.TextDocument): document is vscode.TextDocument & { notebook: vscode.NotebookDocument } {
  const obj = document as { notebook?: vscode.NotebookDocument };
  return obj
    && !!obj.notebook
    && !!obj.notebook.notebookType;
}
