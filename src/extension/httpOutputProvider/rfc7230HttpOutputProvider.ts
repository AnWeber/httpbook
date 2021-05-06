import * as Httpyac from 'httpyac';
import * as vscode from 'vscode';
import { AppConfig } from '../config';
import { HttpOutputProvider, HttpOutputResult, HttpOutputPriority } from './httpOutputProvider';

export class Rfc7230HttpOutpoutProvider implements HttpOutputProvider {
  id = 'httpbook-rfc7230';


  constructor(readonly config: AppConfig) {}

  getOutputResult(httpRegion: Httpyac.HttpRegion): HttpOutputResult | false {
    if (httpRegion.response) {
      const outputItems: vscode.NotebookCellOutputItem[] = [];
      if (this.config.useResponseBodyNotebookOutputRenderer) {
        outputItems.push(new vscode.NotebookCellOutputItem(
          'x-application/httpbook-rfc7230-body',
          httpRegion
        ));
      }
      if (this.config.useRFC7230NotebookOutputRendererer) {
        outputItems.push(new vscode.NotebookCellOutputItem(
          'x-application/httpbook-rfc7230',
          httpRegion
        ));
      }
      if (this.config.useResponseNotebookOutputRenderer) {
        outputItems.push(new vscode.NotebookCellOutputItem(
          'x-application/httpbook-rfc7230-response',
          httpRegion
        ));
      }
      if (this.config.useHeaderNotebookOutputRenderer) {
        outputItems.push(new vscode.NotebookCellOutputItem(
          'x-application/httpbook-rfc7230-header',
          httpRegion
        ));
      }
      return {
        outputItems,
        priority: HttpOutputPriority.Default,
      };
    }
    return false;
  }
}
