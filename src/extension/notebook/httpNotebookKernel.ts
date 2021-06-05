import * as vscode from 'vscode';
import type * as Httpyac from 'httpyac';
import { HttpNotebookViewType } from './notebookSelector';
import { HttpNotebookOutputFactory } from './httpNotebookOutputFactory';


export class HttpNotebookKernel implements vscode.NotebookCellStatusBarItemProvider {

  private executionOrder = 0;


  private subscriptions: Array<vscode.Disposable>;
  onDidChangeCellStatusBarItems?: vscode.Event<void> | undefined;
  constructor(
    private readonly httpNotebookOutputFactory: HttpNotebookOutputFactory,
    private readonly httpyac: typeof Httpyac,
    private readonly httpFileStore: Httpyac.HttpFileStore,
    private readonly refreshCodeLens: vscode.EventEmitter<void>
  ) {
    this.onDidChangeCellStatusBarItems = refreshCodeLens.event;
    const controller = vscode.notebooks.createNotebookController('httpbook-kernel', HttpNotebookViewType, 'HttpBook');
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
      result.push(this.createNotebookCellStatusBarItem(
        `${cellHttpFile.activeEnvironment || 'no env'}`,
        vscode.NotebookCellStatusBarAlignment.Left,
        'httpyac.toggle-env',
        `current environment: ${cellHttpFile.activeEnvironment || '-'}`,
      ));
      if (this.httpyac.environments.userSessionStore.userSessions.length > 0) {
        result.push(this.createNotebookCellStatusBarItem(
          `active session (${this.httpyac.environments.userSessionStore.userSessions.length})`,
          vscode.NotebookCellStatusBarAlignment.Right,
          'httpyac.logout',
          `active session (${this.httpyac.environments.userSessionStore.userSessions.length})`,
        ));
      }
      if (this.httpyac.environments.cookieStore.cookies.length > 0) {
        result.push(this.createNotebookCellStatusBarItem(
          `cookies (${this.httpyac.environments.cookieStore.cookies.length})`,
          vscode.NotebookCellStatusBarAlignment.Right,
          'httpyac.removeCookies',
        ));
      }
      for (const httpRegion of cellHttpFile.httpRegions) {

        // TODO correct command if cell statusbar items are working with command
        if (httpRegion.response) {
          result.push(this.createNotebookCellStatusBarItem(
            '$(save)',
            vscode.NotebookCellStatusBarAlignment.Left,
            'httpyac.save',
            'save'
          ));
          result.push(this.createNotebookCellStatusBarItem(
            '$(file-code)',
            vscode.NotebookCellStatusBarAlignment.Left,
            'httpyac.show',
            'show in editor'
          ));
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

  private createNotebookCellStatusBarItem(text: string, alignment: vscode.NotebookCellStatusBarAlignment, command: string | vscode.Command, tooltip?: string) {
    const statusBarItem = new vscode.NotebookCellStatusBarItem(text, alignment);
    statusBarItem.command = command;
    statusBarItem.tooltip = tooltip;
    return statusBarItem;
  }


  private async send(cells: vscode.NotebookCell[], notebook: vscode.NotebookDocument, controller: vscode.NotebookController): Promise<void> {
    const r = this.httpyac.fileProvider.toString(notebook.uri);
    this.httpyac.log.info(r);
    const httpFile = this.httpFileStore.get(notebook.uri);
    if (httpFile) {
      for (const cell of cells) {
        const cellHttpFile = await this.getCellHttpFile(cell);
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

  private async getCellHttpFile(cell: vscode.NotebookCell) {
    return await this.httpFileStore.getOrCreate(cell.document.uri,
      () => Promise.resolve(cell.document.getText()), cell.document.version);
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
    const execution = controller.createNotebookCellExecution(cell);
    execution.executionOrder = ++this.executionOrder;
    execution.start(Date.now());
    try {
      await this.httpyac.httpYacApi.send({
        httpFile,
        httpRegions,
      });
      const outputs: Array<vscode.NotebookCellOutput> = [];

      for (const httpRegion of httpRegions) {
        outputs.push(...this.httpNotebookOutputFactory.createHttpRegionOutputs(httpRegion, {
          metaData: httpRegion.metaData,
          mimeType: httpRegion.response?.contentType?.mimeType,
          httpFile
        }));
      }
      execution.replaceOutput(outputs);
      execution.end(true, Date.now());
      return true;
    } catch (err) {
      this.httpyac.log.error(err);
      execution.replaceOutput([
        new vscode.NotebookCellOutput([
          vscode.NotebookCellOutputItem.error(err),
        ])
      ]);
      execution.end(false, Date.now());
      return false;
    }
  }
}
