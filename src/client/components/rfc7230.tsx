// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { h, FunctionComponent, Fragment } from 'preact';
import style from './rfc7230.css';
import { HttpResponse, HttpMethod } from 'httpyac';
import { BodyOutput, HljsMetaData } from './hljs';


interface NormalizedOptions {
  url?: URL;
  method?: HttpMethod;
  headers?: Record<string, string | string[] | undefined>;
  body?: unknown;
}

interface RFC7230Data{
  response: HttpResponse,
  metaData: HljsMetaData,
  requestVisible?: boolean,
  bodyVisible?: boolean
}


export const RFC7230Response: FunctionComponent<RFC7230Data> = ({ response, metaData, requestVisible, bodyVisible }) => <section className={style.response}>
  {requestVisible && response.request
    && <Request request={response.request} metaData={metaData} bodyVisible={bodyVisible}/>
  }
  <StatusLine response={response} />
  {response.headers
    && <Headers headers={response.headers} />
  }
  {bodyVisible && typeof response.body === 'string'
    && <BodyOutput hljsOutput={response} metaData={metaData} />
  }
</section>;


const Request: FunctionComponent<{ request: NormalizedOptions, metaData: HljsMetaData, bodyVisible?: boolean }>
  = ({ request, metaData, bodyVisible }) => <div className={style.request}>
    <RequestLine request={request} />
    {request.headers
    && <Headers headers={request.headers} />
    }
    {bodyVisible && typeof request.body === 'string'
    && <BodyOutput hljsOutput={{ body: request.body }} metaData={metaData} />
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

const Headers: FunctionComponent<{ headers: Record<string, string | string[] | undefined | null> }> = ({ headers }) =>
  <div className={style.header}>
    {Object.entries(headers).map(([key, value]) => <Fragment>
      <span className={style.headerName}>{key}:</span>
      <span className={style.headerValue} title={key}>{Array.isArray(value) ? value.join(' ,') : value}</span>
    </Fragment>)}
  </div>;
export const HttpBody: FunctionComponent<{ response: HttpResponse, metaData: HljsMetaData }>
  = ({ response, metaData }) => <div className={style.response}>
    <BodyOutput hljsOutput={response} metaData={metaData}/>
  </div>;
