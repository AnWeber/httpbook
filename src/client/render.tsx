// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { h, render } from 'preact';
import { HttpRegion } from 'httpyac';
import type { NotebookRendererApi } from 'vscode-notebook-renderer';
import { TestResults, RFC7230Response, HttpBody } from './components';

interface IRenderInfo {
  container: HTMLElement;
  mimeType: string;
  data: HttpRegion;
  metaData?: Record<string, string>,
  notebookApi: NotebookRendererApi<unknown>;
}

export function renderCell({ container, mimeType, data, metaData }: IRenderInfo): void {
  if (mimeType === 'x-application/httpbook-testresults') {
    if (data.testResults) {
      render(<TestResults testResults={data.testResults} />, container);
    }
  } else if (data.response) {
    switch (mimeType) {
      case 'x-application/httpbook-rfc7230':
        render(<RFC7230Response response={data.response} rawBody={metaData?.rawBody} requestVisible={true} bodyVisible={true} />, container);
        break;
      case 'x-application/httpbook-rfc7230-response':
        render(<RFC7230Response response={data.response} rawBody={metaData?.rawBody} bodyVisible={true} />, container);
        break;
      case 'x-application/httpbook-rfc7230-header':
        render(<RFC7230Response response={data.response} rawBody={metaData?.rawBody} requestVisible={true} />, container);
        break;
      default:
        render(<HttpBody body={data.response.body} rawBody={metaData?.rawBody} mimeType={data.response.contentType?.mimeType} />, container);
        break;
    }

  }
}
