import { QueryResultRow } from "./QueryResultRow";

export interface MSSQLIndexRow extends QueryResultRow {
  _schema: string;
  _table: string;
  _name: string;
  _type: string;
  _column_name: string;
  _column_desc: boolean;
  _unique: boolean;
  _primaryxml: string;
  _comment: string;
  _where: string;
  _ds: string;
  _ds_is_default: boolean;
  _using_xml_index: string;
  _is_padded: boolean;
  _fill_factor: number;
  _ignore_dup_key: boolean;
  _no_recompute: boolean;
  _allow_row_locks: boolean;
  _allow_page_locks: boolean;
  _tessellation_scheme: string;
  _bounding_box_xmin: number;
  _bounding_box_ymin: number;
  _bounding_box_xmax: number;
  _bounding_box_ymax: number;
  _level_1_grid_desc: string;
  _level_2_grid_desc: string;
  _level_3_grid_desc: string;
  _level_4_grid_desc: string;
  _cells_per_object: number;
}
