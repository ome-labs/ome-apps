// What every settings page reads: the daemon's status, its settings and its own description. Cached by the queries.
import type { DaemonInfo, Settings, Status } from "@ome-labs/api";

import { useOme } from "../data/ome.ts";

export interface SettingsData {
  status: Status & { profile: NonNullable<Status["profile"]> };
  settings: Settings;
  info: DaemonInfo | undefined;
}

/** The data, once the status (with a profile) and the settings are in. */
export function useSettingsData(): SettingsData | undefined {
  const status = useOme("status", {});
  const config = useOme("config.get", {});
  const info = useOme("daemon.info", {});
  const profile = status.data?.profile;
  if (!status.data || !profile || !config.data) return undefined;
  return { status: { ...status.data, profile }, settings: config.data, info: info.data };
}
