import { Features } from "../reverse/common/Features";
import { Platform } from "./Platform";

export interface HandledConnection<T extends Features> {
  getFeatures(): Promise<T>;
  getServerVersion(): Promise<string>;
  getServerDescription(): Promise<string>;
  getServerPlarform(): Promise<Platform>;
  close(): Promise<void>;
}
