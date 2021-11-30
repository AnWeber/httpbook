## 2.2.1 (2021-11-30)

#### Fix

- no blank cells after save (#36)
- environments selection button is not empty (#30)

## 2.2.0 (2021-10-30)

#### Features

- log Stream in notebook output

## 2.1.1 (2021-10-25)

#### Fix

- fix parsing error if other httpBook is open and active (#33)

## 2.1.0 (2021-10-24)

#### Features

- add [WebSocket](https://httpyac.github.io/guide/request.html#websocket) support
- add [MQTT](https://httpyac.github.io/guide/request.html#mqtt) support
- add [Server-Sent Events](https://httpyac.github.io/guide/request.html#server-sent-events-eventsource) support
- HTTP header array support added
- added oauthSession2 Variable to directly access OAuth2 Token
- add additional Meta Data
  - `@verbose` to increase log level to `trace`
  - `@debug` to increase log level to `debug`
  - `@keepStreaming` of MQTT, Server-Sent-Events or WebSocket until the session is ended manually
  - `@sleep` supports variables
  - documentation of meta data added to outline view
- better auto completion support
- added more snippets for MQTT, WebSocket and Server-Sent Events

#### Fix

- response body is logged to output channel

## 2.0.1 (2021-09-24)

#### Fix

- show intermediate results directly with gRPC and not only at the end of the stream
- remove svg-sprite-loader to get rid of security warning

## 2.0.0 (2021-09-22)

#### Features

- [gRPC Request support](https://httpyac.github.io/guide/request.html#grpc)
  - Unary RPC
  - Server Streaming
  - Client Streaming
  - Bi-Directional Streaming
- add history view to explorer activity bar (visible when history entries exists)
- add meta option sleep (wait x milliseconds before request)
- Basic Authentication with Whitespace in username or password (`Basic {{username}}:{{password}}`)
- register script task for event hooks (streaming, request, response, after)

#### Fix

- input and quickpick variable replacer fixed
- transientOutputs is set according to saveWithOutputs (#31)

## 1.2.0 (2021-8-09)

#### Features

- support httpYac v3.0.0
  - [httpyac plugin support](https://httpyac.github.io/plugins/#getting-started)
  - [hook api support](https://httpyac.github.io/guide/hooks.html#project-local-hooks)
  - [better documentation](https://httpyac.github.io/guide)
  - [new location for examples](https://github.com/httpyac/httpyac.github.io/tree/main/examples)
  - add requireUncached to script context to clear NodeJS Caching

## 1.1.0 (2021-07-30)

#### Features

- prefer built-in renderer (see #27, #29)
- remove monaco editor renderer in separate extension (https://marketplace.visualstudio.com/items?itemName=anweber.httpbook-monacorenderer)

## 1.0.0 (2021-07-09)

#### Features

- update to new extension api of [vscode-httpyac](https://github.com/AnWeber/vscode-httpyac/releases/tag/2.20.0)
- update monaco editor

## 0.26.0 (2021-07-09)

#### Features

- workaround for missing default mime renderer (microsoft/vscode#125876)

## 0.25.0 (2021-07-03)

#### Fix

- NotebookCellStatusBarItem does not support vscode.uri as argument (microsoft/vscode#124529)

## 0.24.0 (2021-06-30)

#### Features

- add new meta data @noRejectUnauthorized, to disable ssl verification
- add better json schema support in settings and file .httpyac.json
- improve error for SSL Validation error
- add completion for new meta data

#### Fix

- use args to always open/save correct cell response

## 0.23.0 (2021-06-24)

#### Features

- support cancellation of execution

## 0.22.0 (2021-06-21)

#### Fix

- monaco editor supporty application/xml

## 0.21.0 (2021-06-20)

#### Fix

- outputs are saved correctly
- monaco editor is only used if not empty body

## 0.20.0 (2021-06-20)

#### Features

- update monaco-editor
- remove enable proposed api
- saving outputs can be disabled

## 0.19.0 (2021-06-11)

#### Features

- update monaco-editor

## 0.18.0 (2021-06-05)

#### Features

- search notebookRenderer supporting mimeType

## 0.17.0 (2021-06-05)

#### Features

- update to new notebook api

## 0.16.0 (2021-05-30)

#### Features

- change to new createNotebookCellExecution
- response output is saved (is still in development)

#### Fix

- fix support of file references as request body

## 0.15.0 (2021-05-26)

#### Features

- change to new notebookRender contribution
- remove onDidReceiveMessage, because of changing api

## 0.14.0 (2021-05-24)

#### Features

- update to new vscode renderer api
- remove use of --vscode- CSS Variables

## 0.13.2 (2021-05-17)

#### Fix

- removed direct access of httpyac

## 0.13.1 (2021-05-17)

#### Fix

- use only type import for httpyac

## 0.13.0 (2021-05-16)

#### Features

- use new NotebookRenderer Api
- Monaco Editor as default Editor
- use ContentType of Response as Output

#### Fix

- testResults output is working again

## 0.12.0 (2021-05-16)

#### Features

- add cell status items (save, show, toggle env, active sessions, remove cookies)

#### Fix

- fixed codelens integration of vscode-httpyac
- fixed environment per file and not per cell
- changing global scripts/ variables are used without file reload
- ref to other response are not called on every request

## 0.11.0 (2021-05-14)

#### Features

- output header in grid
- setting to disable builtin NotebookOutputRenderer
- catch error in httpOutputProvider
- allow save without explicit region delimiter

## 0.10.0 (2021-05-13)

#### Features

- redesign of extension api
- updated to current notebook api
- support virtual workspaces

## 0.9.0 (2021-05-09)

#### Features

- extension api supports onDidReceiveMessage function
- RFC7230 NotebookOutputRenderer supports disabling highlight.js (better Performance on large files)
- RF7230 NotebookOutputRenderer supports pretty print of JSON

#### Fix

- builtin application/json NotebookOutputRenderer not working on content-type application/hal+json
- enableProposedApi true in marketplace release

## 0.8.0 (2021-05-08)

#### Features

- better highlight support by using mimetype

#### Fix

- error in env support

## 0.7.0 (2021-05-07)

#### Features

- color contribution
- support markdown cells

#### Fix

- create empty new files supported

## 0.5.0 (2021-05-06)

#### Features

- custom renderer added
- support for RFC7230 output
- highlight.js added
- extension api refactored
- better settings support

## 0.1.0 (2021-05-03)

#### Features

- initial release
- support sending requests and view in built-in code cells
