import { ActivationFunction, CellInfo } from 'vscode-notebook-renderer';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { h, render } from 'preact';
import { TestResults } from './components/testResults';


export const activate: ActivationFunction = () => ({
  renderCell(_id, cell: CellInfo) {
    if (typeof cell.value === 'string') {
      render(<TestResults testResults={JSON.parse(cell.value)} />, cell.element);
    }
  },
});
