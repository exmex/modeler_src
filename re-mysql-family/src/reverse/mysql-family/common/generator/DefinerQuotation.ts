export class DefinerQuotation {
    public static quoteDefiner(definer: string): string {
        const splitterDefiner = definer.split("@");

        switch (splitterDefiner.length) {
            case 1:
                return `'${splitterDefiner[0]}'`;
            case 2:
                return `'${splitterDefiner[0]}'@'${splitterDefiner[1]}'`;
            default:
                return definer;
        }
    }
}
