import * as vscode from 'vscode';

export const HttpNotebookViewType = 'http';

export const httpDocumentSelector: vscode.DocumentSelector = [
  { language: 'http', scheme: '*' }
];
