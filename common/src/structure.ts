export interface Column {
  pk: boolean;
  param: string;
  datatype: string;
  name: string;
  id: string;
  after?: string;
  autoinc?: boolean;
  comment: string;
  collation?: string;
  charset?: string;
  defaultvalue: string;
  nn: boolean;
  enum?: string;
  fk?: boolean;
  list: boolean;
  // mongoose
  ref?: string;
  unsigned?: boolean;
  zerofill?: boolean;
  data?: string;
  isHidden?: boolean;
  isArrayItemNn?: boolean;
  validation?: string;
  pattern?: boolean;
  any?: string;
  specification?: string;
  useSchemaId?: boolean;

  //graphql
  fieldArguments?: string | null;
  fieldDirective?: string;

  pg?: {
    generatedIdentity?: string;
    generated?: string;
    dimensions: number;
  };

  sqlite?: {
    autoincrement: boolean;
  };

  nodeType?: string;
  estimatedSize: string;
}

export interface KeyCol {
  id: string;
  colid: string;
}

export interface Key {
  id: string;
  isPk: boolean;
  name: string;
  cols: KeyCol[];
  mssql?: { clustered: boolean };
}

export interface OtherObject extends ItemObject {
  code: string;

  type: string;

  enumValues?: string;
  directive?: string;

  generate: boolean;
  generateCustomCode: boolean;

  pg?: {
    owner: string;
    schema: string;
    type?: string;
    domain?: {
      not_null: boolean;
      constraints: { id: string; name: string; constraint_def: string }[];
      collation: string;
      default: string;
      datatype: string;
      datatype_param: string;
    };
    rule?: {
      tablename: string;
    };
    policy?: {
      permissive: boolean;
      tablename: string;
      command: string;
      role_names: string[];
      using_expression: string;
      check_expression: string;
    };
    trigger?: {
      tablename: string;
    };
  };

  mssql?: {
    schema: string;
    trigger?: {
      tablename: string;
    };

    sequence?: {
      start: number;
      increment: number;
      minValue?: number;
      maxValue?: number;
      isCycling: boolean;
      cache?: number;
    };

    udt?: {
      baseType?: string;
      params?: string;
      isNotNull: boolean;
      externalName?: string;
      asTable?: string;
    };
  };
}

export interface IndexCol {
  id: string;
  colid: string;

  pg?: {
    collate?: string;
    desc?: boolean;
    nullsLast?: boolean;
    expression?: string;
  };

  sqlite?: {
    collate?: string;
    expression?: string;
    desc?: boolean;
  };

  mssql?: {
    desc?: boolean;
  };
}

export interface Index {
  cols: IndexCol[];
  name: string;
  fulltext?: boolean;
  id: string;
  unique: boolean;

  algorithm?: string;
  lockoption?: string;
  using?: string;

  pg?: {
    tablespace?: string;
    desc?: string;
    storageParameters?: string;
    expression?: string;
  };

  sqlite?: {
    expression?: string;
  };

  mongodb?: {
    options: any;
    fields: any;
  };

  mssql?: {
    type: string;
    clustered: boolean;
    primaryxml: boolean;
    desc: string;
    where: string;
    order: string;
    with: string;
    using: string;
    keyIndex: string;
    pathXMLIndex: string;
    onFilegroup: string;
  };
}

export interface Item {
  id: string;
  visible: boolean;
  name: string;
  desc: string;
}

export interface ItemObject extends Item {
  lines: string[];
}

export interface Table extends ItemObject {
  generate: boolean;
  generateCustomCode: boolean;

  validationAction?: string;
  validationLevel?: string;
  size?: number;
  max?: number;
  capped?: boolean;
  others?: string;

  freezeTableName?: boolean;
  paranoid?: boolean;
  timestamps?: boolean;
  version?: boolean;

  relations: string[];
  indexes: Index[];
  embeddable: boolean;
  estimatedSize: string;
  rowformat?: string;
  tabletype?: string;
  keys: Key[];
  collation?: string;
  charset?: string;
  cols: Column[];
  afterScript?: string;
  database?: string;
  initautoinc?: string;
  directive?: string;
  validation?: string;

  objectType?: string;
  nodeType?: string;

  schema?: string;
  specification?: any;
  refUrl?: string;

  pg?: {
    tablespace: string;
    inherits: string;
    storageParameters: string;
    partition: string;
    owner: string;
    rowsecurity: boolean;
    schema: string;
    partitionNames: string[];
  };

  sqlite?: {
    withoutrowid: boolean;
    strict: boolean;
  };

  mssql?: {
    schema: string;
  };
}

export interface RelationCol {
  id: string;
  childcol: string;
  parentcol: string;
}

export interface Relation extends Item {
  generate: boolean;
  generateCustomCode: boolean;

