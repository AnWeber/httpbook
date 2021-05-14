import * as vscode from 'vscode';


export const APP_NAME = 'httpbook';


export enum TestSlotOutput{
  always = 'always',
  onlyFailed = 'onlyFailed',
  never = 'never',
}

export interface AppConfig {
  outputTests?: TestSlotOutput;
  useHighlightJSInOutput?: boolean,
  prettyPrintInOutput?: boolean,
  useBuiltInNotebookOutputRendererer?: boolean,
  useRFC7230NotebookOutputRendererer?: boolean,
  useHeaderNotebookOutputRenderer?: boolean,
  useResponseNotebookOutputRenderer?: boolean,
  useResponseBodyNotebookOutputRenderer?: boolean,
  useMarkdownNotebookOutputRenderer?: boolean;
  useContentTypeAsNotebookOutputRendererMime?: boolean;
  mapContentTypeToNotebookOutputRendererMime?: Record<string, string | Array<string>>;
  preferNotebookOutputRenderer?: Record<string, string>;
  saveWithEmptyFirstline?: boolean;
  saveWithRegionDelimiter?: boolean;
  readonly [key: string]: unknown;
}


export function getConfigSetting() : AppConfig {
  return vscode.workspace.getConfiguration(APP_NAME);
}

export type ConfigWatcher = (appConfig: AppConfig, ...config: Array<Record<string, unknown>>) => void

export function watchConfigSettings(watcher: ConfigWatcher, ...sections: Array<string>) : vscode.Disposable {
  const rootSections = [APP_NAME, ...sections];
  watcher(getConfigSetting(), ...sections.map(section => vscode.workspace.getConfiguration(section)));
  return vscode.workspace.onDidChangeConfiguration(changeEvent => {
    if (rootSections.some(section => changeEvent.affectsConfiguration(section))) {
      watcher(getConfigSetting(), ...sections.map(section => vscode.workspace.getConfiguration(section)));
    }
  });
}
