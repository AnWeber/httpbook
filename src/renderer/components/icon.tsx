// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { h, FunctionComponent } from 'preact';
import './icon.css';

export const Icon: FunctionComponent<{ svg: { id: string }, class: string }>
  = props => <svg class={`icon ${props.class}`}>
    <use xlinkHref={`#${props.svg.id}`} />
  </svg>;
