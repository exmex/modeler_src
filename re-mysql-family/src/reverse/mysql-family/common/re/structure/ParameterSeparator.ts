export class ParameterSeparator {
    public static separateParameter(type: string): string {
        const splittedType = type.split("(");
        if (splittedType.length > 1) {
            const other = splittedType[1].split(")");
            return other[0];
        }
        return "";
    }
}
