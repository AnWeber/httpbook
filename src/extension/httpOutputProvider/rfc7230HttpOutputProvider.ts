import type * as Httpyac from 'httpyac';
import * as vscode from 'vscode';
import { AppConfig, Rfc7230Output } from '../config';
import { HttpOutputProvider, HttpOutputResult, HttpOutputPriority } from '../extensionApi';

export class Rfc7230HttpOutputProvider implements HttpOutputProvider {
  id = 'httpbook-rfc7230';

  constructor(
    readonly config: AppConfig,
    readonly httpyac: typeof Httpyac
  ) {}

  getResponseOutputResult(response: Httpyac.HttpResponse): HttpOutputResult | false {
    const httpResponse: Httpyac.HttpResponse = this.prepareHttpResponse(response);

    if (this.config.outputRfc7230 === Rfc7230Output.response) {
      delete httpResponse.request;
    } else if (this.config.outputRfc7230 === Rfc7230Output.request_header_and_response) {
      delete httpResponse.request?.body;
    } else if (this.config.outputRfc7230 === Rfc7230Output.only_header) {
      delete httpResponse.request?.body;
      delete httpResponse.body;
      delete httpResponse.prettyPrintBody;
    } else if (this.config.outputRfc7230 === Rfc7230Output.only_response_header) {
      delete httpResponse.request;
      delete httpResponse.body;
      delete httpResponse.prettyPrintBody;
    }

    return {
      outputItems: vscode.NotebookCellOutputItem.json(httpResponse, 'message/http'),
      priority: HttpOutputPriority.Default,
    };
  }

  private prepareHttpResponse(response: Httpyac.HttpResponse) {
    const httpResponse: Httpyac.HttpResponse = {
      ...response,
      request: response.request && {
        url: response.request.url,
        method: response.request.method,
        headers: response.request.headers,
        body: response.request.body,
      },
    };
    if (response.rawBody && this.httpyac.utils.isMimeTypeImage(response.contentType)) {
      httpResponse.body = `data:${response.contentType?.mimeType || 'image/png'};base64,${response.rawBody.toString(
        'base64'
      )}`;
    }
    delete httpResponse.rawBody;
    delete httpResponse.parsedBody;
    return httpResponse;
  }
}
