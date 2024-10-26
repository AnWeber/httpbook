import type * as Httpyac from 'httpyac';
import * as vscode from 'vscode';
import { EOL } from 'os';
import { AppConfig, watchConfigSettings } from '../config';
import { HttpNotebookOutputFactory } from './httpNotebookOutputFactory';
import { HttpYacExtensionApi } from '../httpyacExtensionApi';

export const HttpNotebookViewType = 'http';

interface HttpCell {
  value: string;
  index?: number;
  kind: vscode.NotebookCellKind;
  outputs?: Array<unknown>;
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
        this.notebookSerializerDispose = vscode.workspace.registerNotebookSerializer(HttpNotebookViewType, this, {
          transientOutputs: !c.saveWithOutputs,
          transientCellMetadata: {
            inputCollapsed: true,
            outputCollapsed: true,
            with: true,
          },
        });
      }),
    ];
  }
  private disposeNotebookSerializer() {
    if (this.notebookSerializerDispose) {
      this.notebookSerializerDispose.dispose();
      this.notebookSerializerDispose = undefined;
    }
  }

  public async deserializeNotebook(content: Uint8Array): Promise<vscode.NotebookData> {
    try {
      const httpFile = await this.httpyacExtensionApi.documentStore.parse(
        undefined,
        Buffer.from(content).toString('utf-8')
      );

      const cells: Array<vscode.NotebookCellData> = [];
      for (const httpRegion of httpFile.httpRegions) {
        cells.push(...(await this.createCells(httpRegion, httpFile)));
      }
      return new vscode.NotebookData(cells);
    } catch (err) {
      this.httpyacExtensionApi.httpyac.io.log.error(err);
      return new vscode.NotebookData([]);
    }
  }
  public serializeNotebook(data: vscode.NotebookData): Uint8Array | Promise<Uint8Array> {
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
      const sourceCellLines: Array<string> = [];

      const afterCells = [];

      if (httpRegion.symbol.source) {
        const sourceLines = this.httpyacExtensionApi.httpyac.utils.toMultiLineArray(httpRegion.symbol.source);
        for (let index = 0; index < sourceLines.length; index++) {
          const currentLine = httpRegion.symbol.startLine + index;
          const childSymbol = httpRegion.symbol.children?.find(
            child => child.startLine <= currentLine && currentLine < child.endLine
          );
          if (childSymbol?.kind === this.httpyacExtensionApi.httpyac.HttpSymbolKind.comment) {
            const markdownCell = this.createMarkDownCell(childSymbol.description);
            if (sourceCellLines.some(line => !!line)) {
              afterCells.push(markdownCell);
            } else {
              cells.push(markdownCell);
            }
            index = childSymbol.endLine;
          } else if (childSymbol?.kind !== this.httpyacExtensionApi.httpyac.HttpSymbolKind.response) {
            sourceCellLines.push(sourceLines[index]);
          } else {
            break;
          }
        }
      }
      this.removeTrailingEmptyLines(sourceCellLines);
      if (sourceCellLines.length > 0) {
        const source = this.httpyacExtensionApi.httpyac.utils.toMultiLineString(sourceCellLines);
        if (source.length > 0) cells.push(await this.createHttpCodeCell(source, httpRegion, httpFile));
        sourceCellLines.length = 0;
      }
      cells.push(...afterCells);
    } else {
      cells.push(await this.createHttpCodeCell(httpRegion.symbol.source || '', httpRegion, httpFile));
    }
    return cells;
  }

  private createMarkDownCell(source: string) {
    return new vscode.NotebookCellData(vscode.NotebookCellKind.Markup, source, 'markdown');
  }

  private async createHttpCodeCell(source: string, httpRegion: Httpyac.HttpRegion, httpFile: Httpyac.HttpFile) {
    const cell = new vscode.NotebookCellData(vscode.NotebookCellKind.Code, source, 'http');
    if (httpRegion.response) {
      cell.outputs = await this.httpNotebookOutputFactory.createHttpRegionOutputs(
        httpRegion.response,
        httpRegion.testResults || [],
        {
          metaData: Object.fromEntries(
            Object.entries(httpRegion.metaData).map(([key, val]) => [key, val ? `${val}` : val])
          ),
          mimeType: httpRegion.response.contentType?.mimeType,
          httpFile,
        }
      );
    }
    return cell;
  }

  private removeTrailingEmptyLines(lines: Array<string>): void {
    while (lines.length > 0 && /^(\s*)?$/u.test(lines[lines.length - 1])) {
      lines.pop();
    }
  }

  private getDocumentSource(document: vscode.NotebookData | vscode.NotebookDocument): string {
    const contents: Array<string> = [];
    let hasPrevCell = false;
    const cells = this.getNotebookCells(document);
    for (const cell of cells) {
      if (cell.kind === vscode.NotebookCellKind.Code) {
        const sourceFirstLine = this.httpyacExtensionApi.httpyac.utils.toMultiLineArray(cell.value.trim()).shift();

        const startsWithSeparator =
          sourceFirstLine && this.httpyacExtensionApi.httpyac.utils.RegionSeparator.test(sourceFirstLine);

        if (hasPrevCell) {
          if (!startsWithSeparator) {
            contents.push(`###`);
          }
        }
        if (cell.index !== undefined) {
          contents.push(`# @cellIndex ${cell.index}`);
        }
        contents.push(cell.value);
        if (cell.outputs && this.config.saveWithOutputs) {
          for (const output of cell.outputs) {
            if (output && typeof output === 'string') {
              contents.push('');
              contents.push(output);
            }
          }
        }
        if (cell.index !== undefined) {
          contents.push(`# @cellIndexAfter ${cell.index}`);
        }
        hasPrevCell = true;
      } else if (cell.kind === vscode.NotebookCellKind.Markup) {
        contents.push(`/*${EOL}${cell.value}${EOL}*/`);
      }
    }
    return contents.join(`${EOL}`);
  }

  private getNotebookCells(document: vscode.NotebookData | vscode.NotebookDocument): Array<HttpCell> {
    if (this.isNotebookData(document)) {
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
        index: obj.index,
      };
      if (obj.outputs) {
        result.outputs = obj.outputs.map(output => output.metadata?.source);
      }
      return result;
    });
  }

  public async getNotebookHttpFile(notebook: vscode.NotebookDocument) {
    let version = 0;
    for (const cell of notebook.getCells()) {
      version += cell.document.version;
    }
    return await this.httpyacExtensionApi.documentStore.getOrCreate(
      notebook.uri,
      () => Promise.resolve(this.getDocumentSource(notebook)),
      version
    );
  }

  private isNotebookData(document: vscode.NotebookData | vscode.NotebookDocument): document is vscode.NotebookData {
    if (document instanceof vscode.NotebookData) {
      return true;
    }
    const obj = document as unknown as Record<string, unknown>;
    return Array.isArray(obj.cells) && !obj.getCells;
  }
}
