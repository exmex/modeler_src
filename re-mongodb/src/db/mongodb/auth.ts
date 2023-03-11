import { AuthMechanism } from "mongodb";

export interface Auth {
    provide(): { authSource?: string, auth?: { username: string, password: string }, authMechanism?: AuthMechanism }
}