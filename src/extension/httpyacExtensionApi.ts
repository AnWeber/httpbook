import type * as httpyac from 'httpyac';
import * as vscode from 'vscode';

export interface DocumentStore {
  httpFileStore: httpyac.HttpFileStore;
  getDocumentPathLike: (document: vscode.TextDocument) => httpyac.PathLike;
  getHttpFile(document: vscode.TextDocument): Promise<httpyac.HttpFile>;
}
export interface HttpYacExtensionApi{
  httpyac: typeof httpyac,
  httpFileStore: httpyac.HttpFileStore,
  documentStore: DocumentStore,
  httpDocumentSelector: vscode.DocumentSelector,
  refreshCodeLens: vscode.EventEmitter<void>,
  environementChanged: vscode.EventEmitter<string[] | undefined>
  getErrorQuickFix: (err: Error) => string | undefined;
}
