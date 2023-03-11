export const TEST_ID = {
  PLATFORM: {
    GRAPHQL: "GRAPHQL",
    JSON: "JSON",
    MARIADB: "MARIADB",
    MONGODB: "MONGODB",
    MONGOOSE: "MONGOOSE",
    MYSQL: "MYSQL",
    PG: "PG",
    SEQUELIZE: "SEQUELIZE",
    SQLITE: "SQLITE",
    LOGICAL: "LOGICAL",
    JSONSCHEMA: "JSONSCHEMA",
    OPENAPI: "OPENAPI",
    FULLJSON: "FULLJSON",
    MSSQL: "MSSQL"
  },
  TOOLBAR: {
    UPDATE: "toolbar.update",
    UPDATE_DEFAULT_CONNECTION: "toolbar.update_default_connection",
    UPDATE_SELECT_CONNECTION: "toolbar.update_select_connection",
    SHOW_LAST_UPDATE_STATS: "toolbar.show_last_update_stats",
    ACCOUNT: "toolbar.account",
    REPORT: "toolbar.report",
    GENERATE_HTML_REPORT: "toolbar.generate_html_report",
    GENERATE_DIFF_HTML_REPORT: "toolbar.generate_diff_html_report",
    GENERATE_PDF: "toolbar.generate_pdf",
    OPEN: "toolbar.open",
    SELECTION: "toolbar.selection",
    TABLE: "toolbar.table",
    SAVE: "toolbar.save",
    PROJECTS: "toolbar.projects",
    CONNECTIONS: "toolbar.connections",
    NEW: "toolbar.new",
    COMPOSITE: "toolbar.composite",
    NESTED_TYPE: "toolbar.nested_type",
    TYPE: "toolbar.type",
    INPUT: "toolbar.input",
    INTERFACE: "toolbar.interface",
    UNION: "toolbar.union",
    SCRIPT: "toolbar.script",
    ADD_FROM_SUBMENU: "toolbar.add_from_submenu",
    RELATION: "toolbar.relation",
    LINE: "toolbar.line",
    IMPLEMENTS: "toolbar.implements",
    NOTE: "toolbar.note",
    TEXT_NOTE: "toolbar.text_note",
    RELATION_BELONGS: "toolbar.relation_belongs",
    REF: "toolbar.ref",
    OBJECT: "toolbar.object",
    OTHER: {
      DROPDOWN: "toolbar.other.dropdown",
      QUERY: "toolbar.other.query",
      MUTATION: "toolbar.other.mutation",
      SCALAR: "toolbar.other.scalar",
      OTHER_TYPE: "toolbar.other.other_type",
      ENUM: "toolbar.other.enum",
      VIEW: "toolbar.other.view",
      MATERIALIZED_VIEW: "toolbar.other.materialized_view",
      PROCEDURE: "toolbar.other.procedure",
      FUNCTION: "toolbar.other.function",
      DOMAIN: "toolbar.other.domain",
      SEQUENCE: "toolbar.other.sequence",
      RULE: "toolbar.other.rule",
      POLICY: "toolbar.other.policy",
      TRIGGER: "toolbar.other.trigger",
      OTHER: "toolbar.other.other",
      USER_DEFINED_TYPE: "toolbar.other.user_defined_type"
    },
    SETTINGS: "toolbar.settings",
    UNDO: "toolbar.undo",
    SHOW_HIDE: "toolbar.show_hide",
    COPY: "toolbar.copy",
    PASTE: "toolbar.paste",
    EDIT: "toolbar.edit",
    DELETE: "toolbar.delete",
    DISPLAY: {
      DROPDOWN: "toolbar.display.dropdown",
      METADATA: "toolbar.display.metadata",
      DATA: "toolbar.display.data",
      DESCRIPTION: "toolbar.display.description",
      INDEXES: "toolbar.display.indexes",
      NESTED_OBJECTS: "toolbar.display.nested_objects",
      SCHEMA: "toolbar.display.schema",
      CARDINALITY_CAPTIONS: "toolbar.display.cardinality_captions",
      ESTIMATED_SIZES: "toolbar.display.estimated_sizes",
      STICKY_PARENT: "toolbar.display.sticky_parent",
      SHOW_DESCRIPTIONS: "toolbar.display.show_descriptions",
      SHOW_SPECIFICATIONS: "toolbar.display.show_specifications",
      SHOW_LOCALLY_REFERENCED: "toolbar.display.show_locally_referenced"
    },
    FINDER: "toolbar.finder",
    EXPAND_ALL: "toolbar.expand_all",
    COLLAPSE_ALL: "toolbar.collapse_all",
    LINE_MODE: "toolbar.line_mode",
    AUTOLAYOUT: {
      DROPDOWN: "toolbar.autolayout.dropdown",
      PARENT_CHILD: "toolbar.autolayout.parent_child",
      GRID: "toolbar.autolayout.grid",
      TREE: "toolbar.autolayout.tree"
    },
    RESIZE: {
      DROPDOWN: "toolbar.resize.dropdown",
      MAX_WIDTH: "toolbar.resize.max_width",
      MAX_HEIGHT: "toolbar.resize.max_height",
      MIN_WIDTH: "toolbar.resize.min_width",
      MIN_HEIGHT: "toolbar.resize.max_width",
      AUTOSIZE: "toolbar.resize.autosize",
      LOCK_DIMENSIONS: "toolbar.resize.lock_dimensions"
    },
    ALIGN: {
      DROPDOWN: "toolbar.align.dropdown",
      LEFT: "toolbar.align.left",
      RIGHT: "toolbar.align.right",
      TOP: "toolbar.align.top",
      BOTTOM: "toolbar.align.bottom",
      HCENTER: "toolbar.align.hcenter",
      VCENTER: "toolbar.align.vcenter"
    }
  },
  CONFIRMATIONS: {
    DELETE_CONNECTION: "confirmations.delete_connection",
    DELETE_DIAGRAM: "confirmations.delete_diagram",
    DELETE_LINE: "confirmations.delete_line",
    DELETE_RELATION: "confirmations.delete_relation",
    DELETE: "confirmations.delete"
  },
  MODALS: {
    BACKUP_MODEL: "modals.backup_model",
    ADD_DIAGRAMS_BY_CONTAINERS: "modals.add_diagrams_by_containers",
    ADD_TO_ANOTHER_DIAGRAM: "modals.add_to_another_diagram",
    BROWSER_SETTINGS: "modals.browser_settings",
    BUY_PRO: "modals.buy_pro",
    COLUMN: "modals.column",
    CONNECTION: "modals.connection",
    DIAGRAM_ITEMS: "modals.diagram_items",
    DIAGRAM: "modals.diagram",
    EULA: "modals.eula",
    FEEDBACK: "modals.feedback",
    IMPORT_FROM_URL: "modals.import_from_url",
    INDEX_ASSISTANT: "modals.index_assistant",
    LINE: "modals.line",
    MODEL: "modals.model",
    NEW_CONNECTION: "modals.new_connection",
    NEW_MODEL: "modals.new_model",
    NOTE: "modals.note",
    OPEN_FROM_URL: "modals.open_from_url",
    ORDER_ITEMS: "modals.order_items",
    OTHER_OBJECT: "modals.other_object",
    PROXY: "modals.proxy",
    RELATION: "modals.relation",
    REPORT: "modals.report",
    RESTORE_MODEL: "modals.restore_model",
    REVERSE_STATS: "modals.reverse_stats",
    SPECIFICATION_ASSISTANT: "modals.specification_assistant",
    SQL: "modals.sql",
    TABLE: "modals.table",
    TIPS: "modals.tips",
    TRIAL: "modals.trial",
    UNSAVED_CHANGES: "modals.unsaved_changes",
    TEXT_EDITOR: "modals.text_editor"
  },
  DROPDOWNS: {
    COLUMN: "dropdowns.column",
    DIAGRAM: "dropdowns.diagram",
    DIAGRAM_ITEM: "dropdowns.diagram_item",
    LINE: "dropdowns.line",
    MODEL: "dropdowns.model",
    RELATION: "dropdowns.relation"
  },
  SQL_CODE_SETTINGS: {
    JSON_CODE: "sql_code_settings.json_code",
    JSON_CODE_DEFINITION_KEY: "sql_code_settings.json_code_definition_key",
    JSON_CODE_FORMAT: "sql_code_settings.json_code_format",
    SQL_INDENT_WITH: "sql_code_settings.sql_indent_with",
    SQL_INDENT_SIZE: "sql_code_settings.sql_indent_size",
    SQL_INDENT: "sql_code_settings.sql_indent",
    SQL_LIMIT_ITEMS: "sql_code_settings.sql_limit_items",
    SQL_MAX_LINE_ITEMS: "sql_code_settings.sql_max_line_items",
    SQL_WRAP_LINES: "sql_code_settings.sql_wrap_lines",
    SQL_WRAP_LINES_LENGTH: "sql_code_settings.sql_wrap_lines_length",
    SQL_SETTINGS: "sql_code_settings.sql_settings",
    SQL_STATEMENT_DELIMITER: "sql_code_settings.sql_statement_delimiter",
    SQL_ROUTINE_DELIMITER: "sql_code_settings.sql_routine_delimiter",
    SQL_KEYWORD_CASE: "sql_code_settings.sql_keyword_case",
    SQL_IDENTIFIER_CASE: "sql_code_settings.sql_identifier_case",
    SQL_INCLUDE_SCHEMA: "sql_code_settings.sql_include_schema",
    SQL_QUOTATION: "sql_code_settings.sql_quotation",
    SQL_INCLUDE_NAMES: "sql_code_settings.sql_include_names",
    SQL_QUOTATION_TYPE: "sql_code_settings.sql_quotation_type"
  },
  CONNECTIONS: {
    CREATE_NEW_CONNECTION_BUTTON: "connections.create_new_connection",
    CONNECT_AND_LOAD_EXISTING_DATABASE_STRUCTURE_LINK:
      "connections.connect_and_load_existing_database_structure",
    COMMERCIAL_FEATURE_TEXT: "connections.commercial_feature_text",
    UPDATE_MODEL: "connections.update_model"
  },
  MODAL_TRIAL: {
    CONTINUE_WITH_FREEWARE_BUTTON: "modal_trial.continue_with_freeware",
    CONTINUE_WITH_TRIAL_BUTTON: "modal_trial.continue_with_trial",
    CLOSE_NO_FREEWARE_BUTTON: "modal_trial.close_no_freeware"
  },
  MODAL_TIPS: {
    CLOSE: "modal_tips.close"
  },
  LICENSE: {
    LICENSE_ERROR: "license.license_error",
    ACTIVATE_BUTTON: "license.activate_button",
    LICENSE_KEY_INPUT: "license.license_key_input"
  },
  BUY_NOW: {
    BUY_NOW_BUTTON: "buy_now.buy_now"
  },
  MODAL_EULA: {
    I_AGREE_BUTTON: "modal_eula.i_agree"
  },
  MODAL_NEW_MODEL: {
    NEW_PROJECT_NAME: "modal_new_model.new_project_name",
    CREATE_NEW_PROJECT: "modal_new_model.create_new_project"
  },
  MODAL_REPORT: {
    CLOSE: "modal_report.close"
  },
  MODAL_BUY_PRO: {
    CLOSE: "modal_buy_pro.close"
  },
  MODAL_RESTORE_MODEL: {
    DISCARD_CHANGES_AND_CONTINUE:
      "modal_restore_model.discard_changes_and_continue"
  },
  MODAL_UNSAVED_CHANGES: {
    DISCARD_CHANGES_AND_CONTINUE:
      "model_unsaved_changes.discard_changes_and_continue"
  },
  MODELS: {
    LOAD_FROM_DATABASE: "models.load_from_database",
    IMPORT_FROM_URL: "models.import_from_url",
    IMPORT_FILE: "models.import_file",
    NEW_PROJECT: "models.new_project"
  },
  TABLES: {
    NAME: "table.name",
    DESCRIPTION: "table.description",
    ESTIMATED_SIZE: "table.estimated_size",
    EMBEDDABLE: "table.embeddable"
  },
  COLUMNS: {
    NAME: "column.name",
    INPUT_NEW_NAME: "column.input_new_name",
    BUTTON_ADD_NEW: "column.button_add_new"
  },
  KEYS: {
    INPUT_NAME: "keys.input_name",
    BUTTON_ADD_KEY: "keys.button_add_key",
    BUTTON_ADD_COLUMN: "keys.button_add_column",
    SELECT_COLUMN: "keys.select_column",
    BUTTON_DELETE: "keys.button_delete"
  },
  INDEXES: {
    INPUT_NAME: "indexes.input_name",
    BUTTON_ADD_INDEX: "indexes.button_add_index",
    BUTTON_ADD_COLUMN: "indexes.button_add_column",
    BUTTON_DELETE: "indexes.button_delete"
  },
  DIAGRAM: {
    MAIN_AREA: "diagram.main_area",
    DROPDOWN_ADD_DIAGRAMS_BY_CONTAINERS:
      "diagram.dropdown_add_diagrams_by_containers",
    DROPDOWN_DESELECT_ALL: "diagram.dropdown_deselect_all",
    ITEM: {
      DROPDOWN_ADD_TO_ANOTHER_DIAGRAM:
        "diagram.item.dropdown_add_to_another_diagram"
    }
  },
  DIAGRAM_PANEL: {
    ADD_DIAGRAM: "diagram_panel.add_diagram",
    BUY_NOW: "diagram_panel.buy_now",
    ACTIVE_DIAGRAM: {
      DROPDOWN_EDIT: "diagram_panel.active_diagram.dropdown_edit",
      DROPDOWN_MANAGE_ITEMS:
        "diagram_panel.active_diagram.dropdown_manage_items",
      DROPDOWN_DELETE: "diagram_panel.active_diagram.dropdown_delete",
      DROPDOWN_ADD_DIAGRAMS_BY_CONTAINERS:
        "diagram_panel.active_diagram.dropdown_add_diagrams_by_containers"
    }
  },
  FOOTER: {
    UNSAVED: "footer.unsaved",
    NOTIFICATIONS: "footer.notifications"
  },
  NEW_CONNECTION: {
    PLATFORM: {
      PG: "PG",
      MONGODB: "MONGODB",
      MARIADB: "MARIADB",
      MYSQL: "MYSQL",
      MSSQL: "MSSQL"
    },
    NAME_EDIT: "new_connection.name_edit",
    SERVER_EDIT: "new_connection.server_edit",
    PORT_EDIT: "new_connection.port_edit",
    DATABASE_EDIT: "new_connection.database_edit",
    USER_EDIT: "new_connection.user_edit",
    PASSWORD_EDIT: "new_connection.password_edit",
    SCHEMA_EDIT: "new_connection.schema_edit",
    LOAD_DATABASES_BUTTON: "new_connection.load_databases",
    SAVE_CONNECTION_BUTTON: "new_connection.save_connection"
  },
  LAYOUT: {
    ASIDE_RIGHT: "layout.aside_right",
    ASIDE_TOGGLE_BUTTON_LEFT: "containers.aside_toggle_button_left",
    ASIDE_TOGGLE_BUTTON_RIGHT: "containers.aside_toggle_button_right",
    APP_LAYOUT: "layout.app_layout"
  },
  COMPONENTS: {
    TIPS: "components.tips",
    LOADING: "components.loading",
    INPUT_SEARCH_MODEL: "components.search_model",
    INPUT_SEARCH_CONNECTION: "components.search_connection",
    INPUT_SEARCH_BROWSER: "components.search_browser"
  },
  LICENSE_TYPE: "license_type",
  REMAINING_DAYS: "remaining_days",
  PRODUCT_TYPE: "product_type",
  BACK_TO_ACTIVE_PROJECT: "back_to_active_project",
  DETAIL: {
    PG_SCHEMA: "pg_schema",
    MSSQL_SCHEMA: "msssql_schema"
  },
  MODAL_BACKUP_MODEL: {
    CLOSE: "modal_backup_model.close",
    SAVE_BACKUP: "modal_backup_model.save_backup",
    SKIP_BACKUP: "modal_backup_model.skip_backup"
  }
};

export const TITLE = {
  TRIAL_VERSION: "Trial version",
  LICENSE_AGREEMENT: "License agreement",
  FREEWARE_WITH_LIMITED_FEATURES: "Freeware with limited features",
  UPGRADE_TO_MOON_MODELER_PROFESSIONAL: "Upgrade to Moon Modeler Professional",
  UPGRADE_TO_LUNA_MODELER_PROFESSIONAL: "Upgrade to Luna Modeler Professional",
  NEW_PROJECT: "New project"
};

export const MESSAGE = {
  LICENSE_ERROR: "That license does not exist for the provided product."
};
