import type * as httpyac from 'httpyac';
import * as vscode from 'vscode';

interface DocumentStore extends httpyac.HttpFileStore{
  getDocumentPathLike: (document: vscode.TextDocument) => httpyac.PathLike;
}
export interface HttpyacExtensionApi{
  httpyac: typeof httpyac,
  httpFileStore: httpyac.HttpFileStore,
  documentStore: DocumentStore,
  httpDocumentSelector: vscode.DocumentSelector,
  refreshCodeLens: vscode.EventEmitter<void>,
  environementChanged: vscode.EventEmitter<string[] | undefined>
}
