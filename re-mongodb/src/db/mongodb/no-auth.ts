import { Auth } from "./auth";

export class NoAuth implements Auth {
    public constructor() {
    }

    public provide() {
        return {}
    }
}