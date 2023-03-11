import {
    buildClientSchema,
    getIntrospectionQuery,
    printSchema,
} from "graphql";

import { ConnectionProvider } from "re";
import { GraphQLFeatures } from "./GraphQLFeatures";
import { GraphQLHandledConnection } from "./GraphQLHandledConnection";
import { GraphQLSchemaParser } from "./GraphQLSchemaParser";
import { GraphQLSchemaPreprocessor } from "./GraphQLSchemaPreprocessor";
import axios from "axios";
import fs from "fs";
import https from "https";

const FILE_SOURCE_TYPE = "file";

export class GraphQLConnectionProvider implements ConnectionProvider<GraphQLFeatures, GraphQLHandledConnection> {

    public constructor(private sourceType: string, private source: string) { }

    public async createConnection(): Promise<GraphQLHandledConnection> {
        const schemaText = this.isFileSource()
            ? await this.getSchemaTextFromFile()
            : await this.getSchemaTextFromUrl();

        const preprocessor = new GraphQLSchemaPreprocessor(schemaText);
        const { document, script } = preprocessor.parseDocument();
        const parser = new GraphQLSchemaParser(document, script);
        return new GraphQLHandledConnection(parser);
    }

    private isFileSource() {
        return this.sourceType === FILE_SOURCE_TYPE;
    }

    private async getSchemaTextFromUrl() {
        let result;
        try {
            const agent = new https.Agent({
                rejectUnauthorized: false
            });
            result = await axios.post(this.source, {
                query: getIntrospectionQuery(),
            }, {
                httpsAgent: agent
            });
        } catch (e) {
            throw new Error((e as Error).message);
        }
        const schema = buildClientSchema(result.data.data);
        return printSchema(schema);
    }

    private async getSchemaTextFromFile() {
        const schemaFileBuffer = await fs.promises.readFile(this.source);
        return schemaFileBuffer.toString();
    }
}
