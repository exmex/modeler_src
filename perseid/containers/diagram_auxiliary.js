import ColumnDropDown from "./dropdowns/column_dropdown";
import ConfirmDelete from "./confirmations/confirm_delete";
import ConfirmDeleteDiagram from "./confirmations/confirm_delete_diagram";
import ConfirmDeleteLine from "./confirmations/confirm_delete_line";
import ConfirmDeleteRelation from "./confirmations/confirm_delete_relation";
import { DROPDOWN_MENU } from "../actions/ui";
import DiagramDropDown from "./dropdowns/diagram_dropdown";
import DiagramItemDropDown from "./dropdowns/diagram_item_dropdown";
import LineDropDown from "./dropdowns/line_dropdown";
import ModalAddDiagramsByContainers from "./modals/modal_add_diagrams_by_containers";
import ModalAddToAnotherDiagram from "./modals/modal_add_to_another_diagram";
import ModalBrowserSettings from "./modals/modal_browser_settings";
import ModalColumn from "./modals/modal_column";
import ModalDiagram from "./modals/modal_diagram";
import ModalDiagramItems from "./modals/modal_diagram_items";
import ModalIndexAssistant from "./modals/modal_index_assistant";
import ModalLine from "./modals/modal_line";
import ModalModel from "./modals/modal_model";
import ModalNote from "./modals/modal_note";
import ModalOrderItems from "./modals/modal_order_items";
import ModalOtherObject from "./modals/modal_other_object";
import ModalRelation from "./modals/modal_relation";
import ModalSql from "./modals/modal_sql";
import ModalTable from "./modals/modal_table";
import ModelDropDown from "./dropdowns/model_dropdown";
import React from "react";
import RelationDropDown from "./dropdowns/relation_dropdown";
import { connect } from "react-redux";
import { withRouter } from "react-router";

const DiagramAuxiliary = (props) => {
  return (
    <>
      {props.dropDownMenu?.type === DROPDOWN_MENU.RELATION && (
        <RelationDropDown />
      )}

      {props.dropDownMenu?.type === DROPDOWN_MENU.DIAGRAM_ITEM && (
        <DiagramItemDropDown />
      )}
      {props.dropDownMenu?.type === DROPDOWN_MENU.PROJECT && <ModelDropDown />}
      {props.dropDownMenu?.type === DROPDOWN_MENU.DIAGRAM && (
        <DiagramDropDown />
      )}
      {props.dropDownMenu?.type === DROPDOWN_MENU.LINE && <LineDropDown />}
      {props.dropDownMenu?.type === DROPDOWN_MENU.COLUMN && <ColumnDropDown />}

      {props.relationModalIsDisplayed === true && <ModalRelation />}
      {props.modelModalIsDisplayed && <ModalModel />}
      {props.tableModalIsDisplayed && <ModalTable />}
      {props.columnModalIsDisplayed && <ModalColumn />}
      {props.indexAssistantModalIsDisplayed && <ModalIndexAssistant />}
      {props.noteModalIsDisplayed && <ModalNote />}
      {props.otherObjectModalIsDisplayed && <ModalOtherObject />}
      {props.lineModalIsDisplayed && <ModalLine />}
      {props.textEditorModalIsDisplayed && props.textEditorComponent}
      {props.sqlModalIsDisplayed && <ModalSql />}
      {props.diagramModalIsDisplayed && <ModalDiagram />}
      {props.diagramItemsModalIsDisplayed && <ModalDiagramItems />}
      {props.orderItemsModalIsDisplayed && <ModalOrderItems />}
      {props.addDiagramsByContainersModalIsDisplayed && (
        <ModalAddDiagramsByContainers />
      )}
      {props.addToAnotherDiagramModalIsDisplayed && (
        <ModalAddToAnotherDiagram />
      )}

      {props.confirmDeleteRelationIsDisplayed && <ConfirmDeleteRelation />}
      {props.confirmDeleteIsDisplayed && <ConfirmDelete />}
      {props.confirmDeleteLineIsDisplayed && <ConfirmDeleteLine />}
      {props.confirmDeleteDiagramIsDisplayed && <ConfirmDeleteDiagram />}
      {props.browserSettingsModalIsDisplayed && <ModalBrowserSettings />}
    </>
  );
};

function mapStateToProps(state) {
  return {
    addDiagramsByContainersModalIsDisplayed:
      state.ui.addDiagramsByContainersModalIsDisplayed,
    addToAnotherDiagramModalIsDisplayed:
      state.ui.addToAnotherDiagramModalIsDisplayed,
    dropDownMenu: state.ui.dropDownMenu,
    confirmDeleteIsDisplayed: state.ui.confirmDeleteIsDisplayed,
    tableModalIsDisplayed: state.ui.tableModalIsDisplayed,
    columnModalIsDisplayed: state.ui.columnModalIsDisplayed,
    diagramItemsModalIsDisplayed: state.ui.diagramItemsModalIsDisplayed,
    sqlModalIsDisplayed: state.ui.sqlModalIsDisplayed,
    relationModalIsDisplayed: state.ui.relationModalIsDisplayed,
    confirmDeleteRelationIsDisplayed: state.ui.confirmDeleteRelationIsDisplayed,
    confirmDeleteDiagramIsDisplayed: state.ui.confirmDeleteDiagramIsDisplayed,
    confirmDeleteLineIsDisplayed: state.ui.confirmDeleteLineIsDisplayed,
    modelModalIsDisplayed: state.ui.modelModalIsDisplayed,
    indexAssistantModalIsDisplayed: state.ui.indexAssistantModalIsDisplayed,
    noteModalIsDisplayed: state.ui.noteModalIsDisplayed,
    otherObjectModalIsDisplayed: state.ui.otherObjectModalIsDisplayed,
    lineModalIsDisplayed: state.ui.lineModalIsDisplayed,
    textEditorModalIsDisplayed: state.ui.textEditorModalIsDisplayed,
    diagramModalIsDisplayed: state.ui.diagramModalIsDisplayed,
    orderItemsModalIsDisplayed: state.ui.orderItemsModalIsDisplayed,
    browserSettingsModalIsDisplayed: state.ui.browserSettingsModalIsDisplayed,
    specificationAssistantModalIsDisplayed:
      state.ui.specificationAssistantModalIsDisplayed,
    textEditorComponent: state.ui.textEdiorComponent
  };
}

export default withRouter(connect(mapStateToProps)(DiagramAuxiliary));
