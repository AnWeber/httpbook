import { HttpFileStore, HttpRegion } from 'httpyac';
import * as vscode from 'vscode';
import { EOL } from 'os';

export class HttpNotebookContentProvider implements vscode.NotebookContentProvider {
  options?: vscode.NotebookDocumentContentOptions | undefined;

  constructor(private readonly httpFileStore: HttpFileStore) { }


  onDidChangeNotebookContentOptions?: vscode.Event<vscode.NotebookDocumentContentOptions> | undefined;

  async openNotebook(uri: vscode.Uri, openContext: vscode.NotebookDocumentOpenContext): Promise<vscode.NotebookData> {
    const httpFile = await this.httpFileStore.getOrCreate(uri.fsPath, async () => {
      const content = await vscode.workspace.fs.readFile(uri);
      return Buffer.from(content).toString();
    }, 0);
    if (openContext.backupId) {
      this.httpFileStore.rename(uri.fsPath, openContext.backupId);
    }
    const cells = httpFile.httpRegions
      .filter(obj => obj.actions.length > 0)
      .map(this.createCell);
    return this.createNotebook(cells);
  }
  async saveNotebook(document: vscode.NotebookDocument): Promise<void> {
    await this.saveDocument(document.uri, document);
  }

  async saveNotebookAs(targetResource: vscode.Uri, document: vscode.NotebookDocument): Promise<void> {
    await this.saveDocument(targetResource, document);
  }


  backupNotebook(document: vscode.NotebookDocument): Promise<vscode.NotebookDocumentBackup> {
    return Promise.resolve({
      id: document.uri.fsPath,
      delete: () => {
        // eslint-disable-next-line no-console
        console.info('no delete needed');
      }
    });
  }


  private async saveDocument(uri: vscode.Uri, document: vscode.NotebookDocument) : Promise<void> {
    const contents: Array<string> = [];
    for (const cell of document.getCells()) {
      if (cell.kind === vscode.NotebookCellKind.Code) {
        contents.push(cell.document.getText());
      }
    }
    await vscode.workspace.fs.writeFile(uri, Buffer.from(contents.join(`${EOL}${EOL}###${EOL}${EOL}`)));
  }


  private createCell(httpRegion: HttpRegion) {
    return new vscode.NotebookCellData(vscode.NotebookCellKind.Code,
      httpRegion.source || '',
      'http',
      [],
      new vscode.NotebookCellMetadata());

  }

  private createNotebook(cells: Array<vscode.NotebookCellData>) {
    return new vscode.NotebookData(cells,
      new vscode.NotebookDocumentMetadata());

  }
}
