import { MSSQLIndexRow } from "./MSSQLIndexRow";
import { MSSQLRE } from "./MSSQLRE";
import sql from "mssql";

export class MSSQLIndexRE extends MSSQLRE<MSSQLIndexRow> {
  public async reverse(): Promise<MSSQLIndexRow[]> {
    return await this.connection.query(
      `select 
      schema_name(t.schema_id) _schema, 
      t.name _table, 
      i.name _name, 
      i.type_desc _type,
      c.name  _column_name,
      ic.is_descending_key _column_desc,
      i.is_unique _unique,
      xi.xml_index_type_description _primaryxml,
      p.value _comment,
      i.filter_definition _where,
      ds.name _ds,
      ds.is_default _ds_is_default,
      xpi.name _using_xml_index,
      i.is_padded _is_padded,
      i.fill_factor _fill_factor,
      i.ignore_dup_key _ignore_dup_key,
      st.no_recompute _no_recompute,
      i.allow_row_locks _allow_row_locks,
      i.allow_page_locks _allow_page_locks,
      it.tessellation_scheme _tessellation_scheme,
	    bounding_box_xmin _bounding_box_xmin,   
      bounding_box_ymin _bounding_box_ymin,   
      bounding_box_xmax _bounding_box_xmax,   
      bounding_box_ymax _bounding_box_ymax,   
      level_1_grid_desc _level_1_grid_desc,
      level_2_grid_desc _level_2_grid_desc,   
      level_3_grid_desc _level_3_grid_desc,   
      level_4_grid_desc _level_4_grid_desc,   
      cells_per_object _cells_per_object
      from sys.index_columns ic 
      join sys.columns c on ic.object_id = c.object_id and ic.column_id = c.column_id
      join sys.indexes i on i.object_id = ic.object_id and i.index_id = ic.index_id  
      join sys.tables t on t.object_id = i.object_id      
      left join sys.stats st ON st.object_id = i.object_id AND st.stats_id = i.index_id   
      left join sys.xml_indexes xi on xi.object_id = ic.object_id and xi.index_id = ic.index_id
      left join sys.xml_indexes xpi on xpi.object_id = xi.object_id and xpi.index_id = xi.using_xml_index_id
      LEFT JOIN sys.extended_properties p ON p.major_id = i.object_id and p.minor_id = i.index_id and p.class = 7 
      LEFT JOIN sys.data_spaces ds on ds.data_space_id = i.data_space_id
      left join sys.spatial_index_tessellations it on i.object_id = it.object_id and i.index_id = it.index_id
      where i.name is not null 
      and i.is_primary_key = 0
      and i.is_unique_constraint = 0
      order by i.index_id, key_ordinal;`,
      []
    );
  }
}
