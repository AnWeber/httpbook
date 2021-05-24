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
