import { Ssh } from "./ssh";

export class NoSsh implements Ssh {
    provide() {
        return Promise.resolve({});
    }
}