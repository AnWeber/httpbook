import { ActivationFunction, CellInfo } from 'vscode-notebook-renderer';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { h, render } from 'preact';
import { RFC7230Response } from './components/rfc7230';


export const activate: ActivationFunction = () => ({
  renderCell(_id, cell: CellInfo) {
    if (typeof cell.value === 'string') {
      let image: string | undefined;
      if (hasImage(cell.metadata)) {
        image = cell.metadata.image;
      }
      render(<RFC7230Response response={JSON.parse(cell.value)} image={image}/>, cell.element);
    }
  },
});

function hasImage(metadata: unknown): metadata is { image: string } {
  const obj = metadata as Record<string, string>;
  return !!obj.image;
}
