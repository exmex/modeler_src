export class CompositeDependencies {
    notCycledComposites(composites, startComposite) {
        if (!startComposite) {
            return composites;
        }

        const dependent = this.findDependentComposites(composites, startComposite);
        const nonDependent = composites
            .reduce((r, i) =>
                startComposite.id === i.id
                    || dependent.find((d) => d.id === i.id) ? r : [...r, i], [])

        return nonDependent;
    }

    findDependentComposites(composites, startComposite) {
        const depedentCompositesOfStartComposite = composites
            .filter((composite) => composite.cols
                .filter((col) => col.datatype === startComposite.id).length > 0);
        const arraysOfAllDepedentCompositesOfStartComposite = depedentCompositesOfStartComposite
            .map((depedentComposite) => this
                .findDependentComposites(composites, depedentComposite));
        const allDepedentCompositesOfStartComposite = arraysOfAllDepedentCompositesOfStartComposite
            .reduce((r, i) => [...r, ...i], [])
        return [
            ...depedentCompositesOfStartComposite,
            ...allDepedentCompositesOfStartComposite]
    }
}