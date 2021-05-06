import { HttpRegion, HttpFile } from 'httpyac';
import * as vscode from 'vscode';


export enum HttpOutputSlot{
  testResults = 'testResults',
  response = 'response',
}
export interface HttpOutputContext{
  cell: vscode.NotebookCell;
  httpFile: HttpFile;
  slot: HttpOutputSlot;
}

export enum HttpOutputPriority{
  Low = 10,
  Default = 100,
  High = 1000,
}

export interface HttpOutputResult {
  outputItems: vscode.NotebookCellOutputItem | Array<vscode.NotebookCellOutputItem>;
  priority: number;
}

export interface HttpOutputProvider{
  readonly id: string;

  /** supported slots, if emtpy only response */
  supportedSlots?: HttpOutputSlot[];

  getOutputResult(httpRegion: HttpRegion, context: HttpOutputContext): HttpOutputResult | false;
}
