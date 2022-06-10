import React from "react";
import { createRoot } from "react-dom/client";
import {
  useQuery,
  QueryClient,
  QueryClientProvider,
  useMutation,
} from "react-query";

const queryClient = new QueryClient();

createRoot(document.getElementById("root") as Element).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);

function App() {
  const [text, setText] = React.useState("");
  const blockMutation = useMutation(window.electronAPI.addBlock, {
    onSuccess() {
      queryClient.invalidateQueries("blocks");
      setText("");
    },
  });
  const blocksQuery = useQuery(["blocks"], async () => {
    return window.electronAPI.getBlocks();
  });
  return (
    <div>
      <button
        onClick={() => {
          blockMutation.mutate(text);
        }}
      >
        add
      </button>
      <textarea
        value={text}
        onChange={(event) => setText(event.currentTarget.value)}
      />
      <div>
        {blocksQuery.data?.map((block) => {
          return <pre key={block}>{block}</pre>;
        })}
      </div>
    </div>
  );
}
