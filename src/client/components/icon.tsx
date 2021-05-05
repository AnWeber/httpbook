// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { h, FunctionComponent } from 'preact';
import style from './icon.css';

export const Icon: FunctionComponent<{ svg: { id: string } }> = ({ svg }) => <svg className={style.icon}>
  <use xlinkHref={`#${svg.id}` } />
</svg>;
