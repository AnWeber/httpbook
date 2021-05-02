import * as Httpyac from 'httpyac';
import * as vscode from 'vscode';
import { MimeOutputProvider } from '../models/mimeOutputProvider';
import { HttpOutputRendererMimes } from '../config';

export class MarkdownTestResultsMimeOutputProvider implements MimeOutputProvider {
  constructor(private readonly httpyac: typeof Httpyac) { }

  getNotebookCellOutputItem(mime: string, httpRegion: Httpyac.HttpRegion): vscode.NotebookCellOutputItem | false {
    if (mime === HttpOutputRendererMimes.testresultsMarkdown && httpRegion.response) {

      // TODO fix httpyac
      return new vscode.NotebookCellOutputItem('text/markdown',
        this.httpyac.utils.toMarkdown(httpRegion.response, {
          responseBody: true,
          requestBody: true,
          prettyPrint: true,
          meta: true,
          testResults: httpRegion.testResults,
          timings: true,
        }));
    }
    return false;
  }
}
