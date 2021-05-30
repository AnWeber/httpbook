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
      new httpOutput.TestResultsMimeOutpoutProvider(),
      new httpOutput.MonacoEditorHttpOutputProvider(config, this.httpyac),
      new httpOutput.Rfc7230HttpOutpoutProvider(config, this.httpyac),
      new httpOutput.ImageHttpOutputProvider(),
      new httpOutput.ContentTypeHttpOutputProvider(config),
    ];
  }


  public createHttpRegionOutputs(httpRegion: Httpyac.HttpRegion, httpOutputContext: extensionApi.HttpOutputContext): vscode.NotebookCellOutput[] {
    const outputs: vscode.NotebookCellOutput[] = [];
    if (httpRegion.testResults && this.canShowTestResults(httpRegion.testResults)) {
      const testResults = httpRegion.testResults;
      const outputItems = this.mapHttpOutputProvider(
        obj => !!obj.getTestResultOutputResult && obj.getTestResultOutputResult(testResults, httpOutputContext)
      );
      if (outputItems.length > 0) {
        outputs.push(this.createNotebookCellOutput(outputItems, httpRegion.response?.contentType?.mimeType));
      }
    }
    if (httpRegion.response) {
      const response = httpRegion.response;
      const outputItems = this.mapHttpOutputProvider(
        obj => !!obj.getResponseOutputResult && obj.getResponseOutputResult(response, httpOutputContext)
      );
      if (outputItems.length > 0) {
        const output = this.createNotebookCellOutput(outputItems, response.contentType?.mimeType);

        // TODO add fix to httpyac lib
        delete response.headers[':status'];
        output.metadata = {
          source: this.httpyac.utils.toMultiLineString(this.httpyac.utils.toHttpStringResponse(response)),
        };
        outputs.push(output);
      }
    }
    return outputs;
  }

  private canShowTestResults(testResults: Array<Httpyac.TestResult> | undefined) {
    if (testResults && this.config.outputTests !== TestSlotOutput.never) {
      if (this.config.outputTests === TestSlotOutput.onlyFailed) {
        return testResults.some(obj => !obj.result);
      }
      return true;
    }
    return false;
  }

  private mapHttpOutputProvider(mapFunc: (obj: extensionApi.HttpOutputProvider) => (extensionApi.HttpOutputResult | false)) {
    const result: Array<extensionApi.HttpOutputResult> = [];

    for (const httpOutputProvider of this.httpOutputProvider) {
      try {
        const obj = mapFunc(httpOutputProvider);
        if (obj) {
          result.push(obj);
        }
      } catch (err) {
        this.httpyac.log.error(httpOutputProvider.id, err);
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

  private compareHttpOutputResults(obj1: extensionApi.HttpOutputResult, obj2: extensionApi.HttpOutputResult, mime?: string) {
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

  private hasHttpOutputResultsMime(obj: extensionApi.HttpOutputResult, mime?: string) : boolean {
    if (Array.isArray(obj.outputItems)) {
      return obj.outputItems.some(obj => obj.mime === mime);
    }
    return obj.outputItems.mime === mime;
  }
}
