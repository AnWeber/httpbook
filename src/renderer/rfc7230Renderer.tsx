import { ActivationFunction, OutputItem } from 'vscode-notebook-renderer';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { h, render } from 'preact';
import { RFC7230Response } from './components/rfc7230';

export const activate: ActivationFunction = () => ({
  renderOutputItem(outputItem: OutputItem, element: HTMLElement) {
    render(<RFC7230Response response={outputItem.json()} />, element);
  },
});
