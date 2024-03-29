import { ActivationFunction, OutputItem } from 'vscode-notebook-renderer';
import { h, render } from 'preact';
import { TestResults } from './components/testResults';

export const activate: ActivationFunction = () => ({
  renderOutputItem(outputItem: OutputItem, element: HTMLElement) {
    render(<TestResults testResults={outputItem.json()} />, element);
  },
});
