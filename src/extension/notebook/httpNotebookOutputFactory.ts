import * as vscode from 'vscode';
import * as extensionApi from '../extensionApi';
import type * as Httpyac from 'httpyac';
import * as httpOutput from '../httpOutputProvider';

import { AppConfig, TestSlotOutput } from '../config';

export class HttpNotebookOutputFactory {
  readonly httpOutputProvider: Array<extensionApi.HttpOutputProvider>;
  constructor(
    private readonly config: AppConfig,
    private readonly httpyac: typeof Httpyac
  ) {
    this.httpOutputProvider = [
      new httpOutput.TestResultsMimeOutputProvider(),
      new httpOutput.BuiltInHttpOutputProvider(config, this.httpyac),
      new httpOutput.Rfc7230HttpOutputProvider(config, this.httpyac),
      new httpOutput.ExtensionHttpOutputProvider(),
      new httpOutput.ImageHttpOutputProvider(),
      new httpOutput.ContentTypeHttpOutputProvider(config),
    ];
  }

  public async createHttpRegionOutputs(
    response: Httpyac.HttpResponse,
    testResults: Array<Httpyac.TestResult>,
    httpOutputContext: extensionApi.HttpOutputContext
  ): Promise<vscode.NotebookCellOutput[]> {
    const outputs: vscode.NotebookCellOutput[] = [];
    if (testResults.length > 0 && this.canShowTestResults(testResults)) {
      const outputItems = await this.mapHttpOutputProvider(obj =>
        obj.getTestResultOutputResult?.(testResults, httpOutputContext)
      );
      if (outputItems.length > 0) {
        outputs.push(this.createNotebookCellOutput(outputItems, response?.contentType?.mimeType));
      }
    }
    if (response) {
      const outputItems = await this.mapHttpOutputProvider(obj =>
        obj.getResponseOutputResult?.(response, httpOutputContext)
      );
      if (outputItems.length > 0) {
        const output = this.createNotebookCellOutput(outputItems, response.contentType?.mimeType);

        output.metadata = {
          source: this.httpyac.utils.toMultiLineString(this.httpyac.utils.toHttpStringResponse(response)).trim(),
        };
        outputs.push(output);
      }
    }
    return outputs;
  }

  private canShowTestResults(testResults: Array<Httpyac.TestResult> | undefined) {
    if (testResults && this.config.outputTests !== TestSlotOutput.never) {
      if (this.config.outputTests === TestSlotOutput.onlyFailed) {
        return testResults.some(t =>
          [this.httpyac.TestResultStatus.ERROR, this.httpyac.TestResultStatus.FAILED].includes(t.status)
        );
      }
      return true;
    }
    return false;
  }

  private async mapHttpOutputProvider(
    mapFunc: (obj: extensionApi.HttpOutputProvider) => extensionApi.HttpOutputReturn | undefined
  ) {
    const result: Array<extensionApi.HttpOutputResult> = [];

    for (const httpOutputProvider of this.httpOutputProvider) {
      try {
        let obj = mapFunc(httpOutputProvider);
        if (obj) {
          if (this.httpyac.utils.isPromise(obj)) {
            obj = await obj;
          }
          if (obj) {
            result.push(obj);
          }
        }
      } catch (err) {
        this.httpyac.io.log.error(httpOutputProvider.id, err);
      }
    }
    return result;
  }

  private createNotebookCellOutput(outputItems: Array<extensionApi.HttpOutputResult>, mimeType?: string) {
    const preferredMime = this.getPreferredNotebookOutputRendererMime(mimeType);

    const items = outputItems
      .sort((obj1, obj2) => this.compareHttpOutputResults(obj1, obj2, preferredMime))
      .reduce((prev: Array<vscode.NotebookCellOutputItem>, current) => {
        if (Array.isArray(current.outputItems)) {
          prev.push(...current.outputItems);
        } else {
          prev.push(current.outputItems);
        }
        return prev;
      }, [])
      .filter((obj, index, self) => self.indexOf(obj) === index);

    return new vscode.NotebookCellOutput(items);
  }

  private getPreferredNotebookOutputRendererMime(mimeType?: string) {
    if (mimeType && this.config.preferNotebookOutputRenderer) {
      for (const [regex, mime] of Object.entries(this.config.preferNotebookOutputRenderer)) {
        const regexp = new RegExp(regex, 'ui');
        if (regexp.test(mimeType)) {
          return mime;
        }
      }
    }
    return '';
  }

  private compareHttpOutputResults(
    obj1: extensionApi.HttpOutputResult,
    obj2: extensionApi.HttpOutputResult,
    mime?: string
  ) {
    if (mime) {
      if (this.hasHttpOutputResultsMime(obj1, mime)) {
        return -1;
      }
      if (this.hasHttpOutputResultsMime(obj2, mime)) {
        return 1;
      }
    }
    return obj2.priority - obj1.priority;
  }

  private hasHttpOutputResultsMime(obj: extensionApi.HttpOutputResult, mime?: string): boolean {
    if (Array.isArray(obj.outputItems)) {
      return obj.outputItems.some(obj => obj.mime === mime);
    }
    return obj.outputItems.mime === mime;
  }
}