  type: string;
  cols: RelationCol[];
  child: string;
  parent: string;
  parent_key: string;
  c_mp: string;
  c_mch: string;
  c_p: string;
  c_ch: string;
  c_cp: string;
  c_cch: string;
  ri_pd?: string;
  ri_pu?: string;
}

export interface Line {
  id: string;
  visible: boolean;
  name: string;
  desc: string;
  style: string;
  parent: string;
  child: string;
  lineColor: string;
  markerStart: string;
  markerEnd: string;
  linegraphics: string;

  generate: boolean;
}

export interface MoonModelerModel {
  model: ModelDescription;
  otherObjects: OtherObjects;
  relations: Relations;
  tables: Tables;
  lines: Lines;
  notes: Notes;
  diagrams: Diagrams;
  order: string[];
  warnings?: Warning[];
  originalModel?: any;
  layoutUpdateDiagrams?: LayoutUpdateDiagrams;
  collapsedTreeItems: string[];
}

export interface Note extends ItemObject {}

export interface ModelDescription {
  connectionId?: string;
  id: string;
  name: string;
  activeDiagram: string;
  desc: string;
  path: string;
  type: string;
  version: number;
  parentTableInFkCols: boolean;
  caseConvention: string;
  replaceSpace: string;
  color: string;
  sideSelections: boolean;
  isDirty: boolean;
  cardinalityIsDisplayed: boolean;
  storedin: {
    extra: number;
    major: number;
    minor: number;
  };
  def_database?: string;
  def_charset?: string;
  def_collation?: string;
  def_coltopk?: boolean;
  def_rowformat?: string;
  def_tabletype?: string;
  beforeScript?: string;
  afterScript?: string;
  def_others?: string;
  lastSaved?: string;
  filePath?: string;
  pg?: {
    schema?: string;
  };
  mssql?: {
    schema?: string;
  };
  embeddedInParentsIsDisplayed: boolean;
  schemaContainerIsDisplayed: boolean;
  estimatedSizeIsDisplayed: boolean;
  showDescriptions?: boolean;
  showSpecifications?: boolean;
  showLocallyReferenced?: boolean;
  writeFileParam: boolean;
  sqlSettings?: {
    wrapLines: boolean;
    wrapOffset: number;
    indent: boolean;
    indentationString: string;
    indentationSize: number;
    limitItemsOnLine: boolean;
    maxListItemsOnLine: number;
    statementDelimiter: string;
    routineDelimiter: string;
    keywordCase: string;
    identiferCase: string;
    includeSchema?: string;
    quotation?: string;
    includeGeneratedNames?: string;
    quotationType?: string;
  };
  nameAutoGeneration?: {
    keys: boolean;
    indexes: boolean;
    relations: boolean;
  };
  jsonCodeSettings?: {
    strict: boolean;
    definitionKeyName: string;
    format: string;
  };
  currentDisplayMode: string;
}

export interface ModelObjects {
  relations: Relations;
  tables: Tables;
  otherObjects: OtherObjects;
  order: string[];
}

export interface DiagramItem {
  referencedItemId: string;
  x: number;
  y: number;
  gHeight: number;
  gWidth: number;
  color: string;
  background: string;
  resized: boolean;
  autoExpand: boolean;
  collapsed?: boolean;
}
export interface Diagram {
  name: string;
  description: string;
  id: string;
  keysgraphics: boolean;
  linegraphics: string;
  background: string;
  lineColor: string;
  isOpen: boolean;
  zoom: number;
  main: boolean;
  diagramItems: DiagramItems;
  scroll: { x: number; y: number };
  type?: string;
}

export interface DiagramItems {
  [key: string]: DiagramItem;
}

export interface Diagrams {
  [key: string]: Diagram;
}

export interface OtherObjects {
  [key: string]: OtherObject;
}

export interface Relations {
  [key: string]: Relation;
}

export interface Tables {
  [key: string]: Table;
}

export interface Lines {
  [key: string]: Line;
}

export interface Notes {
  [key: string]: Note;
}

export interface Warning {
  message: string;
}

export interface LayoutUpdateDiagrams {
  [key: string]: LayoutUpdateDiagram;
}

export interface LayoutUpdateDiagram {
  ids: string[];
  start: { x: number; y: number };
}

export interface ReverseStatItemCounterDetail {
  count: number;
  idNames: { id: string; name: string; containerId?: string }[];
}

export interface ReverseStatItemCounter {
  total: number;
  added: ReverseStatItemCounterDetail;
  removed: ReverseStatItemCounterDetail;
  modified: ReverseStatItemCounterDetail;
}

export interface ReverseStatItem {
  caption: string;
  counter: ReverseStatItemCounter;
}
export interface ReverseStats {
  reversedOn: number;
  connectionId: string;
  items: ReverseStatItem[];
}
