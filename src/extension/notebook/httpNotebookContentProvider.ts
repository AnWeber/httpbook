import * as Httpyac from 'httpyac';
import * as vscode from 'vscode';
import { EOL } from 'os';
import { AppConfig } from '../config';

export class HttpNotebookContentProvider implements vscode.NotebookContentProvider {
  options?: vscode.NotebookDocumentContentOptions | undefined;

  constructor(
    private readonly config: AppConfig,
    private readonly httpFileStore: Httpyac.HttpFileStore,
    private readonly httpyac: typeof Httpyac,
  ) { }


  onDidChangeNotebookContentOptions?: vscode.Event<vscode.NotebookDocumentContentOptions> | undefined;

  async openNotebook(uri: vscode.Uri, openContext: vscode.NotebookDocumentOpenContext): Promise<vscode.NotebookData> {
    try {
      const httpFile = await this.httpFileStore.getOrCreate(uri, async () => {
        const content = await vscode.workspace.fs.readFile(uri);
        return Buffer.from(content).toString();
      }, 0);
      if (openContext.backupId) {
        this.httpFileStore.rename(uri, vscode.Uri.parse(openContext.backupId));
      }
      const cells = httpFile.httpRegions
        .map(this.createCell);
      return this.createNotebook(cells);
    } catch (err) {
      this.httpyac.log.trace(err);
      return this.createNotebook([]);
    }
  }
  async saveNotebook(document: vscode.NotebookDocument): Promise<void> {
    await this.saveDocument(document.uri, document);
  }

  async saveNotebookAs(targetResource: vscode.Uri, document: vscode.NotebookDocument): Promise<void> {
    await this.saveDocument(targetResource, document);
  }


  backupNotebook(document: vscode.NotebookDocument): Promise<vscode.NotebookDocumentBackup> {
    return Promise.resolve({
      id: document.uri.toString(),
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      delete: () => {}
    });
  }


  private async saveDocument(uri: vscode.Uri, document: vscode.NotebookDocument) : Promise<void> {
    const contents: Array<string> = [];
    if (this.config.saveWithEmptyFirstline) {
      contents.push('');
    }
    let hasPrevCell = false;
    let isPrevCellGlobalScript = false;
    for (const cell of document.getCells()) {
      if (cell.kind === vscode.NotebookCellKind.Code) {
        const sourceFirstLine = this.httpyac.utils.toMultiLineArray(cell.document.getText().trim()).shift();
        const startsWithRequestLine = sourceFirstLine
          && this.httpyac.parser.ParserRegex.request.requestLine.test(sourceFirstLine);

        if (hasPrevCell) {
          if (!startsWithRequestLine || isPrevCellGlobalScript) {
            contents.push(`${EOL}###${EOL}`);
          } else if (this.config.saveWithRegionDelimiter) {
            contents.push(`${EOL}###${EOL}`);
          } else {
            contents.push(`${EOL}`);
          }
        }
        isPrevCellGlobalScript = !startsWithRequestLine;
        contents.push(cell.document.getText());
        hasPrevCell = true;
      } else if (cell.kind === vscode.NotebookCellKind.Markdown) {

        contents.push(`${EOL}###${EOL}${EOL}/*${EOL}${cell.document.getText()}${EOL}*/${EOL}`);
      }
    }
    await vscode.workspace.fs.writeFile(uri, Buffer.from(contents.join(`${EOL}`)));

  }


  private createCell(httpRegion: Httpyac.HttpRegion) {
    let source = httpRegion.source || '';
    if (httpRegion.actions.length > 0) {
      return new vscode.NotebookCellData(vscode.NotebookCellKind.Code,
        source,
        'http',
        [],
        new vscode.NotebookCellMetadata());
    }
    if (source.length > 4) {
      source = source.slice(2, source.length - 2).trim();
    }
    return new vscode.NotebookCellData(vscode.NotebookCellKind.Markdown,
      source,
      'http',
      [],
      new vscode.NotebookCellMetadata());
  }

  private createNotebook(cells: Array<vscode.NotebookCellData>) {
    return new vscode.NotebookData(
      cells,
      new vscode.NotebookDocumentMetadata()
    );
  }
}
