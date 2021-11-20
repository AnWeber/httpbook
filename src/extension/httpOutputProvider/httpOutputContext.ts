import type { HttpRegion, HttpFile } from 'httpyac';

export interface HttpOutputContext {
  httpRegion: HttpRegion;
  httpFile: HttpFile;
}
