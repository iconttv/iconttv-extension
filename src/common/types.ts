export type IconSize = 'small' | 'medium' | 'large';

export interface Icon {
  name: string;
  nameHash: string;
  uri: string;
  thumbnailUri: string;
  keywords: string[];
  tags: string[];
  useOrigin: boolean;
  originUri: string;
  count?: number;
}

export interface IconStats {
  [hash: string]: number;
}

export interface ServerIconList {
  icons: Icon[];
  timestamp: number;
}

export type Keyword2Icon = Record<string, Element>;

export interface IconApplyOptions {
  replaceTags: boolean;
}
