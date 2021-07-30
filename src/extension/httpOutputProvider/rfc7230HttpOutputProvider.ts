import type * as Httpyac from 'httpyac';
import * as vscode from 'vscode';
import { AppConfig } from '../config';
import { HttpOutputProvider, HttpOutputResult, HttpOutputPriority } from '../extensionApi';

export class Rfc7230HttpOutpoutProvider implements HttpOutputProvider {
  id = 'httpbook-rfc7230';


  constructor(readonly config: AppConfig, readonly httpyac: typeof Httpyac) {}

  getResponseOutputResult(response: Httpyac.HttpResponse): HttpOutputResult | false {
    const httpResponse: Httpyac.HttpResponse = {
      ...response,
      request: response.request && {
        url: response.request.url,
        method: response.request.method,
        headers: response.request.headers,
        body: response.request.body,
      }
    };
    if (response.rawBody
        && this.httpyac.utils.isMimeTypeImage(response.contentType)) {
      httpResponse.body = `data:${response.contentType?.mimeType || 'image/png'};base64,${response.rawBody.toString('base64')}`;
    }

    return {
      outputItems: vscode.NotebookCellOutputItem.json(httpResponse, 'message/http'),
      priority: HttpOutputPriority.Default,
    };
  }
}
