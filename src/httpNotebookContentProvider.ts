import { HttpFileStore, HttpRegion } from 'httpyac';
import * as vscode from 'vscode';
import { EOL } from 'os';

export class HttpNotebookContentProvider implements vscode.NotebookContentProvider {
  options?: vscode.NotebookDocumentContentOptions | undefined;

  constructor(private readonly httpFileStore: HttpFileStore) { }


  onDidChangeNotebookContentOptions?: vscode.Event<vscode.NotebookDocumentContentOptions> | undefined;

  async openNotebook(uri: vscode.Uri): Promise<vscode.NotebookData> {
    const httpFile = await this.httpFileStore.getOrCreate(uri.fsPath, async () => {
      const content = await vscode.workspace.fs.readFile(uri);
      return Buffer.from(content).toString();
    }, 0);
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


  backupNotebook(): Promise<vscode.NotebookDocumentBackup> {
    throw new Error('Method not implemented.');
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
