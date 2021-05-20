import * as Httpyac from 'httpyac';
import * as vscode from 'vscode';
import { HttpOutputProvider, HttpOutputResult, HttpOutputPriority } from '../extensionApi';


export class TestResultsMimeOutpoutProvider implements HttpOutputProvider {
  id = 'httpbook-testresults';

  getTestResultOutputResult(testResults: Httpyac.TestResult[]): HttpOutputResult | false {
    return {
      outputItems: new vscode.NotebookCellOutputItem(
        'x-application/httpbook-testresults',
        JSON.stringify(testResults),
      ),
      priority: HttpOutputPriority.Default
    };
  }
}
