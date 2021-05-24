import type * as Httpyac from 'httpyac';
import * as vscode from 'vscode';
import { AppConfig } from '../config';
import { HttpOutputProvider, HttpOutputResult, HttpOutputPriority } from '../extensionApi';

export class Rfc7230HttpOutpoutProvider implements HttpOutputProvider {
  id = 'httpbook-rfc7230';


  constructor(readonly config: AppConfig, readonly httpyac: typeof Httpyac) {}

  getResponseOutputResult(response: Httpyac.HttpResponse): HttpOutputResult | false {
    const metaData: Record<string, unknown> = {};
    if (response.rawBody
        && this.httpyac.utils.isMimeTypeImage(response.contentType)) {
      metaData.image = response.rawBody.toString('base64');
    }
    const ouputItem = vscode.NotebookCellOutputItem.json(response, 'message/http');
    ouputItem.metadata = metaData;
    return {
      outputItems: ouputItem,
      priority: HttpOutputPriority.Default,
    };
  }
}
