export class ViewMetadata {
    public securityType: string;
    public name: string;
    public viewDefinition: string;
    public checkOption: string;
    public definer: string;
    public algorithm: string;

    public constructor(
        securityType: string,
        name: string,
        viewDefinition: string,
        checkOption: string,
        definer: string,
        algorithm: string,
    ) {
        this.securityType = securityType;
        this.name = name;
        this.viewDefinition = viewDefinition;
        this.checkOption = checkOption;
        this.definer = definer;
        this.algorithm = algorithm;
    }
}
