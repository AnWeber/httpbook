// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { h, FunctionComponent, Fragment } from 'preact';
import style from './rfc7230.css';
import { HttpResponse, HttpMethod } from 'httpyac';


interface NormalizedOptions {
  url?: URL;
  method?: HttpMethod;
  headers?: Record<string, string | string[] | undefined>;
  body?: unknown;
}

interface RFC7230Data{ response: HttpResponse, requestVisible?: boolean, bodyVisible?: boolean }

export const RFC7230Response: FunctionComponent<RFC7230Data> = ({ response, requestVisible, bodyVisible }) => <section className={style.response}>
  {requestVisible && response.request
    && <Request request={response.request} bodyVisible={bodyVisible}/>
  }
  <StatusLine response={response} />
  {response.headers
    && <Headers headers={response.headers} />
  }
  {bodyVisible && typeof response.body === 'string'
    && <Body body={response.body} />
  }
</section>;


const Request: FunctionComponent<{ request: NormalizedOptions, bodyVisible?: boolean}> = ({ request, bodyVisible }) => <div className={style.request}>
  <RequestLine request={request} />
  {request.headers
    && <Headers headers={request.headers} />
  }
  {bodyVisible && typeof request.body === 'string'
    && <Body body={request.body} />
  }
</div>;


const RequestLine: FunctionComponent<{ request: NormalizedOptions }> = ({ request }) => <h4 className={style.requestLine}>
  <span className={style.requestLineMethod}>{request.method || 'GET'}</span> <span className={style.requestLineUrl}>{request.url}</span>
</h4>;


const StatusLine: FunctionComponent<{ response: HttpResponse }> = ({ response }) => <h4 className={style.statusLine}>
  <span className={style.statusLineVersion}>HTTP/{response.httpVersion || '1.1'}</span> <span className={style.statusLineCode}>{response.statusCode}</span> {response.statusMessage
    && <span className={style.statusLineMessage}>{response.statusMessage}</span>
  }
</h4>;

const Headers: FunctionComponent<{ headers: Record<string, string | string[] | undefined | null> }> = ({ headers }) => <Fragment>
  {Object.entries(headers).map(([key, value]) => <div className={style.header}>
    <span className={style.headerName}>{key}:</span>{value
      && <div className={style.headerValue}>{Array.isArray(value) ? value.join(' ,') : value}</div>
    }
  </div>)}
</Fragment>;


export const HttpBody: FunctionComponent<{ body: unknown, mimeType?: string }> = ({ body }) => <div className={style.response}>
  <pre><code>{`${body}`}</code></pre>
</div>;


const Body: FunctionComponent<{ body: unknown, mimeType?: string }> = ({ body }) => <pre><code>{`${body}`}</code></pre>;
