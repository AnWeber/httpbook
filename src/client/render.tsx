// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { h, render } from 'preact';
import { HttpRegion } from 'httpyac';
import type { NotebookRendererApi } from 'vscode-notebook-renderer';
import { TestResults, RFC7230Response, HttpBody, HljsMetaData } from './components';

interface IRenderInfo {
  container: HTMLElement;
  mimeType: string;
  data: HttpRegion;
  metaData?: HljsMetaData,
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
        render(<RFC7230Response response={data.response} metaData={metaData} requestVisible={true} bodyVisible={true} />, container);
        break;
      case 'x-application/httpbook-rfc7230-response':
        render(<RFC7230Response response={data.response} metaData={metaData} bodyVisible={true} />, container);
        break;
      case 'x-application/httpbook-rfc7230-header':
        render(<RFC7230Response response={data.response} metaData={metaData} requestVisible={true} />, container);
        break;
      default:
        render(<HttpBody response={data.response} metaData={metaData} />, container);
        break;
    }

  }
}
