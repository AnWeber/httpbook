import * as vscode from 'vscode';
import * as Httpyac from 'httpyac';
import * as extensionApi from '../extensionApi';
import * as httpOutput from '../httpOutputProvider';
import { AppConfig, TestSlotOutput } from '../config';
import { TestResult } from 'httpyac';


export class HttpNotebookKernel {

  private executionOrder = 0;

  readonly httpOutputProvider: Array<extensionApi.HttpOutputProvider>;

  private subscriptions: Array<vscode.Disposable>;
  constructor(
    private readonly httpyac: typeof Httpyac,
    private readonly httpFileStore: Httpyac.HttpFileStore,
    private readonly refreshCodeLens: vscode.EventEmitter<void>,
    readonly config: AppConfig,
  ) {
    const controller = vscode.notebook.createNotebookController('httpbook-kernel', 'http', 'HttpBook');
    controller.supportedLanguages = ['http'];
    controller.hasExecutionOrder = true;
    controller.description = 'a Notebook for sending REST, SOAP, and GraphQL requests';
    controller.executeHandler = this.send.bind(this);
    controller.onDidReceiveMessage(this.onDidReceiveMessage, this);

    this.httpOutputProvider = [
      new httpOutput.TestResultsMimeOutpoutProvider(),
      new httpOutput.Rfc7230HttpOutpoutProvider(config, this.httpyac),
      new httpOutput.BuiltInHttpOutputProvider(config),
      new httpOutput.ImageHttpOutputProvider(config),
      new httpOutput.ContentTypeHttpOutputProvider(config),
      new httpOutput.MarkdownHttpOutputProvider(config, this.httpyac),
    ];

    this.subscriptions = [
      controller,
    ];
  }
  public dispose(): void {
    if (this.subscriptions) {
      this.subscriptions.forEach(obj => obj.dispose());
      this.subscriptions = [];
    }
  }


  private onDidReceiveMessage(event: { editor: vscode.NotebookEditor, message: unknown }) {
    for (const httpOutputProvider of this.httpOutputProvider) {
      try {
        if (httpOutputProvider.onDidReceiveMessage) {
          httpOutputProvider.onDidReceiveMessage(event);
        }
      } catch (err) {
        this.httpyac.log.error(httpOutputProvider.id, err);
      }
    }
  }

  private async send(cells: vscode.NotebookCell[], notebook: vscode.NotebookDocument, controller: vscode.NotebookController): Promise<void> {
    const r = this.httpyac.fileProvider.toString(notebook.uri);
    this.httpyac.log.info(r);
    const httpFile = this.httpFileStore.get(notebook.uri);
    if (httpFile) {
      for (const cell of cells) {
        const cellHttpFile = await this.httpFileStore.getOrCreate(cell.document.uri,
          () => Promise.resolve(cell.document.getText()), cell.document.version);
        if (cellHttpFile.httpRegions.length > 0) {
          httpFile.activeEnvironment = cellHttpFile.activeEnvironment;
          if (await this.executeCell(controller, cell, httpFile, cellHttpFile.httpRegions)) {
            this.refreshCodeLens.fire();
            this.refreshFileHttpRegions(cellHttpFile, httpFile);
          }
        }
      }
    }
  }

  private refreshFileHttpRegions(cellHttpFile: Httpyac.HttpFile, httpFile: Httpyac.HttpFile) {
    for (const httpRegion of cellHttpFile.httpRegions) {
      if (httpRegion.metaData.name && httpRegion.response) {
        const fileHttpRegion = httpFile.httpRegions.find(obj => obj.metaData.name === httpRegion.metaData.name);
        if (fileHttpRegion) {
          fileHttpRegion.response = httpRegion.response;
          fileHttpRegion.testResults = httpRegion.testResults;
        }
      }
    }
  }

  private async executeCell(controller: vscode.NotebookController, cell: vscode.NotebookCell, httpFile: Httpyac.HttpFile, httpRegions: Httpyac.HttpRegion[]) {
    const execution = controller.createNotebookCellExecutionTask(cell);
    execution.executionOrder = ++this.executionOrder;
    execution.start({ startTime: Date.now() });
    try {
      await this.httpyac.httpYacApi.send({
        httpFile,
        httpRegions,
      });
      const outputs: Array<vscode.NotebookCellOutput> = [];

      for (const httpRegion of httpRegions) {
        outputs.push(...this.createHttpRegionOutputs(httpRegion, {
          cell,
          metaData: httpRegion.metaData,
          httpRegion,
          mimeType: httpRegion.response?.contentType?.mimeType,
          httpFile
        }));
      }
      execution.replaceOutput(outputs);
      execution.end({
        success: true,
        endTime: Date.now(),
      });
      return true;
    } catch (err) {
      this.httpyac.log.error(err);
      execution.replaceOutput([
        new vscode.NotebookCellOutput([
          new vscode.NotebookCellOutputItem('application/x.notebook.error-traceback', {
            ename: err instanceof Error && err.name || 'error',
            evalue: err instanceof Error && err.message || JSON.stringify(err, null, 2),
            traceback: [err.stack]
          })
        ])
      ]);
      execution.end({ success: false, endTime: Date.now() });
      return false;
    }
  }

  private createHttpRegionOutputs(httpRegion: Httpyac.HttpRegion, httpOutputContext: extensionApi.HttpOutputContext): vscode.NotebookCellOutput[] {
    const outputs: vscode.NotebookCellOutput[] = [];
    if (httpRegion.testResults && this.canShowTestResults(httpRegion.testResults)) {
      const testResults = httpRegion.testResults;
      const outputItems = this.mapHttpOutputProvider(
        obj => !!obj.getTestResultOutputResult && obj.getTestResultOutputResult(testResults, httpOutputContext)
      );
      if (outputItems.length > 0) {
        outputs.push(this.createNotebookCellOutput(outputItems, httpRegion.response?.contentType?.mimeType));
      }
    }
    if (httpRegion.response) {
      const response = httpRegion.response;
      const outputItems = this.mapHttpOutputProvider(
        obj => !!obj.getResponseOutputResult && obj.getResponseOutputResult(response, httpOutputContext)
      );
      if (outputItems.length > 0) {
        outputs.push(this.createNotebookCellOutput(outputItems, response.contentType?.mimeType));
      }
    }
    return outputs;
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

  private mapHttpOutputProvider(mapFunc: (obj: extensionApi.HttpOutputProvider) => (extensionApi.HttpOutputResult | false)) {
    const result: Array<extensionApi.HttpOutputResult> = [];

    for (const httpOutputProvider of this.httpOutputProvider) {
      try {
        const obj = mapFunc(httpOutputProvider);
        if (obj) {
          result.push(obj);
        }
      } catch (err) {
        this.httpyac.log.error(httpOutputProvider.id, err);
      }
    }
    return result;
  }

  private createNotebookCellOutput(outputItems: Array<extensionApi.HttpOutputResult>, mimeType?: string) {
    const preferredMime = this.getPreferredNotebookOutputRendererMime(mimeType);

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
