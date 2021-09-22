import type * as Httpyac from 'httpyac';
import * as vscode from 'vscode';
import { EOL } from 'os';
import { AppConfig, watchConfigSettings } from '../config';
import { HttpNotebookOutputFactory } from './httpNotebookOutputFactory';
import { isNotebookDocument } from './notebookUtils';
import { HttpYacExtensionApi } from '../httpyacExtensionApi';

export const HttpNotebookViewType = 'http';

interface HttpCell{
  value: string;
  kind: vscode.NotebookCellKind,
  outputs?: Array<unknown>
}

export class HttpNotebookSerializer implements vscode.NotebookSerializer {

  options?: vscode.NotebookDocumentContentOptions | undefined;

  notebookSerializerDispose: vscode.Disposable | undefined;

  private subscriptions: Array<vscode.Disposable>;
  constructor(
    private readonly httpNotebookOutputFactory: HttpNotebookOutputFactory,
    private readonly httpyacExtensionApi: HttpYacExtensionApi,
    private readonly config: AppConfig
  ) {


    this.subscriptions = [
      watchConfigSettings(c => {
        this.disposeNotebookSerializer();
        this.notebookSerializerDispose = vscode.workspace.registerNotebookSerializer(
          HttpNotebookViewType,
          this,
          {
            transientOutputs: !c.saveWithOutputs,
            transientCellMetadata: {
              inputCollapsed: true,
              outputCollapsed: true,
              with: true,
            }
          }
        );
      }),
      vscode.workspace.onDidChangeTextDocument(this.onDidChangeTextDocument.bind(this)),

    ];
  }
  private disposeNotebookSerializer() {
    if (this.notebookSerializerDispose) {
      this.notebookSerializerDispose.dispose();
      this.notebookSerializerDispose = undefined;
    }
  }

  async deserializeNotebook(content: Uint8Array): Promise<vscode.NotebookData> {
    try {
      const httpFile = await this.httpyacExtensionApi.documentStore.parse(
        vscode.window.activeTextEditor?.document.uri,
        Buffer.from(content).toString('utf-8')
      );

      const cells: Array<vscode.NotebookCellData> = [];
      for (const httpRegion of httpFile.httpRegions) {
        cells.push(...(await this.createCells(httpRegion, httpFile)));
      }
      return new vscode.NotebookData(cells);
    } catch (err) {
      this.httpyacExtensionApi.httpyac.io.log.trace(err);
      return new vscode.NotebookData([]);
    }
  }
  serializeNotebook(data: vscode.NotebookData): Uint8Array | Thenable<Uint8Array> {
    const source = this.getDocumentSource(data);
    return Buffer.from(source);
  }
  public dispose(): void {
    this.disposeNotebookSerializer();
    if (this.subscriptions) {
      this.subscriptions.forEach(obj => obj.dispose());
      this.subscriptions = [];
    }
  }


  onDidChangeNotebookContentOptions?: vscode.Event<vscode.NotebookDocumentContentOptions> | undefined;

  private async createCells(httpRegion: Httpyac.HttpRegion, httpFile: Httpyac.HttpFile) {
    const cells: Array<vscode.NotebookCellData> = [];
    if (httpRegion.symbol.children) {
      const sourceLines: Array<string> = [];
      for (const symbol of httpRegion.symbol.children) {
        if (symbol.source) {
          if (symbol.kind === this.httpyacExtensionApi.httpyac.HttpSymbolKind.comment) {
            cells.push(this.createMarkDownCell(symbol.source));
          } else if (symbol.kind !== this.httpyacExtensionApi.httpyac.HttpSymbolKind.response) {
            sourceLines.push(symbol.source);
          }
        }
      }
      if (sourceLines.length > 0) {
        cells.push(await this.createHttpCodeCell(this.httpyacExtensionApi.httpyac.utils.toMultiLineString(sourceLines), httpRegion, httpFile));
      }
    } else {
      cells.push(await this.createHttpCodeCell(httpRegion.symbol.source || '', httpRegion, httpFile));
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

  private async createHttpCodeCell(source: string, httpRegion: Httpyac.HttpRegion, httpFile: Httpyac.HttpFile) {
    const cell = new vscode.NotebookCellData(vscode.NotebookCellKind.Code,
      source,
      'http');

    if (httpRegion.response) {
      cell.outputs = await this.httpNotebookOutputFactory.createHttpRegionOutputs(
        httpRegion.response,
        httpRegion.testResults || [],
        {
          metaData: httpRegion.metaData,
          mimeType: httpRegion.response.contentType?.mimeType,
          httpFile
        }
      );
    }
    return cell;
  }

  public getDocumentSource(document: vscode.NotebookData | vscode.NotebookDocument): string {
    const contents: Array<string> = [];
    let hasPrevCell = false;
    let isPrevCellGlobalScript = false;
    const cells = this.getNotebookCells(document);
    for (const cell of cells) {
      if (cell.kind === vscode.NotebookCellKind.Code) {
        const sourceFirstLine = this.httpyacExtensionApi.httpyac.utils.toMultiLineArray(cell.value.trim()).shift();
        const startsWithRequestLine = sourceFirstLine
          && this.httpyacExtensionApi.httpyac.parser.ParserRegex.request.requestLine.test(sourceFirstLine);

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
        contents.push(cell.value);
        if (cell.outputs && this.config.saveWithOutputs) {
          for (const output of cell.outputs) {
            if (output && typeof output === 'string') {
              contents.push('');
              contents.push(output);
            }
          }
        }
        hasPrevCell = true;
      } else if (cell.kind === vscode.NotebookCellKind.Markup) {
        contents.push(`${EOL}/*${EOL}${cell.value}${EOL}*/${EOL}`);
      }
    }
    return contents.join(`${EOL}`);
  }

  private getNotebookCells(document: vscode.NotebookData | vscode.NotebookDocument) : Array<HttpCell> {
    if (document instanceof vscode.NotebookData) {
      return document.cells.map(obj => {
        const result: HttpCell = {
          value: obj.value,
          kind: obj.kind,
        };
        if (obj.outputs) {
          result.outputs = obj.outputs.map(output => output.metadata?.source);
        }
        return result;
      });
    }
    return document.getCells().map(obj => {
      const result: HttpCell = {
        value: obj.document.getText(),
        kind: obj.kind,
      };
      if (obj.outputs) {
        result.outputs = obj.outputs.map(output => output.metadata?.source);
      }
      return result;
    });
  }

  public onDidChangeTextDocument(event: vscode.TextDocumentChangeEvent): void {
    if (isNotebookDocument(event?.document)
      && event.document.notebook?.notebookType === HttpNotebookViewType
      && vscode.languages.match(this.httpyacExtensionApi.httpDocumentSelector, event.document)) {
      const source = this.getDocumentSource(event.document.notebook);
      this.httpyacExtensionApi.documentStore.getOrCreate(event.document.notebook.uri, () => Promise.resolve(source), event.document.version);
    }
  }
}
