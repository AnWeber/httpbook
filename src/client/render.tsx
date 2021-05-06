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

export function renderCell({ container, mimeType, data }: IRenderInfo): void {
  if (mimeType === 'x-application/httpbook-testresults') {
    if (data.testResults) {
      render(<TestResults testResults={data.testResults} />, container);
    }
  } else if (data.response) {
    switch (mimeType) {
      case 'x-application/httpbook-rfc7230':
        render(<RFC7230Response response={data.response} requestVisible={true} bodyVisible={true} />, container);
        break;
      case 'x-application/httpbook-rfc7230-response':
        render(<RFC7230Response response={data.response} bodyVisible={true} />, container);
        break;
      case 'x-application/httpbook-rfc7230-header':
        render(<RFC7230Response response={data.response} requestVisible={true} />, container);
        break;
      default:
        render(<HttpBody body={data.response.body} />, container);
        break;
    }

  }
}
