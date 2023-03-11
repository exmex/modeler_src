export class RelationChecker {
    pgAllowedRelationTarget(source, target, modelType) {
        return (
            (
                modelType === "PG"
                && target.embeddable === false
                && source.embeddable === false
                && target.objectType !== "composite"
                && source.objectType !== "composite"
            )
            || modelType !== "PG"
        );
    }

    otherAllowedRelationTarget(source, target, modelType) {
        return (
            (
                modelType === "PG"
                || modelType === "MONGODB"
            )
            ||
            (
                (
                    modelType !== "PG"
                    && modelType !== "MONGODB"
                )
                && source.embeddable === false
                && target.embeddable === false
            )
        )
    }


    mongoDbAllowedRelationTarget(source, modelType) {
        return (
            (modelType === "MONGODB"
                && source.embeddable === false
            )
            ||
            modelType !== "MONGODB")
    }

    allowedRelationTarget(newRelation, modelType, tables) {
        const source = tables[newRelation.sourceId];
        const target = tables[newRelation.targetId];
        return (
            this.pgAllowedRelationTarget(source, target, modelType)
            && this.mongoDbAllowedRelationTarget(source, modelType)
            && this.otherAllowedRelationTarget(source, target, modelType)
        );
    }
}