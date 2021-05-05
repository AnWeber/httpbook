// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { h, render } from 'preact';
import { HttpRegion } from 'httpyac';
import type { NotebookRendererApi } from 'vscode-notebook-renderer';
import { TestResults, RFC7230Response } from './components';

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
  } else if (mimeType === 'x-application/httpbook-rfc7230') {
    if (data.response) {
      render(<RFC7230Response response={data.response} />, container);
    }
  }
}
