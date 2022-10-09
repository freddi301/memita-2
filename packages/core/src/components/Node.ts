import { UiApi } from "./Api";
import { TablesDataGatewayInstance } from "./Tables";
import _ from "lodash";
import { createSynchronizationCommands } from "./SynchronizationCommands";
import { createUiQueries } from "./UiQueries";
import { createUiCommands } from "./UiCommands";
import { createConnectivityService } from "./ConnectivityService";

export async function createNode({ tables, filesPath }: { filesPath: string; tables: TablesDataGatewayInstance }) {
  const synchronizationCommands = createSynchronizationCommands({ tables });
  const uiQueries = createUiQueries({ tables, filesPath });
  const uiCommands = createUiCommands({ tables });

  const connectivityManager = createConnectivityService(() => {});

  let stopped = false;
  async function stop() {
    if (!stopped) {
      stopped = true;
      await connectivityManager.stop();
      await tables.close();
    }
  }

  const uiApi: UiApi = {
    ...synchronizationCommands,
    ...uiCommands,
    ...uiQueries,
    ...connectivityManager.uiApi,
  };

  const driverApi = {
    stop,
  };

  return {
    uiApi,
    driverApi,
  };
}
