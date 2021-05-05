// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { h, FunctionComponent, Fragment } from 'preact';
import style from './testResults.css';
import { TestResult } from 'httpyac';
import PassSvg from 'vscode-codicons/src/icons/pass.svg';
import BugSvg from 'vscode-codicons/src/icons/bug.svg';
import { Icon } from '../components/icon';

export const TestResults: FunctionComponent<{
  testResults: Array<TestResult>;
}> = ({ testResults }) => (
  <div className={style.testResults}>
    <div className={style.testTitle}>
      <h4 className={style.testTitleCell}>
        <span>{testResults.filter(obj => obj.result).length}</span> Passing Tests
      </h4>
      <h4 className={style.testTitleCell}>
        <span className={ testResults.filter(obj => !obj.result).length > 0 ? style.testError : ''}>{testResults.filter(obj => !obj.result).length}</span> Failing Tests
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

  <article className={style.testLine}>
    <span className={testResult.result ? '' : style.testError}>
      {testResult.result
        ? <Icon svg={PassSvg}></Icon>
        : <Icon svg={BugSvg}></Icon>
      }
    </span>
    <div>
      <span>{testResult.message}</span>
      {
        testResult.error
        && <Fragment>
          <div>{testResult.error.displayMessage}</div>
          {
            testResult.error?.error?.stack && <pre><code className={style.testError}>{testResult.error.error.stack}</code></pre>
          }
        </Fragment>
      }
    </div>
  </article>
);
