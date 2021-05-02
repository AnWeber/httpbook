import { HttpRegion } from 'httpyac';
import * as vscode from 'vscode';

export interface MimeOutputProvider{
  getNotebookCellOutputItem(mime: string, httpRegion: HttpRegion) : vscode.NotebookCellOutputItem | false;
}
