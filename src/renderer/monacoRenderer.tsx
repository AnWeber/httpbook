import { ActivationFunction, CellInfo } from 'vscode-notebook-renderer';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { h, render } from 'preact';
import { MonacoEditor } from './components/monacoEditor';


export const activate: ActivationFunction = () => ({
  renderCell(_id, cell: CellInfo) {
    if (typeof cell.value === 'string') {
      let colorThemeKind = 1;
      if (isColorThemeKind(cell.metadata)) {
        colorThemeKind = cell.metadata.colorThemeKind;
      }
      render(<MonacoEditor value={cell.value} mimeType={cell.mime} colorThemeKind={colorThemeKind} />, cell.element);
    }
  },
});

function isColorThemeKind(metadata: unknown): metadata is { colorThemeKind: number } {
  const obj = metadata as Record<string, number>;
  return !!obj && !!obj.colorThemeKind;
}
