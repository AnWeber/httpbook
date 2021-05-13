import * as Httpyac from 'httpyac';
import * as vscode from 'vscode';
import { HttpOutputProvider, HttpOutputResult, HttpOutputPriority, HttpOutputContext } from '../extensionApi';
import { HttpOutputContext as InternalHttpOutputContext } from './httpOutputContext';

export class TestResultsMimeOutpoutProvider implements HttpOutputProvider {
  id = 'httpbook-testresults';

  getOutputResult(_testResult: Httpyac.TestResult[], { httpRegion }: HttpOutputContext & InternalHttpOutputContext): HttpOutputResult | false {
    return {
      outputItems: new vscode.NotebookCellOutputItem(
        'x-application/httpbook-testresults',
        httpRegion
      ),
      priority: HttpOutputPriority.Default
    };

  }
}
