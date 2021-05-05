import { render } from './render';
import errorOverlay from 'vscode-notebook-error-overlay';
import { NotebookOutputEventParams } from 'vscode-notebook-renderer';

// eslint-disable-next-line no-underscore-dangle
declare let __webpack_relative_entrypoint_to_root__: string;
declare const scriptUrl: string;

__webpack_public_path__ = new URL(scriptUrl.replace(/[^/]+$/u, '') + __webpack_relative_entrypoint_to_root__).toString();


const notebookApi = acquireNotebookRendererApi('httpbook');

// Track cells that we render so that, in development, we can re-render then
// when the scripts change.
const rendered = new Map<string, NotebookOutputEventParams>();

// You can listen to an event that will fire right before cells unmount if
// you need to do teardown:
notebookApi.onWillDestroyOutput(evt => {
  if (evt) {
    rendered.delete(evt.outputId);
  } else {
    rendered.clear();
  }
});

notebookApi.onDidCreateOutput(evt => {
  rendered.set(evt.outputId, evt);
  renderTag(evt);
});

// Function to render your contents in a single tag, calls the `render()`
// function from render.ts. Also catches and displays any thrown errors.
const renderTag = ({ element, mime, value }: NotebookOutputEventParams) =>
  errorOverlay.wrap(element, () => {
    element.innerHTML = '';
    const node = document.createElement('div');
    element.appendChild(node);

    render({ container: node, mimeType: mime, data: value, notebookApi });
  });

function renderAllTags() {
  for (const evt of rendered.values()) {
    renderTag(evt);
  }
}

renderAllTags();

// When the module is hot-reloaded, rerender all tags. Webpack will update
// update the `render` function we imported, so we just need to call it again.
if (module.hot) {

  // note: using `module.hot?.accept` breaks HMR in Webpack 4--they parse
  // for specific syntax in the module.
  module.hot.accept(['./render'], renderAllTags);
}
