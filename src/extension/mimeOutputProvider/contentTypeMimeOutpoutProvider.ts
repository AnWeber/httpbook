import * as Httpyac from 'httpyac';
import * as vscode from 'vscode';
import { MimeOutputProvider } from '../models/mimeOutputProvider';
import { HttpOutputRendererMimes } from '../config';

export class ContentTypeMimeOutputProvider implements MimeOutputProvider {


  getNotebookCellOutputItem(mime: string, httpRegion: Httpyac.HttpRegion): vscode.NotebookCellOutputItem | false {
    if (mime === HttpOutputRendererMimes.contenttype && httpRegion.response?.contentType) {
      return new vscode.NotebookCellOutputItem(
        httpRegion.response.contentType.mimeType,
        httpRegion.response.parsedBody || httpRegion.response.body,
        {
          response: httpRegion.response,
          testResults: httpRegion.testResults,
        }
      );
    }
    return false;
  }
}
