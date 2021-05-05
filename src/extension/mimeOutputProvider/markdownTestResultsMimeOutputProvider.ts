import * as Httpyac from 'httpyac';
import * as vscode from 'vscode';
import { MimeOutputProvider } from '../models/mimeOutputProvider';
import { HttpOutputRendererMimes } from '../config';

export class MarkdownTestResultsMimeOutputProvider implements MimeOutputProvider {
  constructor(private readonly httpyac: typeof Httpyac) { }

  getNotebookCellOutputItem(mime: string, httpRegion: Httpyac.HttpRegion): vscode.NotebookCellOutputItem | false {
    if (mime === HttpOutputRendererMimes.testresultsMarkdown && httpRegion.testResults) {
      return new vscode.NotebookCellOutputItem('text/markdown',
        this.httpyac.utils.joinMarkdown(this.httpyac.utils.toMarkdownTestResults(httpRegion.testResults)));
    }
    return false;
  }
}
