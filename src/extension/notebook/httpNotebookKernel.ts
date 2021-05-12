import * as vscode from 'vscode';
import * as Httpyac from 'httpyac';
import * as extensionApi from '../extensionApi';
import * as httpOutput from '../httpOutputProvider';
import { AppConfig, TestSlotOutput } from '../config';
import { TestResult } from 'httpyac';


export class HttpNotebookKernel {

  private executionOrder = 0;

  readonly httpOutputProvider: Array<extensionApi.HttpOutputProvider>;

  constructor(
    private readonly httpyac: typeof Httpyac,
    private readonly httpFileStore: Httpyac.HttpFileStore,
    readonly config: AppConfig,
  ) {
    this.controller = vscode.notebook.createNotebookController('httpbook-kernel', 'http', 'HttpBook');
    this.controller.supportedLanguages = ['http'];
    this.controller.hasExecutionOrder = true;
    this.controller.description = 'a Notebook for sending REST, SOAP, and GraphQL requests';
    this.controller.executeHandler = this.send.bind(this);
    this.controller.onDidReceiveMessage(this.onDidReceiveMessage, this);

    this.httpOutputProvider = [
      new httpOutput.TestResultsMimeOutpoutProvider(),
      new httpOutput.Rfc7230HttpOutpoutProvider(config, this.httpyac),
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

  private onDidReceiveMessage(event: { editor: vscode.NotebookEditor, message: unknown }) {
    for (const httpOutputProvider of this.httpOutputProvider) {
      if (httpOutputProvider.onDidReceiveMessage) {
        httpOutputProvider.onDidReceiveMessage(event);
      }
    }
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
                slot: extensionApi.HttpOutputSlot.testResults,
                cell,
                httpFile
              }));
            }
            outputs.push(this.createOutputs(httpRegion, {
              slot: extensionApi.HttpOutputSlot.response,
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

  private supportOutputSlot(httpOutputProvider: extensionApi.HttpOutputProvider, slot: extensionApi.HttpOutputSlot) {
    if (slot === extensionApi.HttpOutputSlot.response && !httpOutputProvider.supportedSlots) {
      return true;
    }
    if (httpOutputProvider.supportedSlots) {
      return httpOutputProvider.supportedSlots.indexOf(slot) >= 0;
    }
    return false;
  }

  private createOutputs(httpRegion: Httpyac.HttpRegion, context: extensionApi.HttpOutputContext): vscode.NotebookCellOutput {
    const outputItems: Array<extensionApi.HttpOutputResult> = [];
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

  private compareHttpOutputResults(obj1: extensionApi.HttpOutputResult, obj2: extensionApi.HttpOutputResult, mime?: string) {

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

  private hasHttpOutputResultsMime(obj: extensionApi.HttpOutputResult, mime?: string) : boolean {
    if (Array.isArray(obj.outputItems)) {
      return obj.outputItems.some(obj => obj.mime === mime);
    }
    return obj.outputItems.mime === mime;
  }
}
