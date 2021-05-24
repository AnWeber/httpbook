import { ActivationFunction, CellInfo } from 'vscode-notebook-renderer';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { h, render } from 'preact';
import { MonacoEditor, MonacoEditorMetaData } from './components/monacoEditor';


export const activate: ActivationFunction = () => ({
  renderCell(_id, cell: CellInfo) {
    let metaData: MonacoEditorMetaData = {
      colorThemeKind: 1,
      editorOptions: {}
    };
    if (isColorThemeKind(cell.metadata)) {
      metaData = cell.metadata;
    }
    render(<MonacoEditor value={cell.text()} mimeType={cell.mime} metaData={metaData} />, cell.element);
  },
});


function isColorThemeKind(metadata: unknown): metadata is MonacoEditorMetaData {
  const obj = metadata as Record<string, number>;
  return !!obj && !!obj.colorThemeKind;
}
