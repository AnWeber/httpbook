import type * as Httpyac from 'httpyac';
import * as vscode from 'vscode';
import { EOL } from 'os';
import { AppConfig } from '../config';
import { HttpNotebookViewType } from './notebookSelector';
import { HttpNotebookOutputFactory } from './httpNotebookOutputFactory';


export class HttpNotebookContentProvider implements vscode.NotebookContentProvider {

  options?: vscode.NotebookDocumentContentOptions | undefined;

  private subscriptions: Array<vscode.Disposable>;
  constructor(
    private readonly httpNotebookOutputFactory: HttpNotebookOutputFactory,
    private readonly httpyac: typeof Httpyac,
    private readonly httpFileStore: Httpyac.HttpFileStore,
    private readonly config: AppConfig,
    private readonly httpDocumentSelector: vscode.DocumentSelector,
  ) {

    this.subscriptions = [
      vscode.workspace.onDidChangeTextDocument(this.onDidChangeTextDocument.bind(this)),
      vscode.workspace.registerNotebookContentProvider(
        HttpNotebookViewType,
        this,
        {
          transientOutputs: true,
          transientCellMetadata: {
            inputCollapsed: true,
            outputCollapsed: true,
            with: true,
          }
        }
      )
    ];
  }
  public dispose(): void {
    if (this.subscriptions) {
      this.subscriptions.forEach(obj => obj.dispose());
      this.subscriptions = [];
    }
  }


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
      const cells: Array<vscode.NotebookCellData> = [];
      for (const httpRegion of httpFile.httpRegions) {
        cells.push(...this.createCells(httpRegion, httpFile));
      }
      return new vscode.NotebookData(cells);
    } catch (err) {
      this.httpyac.log.trace(err);
      return new vscode.NotebookData([]);
    }
  }

  private createCells(httpRegion: Httpyac.HttpRegion, httpFile: Httpyac.HttpFile) {
    const cells: Array<vscode.NotebookCellData> = [];
    if (httpRegion.symbol.children) {
      const sourceLines: Array<string> = [];
      for (const symbol of httpRegion.symbol.children) {
        if (symbol.source) {
          if (symbol.kind === this.httpyac.HttpSymbolKind.comment) {
            cells.push(this.createMarkDownCell(symbol.source));
          } else if (symbol.kind !== this.httpyac.HttpSymbolKind.response) {
            sourceLines.push(symbol.source);
          }
        }
      }
      if (sourceLines.length > 0) {
        cells.push(this.createHttpCodeCell(this.httpyac.utils.toMultiLineString(sourceLines), httpRegion, httpFile));
      }
    } else {
      cells.push(this.createHttpCodeCell(httpRegion.symbol.source || '', httpRegion, httpFile));
    }
    return cells;
  }

  private createMarkDownCell(source: string) {
    let src = source;
    if (source.length > 4) {
      src = source.slice(2, source.length - 2).trim();
    }
    return new vscode.NotebookCellData(
      vscode.NotebookCellKind.Markup,
      src,
      'text/markdown'
    );
  }

  private createHttpCodeCell(source: string, httpRegion: Httpyac.HttpRegion, httpFile: Httpyac.HttpFile) {
    const cell = new vscode.NotebookCellData(vscode.NotebookCellKind.Code,
      source,
      'http');

    if (httpRegion.response) {
      cell.outputs = this.httpNotebookOutputFactory.createHttpRegionOutputs(httpRegion, {
        metaData: httpRegion.metaData,
        mimeType: httpRegion.response.contentType?.mimeType,
        httpFile
      });
    }
    return cell;
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
      delete: () => { }
    });
  }


  private getDocumentSource(document: vscode.NotebookDocument): string {
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
        for (const output of cell.outputs) {
          if (output.metadata?.source) {
            contents.push('');
            contents.push(output.metadata.source);
          }
        }

        hasPrevCell = true;
      } else if (cell.kind === vscode.NotebookCellKind.Markup) {
        contents.push(`${EOL}/*${EOL}${cell.document.getText()}${EOL}*/${EOL}`);
      }
    }
    return contents.join(`${EOL}`);
  }

  private async saveDocument(uri: vscode.Uri, document: vscode.NotebookDocument): Promise<void> {
    await vscode.workspace.fs.writeFile(uri, Buffer.from(this.getDocumentSource(document)));
  }


  public onDidChangeTextDocument(event: vscode.TextDocumentChangeEvent): void {
    if (event.document.notebook
      && event.document.notebook?.notebookType === HttpNotebookViewType
      && vscode.languages.match(this.httpDocumentSelector, event.document)) {
      const source = this.getDocumentSource(event.document.notebook);
      this.httpFileStore.getOrCreate(event.document.notebook.uri, () => Promise.resolve(source), event.document.version);
    }
  }

}
