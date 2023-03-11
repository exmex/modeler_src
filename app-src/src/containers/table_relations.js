import { RELATION, TABLE } from "../components/url_navigation";
import React, { Component } from "react";

import ObjCaption from "../components/obj_caption";
import ObjLink from "../components/obj_link";
import _ from "lodash";

class Relations extends Component {
  getRelationDetail(rid) {
    const relation = this.props.relations[rid];

    if (relation) {
      const parent = this.props.tables[relation.parent];
      const child = this.props.tables[relation.child];
      const isSelf = parent.id === child.id;

      const relationLinkProps = {
        caption: "Name",
        linkedItem: { item: relation, objectType: RELATION }
      };

      const parentLinkProps = {
        caption: "Parent",
        linkedItem: { item: parent, objectType: TABLE }
      };
      const childLinkProps = {
        caption: "Child",
        linkedItem: { item: child, objectType: TABLE }
      };

      const selfLinkProps = {
        caption: "Self",
        linkedItem: { item: child, objectType: TABLE }
      };

      return (
        <div className="im-subpanel-rel">
          <ObjLink {...relationLinkProps} />

          {isSelf && <ObjCaption {...selfLinkProps} />}

          {this.props.table?.id === parent.id && !isSelf && (
            <ObjLink {...childLinkProps} />
          )}
          {this.props.table?.id === child.id && !isSelf && (
            <ObjLink {...parentLinkProps} />
          )}
        </div>
      );
    }
  }

  renderRelations(relations) {
    return relations.map((rid) => {
      return <div key={rid}>{this.getRelationDetail(rid)}</div>;
    });
  }

  render() {
    return (
      <div className="im-subpanel">
        {_.size(this.props.table?.relations) < 1 && (
          <div className="im-message">
            No {this.props.localization.L_RELATION} exists
          </div>
        )}

        {this.props.table?.relations &&
          this.renderRelations(this.props.table.relations)}
      </div>
    );
  }
}

export default Relations;
