import { ModelPartProvider } from "re";
import { OtherObjects } from "common"

export class GraphQLOtherObjectsProvider implements ModelPartProvider<OtherObjects> {
    private enumProvider: ModelPartProvider<OtherObjects>;
    private queryProvider: ModelPartProvider<OtherObjects>;
    private mutationProvider: ModelPartProvider<OtherObjects>;
    private scalarProvider: ModelPartProvider<OtherObjects>;

    public constructor(
        enumProvider: ModelPartProvider<OtherObjects>,
        queryProvider: ModelPartProvider<OtherObjects>,
        mutationProvider: ModelPartProvider<OtherObjects>,
        scalarProvider: ModelPartProvider<OtherObjects>,
    ) {
        this.enumProvider = enumProvider;
        this.queryProvider = queryProvider;
        this.mutationProvider = mutationProvider;
        this.scalarProvider = scalarProvider;
    }
    public async provide(): Promise<OtherObjects> {
        return {
            ...(await this.enumProvider.provide()),
            ...(await this.queryProvider.provide()),
            ...(await this.mutationProvider.provide()),
            ...(await this.scalarProvider.provide()),
        }
    }
}
