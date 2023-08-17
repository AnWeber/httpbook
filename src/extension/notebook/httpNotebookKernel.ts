import * as vscode from 'vscode';
import type * as Httpyac from 'httpyac';
import { HttpNotebookOutputFactory } from './httpNotebookOutputFactory';
import { HttpNotebookSerializer, HttpNotebookViewType } from './httpNotebookSerializer';
import { HttpYacExtensionApi } from '../httpyacExtensionApi';
import { AppConfig } from '../config';

export class HttpNotebookKernel implements vscode.NotebookCellStatusBarItemProvider {
  private executionOrder = 0;

  private subscriptions: Array<vscode.Disposable>;
  onDidChangeCellStatusBarItems?: vscode.Event<void> | undefined;
  constructor(
    private readonly config: AppConfig,
    private readonly httpNotebookOutputFactory: HttpNotebookOutputFactory,
    private readonly httpNotebookSerializer: HttpNotebookSerializer,
    private readonly httpyacExtensionApi: HttpYacExtensionApi
  ) {
    this.onDidChangeCellStatusBarItems = httpyacExtensionApi.documentStore.documentStoreChangedEmitter.event;
    const controller = vscode.notebooks.createNotebookController('httpbook-kernel', '*', 'HttpBook');
    controller.supportedLanguages = ['http'];
    controller.description = 'a Notebook for sending REST, SOAP, and GraphQL requests';
    controller.executeHandler = this.send.bind(this);

    this.subscriptions = [
      controller,
      vscode.notebooks.registerNotebookCellStatusBarItemProvider(HttpNotebookViewType, this),
    ];
  }
  async provideCellStatusBarItems(cell: vscode.NotebookCell): Promise<vscode.NotebookCellStatusBarItem[]> {
    const result: vscode.NotebookCellStatusBarItem[] = [];

    const cellHttpFile = await this.getCellHttpFile(cell);
    if (cellHttpFile) {
      const env = cellHttpFile.activeEnvironment?.join?.(', ') || '-';
      result.push(
        this.createNotebookCellStatusBarItem(
          `env: ${env}`,
          vscode.NotebookCellStatusBarAlignment.Left,
          'httpyac.toggle-env',
          `current environment: ${env}`
        )
      );
      if (this.httpyacExtensionApi.httpyac.store.userSessionStore.userSessions.length > 0) {
        result.push(
          this.createNotebookCellStatusBarItem(
            `active session (${this.httpyacExtensionApi.httpyac.store.userSessionStore.userSessions.length})`,
            vscode.NotebookCellStatusBarAlignment.Right,
            'httpyac.logout',
            `active session (${this.httpyacExtensionApi.httpyac.store.userSessionStore.userSessions.length})`
          )
        );
      }

      for (const httpRegion of cellHttpFile.httpRegions) {
        const args = [cell.document.uri, httpRegion.symbol.startLine];
        if (httpRegion.response) {
          result.push(
            this.createNotebookCellStatusBarItem('$(save)', vscode.NotebookCellStatusBarAlignment.Left, {
              command: 'httpyac.save',
              title: '$(save)',
              tooltip: 'save',
              arguments: args,
            })
          );
          result.push(
            this.createNotebookCellStatusBarItem('$(file-code)', vscode.NotebookCellStatusBarAlignment.Left, {
              command: 'httpyac.show',
              title: '$(file-code)',
              tooltip: 'show in editor',
              arguments: args,
            })
          );
        }
      }
    }
    return result;
  }
  public dispose(): void {
    if (this.subscriptions) {
      this.subscriptions.forEach(obj => obj.dispose());
      this.subscriptions = [];
    }
  }

  private createNotebookCellStatusBarItem(
    text: string,
    alignment: vscode.NotebookCellStatusBarAlignment,
    command: string | vscode.Command,
    tooltip?: string
  ) {
    const statusBarItem = new vscode.NotebookCellStatusBarItem(text, alignment);
    if (typeof command === 'string') {
      statusBarItem.command = command;
    } else {
      statusBarItem.command = command.command;
    }
    statusBarItem.tooltip = tooltip;
    return statusBarItem;
  }

