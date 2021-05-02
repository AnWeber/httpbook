import * as httpyac from 'httpyac';
import * as vscode from 'vscode';

export interface HttpyacExtensionApi{
  httpyac: typeof httpyac,
  httpFileStore: httpyac.HttpFileStore,
  refreshCodeLens: vscode.EventEmitter<void>,
  environementChanged: vscode.EventEmitter<string[] | undefined>
}
