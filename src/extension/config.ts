import * as vscode from 'vscode';

export const APP_NAME = 'httpbook';

export enum TestSlotOutput {
  always = 'always',
  onlyFailed = 'onlyFailed',
  never = 'never',
}

export enum Rfc7230Output {
  request_and_response = 'request_and_response',
  request_header_and_response = 'request_header_and_response',
  response = 'response',
  only_header = 'only_header',
  only_response_header = 'only_response_header',
}

export interface AppConfig {
  outputTests?: TestSlotOutput;
  outputAllResponses?: boolean;
  outputRfc7230?: Rfc7230Output;
  useContentTypeAsNotebookOutputRendererMime?: boolean;
  mapContentTypeToNotebookOutputRendererMime?: Record<string, string | Array<string>>;
  preferNotebookOutputRenderer?: Record<string, string>;
  saveWithOutputs?: boolean;
}

export function getConfigSetting(): AppConfig {
  return vscode.workspace.getConfiguration(APP_NAME) as AppConfig;
}

export type ConfigWatcher = (appConfig: AppConfig, ...config: Array<Record<string, unknown>>) => void;

export function watchConfigSettings(watcher: ConfigWatcher, ...sections: Array<string>): vscode.Disposable {
  const rootSections = [APP_NAME, ...sections];
  watcher(getConfigSetting(), ...sections.map(section => vscode.workspace.getConfiguration(section)));
  return vscode.workspace.onDidChangeConfiguration(changeEvent => {
    if (rootSections.some(section => changeEvent?.affectsConfiguration(section))) {
      watcher(getConfigSetting(), ...sections.map(section => vscode.workspace.getConfiguration(section)));
    }
  });
}
