import * as vscode from 'vscode';


export const APP_NAME = 'httpbook';

export enum HttpOutputRendererMimes{
  mime = 'x-application/httpbook-mime',
  contenttype = 'x-application/httpbook-contenttype',
  markdown = 'x-application/httpbook-markdown',
  rfc7230 = 'x-application/httpbook-rfc7230',
  testresults = 'x-application/httpbook-testresults',
  testresultsMarkdown = 'x-application/httpbook-testresults-markdown',
  error = 'application/x.notebook.error-traceback'
}

export interface OutputMimeConstraint {
  mime: string;
  supportedMimeTypes: Array<string>,
  json: boolean;
  xml: boolean;
}

export interface AppConfig {
  responseMimes?: Array<string | OutputMimeConstraint>,
  testMimes?: Array<string>,


  readonly [key: string]: unknown;
}


export function getConfigSetting() : AppConfig {
  return vscode.workspace.getConfiguration(APP_NAME);
}
