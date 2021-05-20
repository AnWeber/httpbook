// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { h, Component } from 'preact';
import type { editor } from 'monaco-editor';
import './monacoEditor.css';

export class MonacoEditor extends Component<
  { value: string | Uint8Array, mimeType: string, colorThemeKind: number },
  { editor: editor.IStandaloneCodeEditor }> {
  private ref: HTMLElement | null = null;
  async componentDidMount(): Promise<void> {
    if (this.ref) {

      const { editor } = await import(/* webpackChunkName: "monacoeditor" */ 'monaco-editor/esm/vs/editor/editor.api.js');

      if (this.props.colorThemeKind === 2) {
        editor.setTheme('vs-dark');
      } else if (this.props.colorThemeKind === 3) {
        editor.setTheme('hc-black');
      } else {
        editor.setTheme('vs');
      }
      const monacoEditor = editor.create(this.ref, {
        value: `${this.props.value}`,
        language: this.getLanguageId(this.props.mimeType)
      });


      const formatAction = monacoEditor.getAction('editor.action.format');
      if (formatAction) {
        formatAction.run();
      }
      this.state = {
        editor: monacoEditor
      };
    }
  }

  private getLanguageId(mimeType: string): string {
    if (/^(application|json)\/(.*\+|x-amz-)?json.*$/u.test(mimeType)) {
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
