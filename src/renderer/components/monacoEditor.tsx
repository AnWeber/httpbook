// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { h, Component } from 'preact';
import type { editor } from 'monaco-editor';
import './monacoEditor.css';

export interface MonacoEditorProps{
  value: string,
  mimeType: string,
}

export class MonacoEditor extends Component<MonacoEditorProps,
  { editor: editor.IStandaloneCodeEditor }> {
  private ref: HTMLElement | null = null;
  async componentDidMount(): Promise<void> {
    if (this.ref) {

      const { editor } = await import(/* webpackChunkName: "monacoeditor" */ 'monaco-editor/esm/vs/editor/editor.api.js');


      if (document.body.className.indexOf('vscode-dark') >= 0) {
        editor.setTheme('vs-dark');
      } else if (document.body.className.indexOf('vscode-high-contrast') >= 0) {
        editor.setTheme('hc-black');
      } else {
        editor.setTheme('vs');
      }
      const computedStyle = getComputedStyle(this.ref);

      const monacoEditor = editor.create(
        this.ref,
        Object.assign(
          {
            fontFamily: computedStyle.getPropertyValue('--theme-code-font-family'),
            fontSize: +computedStyle.getPropertyValue('--theme-code-font-size').replace('px', ''),
            fontWeight: computedStyle.getPropertyValue('--theme-code-font-weight'),
            language: this.getLanguageId(this.props.mimeType),
            minimap: {
              enabled: false
            },
          }
        )
      );

      const model = monacoEditor.getModel();
      if (model) {
        model.onDidChangeContent(() => {
          setTimeout(() => {
            monacoEditor.getAction('editor.action.formatDocument').run();
          }, 100);
        });
      }

      monacoEditor.setValue(this.props.value);

      this.state = {
        editor: monacoEditor
      };
    }

  }


  private getLanguageId(mimeType: string): string {
    if (/^(application|text)\/(.*\+|x-amz-)?json.*$/u.test(mimeType)) {
      return 'json';
    }
    if (['application/javascript', 'application/x-javascript'].indexOf(mimeType) >= 0) {
      return 'javascript';
    }
    if (['image/svg+xml', 'application/xhtml+xml', 'text/xml', 'application/xml'].indexOf(mimeType)) {
      return 'xml';
    }
    if (['text/html'].indexOf(mimeType) >= 0) {
      return 'html';
    }
    if (['text/css'].indexOf('text/css') >= 0) {
      return 'css';
    }
    if (mimeType === 'text/markdown') {
      return 'markdown';
    }
    return 'plaintext';
  }

  componentWillUnmount(): void {
    this.state.editor.dispose();
  }

  render(): h.JSX.Element {
    return (
      <section>
        <div class="editor" ref={ref => {
          this.ref = ref;
        }}>
        </div>
      </section>
    );
  }
}
