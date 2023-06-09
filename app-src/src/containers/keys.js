import React, { Component } from "react";
import {
  addColumnToKey,
  autoGenerateKeys,
  changeKey,
  deleteKey,
  fetchKey,
  fetchTable,
  getAutoGeneratedDependentRelations,
  getAutoGeneratedKeys,
  getAutoGeneratedNamesForKey,
  getDependentRelations,
  handleColumnInKeyChange,
  removeColumnFromKey,
  updateAutoGeneratedNamesForKey,
  updateKeyProperty,
  updateRelationNames
} from "../actions/tables";
import { fetchRelation, importRelations } from "../actions/relations";
import {
  finishTransaction,
  getCurrentHistoryTransaction,
  startTransaction
} from "../actions/undoredo";

import CheckboxSwitch from "../components/checkbox_switch";
import { DebounceInput } from "react-debounce-input";
import DetailPanel from "../components/detail_panel";
import { ModelTypes } from "../enums/enums";
import PGHelpers from "../platforms/pg/helpers_pg";
import Sortable from "react-sortablejs";
import UIHelpers from "../helpers/ui_helpers";
import { UndoRedoDef } from "../helpers/history/undo_redo_transaction_defs";
import _ from "lodash";
import arrayMove from "array-move";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { getHistoryContext } from "../helpers/history/history";
import { v4 as uuidv4 } from "uuid";
import { withRouter } from "react-router-dom";

