import { Features } from "re";

export interface MySQLFamilyFeatures extends Features {
    /** Maria */
    fulltextIndexColumn(): boolean;

    /** Maria */
    JSON(): boolean;

    /** Maria */
    expressionBrackets(): boolean;

    /** Maria */
    virtualColumns(): boolean;

    /** Maria */
    aggregateFunction(): boolean;

    /** Maria */
    checkConstraint(): boolean;

    /** Maria */
    generationExpression(): boolean;

    /** Maria */
    compressedColumn(): boolean;

    /** MySQL */
    viewAlgorithm(): boolean;

    /** MySQL */
    generatedColumnExtraBrackets(): boolean;

    /** Maria */
    virtualColumnPersistant(): boolean;

    /** Maria */
    implicitFunctionContainsSQL(): boolean;

    expressionGeneratedExtraDefault(): boolean;

    expressionQuotedDefault(): boolean;

    expressionDefault(): boolean;

    escapedDefault(): boolean;

    expressionBracketsDefault(): boolean;

    modelType(): string;

    schemaComments(): boolean;

    schemaMySQLAvailable(): boolean;
}
