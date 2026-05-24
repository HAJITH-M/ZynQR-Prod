import "./App.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { Toaster } from "sonner";
import PWAUpdatePrompt from "./components/pwa/PWAUpdatePrompt";
import router from "./router";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      /** Retrying 429 counts against the same rate limit and amplifies “storm” traffic. */
      retry(failureCount, error) {
        const status = error?.response?.status;
        if (status === 429 || status === 401 || status === 403) return false;
        return failureCount < 2;
      },
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <PWAUpdatePrompt />
      <Toaster
        closeButton
        position="top-center"
        richColors
        toastOptions={{
          classNames: {
            toast: "font-body",
            title: "font-semibold",
            description: "text-sm opacity-90",
          },
        }}
      />
    </QueryClientProvider>
  );
}

export default App
