import { NotebookCellOutputItem } from 'vscode';
import type { HttpResponse, TestResult } from 'httpyac';
export interface HttpOutputContext{

  mimeType?: string;

  metaData: Record<string, string>;

  [key: string]: unknown;
}


export interface HttpOutputResult {

  /**
   * NotebookCellOutputItem or Array of NotebookCellOutputItem
   */
  outputItems: NotebookCellOutputItem | Array<NotebookCellOutputItem>;

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
   * create NotebookCellOutputItems with view priority for response
   * @param httpRegion processed httpregion with Response, Request und TestResults
   * @param context HttpOutputContext
   * @returns false if output not valid else NotebookCellOutputItems and priortiy
   */
  getResponseOutputResult?(response: HttpResponse, context: HttpOutputContext): HttpOutputResult | false;

  /**
   * create NotebookCellOutputItems with view priority for testResults
   * @param httpRegion processed httpregion with Response, Request und TestResults
   * @param context HttpOutputContext
   * @returns false if output not valid else NotebookCellOutputItems and priortiy
   */
   getTestResultOutputResult?(testResult: TestResult[], context: HttpOutputContext): HttpOutputResult | false;
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
