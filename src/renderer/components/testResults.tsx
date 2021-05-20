// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { h, FunctionComponent, Fragment } from 'preact';
import './testResults.css';
import type { TestResult } from 'httpyac';
import PassSvg from 'vscode-codicons/src/icons/pass.svg';
import BugSvg from 'vscode-codicons/src/icons/bug.svg';
import { Icon } from '../components/icon';

export const TestResults: FunctionComponent<{
  testResults: Array<TestResult>;
}> = ({ testResults }) => (
  <div class="testresults">
    <div class="testtitle">
      <h4 class="testtitle__cell">
        <span>{testResults.filter(obj => obj.result).length}</span> Passing Tests
      </h4>
      <h4 class="testtitle__cell">
        <span className={ testResults.filter(obj => !obj.result).length > 0 ? 'is_error' : ''}>{testResults.filter(obj => !obj.result).length}</span> Failing Tests
      </h4>
    </div>
    <section>
      {testResults.map((testResult, i) => (
        <TestResultLine testResult={testResult} key={i} />
      ))}
    </section>
  </div >
);


const TestResultLine: FunctionComponent<{ testResult: TestResult }> = ({ testResult }) => (

  <article class="testline">
    {testResult.result
      ? <Icon svg={PassSvg} class="is_success"></Icon>
      : <Icon svg={BugSvg} class="is_error"></Icon>
    }
    <div>
      <span>{testResult.message}</span>
      {
        testResult.error
        && <Fragment>
          <div>{testResult.error.displayMessage}</div>
          {
            testResult.error?.error?.stack && <pre><code class="testline__error">{testResult.error.error.stack}</code></pre>
          }
        </Fragment>
      }
    </div>
  </article>
);
