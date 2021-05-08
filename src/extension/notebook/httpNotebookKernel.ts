import * as vscode from 'vscode';
import * as Httpyac from 'httpyac';
import * as httpOutput from '../httpOutputProvider';
import { AppConfig, TestSlotOutput } from '../config';
import { TestResult } from 'httpyac';


export class HttpNotebookKernel {
  readonly id = 'httpbook-kernel';
  readonly label = 'HttpBook Kernel';
  readonly supportedLanguages = ['http'];

  private executionOrder = 0;

  readonly httpOutputProvider: Array<httpOutput.HttpOutputProvider>;

  constructor(
    private readonly httpyac: typeof Httpyac,
    private readonly httpFileStore: Httpyac.HttpFileStore,
    readonly config: AppConfig,
  ) {
    this.controller = vscode.notebook.createNotebookController('httpbook-kernel', 'http', 'HttpBook');

    this.controller.supportedLanguages = [...this.supportedLanguages];
    this.controller.hasExecutionOrder = true;
    this.controller.description = 'a Notebook for sending REST, SOAP, and GraphQL requests';
    this.controller.executeHandler = this.send.bind(this);

    this.httpOutputProvider = [
      new httpOutput.TestResultsMimeOutpoutProvider(),
      new httpOutput.Rfc7230HttpOutpoutProvider(config),

      new httpOutput.BuiltInHttpOutputProvider(),
      new httpOutput.ImageHttpOutputProvider(),
      new httpOutput.ContentTypeHttpOutputProvider(config),
      new httpOutput.MarkdownHttpOutputProvider(config, this.httpyac),
    ];
  }


  private readonly controller: vscode.NotebookController;


  dispose(): void {
    this.controller.dispose();
  }

  private async send(cells: vscode.NotebookCell[], notebook: vscode.NotebookDocument, controller: vscode.NotebookController): Promise<void> {
    const httpFile = this.httpFileStore.get(notebook.uri.fsPath);
    if (httpFile) {

      for (const cell of cells) {
        const currentFile = await this.httpFileStore.parse(notebook.uri.fsPath, cell.document.getText());
        if (currentFile.httpRegions.length > 0) {
          const httpRegion = currentFile.httpRegions[0];
          const execution = controller.createNotebookCellExecutionTask(cell);
          execution.executionOrder = ++this.executionOrder;
          try {
            execution.start({ startTime: Date.now() });
            await this.httpyac.httpYacApi.send({
              httpFile,
              httpRegion,
            });
            const outputs: Array<vscode.NotebookCellOutput> = [];

            if (this.canShowTestResults(httpRegion.testResults)) {
              outputs.push(this.createOutputs(httpRegion, {
                slot: httpOutput.HttpOutputSlot.testResults,
                cell,
                httpFile
              }));
            }
            outputs.push(this.createOutputs(httpRegion, {
              slot: httpOutput.HttpOutputSlot.response,
              cell,
              httpFile
            }));
            execution.replaceOutput(outputs);
            execution.end({
              success: true,
              endTime: Date.now(),
            });
          } catch (err) {
            execution.replaceOutput([
              new vscode.NotebookCellOutput([
                new vscode.NotebookCellOutputItem('application/x.notebook.error-traceback', {
                  ename: err instanceof Error && err.name || 'error',
                  evalue: err instanceof Error && err.message || JSON.stringify(err, null, 2),
                  traceback: [err.stack]
                })
              ])]);
            execution.end({ success: false, endTime: Date.now() });
          }
        }
      }
    }
  }

  private canShowTestResults(testResults: Array<TestResult> | undefined) {
    if (testResults && this.config.outputTests !== TestSlotOutput.never) {
      if (this.config.outputTests === TestSlotOutput.onlyFailed) {
        return testResults.some(obj => !obj.result);
      }
      return true;
    }
    return false;
  }

  private supportOutputSlot(httpOutputProvider: httpOutput.HttpOutputProvider, slot: httpOutput.HttpOutputSlot) {
    if (slot === httpOutput.HttpOutputSlot.response && !httpOutputProvider.supportedSlots) {
      return true;
    }
    if (httpOutputProvider.supportedSlots) {
      return httpOutputProvider.supportedSlots.indexOf(slot) >= 0;
    }
    return false;
  }

  private createOutputs(httpRegion: Httpyac.HttpRegion, context: httpOutput.HttpOutputContext): vscode.NotebookCellOutput {
    const outputItems: Array<httpOutput.HttpOutputResult> = [];
    for (const httpOutputProvider of this.httpOutputProvider.filter(obj => this.supportOutputSlot(obj, context.slot))) {
      const result = httpOutputProvider.getOutputResult(httpRegion, context);
      if (result) {
        outputItems.push(result);
      }
    }

    const preferredMime = this.getPreferredNotebookOutputRendererMime(httpRegion.response?.contentType?.mimeType);

    const items = outputItems
      .sort((obj1, obj2) => this.compareHttpOutputResults(obj1, obj2, preferredMime))
      .reduce((prev: Array<vscode.NotebookCellOutputItem>, current) => {
        if (Array.isArray(current.outputItems)) {
          prev.push(...current.outputItems);
        } else {
          prev.push(current.outputItems);
        }
        return prev;
      }, [])
      .filter((obj, index, self) => self.indexOf(obj) === index);

    return new vscode.NotebookCellOutput(items);
  }

  private getPreferredNotebookOutputRendererMime(mimeType?: string) {
    if (mimeType && this.config.preferNotebookOutputRenderer) {
      for (const [regex, mime] of Object.entries(this.config.preferNotebookOutputRenderer)) {
        const regexp = new RegExp(regex, 'ui');
        if (regexp.test(mimeType)) {
          return mime;
        }
      }
    }
    return '';
  }

  private compareHttpOutputResults(obj1: httpOutput.HttpOutputResult, obj2: httpOutput.HttpOutputResult, mime?: string) {

    if (mime) {
      if (this.hasHttpOutputResultsMime(obj1, mime)) {
        return -1;
      }
      if (this.hasHttpOutputResultsMime(obj2, mime)) {
        return 1;
      }
    }
    return obj2.priority - obj1.priority;
  }

  private hasHttpOutputResultsMime(obj: httpOutput.HttpOutputResult, mime?: string) : boolean {
    if (Array.isArray(obj.outputItems)) {
      return obj.outputItems.some(obj => obj.mime === mime);
    }
    return obj.outputItems.mime === mime;
  }
}
