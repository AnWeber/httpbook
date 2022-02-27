import type * as Httpyac from 'httpyac';
import * as vscode from 'vscode';
import { HttpOutputProvider, HttpOutputResult, HttpOutputPriority } from '../extensionApi';

export class TestResultsMimeOutputProvider implements HttpOutputProvider {
  id = 'httpbook-testresults';

  getTestResultOutputResult(testResults: Httpyac.TestResult[]): HttpOutputResult | false {
    return {
      outputItems: vscode.NotebookCellOutputItem.json(testResults, 'x-application/httpbook-testresults'),
      priority: HttpOutputPriority.Default,
    };
  }
}
