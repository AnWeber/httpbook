import * as vscode from 'vscode';
import * as Httpyac from 'httpyac';
import { AppConfig, getConfigSetting, HttpOutputRendererMimes, OutputMimeConstraint } from './config';
import * as mimeOutputProvider from './mimeOutputProvider';


export class HttpNotebookKernel {
  readonly id = 'httpbook-kernel';
  readonly label = 'HttpBook Kernel';
  readonly supportedLanguages = ['http'];

  readonly mimeOutputProvider = [
    new mimeOutputProvider.RawMimeOutputProvider(this.httpyac),
    new mimeOutputProvider.ContentTypeMimeOutputProvider(),
    new mimeOutputProvider.MarkdownMimeOutputProvider(this.httpyac),
    new mimeOutputProvider.MarkdownTestResultsMimeOutputProvider(this.httpyac),
  ];

  private readonly _controller: vscode.NotebookController;

  constructor(
    private readonly httpyac: typeof Httpyac,
    private readonly httpFileStore: Httpyac.HttpFileStore
  ) {
    this._controller = vscode.notebook.createNotebookController('httpbook-kernel',
      'http',
      'HttpBook');

    this._controller.supportedLanguages = ['http'];
    this._controller.hasExecutionOrder = true;
    this._controller.description = 'A notebook for making REST calls.';
    this._controller.executeHandler = this.send.bind(this);

  }

  dispose(): void {
    this._controller.dispose();
  }

  private async send(cells: vscode.NotebookCell[], notebook: vscode.NotebookDocument, controller: vscode.NotebookController): Promise<void> {

    const httpFile = this.httpFileStore.get(notebook.uri.fsPath);
    if (httpFile) {
      if (httpFile.activeEnvironment && httpFile.activeEnvironment.length === 0) {
        delete httpFile.activeEnvironment;
      }

      for (const cell of cells) {
        const currentFile = await this.httpFileStore.parse(notebook.uri.fsPath, cell.document.getText());
        if (currentFile.httpRegions.length > 0) {
          const httpRegion = currentFile.httpRegions[0];
          const execution = controller.createNotebookCellExecutionTask(cell);
          try {
            execution.start({ startTime: Date.now() });
            await this.httpyac.httpYacApi.send({
              httpFile,
              httpRegion,
            });
            const outputs: Array<vscode.NotebookCellOutput> = [];
            const config = getConfigSetting();

            const outputItems = this.createResponseOutputs(httpRegion, config);
            if (outputItems.length > 0) {
              outputs.push(new vscode.NotebookCellOutput(outputItems));
            }
            const testOutputItems = this.createTestOutputs(httpRegion, config);
            if (testOutputItems.length > 0) {
              outputs.push(new vscode.NotebookCellOutput(testOutputItems));
            }
            execution.replaceOutput(outputs);
            execution.end({
              success: true,
              endTime: Date.now(),
            });
          } catch (err) {
            execution.replaceOutput([
              new vscode.NotebookCellOutput([
                new vscode.NotebookCellOutputItem(HttpOutputRendererMimes.error, {
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

  private createResponseOutputs(httpRegion: Httpyac.HttpRegion, config: AppConfig) {
    const outputItems: Array<vscode.NotebookCellOutputItem> = [];
    if (httpRegion.response && Array.isArray(config.responseMimes)) {
      for (const responseMime of config.responseMimes) {
        let mime: string | undefined;
        if (typeof (responseMime) === 'string') {
          mime = responseMime;
        } else if (this.supportsOutputMimeConstraint(responseMime, httpRegion.response.contentType)) {
          mime = responseMime.mime;
        }
        if (mime) {
          outputItems.push(this.getNotebookCellOutputItem(mime, httpRegion));
        }
      }
    }
    return outputItems;
  }

  private createTestOutputs(httpRegion: Httpyac.HttpRegion, config: AppConfig) {
    const outputItems: Array<vscode.NotebookCellOutputItem> = [];
    if (httpRegion.testResults && Array.isArray(config.testMimes)) {
      for (const mime of config.testMimes) {
        outputItems.push(this.getNotebookCellOutputItem(mime, httpRegion));
      }
    }
    return outputItems;
  }

  private getNotebookCellOutputItem(mime: string, httpRegion: Httpyac.HttpRegion) {
    const metaData = {
      response: httpRegion.response,
      testResults: httpRegion.testResults,
    };
    for (const mimeOutputProvider of this.mimeOutputProvider) {
      const outputItem = mimeOutputProvider.getNotebookCellOutputItem(mime, httpRegion);
      if (outputItem) {
        return outputItem;
      }
    }
    return new vscode.NotebookCellOutputItem(mime, httpRegion, metaData);
  }

  private supportsOutputMimeConstraint(constraint: OutputMimeConstraint, contentType: Httpyac.ContentType | undefined) {
    if (constraint.json && this.httpyac.utils.isMimeTypeJSON(contentType)) {
      return true;
    }
    if (constraint.xml && this.httpyac.utils.isMimeTypeXml(contentType)) {
      return true;
    }
    return contentType && constraint.supportedMimeTypes.indexOf(contentType.mimeType) >= 0;
  }


}
