import { useSyncExternalStore } from "react";

import { getServerStatus, subscribeToServerStatus } from "@/features/server-status/server-status";

export const useServerStatus = () => useSyncExternalStore(subscribeToServerStatus, getServerStatus);
