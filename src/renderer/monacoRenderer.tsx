import { ActivationFunction, OutputItem } from 'vscode-notebook-renderer';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { h, render } from 'preact';
import { MonacoEditor } from './components/monacoEditor';


export const activate: ActivationFunction = () => ({
  renderOutputItem(outputItem: OutputItem, element: HTMLElement) {
    render(<MonacoEditor value={outputItem.text()} mimeType={outputItem.mime} />, element);
  },
});