class Keys extends Component {
  constructor(props) {
    super(props);
    this.state = { keys: [], tableId: undefined };
    this.handleCheckboxChangePlatform =
      this.handleCheckboxChangePlatform.bind(this);
  }
  componentDidMount() {
    this.updateState();
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevProps.tables !== this.props.tables ||
      prevState.tableId !== this.props.match.params.id
    ) {
      this.updateState();
    }
  }

  updateState() {
    const table =
      this.props.match.params.id &&
      this.props.tables[this.props.match.params.id];
    const keys =
      _.map(table?.keys, (key) => ({
        key,
        canResetName:
          this.props.type === ModelTypes.PG &&
          this.props.nameAutoGeneration.keys
            ? PGHelpers.makeKeyName(key, table, this.props.tables) !== key.name
            : false
      })) || [];
    this.setState({ keys, tableId: this.props.match.params.id });
  }

  async changeName(key_id, newName) {
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.KEYS__UPDATE_KEY_PROPERTY
    );
    try {
      await this.props.updateKeyProperty(
        this.props.match.params.id,
        key_id,
        newName,
        "name"
      );
    } finally {
      await this.props.finishTransaction();
    }
  }

  async handleChangeName(key_id, event) {
    const value = event.target.value;
    this.changeName(key_id, value);
  }

  async resetKeyName(key_id, canResetName) {
    if (!canResetName) {
      return;
    }
    const table =
      this.props.match.params.id &&
      this.props.tables[this.props.match.params.id];
    const key = _.find(table.keys, ["id", key_id]);
    const value = PGHelpers.makeKeyName(key, table, this.props.tables);
    this.changeName(key_id, value);
  }

  async handleColumnInKeyChange(key_id, keycol_id, event) {
    const value = event.target.value;
    const historyContext = getHistoryContext(
      this.props.history,
      this.props.match
    );
    await this.props.startTransaction(
      historyContext,
      UndoRedoDef.KEYS__COLUMN_IN_KEY_CHANGE
    );
    try {
      await this.props.handleColumnInKeyChange(
        historyContext,
        this.props.match.params.id,
        key_id,
        keycol_id,
        value
      );
    } finally {
      await this.props.finishTransaction();
    }
  }

  async handleColumnInKeyDelete(key_id, keycol_id) {
    const table = this.props.tables[this.props.match.params.id];
    var keyToUpdate = _.find(table.keys, ["id", key_id]);
    var k = _.find(keyToUpdate.cols, ["id", keycol_id]);

    const historyContext = getHistoryContext(
      this.props.history,
      this.props.match
    );
    await this.props.startTransaction(
      historyContext,
      UndoRedoDef.KEYS__REMOVE_COLUMN_FROM_KEY
    );
    try {
      const autoGeneratedNames = getAutoGeneratedNamesForKey({
        settings: {
          type: this.props.type,
          nameAutoGeneration: this.props.nameAutoGeneration
        },
        tables: this.props.tables,
        table: table,
        key: keyToUpdate,
        relations: this.props.relations
      });
      try {
        await this.props.removeColumnFromKey(
          historyContext,
          k.colid,
          this.props.match.params.id,
          key_id,
          true
        );
      } finally {
        await this.props.updateAutoGeneratedNamesForKey(autoGeneratedNames);
      }
    } finally {
      await this.props.finishTransaction();
    }
  }

  async handleColumnInKeyAdd(key_id) {
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.KEYS__ADD_COLUMN_TO_KEY
    );
    try {
      const table = this.props.tables[this.props.match.params.id];
      const keyToUpdate = _.find(table.keys, ["id", key_id]);
      const autoGeneratedNames = getAutoGeneratedNamesForKey({
        settings: {
          type: this.props.type,
          nameAutoGeneration: this.props.nameAutoGeneration
        },
        tables: this.props.tables,
        table: table,
        key: keyToUpdate,
        relations: this.props.relations
      });
      try {
        await this.props.addColumnToKey(
          this.props.match.params.id,
          "0",
          this.props.match.params.id,
          key_id
        );

        getCurrentHistoryTransaction().addResizeRequest({
          operation: "addColumnToKey",
          domToModel: true
        });
      } finally {
        await this.props.updateAutoGeneratedNamesForKey(autoGeneratedNames);
      }
    } finally {
      await this.props.finishTransaction();
    }
  }

  async addKey(event) {
    let persistedEvent = event;
    persistedEvent.preventDefault();
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.KEYS__ADD_KEY
    );

    const tableName = this.props.tables[this.props.match.params.id].name;
    const name =
      this.props.type === ModelTypes.PG && this.props.nameAutoGeneration.keys
        ? PGHelpers.makeUniqueAKName(
            tableName,
            [],
            PGHelpers.getAllKeysByNames(this.props.tables)
          )
        : tableName +
          "_ak_" +
          _.size(this.props.tables[this.props.match.params.id].keys);

    try {
      var newKey = {
        id: uuidv4(),
        isPk: false,
        name,
        cols: [],
        ...(this.props.type === ModelTypes.MSSQL
          ? { mssql: { clustered: true } }
          : {})
      };
      await this.props.fetchKey(
        newKey,
        this.props.tables[this.props.match.params.id].id,
        _.size(this.props.tables[this.props.match.params.id].keys)
      );
    } finally {
      await this.props.finishTransaction();
    }
  }

  async deleteKey(key_id) {
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.KEYS__DELETE_KEY
    );
    try {
      var clonedActvTbl = _.cloneDeep(
        this.props.tables[this.props.match.params.id]
      );
      for (const relationId of clonedActvTbl.relations) {
        const relation = this.props.relations[relationId];
        if (relation.parent_key === key_id) {
          const tablePk = _.find(clonedActvTbl.keys, ["isPk", true]);
          await this.props.changeKey(tablePk.id, relationId);
        }
      }
      let updatedKeys = clonedActvTbl.keys;
      var index = _.findIndex(updatedKeys, ["id", key_id]);
      await this.props.deleteKey(clonedActvTbl.id, index);
    } finally {
      await this.props.finishTransaction();
    }
  }

  checkIfColIsInKey(columnId, key) {
    let isColInKey = _.find(key.cols, ["colid", columnId]);
    return !!isColInKey;
  }

  getKeyDetail(key, keycol) {
    return this.props.tables[this.props.match.params.id].cols.map((col) => {
      if (col.id !== keycol.colid) {
        if (!this.checkIfColIsInKey(col.id, key))
          return (
            <option value={col.id} key={col.id}>
              {col.name}
            </option>
          );
      } else {
        return (
          <option value={col.id} key={col.id}>
            {col.name}
          </option>
        );
      }
    });
  }

  getKeyColumns(key) {
    var i = 0;
    return key.cols.map((keycol) => {
      i++;
      return (
        <div key={key.id + "_" + keycol.id} className="im-key-detail-grid">
          {i === 1 ? <div>Columns:</div> : <div />}
          <select
            key={key.id + "_" + keycol.id}
            value={keycol.colid}
            onChange={this.handleColumnInKeyChange.bind(
              this,
              key.id,
              keycol.id
            )}
          >
            <option value="0">Select item...</option>
            {this.getKeyDetail(key, keycol)}
          </select>
          <div className="handle im-icon-16">&#xe95f;</div>
          <div
            className="im-icon-sm im-pointer"
            onClick={this.handleColumnInKeyDelete.bind(this, key.id, keycol.id)}
          >
            <i className="im-icon-Trash16 im-icon-16" />
          </div>
        </div>
      );
    });
  }

  async handleCheckboxChangePlatform(keyid, property, platform, event) {
    const checked = event.target.checked;
    const index = this.props.tables[this.props.match.params.id].keys.find(
      (ind) => ind.id === keyid
    );
    const current = index[platform];
    const next = {
      ...current,
      [property]: checked
    };
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.KEYS__UPDATE_KEY_PROPERTY_PLATFORM_BOOLEAN
    );
    try {
      await this.props.updateKeyProperty(
        this.props.match.params.id,
        keyid,
        next,
        platform
      );
    } finally {
      await this.props.finishTransaction();
    }
  }

  getKeyExtendedPropertiesMSSQL(key) {
    return (
      <div className="im-mt">
        <div className="im-properties-grid">
          <div />
          <CheckboxSwitch
            label={`Clustered`}
            checked={key.mssql.clustered ?? false}
            onChange={this.handleCheckboxChangePlatform.bind(
              this,
              key.id,
              "clustered",
              "mssql"
            )}
          />{" "}
        </div>
      </div>
    );
  }

  getExtendedByModelType(key) {
    if (this.props.type === ModelTypes.MSSQL) {
      return this.getKeyExtendedPropertiesMSSQL(key);
    }
  }

  renderResetName(key, canResetName) {
    const className =
      "im-has-tooltip im-relative  im-pointer im-icon-sm" +
      (canResetName ? "" : " im-disabled");
    const classNameImage =
      "im-icon-ResetName im-icon-16" + (canResetName ? "" : " im-disabled");
    return this.props.type === ModelTypes.PG &&
      this.props.nameAutoGeneration.keys ? (
      <div
        className={className}
        onClick={this.resetKeyName.bind(this, key.id, canResetName)}
      >
        <i className={classNameImage} />
        <div className={"im-tooltip im-tooltip-right"}>Reset name</div>
      </div>
    ) : (
      <></>
    );
  }

  getKeysClass() {
    return this.props.type === ModelTypes.PG &&
      this.props.nameAutoGeneration.keys
      ? "im-keys-grid-pg"
      : "im-keys-grid";
  }

  renderKeys() {
    return this.state.keys.map(({ key, canResetName }) => {
      if (key) {
        return (
          <div key={key.id} className={this.getKeysClass()}>
            <div />
            <DebounceInput
              minLength={1}
              debounceTimeout={300}
              type="text"
              size="2"
              value={key.name}
              onChange={this.handleChangeName.bind(this, key.id)}
            />

            {key.isPk === false ? (
              <div
                className="im-pointer im-icon-sm"
                onClick={this.deleteKey.bind(this, key.id)}
              >
                <i className="im-icon-Trash16 im-icon-16" />
              </div>
            ) : (
              <div className="im-icon-sm-disabled">
                <i className="im-disabled im-icon-Trash16 im-icon-16" />
              </div>
            )}
            {this.renderResetName(key, canResetName)}
            <DetailPanel colspan="3">
              <div className="im-new-item-wrapper">
                <button
                  className="im-btn-default im-btn-sm im-sub"
                  onClick={this.handleColumnInKeyAdd.bind(this, key.id)}
                >
                  + Add Column to Key
                </button>
              </div>

              <Sortable
                options={{
                  handle: ".handle",
                  animation: 150,
                  easing: "easeOutBounce",
                  dragoverBubble: true
                }}
                onChange={async (_order, _sortable, evt) => {
                  await this.props.startTransaction(
                    getHistoryContext(this.props.history, this.props.match),
                    UndoRedoDef.KEYS__COLS_REORDER
                  );
                  try {
                    const settings = {
                      type: this.props.type,
                      nameAutoGeneration: this.props.nameAutoGeneration
                    };
                    const autoGeneratedKeys = getAutoGeneratedKeys(
                      settings,
                      this.props.tables,
                      this.props.tables[this.props.match.params.id]
                    );

                    var newSort = arrayMove(
                      key.cols,
                      evt.oldIndex,
                      evt.newIndex
                    );
                    var newKey = Object.assign({}, key);
                    newKey.cols = newSort;

                    var clnActvTbl = _.cloneDeep(
                      this.props.tables[this.props.match.params.id]
                    );
                    var keyToUpdate = _.find(clnActvTbl.keys, ["id", key.id]);
                    keyToUpdate.cols = newSort;

                    clnActvTbl.keys = autoGenerateKeys(
                      clnActvTbl,
                      autoGeneratedKeys,
                      this.props.tables
                    );

                    const dependentRelations = getDependentRelations(
                      this.props.relations,
                      clnActvTbl,
                      key
                    );
                    const autoGeneratedDependentRelations =
                      getAutoGeneratedDependentRelations(
                        settings,
                        this.props.tables,
                        dependentRelations
                      );
                    await this.props.fetchTable(clnActvTbl);
                    await this.updateDepedentRelations(
                      dependentRelations,
                      autoGeneratedDependentRelations,
                      evt
                    );
                  } finally {
                    await this.props.finishTransaction();
                  }
                }}
              >
                {this.getKeyColumns(key)}
              </Sortable>

              {this.getExtendedByModelType(key)}
            </DetailPanel>
          </div>
        );
      }
    });
  }

  async updateDepedentRelations(
    depedentRelations,
    autoGeneratedDependentRelations,
    evt
  ) {
    for (const depedentRelation of depedentRelations) {
      var modifiedRelationCols = arrayMove(
        depedentRelation.cols,
        evt.oldIndex,
        evt.newIndex
      );
      const modifiedDependentRelation = {
        ...depedentRelation,
        cols: modifiedRelationCols
      };
      if (autoGeneratedDependentRelations[depedentRelation.id]) {
        modifiedDependentRelation.name = PGHelpers.makeRelationName(
          modifiedDependentRelation,
          {
            [depedentRelation.child]: this.props.tables[depedentRelation.child]
          },
          this.props.relations
        );
      }

      await this.props.fetchRelation(modifiedDependentRelation);
    }
  }

  render() {
    return (
      <div>
        <div className="im-new-item-wrapper">
          <button
            className="im-btn-default im-btn-sm"
            onClick={this.addKey.bind(this)}
          >
            + Add Key
          </button>
        </div>
        {UIHelpers.getHeader("Key name")}

        {this.renderKeys()}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    type: state.model.type,
    nameAutoGeneration: state.model.nameAutoGeneration,
    tables: state.tables,
    relations: state.relations
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        fetchTable,
        fetchKey,
        deleteKey,
        addColumnToKey,
        removeColumnFromKey,
        updateKeyProperty,
        handleColumnInKeyChange,
        finishTransaction,
        startTransaction,
        fetchRelation,
        updateRelationNames,
        importRelations,
        updateAutoGeneratedNamesForKey,
        changeKey
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Keys));
