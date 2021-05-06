import * as Httpyac from 'httpyac';
import * as vscode from 'vscode';
import { AppConfig } from '../config';
import { HttpOutputProvider, HttpOutputContext, HttpOutputSlot, HttpOutputResult, HttpOutputPriority } from './httpOutputProvider';

export class MarkdownHttpOutputProvider implements HttpOutputProvider {
  id = 'httpbook-markdown';

  constructor(
    private readonly config: AppConfig,
    private readonly httpyac: typeof Httpyac
  ) { }

  getOutputResult(httpRegion: Httpyac.HttpRegion, context: HttpOutputContext): HttpOutputResult | false {
    if (this.config.useMarkdownNotebookOutputRenderer) {
      if (context.slot === HttpOutputSlot.response && httpRegion.response) {
        return {
          outputItems: new vscode.NotebookCellOutputItem(
            'text/markdown',
            this.httpyac.utils.toMarkdown(httpRegion.response, {
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
      if (context.slot === HttpOutputSlot.testResults && httpRegion.testResults) {
        return {
          outputItems: new vscode.NotebookCellOutputItem(
            'text/markdown',
            this.httpyac.utils.joinMarkdown(this.httpyac.utils.toMarkdownTestResults(httpRegion.testResults))
          ),
          priority: HttpOutputPriority.Low
        };
      }
    }
    return false;
  }
}
