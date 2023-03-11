export class DependenciesRegistry {
    private dependencies: { [key: string]: { parentId: string, parentName: string, childId: string, childName: string } } = {};

    public registerDependencies(parentId: string, parentName: string, childId: string, childName: string): void {
        if ((!this.dependencies[`${parentId}-${childId}`]) && (parentId !== childId)) {
            this.dependencies[`${parentId}-${childId}`] = { parentId, childId, parentName, childName }
        }
    }

    public orderObjects(objectIds: string[]): string[] {
        const result: string[] = [];
        objectIds.forEach(id => {
            this.addAfterAllParents(result, id, []);
        })

        return result;
    }

    private addAfterAllParents(result: string[], id: string, visited: string[]) {
        if (visited.includes(id)) {
            console.log("Cycle found in order definition.");
            return;
        }
        visited.push(id);
        if (!result.find(id1 => id1 === id)) {
            const allParents = this.dependenciesArray.filter(dependency => dependency.childId === id);
            allParents.forEach((item) => {
                this.addAfterAllParents(result, item.parentId, visited)
            });
            result.push(id);
        }
    }

    private get dependenciesArray() {
        return Object.keys(this.dependencies).map(key => this.dependencies[key]);
    }
}