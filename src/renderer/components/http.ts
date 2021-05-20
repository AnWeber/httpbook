export const conf = {
  comments: {
    lineComment: '#',
    blockComment: ['/*', '*/']
  },
  brackets: [
    ['{', '}'],
    ['[', ']'],
    ['(', ')']
  ],
  autoClosingPairs: [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '(', close: ')' },
    { open: '"', close: '"' },
    { open: "'", close: "'" }
  ],
  surroundingPairs: [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '(', close: ')' },
    { open: '"', close: '"' },
    { open: "'", close: "'" }
  ],
  folding: {
    markers: {
      start: /^\s*(?<method>GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS|CONNECT|TRACE|PROPFIND|PROPPATCH|MKCOL|COPY|MOVE|LOCK|UNLOCK|CHECKOUT|CHECKIN|REPORT|MERGE|MKACTIVITY|MKWORKSPACE|VERSION-CONTROL|BASELINE-CONTROL)\s*(?<url>.+?)(\s+HTTP\/(?<version>(\S+)))?$/u,
      end: /^\s*((#{3,}.*?)|((GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS|CONNECT|TRACE|PROPFIND|PROPPATCH|MKCOL|COPY|MOVE|LOCK|UNLOCK|CHECKOUT|CHECKIN|REPORT|MERGE|MKACTIVITY|MKWORKSPACE|VERSION-CONTROL|BASELINE-CONTROL)\s+.*))\s*/u
    },
    script: {
      'start': /^\s*(({{)|(>\s{1}{%)).*$/u,
      'end': /^\s*((}})|(*%}))\s*$/u
    }
  }
};
export const language = {
  defaultToken: '',
  tokenPostfix: '.http',
  tokenizer: {
    comment: [
      [/[^/*]+/u, 'comment'],
      [/\*\//u, 'comment', '@pop'],
      [/[/*]/u, 'comment']
    ],
    httpHeaders: [/^([\w-]+)\s*(:)\s*(.*?)\s*$/u, 'string', 'keyword', 'string'],
    requestLine: [/^\s*(?<method>GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS|CONNECT|TRACE|PROPFIND|PROPPATCH|MKCOL|COPY|MOVE|LOCK|UNLOCK|CHECKOUT|CHECKIN|REPORT|MERGE|MKACTIVITY|MKWORKSPACE|VERSION-CONTROL|BASELINE-CONTROL)\s*(?<url>.+?)(\s+HTTP\/(?<version>(\S+)))?$/u, 'keyword', 'string', 'string']

  }
};
