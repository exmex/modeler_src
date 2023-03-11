import { Auth } from "./auth";
import { AuthMechanism } from "mongodb";

export class DefaultAuth implements Auth {
    public constructor(public username: string, public password: string, public authSource: string, public authMechanism: string) {
    }

    public provide() {
        if (this.username === "") {
            throw new Error("Default authentication problem. User has to be filled in.")
        }
        return { authSource: this.authSource, auth: { username: this.username, password: this.password }, authMechanism: this.authMechanism as AuthMechanism }
    }
}