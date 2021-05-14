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
