import { h, FunctionComponent, Fragment } from 'preact';
import './rfc7230.css';
import type { HttpResponse, Request } from 'httpyac';

interface RFC7230Data {
  response: HttpResponse;
}

export const RFC7230Response: FunctionComponent<RFC7230Data> = ({ response }) => (
  <section class="response">
    {response.request && <RequestComponent request={response.request} />}
    <StatusLineComponent response={response} />
    {response.headers && <HeadersComponent headers={response.headers} />}
    {response.prettyPrintBody ? (
      <pre>
        <code>{response.prettyPrintBody}</code>
      </pre>
    ) : (
      typeof response.body === 'string' &&
      (response.body.startsWith('data:') ? (
        <img src={response.body}></img>
      ) : (
        <pre>
          <code>{response.body}</code>
        </pre>
      ))
    )}
  </section>
);

const RequestComponent: FunctionComponent<{ request: Request }> = ({ request }) => (
  <div class="request">
    <RequestLineComponent request={request} />
    {request.headers && <HeadersComponent headers={request.headers} />}
    {typeof request.body === 'string' && (
      <pre>
        <code>{request.body}</code>
      </pre>
    )}
  </div>
);

const RequestLineComponent: FunctionComponent<{ request: Request }> = ({ request }) => (
  <h4 class="requestline">
    <span class="requestline__method">{request.method || 'GET'}</span>{' '}
    <span class="requestline__url">{`${request.url}`}</span>
  </h4>
);

const StatusLineComponent: FunctionComponent<{ response: HttpResponse }> = ({ response }) => (
  <h4 className={response.statusCode >= 400 ? 'statusline statusline--error' : 'statusline statusline--success'}>
    <span class="statusline__version">HTTP/{response.httpVersion || '1.1'}</span>{' '}
    <span class="statusline__code">{response.statusCode}</span>
    {response.statusMessage && <span class="statusline__message">{response.statusMessage}</span>}
  </h4>
);

const HeadersComponent: FunctionComponent<{ headers: Record<string, unknown> }> = ({ headers }) => (
  <div class="header">
    {Object.entries(headers).map(([key, value]) => {
      let display = `${value}`;
      if (Array.isArray(value)) {
        display = value.join(' ,');
      } else if (value === undefined || value === null) {
        display = '';
      }
      return (
        <Fragment>
          <span class="header__key">{key}:</span>
          <span class="header__value" title={key}>
            {display}
          </span>
        </Fragment>
      );
    })}
  </div>
);
