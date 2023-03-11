export interface MSSQLIndexMetadata {
  id: string;
  name: string;
  unique: boolean;
  columns: {
    id: string;
    name: string;
    desc: boolean;
  }[];
  primaryxml: boolean;
  clustered: boolean;
  type: string;
  comment: string;
  where: string;
  ds: string;
  pathXMLIndex: string;
  with: {
    isPadded: boolean;
    fillFactor: number;
    ignoreDupKey: boolean;
    noRecompute: boolean;
    allowRowLocks: boolean;
    allowPageLocks: boolean;
  };
  spatial?: {
    tessellationScheme: string;
    boundingBoxXmin: number;
    boundingBoxYmin: number;
    boundingBoxXmax: number;
    boundingBoxYmax: number;
    level1Grid: string;
    level2Grid: string;
    level3Grid: string;
    level4Grid: string;
    cellsPerObject: number;
  };
}