  private async send(
    cells: vscode.NotebookCell[],
    notebook: vscode.NotebookDocument,
    controller: vscode.NotebookController
  ): Promise<void> {
    try {
      const httpFile = await this.httpyacExtensionApi.documentStore.getOrCreate(
        notebook.uri,
        () => Promise.resolve(this.httpNotebookSerializer.getDocumentSource(notebook)),
        notebook.version
      );
      if (httpFile) {
        for (const cell of cells) {
          const cellHttpFile = await this.getCellHttpFile(cell);
          if (cellHttpFile && cellHttpFile?.httpRegions.length > 0) {
            httpFile.activeEnvironment = cellHttpFile.activeEnvironment;

            if (
              await this.executeCell(
                controller,
                cell,
                httpFile,
                cellHttpFile.httpRegions.map(obj => obj.clone(httpFile))
              )
            ) {
              this.refreshFileHttpRegions(cellHttpFile, httpFile);
            }
          }
        }
      } else {
        this.httpyacExtensionApi.httpyac.io.log.error('no http file found');
      }
    } catch (err) {
      this.httpyacExtensionApi.httpyac.io.log.error(err);
    }
  }

  private async getCellHttpFile(cell: vscode.NotebookCell) {
    return await this.httpyacExtensionApi.documentStore.getHttpFile(cell.document);
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

  private async executeCell(
    controller: vscode.NotebookController,
    cell: vscode.NotebookCell,
    httpFile: Httpyac.HttpFile,
    httpRegions: Httpyac.HttpRegion[]
  ) {
    const execution = controller.createNotebookCellExecution(cell);
    execution.executionOrder = ++this.executionOrder;
    execution.start(Date.now());

    try {
      execution.clearOutput();
      await this.httpyacExtensionApi.documentStore.send({
        httpFile,
        httpRegions,
        progress: {
          isCanceled: () => execution.token.isCancellationRequested,
          register: (event: () => void) => {
            const dispose = execution.token.onCancellationRequested(event);
            return () => dispose.dispose();
          },
          report: () => {
            // empty output
          },
        },
        logStream: async (type, message) => {
          const newOutput = new vscode.NotebookCellOutput([
            vscode.NotebookCellOutputItem.stdout(`${new Date().toLocaleTimeString()} - ${type}: ${message.body}\n`),
          ]);
          execution.appendOutput(newOutput);
        },
        logResponse: async (response, httpRegion) => {
          if (!response) {
            return;
          }
          if (this.config.outputAllResponses || (httpRegion && httpRegions.indexOf(httpRegion) >= 0)) {
            const outputs = await this.httpNotebookOutputFactory.createHttpRegionOutputs(
              response,
              httpRegion?.testResults || [],
              {
                metaData: Object.fromEntries(
                  Object.entries(httpRegion?.metaData || {}).map(([key, value]) => [key, `${value}`])
                ),
                mimeType: response?.contentType?.mimeType,
                httpFile,
              }
            );
            for (const output of outputs) {
              execution.appendOutput(output);
            }
          }
          await this.httpyacExtensionApi.responseStore.add(response, httpRegion, false);
        },
      });

      execution.end(true, Date.now());
      return true;
    } catch (err) {
      this.httpyacExtensionApi.httpyac.io.log.error(err);
      if (err instanceof Error) {
        const quickFix = this.httpyacExtensionApi.getErrorQuickFix(err);
        if (quickFix) {
          execution.replaceOutput([
            new vscode.NotebookCellOutput([
              vscode.NotebookCellOutputItem.stdout(`${err.stack || `${err.name} -  ${err.message}`}

${quickFix}`),
            ]),
          ]);
        } else {
          execution.replaceOutput([new vscode.NotebookCellOutput([vscode.NotebookCellOutputItem.error(err)])]);
        }
      }
      execution.end(false, Date.now());
      return false;
    }
  }
}
