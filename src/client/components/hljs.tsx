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
import type { ContentType } from 'httpyac';

registerLanguage('css', css);
registerLanguage('javascript', javascript);
registerLanguage('json', json);
registerLanguage('markdown', markdown);
registerLanguage('plaintext', plaintext);
registerLanguage('xml', xml);
registerLanguage('yaml', yaml);

export interface HljsBody{
  body: unknown,
  parsedBody?: unknown,
  contentType?: ContentType,
}

export interface HljsMetaData{
  rawBody?: string,
  useHighlightJSInOutput?: boolean,
  prettyPrintInOutput?: boolean,
}
export const BodyOutput: FunctionComponent<{ hljsOutput: HljsBody, metaData: HljsMetaData}> = ({ hljsOutput, metaData }) => {
  if (hljsOutput.contentType?.mimeType
    && metaData.rawBody
    && ['image/png', 'image/jpeg'].indexOf(hljsOutput.contentType.mimeType) >= 0) {
    return <Image rawBody={metaData.rawBody} mimeType={hljsOutput.contentType.mimeType}/>;
  }
  return <Hljs hljsOutput={hljsOutput} metaData={metaData}/>;
};


export const Hljs: FunctionComponent<{ hljsOutput: HljsBody, metaData: HljsMetaData }> = ({ hljsOutput, metaData }) => {
  let html = `${hljsOutput.body}`;

  if (hljsOutput.contentType?.mimeType
    && /^(application|text)\/(.*\+|x-amz-)?json.*/u.test(hljsOutput.contentType.mimeType)
    && hljsOutput.parsedBody
    && metaData.prettyPrintInOutput) {
    html = JSON.stringify(hljsOutput.parsedBody, null, 2);
  }

  if (metaData.useHighlightJSInOutput) {
    const language: string | undefined = getHighlightJsLanguage(hljsOutput);
    if (language) {
      html = highlight(`${html}`, { language }).value;
    } else {
      html = highlightAuto(`${html}`).value;
    }
  }
  return <pre><code className={style.code} dangerouslySetInnerHTML={{ __html: html }}></code></pre>;
};


export const Image: FunctionComponent<{ rawBody: string, mimeType: string }> = ({ rawBody, mimeType }) => <img src={`data:${mimeType};base64,${rawBody}`}></img>;


function getHighlightJsLanguage(hljsOutput: HljsBody) {
  let language: string | undefined;
  if (hljsOutput.contentType?.mimeType) {
    if (/^(application|text)\/(.*\+|x-amz-)?json.*/u.test(hljsOutput.contentType.mimeType)) {
      language = 'json';
    } else if (/^(application|text)\/(.*\+)?xml.*/u.test(hljsOutput.contentType.mimeType)) {
      language = 'xml';
    } else if (/^(application|text)\/(.*\+|.*-)?yaml.*/u.test(hljsOutput.contentType.mimeType)) {
      language = 'yaml';
    } else if (/^(application|text)\/(.*\+|.*-)?javascript.*/u.test(hljsOutput.contentType.mimeType)) {
      language = 'javascript';
    } else if (hljsOutput.contentType.mimeType === 'text/css') {
      language = 'css';
    } else if (hljsOutput.contentType.mimeType === 'text/markdown') {
      language = 'markdown';
    } else if (hljsOutput.contentType.mimeType === 'application/x-latex') {
      language = 'latex';
    }
  }
  return language;
}
