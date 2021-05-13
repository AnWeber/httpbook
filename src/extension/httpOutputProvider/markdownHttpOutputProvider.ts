import * as Httpyac from 'httpyac';
import * as vscode from 'vscode';
import { AppConfig } from '../config';
import { HttpOutputProvider, HttpOutputResult, HttpOutputPriority, HttpOutputContext } from '../extensionApi';
import { HttpOutputContext as InternalHttpOutputContext } from './httpOutputContext';

export class MarkdownHttpOutputProvider implements HttpOutputProvider {
  id = 'httpbook-markdown';

  constructor(
    private readonly config: AppConfig,
    private readonly httpyac: typeof Httpyac
  ) { }

  getResponseOutputResult(response: Httpyac.HttpResponse, { httpRegion }: HttpOutputContext & InternalHttpOutputContext): HttpOutputResult | false {
    if (this.config.useMarkdownNotebookOutputRenderer) {
      return {
        outputItems: new vscode.NotebookCellOutputItem(
          'text/markdown',
          this.httpyac.utils.toMarkdown(response, {
            responseBody: true,
            requestBody: true,
            prettyPrint: true,
            meta: true,
            testResults: httpRegion.testResults,
            timings: true,
          })
        ),
        priority: HttpOutputPriority.Low
      };
    }
    return false;
  }

  getTestResultOutputResult(testResults: Httpyac.TestResult[]): HttpOutputResult | false {
    if (this.config.useMarkdownNotebookOutputRenderer) {
      return {
        outputItems: new vscode.NotebookCellOutputItem(
          'text/markdown',
          this.httpyac.utils.joinMarkdown(this.httpyac.utils.toMarkdownTestResults(testResults))
        ),
        priority: HttpOutputPriority.Low
      };
    }
    return false;
  }
}
