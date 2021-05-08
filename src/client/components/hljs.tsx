// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { h, FunctionComponent } from 'preact';
import { registerLanguage, highlight, highlightAuto } from 'highlight.js/lib/core';
import style from './hljs.css';


import css from 'highlight.js/lib/languages/css';
import gml from 'highlight.js/lib/languages/gml';
import ini from 'highlight.js/lib/languages/ini';
import javascript from 'highlight.js/lib/languages/javascript';
import latex from 'highlight.js/lib/languages/latex';
import json from 'highlight.js/lib/languages/json';
import markdown from 'highlight.js/lib/languages/markdown';
import plaintext from 'highlight.js/lib/languages/plaintext';
import properties from 'highlight.js/lib/languages/properties';
import xml from 'highlight.js/lib/languages/xml';
import yaml from 'highlight.js/lib/languages/yaml';

registerLanguage('css', css);
registerLanguage('gml', gml);
registerLanguage('ini', ini);
registerLanguage('javascript', javascript);
registerLanguage('latex', latex);
registerLanguage('json', json);
registerLanguage('markdown', markdown);
registerLanguage('plaintext', plaintext);
registerLanguage('properties', properties);
registerLanguage('xml', xml);
registerLanguage('yaml', yaml);


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
