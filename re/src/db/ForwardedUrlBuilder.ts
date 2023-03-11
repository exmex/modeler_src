import { URL, URLSearchParams } from "url";

export class ForwardedUrlBuilder {
    public build(url: string, searchParams: URLSearchParams): string {
        const forwardedUrl = new URL(url);
        searchParams.forEach((value, param) => {
            forwardedUrl.searchParams.append(param, value);
        });
        return forwardedUrl.toString();
    }
}