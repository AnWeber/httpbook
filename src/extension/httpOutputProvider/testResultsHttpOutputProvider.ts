import * as Httpyac from 'httpyac';
import * as vscode from 'vscode';
import { HttpOutputProvider, HttpOutputSlot, HttpOutputResult, HttpOutputPriority } from '../httpOutputProvider';

export class TestResultsMimeOutpoutProvider implements HttpOutputProvider {
  id = 'httpbook-testresults';
  supportedSlots = [HttpOutputSlot.testResults];

  getOutputResult(httpRegion: Httpyac.HttpRegion): HttpOutputResult | false {
    if (httpRegion.testResults) {
      return {
        outputItems: new vscode.NotebookCellOutputItem(
          'x-application/httpbook-testresults',
          httpRegion
        ),
        priority: HttpOutputPriority.Default
      };
    }
    return false;
  }
}
