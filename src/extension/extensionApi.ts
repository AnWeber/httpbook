import { HttpRegion, HttpFile } from 'httpyac';
import * as vscode from 'vscode';


export enum HttpOutputSlot{

  /**
   * Output Slot for testResults NotebookCellOutputItems
   */
  testResults = 'testResults',

  /**
   * Output Slot for response NotebookCellOutputItems
   */
  response = 'response',
}

export interface HttpOutputContext{

  /**
   * current Notebookcell
   */
  cell: vscode.NotebookCell;

  /**
   * parsed Notebook Document with all httpRegions
   */
  httpFile: HttpFile;

  /**
   * aktueller OutputSlot
   */
  slot: HttpOutputSlot;
}


export interface HttpOutputResult {

  /**
   * NotebookCellOutputItem or Array of NotebookCellOutputItem
   */
  outputItems: vscode.NotebookCellOutputItem | Array<vscode.NotebookCellOutputItem>;

  /**
   * priority of outputViewItems
   */
  priority: number;
}

export enum HttpOutputPriority{

  /**
   * used in additional built-in provider like markdown
   */
  Low = 10,

  /**
   * used in all built-in provider
   */
  Default = 100,

  /**
   * priority for extensions that support exactly the response type
   */
  High = 1000,
}

export interface HttpOutputProvider{

  /**
   * unique id (only for logging)
   */
  readonly id: string;

  /**
   * supported slots, if emtpy only HttpOutputSlot.response
  */
  supportedSlots?: HttpOutputSlot[];

  /**
   * onDidReceiveMessage of any NotebookCellOutputItem
   * @param event onDidReceiveMessage Event
   */
  onDidReceiveMessage?(event: { editor: vscode.NotebookEditor, message: unknown }): void;

  /**
   * create NotebookCellOutputItems with view priority
   * @param httpRegion processed httpregion with Response, Request und TestResults
   * @param context HttpOutputContext
   * @returns false if output not valid else NotebookCellOutputItems and priortiy
   */
  getOutputResult(httpRegion: HttpRegion, context: HttpOutputContext): HttpOutputResult | false;
}


/**
 * Extension Api of httpbook
 */
export interface HttpBookApi{

  /**
   * register HttpOutputProvider, which gets called after every execution
   * @param obj HttpOutputProvider to register
   */
  registerHttpOutputProvider(obj: HttpOutputProvider): void;
}
