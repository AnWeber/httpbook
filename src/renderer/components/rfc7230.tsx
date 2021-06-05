// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { h, FunctionComponent, Fragment } from 'preact';
import './rfc7230.css';
import type { HttpResponse, HttpResponseRequest } from 'httpyac';


interface RFC7230Data{
  response: HttpResponse
}


export const RFC7230Response: FunctionComponent<RFC7230Data> = ({ response }) => <section class="response">
  {response.request
    && <Request request={response.request}/>
  }
  <StatusLine response={response} />
  {response.headers
    && <Headers headers={response.headers} />
  }
  {typeof response.body === 'string' && (response.body.startsWith('data:') ? <img src={response.body}></img> : <pre><code>{ response.body }</code></pre>)}
</section>;


const Request: FunctionComponent<{ request: HttpResponseRequest }>
  = ({ request }) => <div class='request'>
    <RequestLine request={request} />
    {request.headers
    && <Headers headers={request.headers} />
    }
    {typeof request.body === 'string' && <pre><code>{ request.body }</code></pre>}
  </div>;


const RequestLine: FunctionComponent<{ request: HttpResponseRequest }> = ({ request }) => <h4 class="requestline">
  <span class="requestline__method">{request.method || 'GET'}</span> <span class="requestline__url">{`${request.url}`}</span>
</h4>;


const StatusLine: FunctionComponent<{ response: HttpResponse }> = ({ response }) =>
  <h4 className={response.statusCode >= 400 ? 'statusline statusline--error' : 'statusline statusline--success'}>
    <span class="statusline__version">HTTP/{response.httpVersion || '1.1'}</span> <span class="statusline__code">{response.statusCode}</span>{response.statusMessage
    && <span class="statusline__message">{response.statusMessage}</span>
    }
  </h4>;

const Headers: FunctionComponent<{ headers: Record<string, string | string[] | undefined | null> }> = ({ headers }) =>
  <div class="header">
    {Object.entries(headers).map(([key, value]) => <Fragment>
      <span class="header__key">{key}:</span>
      <span class="header__value" title={key}>{Array.isArray(value) ? value.join(' ,') : value}</span>
    </Fragment>)}
  </div>;
