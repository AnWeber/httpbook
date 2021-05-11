import * as Httpyac from 'httpyac';
import * as vscode from 'vscode';
import { AppConfig } from '../config';
import { HttpOutputProvider, HttpOutputResult, HttpOutputPriority } from './httpOutputProvider';

export class Rfc7230HttpOutpoutProvider implements HttpOutputProvider {
  id = 'httpbook-rfc7230';


  constructor(readonly config: AppConfig, readonly httpyac: typeof Httpyac) {}

  getOutputResult(httpRegion: Httpyac.HttpRegion): HttpOutputResult | false {
    if (httpRegion.response) {
      const metaData: Record<string, unknown> = {
        useHighlightJSInOutput: this.config.useHighlightJSInOutput,
        prettyPrintInOutput: this.config.prettyPrintInOutput,
      };
      if (httpRegion.response.rawBody
        && this.httpyac.utils.isMimeTypeImage(httpRegion.response.contentType)) {
        metaData.rawBody = httpRegion.response.rawBody.toString('base64');
      }
      const outputItems: vscode.NotebookCellOutputItem[] = [];
      if (this.config.useResponseBodyNotebookOutputRenderer
        && httpRegion.response.body) {
        outputItems.push(new vscode.NotebookCellOutputItem(
          'x-application/httpbook-rfc7230-body',
          httpRegion,
          metaData
        ));
      }
      if (this.config.useRFC7230NotebookOutputRendererer) {
        outputItems.push(new vscode.NotebookCellOutputItem(
          'x-application/httpbook-rfc7230',
          httpRegion,
          metaData
        ));
      }
      if (this.config.useResponseNotebookOutputRenderer) {
        outputItems.push(new vscode.NotebookCellOutputItem(
          'x-application/httpbook-rfc7230-response',
          httpRegion,
          metaData
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
