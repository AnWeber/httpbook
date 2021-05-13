import * as Httpyac from 'httpyac';
import * as vscode from 'vscode';
import { AppConfig } from '../config';
import { HttpOutputProvider, HttpOutputResult, HttpOutputPriority, HttpOutputContext } from '../extensionApi';
import { HttpOutputContext as InternalHttpOutputContext } from './httpOutputContext';

export class Rfc7230HttpOutpoutProvider implements HttpOutputProvider {
  id = 'httpbook-rfc7230';


  constructor(readonly config: AppConfig, readonly httpyac: typeof Httpyac) {}

  getResponseOutputResult(response: Httpyac.HttpResponse, { httpRegion }: HttpOutputContext & InternalHttpOutputContext): HttpOutputResult | false {
    const metaData: Record<string, unknown> = {
      useHighlightJSInOutput: this.config.useHighlightJSInOutput,
      prettyPrintInOutput: this.config.prettyPrintInOutput,
    };
    if (response.rawBody
        && this.httpyac.utils.isMimeTypeImage(response.contentType)) {
      metaData.rawBody = response.rawBody.toString('base64');
    }
    const outputItems: vscode.NotebookCellOutputItem[] = [];
    if (this.config.useResponseBodyNotebookOutputRenderer
        && response.body) {
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
}
