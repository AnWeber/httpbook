## 0.24.0 (2021-06-30)

#### Features
* add new meta data @noRejectUnauthorized, to disable ssl verification
* add better json schema support in settings and file .httpyac.json
* improve error for SSL Validation error
* add completion for new meta data

#### Fix
* use args to always open/save correct cell response

## 0.23.0 (2021-06-24)

#### Features
* support cancellation of execution

## 0.22.0 (2021-06-21)

#### Fix
* monaco editor supporty application/xml

## 0.21.0 (2021-06-20)

#### Fix
* outputs are saved correctly
* monaco editor is only used if not empty body

## 0.20.0 (2021-06-20)

#### Features
* update monaco-editor
* remove enable proposed api
* saving outputs can be disabled

## 0.19.0 (2021-06-11)

#### Features
* update monaco-editor

## 0.18.0 (2021-06-05)

#### Features
* search notebookRenderer supporting mimeType

## 0.17.0 (2021-06-05)

#### Features
* update to new notebook api

## 0.16.0 (2021-05-30)

#### Features
* change to new createNotebookCellExecution
* response output is saved (is still in development)
#### Fix
* fix support of  file references as request body

## 0.15.0 (2021-05-26)

#### Features
* change to new notebookRender contribution
* remove onDidReceiveMessage, because of changing api

## 0.14.0 (2021-05-24)

#### Features
* update to new vscode renderer api
* remove use of --vscode- CSS Variables

## 0.13.2 (2021-05-17)

#### Fix
* removed direct access of httpyac

## 0.13.1 (2021-05-17)

#### Fix
* use only type import for httpyac
## 0.13.0 (2021-05-16)

#### Features
* use new NotebookRenderer Api
* Monaco Editor as default Editor
* use ContentType of Response as Output

#### Fix
* testResults output is working again

## 0.12.0 (2021-05-16)

#### Features
* add cell status items (save, show, toggle env, active sessions, remove cookies)

#### Fix

* fixed codelens integration of vscode-httpyac
* fixed environment per file and not per cell
* changing global scripts/ variables are used without file reload
* ref to other response are not called on every request

## 0.11.0 (2021-05-14)

#### Features
* output header in grid
* setting to disable builtin NotebookOutputRenderer
* catch error in httpOutputProvider
* allow save without explicit region delimiter

## 0.10.0 (2021-05-13)

#### Features
* redesign of extension api
* updated to current notebook api
* support virtual workspaces

## 0.9.0 (2021-05-09)

#### Features
* extension api supports onDidReceiveMessage function
* RFC7230 NotebookOutputRenderer supports disabling highlight.js (better Performance on large files)
* RF7230 NotebookOutputRenderer supports pretty print of JSON

#### Fix
* builtin application/json NotebookOutputRenderer not working on content-type application/hal+json
* enableProposedApi true in marketplace release
## 0.8.0 (2021-05-08)

#### Features
* better highlight support by using mimetype

#### Fix
* error in env support

## 0.7.0 (2021-05-07)

#### Features
* color contribution
* support markdown cells

#### Fix
* create empty new files supported

## 0.5.0 (2021-05-06)

#### Features
* custom renderer added
* support for RFC7230 output
* highlight.js added
* extension api refactored
* better settings support

## 0.1.0 (2021-05-03)

#### Features
* initial release
* support sending requests and view in built-in code cells
