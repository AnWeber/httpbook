// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { h, FunctionComponent, Fragment } from 'preact';
import './testResults.css';
import type { TestResult } from 'httpyac';

export const TestResults: FunctionComponent<{
  testResults: Array<TestResult>;
}> = ({ testResults }) => (
  <div class="testresults">
    <div class="testtitle">
      <h4 class="testtitle__cell">
        <span>{testResults.filter(obj => obj.result).length}</span> Passing Tests
      </h4>
      <h4 class="testtitle__cell">
        <span className={testResults.filter(obj => !obj.result).length > 0 ? 'is_error' : ''}>
          {testResults.filter(obj => !obj.result).length}
        </span>{' '}
        Failing Tests
      </h4>
    </div>
    <section>
      {testResults.map((testResult, i) => (
        <TestResultLine testResult={testResult} key={i} />
      ))}
    </section>
  </div>
);

const TestResultLine: FunctionComponent<{ testResult: TestResult }> = ({ testResult }) => (
  <article className={testResult.result ? 'testline testline--success' : 'testline testline--error'}>
    {testResult.result ? (
      <svg class="testicon" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
        <path d="M6.27 10.87h.71l4.56-4.56-.71-.71-4.2 4.21-1.92-1.92L4 8.6l2.27 2.27z" />
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M8.6 1c1.6.1 3.1.9 4.2 2 1.3 1.4 2 3.1 2 5.1 0 1.6-.6 3.1-1.6 4.4-1 1.2-2.4 2.1-4 2.4-1.6.3-3.2.1-4.6-.7-1.4-.8-2.5-2-3.1-3.5C.9 9.2.8 7.5 1.3 6c.5-1.6 1.4-2.9 2.8-3.8C5.4 1.3 7 .9 8.6 1zm.5 12.9c1.3-.3 2.5-1 3.4-2.1.8-1.1 1.3-2.4 1.2-3.8 0-1.6-.6-3.2-1.7-4.3-1-1-2.2-1.6-3.6-1.7-1.3-.1-2.7.2-3.8 1-1.1.8-1.9 1.9-2.3 3.3-.4 1.3-.4 2.7.2 4 .6 1.3 1.5 2.3 2.7 3 1.2.7 2.6.9 3.9.6z"
        />
      </svg>
    ) : (
      <svg class="testicon" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M10.877 4.5v-.582a2.918 2.918 0 1 0-5.836 0V4.5h-.833L2.545 2.829l-.593.59 1.611 1.619-.019.049a8.03 8.03 0 0 0-.503 2.831c0 .196.007.39.02.58l.003.045H1v.836h2.169l.006.034c.172.941.504 1.802.954 2.531l.034.055L2.2 13.962l.592.592 1.871-1.872.058.066c.868.992 2.002 1.589 3.238 1.589 1.218 0 2.336-.579 3.199-1.544l.057-.064 1.91 1.92.593-.591-1.996-2.006.035-.056c.467-.74.81-1.619.986-2.583l.006-.034h2.171v-.836h-2.065l.003-.044a8.43 8.43 0 0 0 .02-.58 8.02 8.02 0 0 0-.517-2.866l-.019-.05 1.57-1.57-.592-.59L11.662 4.5h-.785zm-5 0v-.582a2.082 2.082 0 1 1 4.164 0V4.5H5.878zm5.697.837l.02.053c.283.753.447 1.61.447 2.528 0 1.61-.503 3.034-1.274 4.037-.77 1.001-1.771 1.545-2.808 1.545-1.036 0-2.037-.544-2.807-1.545-.772-1.003-1.275-2.427-1.275-4.037 0-.918.164-1.775.448-2.528l.02-.053h7.229z"
        />
      </svg>
    )}
    <div>
      <span>{testResult.message}</span>
      {testResult.error && (
        <Fragment>
          <div>{testResult.error.displayMessage}</div>
          {testResult.error?.error?.stack && (
            <pre>
              <code class="testline__error">{testResult.error.error.stack}</code>
            </pre>
          )}
        </Fragment>
      )}
    </div>
  </article>
);
