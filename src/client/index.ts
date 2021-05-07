import { renderCell } from './render';
import errorOverlay from 'vscode-notebook-error-overlay';
import { NotebookOutputEventParams } from 'vscode-notebook-renderer';

// eslint-disable-next-line no-underscore-dangle
declare let __webpack_relative_entrypoint_to_root__: string;
declare const scriptUrl: string;

__webpack_public_path__ = new URL(scriptUrl.replace(/[^/]+$/u, '') + __webpack_relative_entrypoint_to_root__).toString();


const notebookApi = acquireNotebookRendererApi();

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


const renderTag = (event: NotebookOutputEventParams) =>
  errorOverlay.wrap(event.element, () => {
    event.element.innerHTML = '';
    const node = document.createElement('div');
    event.element.appendChild(node);

    renderCell({
      container: node,
      mimeType: event.mime,
      data: event.value,
      metaData: event.metadata,
      notebookApi
    });
  });

function renderAllTags() {
  for (const evt of rendered.values()) {
    renderTag(evt);
  }
}

renderAllTags();
if (module.hot) {
  module.hot.accept(['./render'], renderAllTags);
}
