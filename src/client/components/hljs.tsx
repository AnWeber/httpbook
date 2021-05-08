// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { h, FunctionComponent } from 'preact';
import { registerLanguage, highlight, highlightAuto } from 'highlight.js/lib/core';
import style from './hljs.css';


import css from 'highlight.js/lib/languages/css';
import javascript from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import markdown from 'highlight.js/lib/languages/markdown';
import plaintext from 'highlight.js/lib/languages/plaintext';
import xml from 'highlight.js/lib/languages/xml';
import yaml from 'highlight.js/lib/languages/yaml';

registerLanguage('css', css);
registerLanguage('javascript', javascript);
registerLanguage('json', json);
registerLanguage('markdown', markdown);
registerLanguage('plaintext', plaintext);
registerLanguage('xml', xml);
registerLanguage('yaml', yaml);

export const BodyOutput: FunctionComponent<{ body: unknown, rawBody?: string, mimeType?: string }> = ({ body, rawBody, mimeType }) => {
  if (mimeType
    && rawBody
    && ['image/png', 'image/jpeg'].indexOf(mimeType) >= 0) {
    return <Image rawBody={rawBody} mimeType={mimeType}/>;
  }
  return <Hljs body={body} mimeType={mimeType}/>;
};


export const Hljs: FunctionComponent<{ body: unknown, mimeType?: string }> = ({ body, mimeType }) => {

  let language: string | undefined;
  if (mimeType) {
    if (/^(application|text)\/(.*\+|x-amz-)?json.*/u.test(mimeType)) {
      language = 'json';
    } else if (/^(application|text)\/(.*\+)?xml.*/u.test(mimeType)) {
      language = 'xml';
    } else if (/^(application|text)\/(.*\+|.*-)?yaml.*/u.test(mimeType)) {
      language = 'yaml';
    } else if (/^(application|text)\/(.*\+|.*-)?javascript.*/u.test(mimeType)) {
      language = 'javascript';
    } else if (mimeType === 'text/css') {
      language = 'css';
    } else if (mimeType === 'text/markdown') {
      language = 'markdown';
    } else if (mimeType === 'application/x-latex') {
      language = 'latex';
    }
  }

  let html: string | undefined;
  if (language) {
    html = highlight(`${body}`, { language }).value;
  } else {
    html = highlightAuto(`${body}`).value;
  }
  return <pre><code className={style.code} dangerouslySetInnerHTML={{ __html: html }}></code></pre>;
};


export const Image: FunctionComponent<{ rawBody: string, mimeType: string }> = ({ rawBody, mimeType }) => <img src={`data:${mimeType};base64,${rawBody}`}></img>;
