import { RouterProvider } from "react-router";
import { router } from "./routes";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";

import { LoadingPage } from "./components/loading-page";

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <RouterProvider router={router} fallbackElement={<LoadingPage />} />
      <Toaster 
        position="top-right" 
        richColors
        toastOptions={{
          style: {
            borderRadius: '12px',
            padding: '16px 20px',
            fontSize: '14px',
            fontWeight: '500',
            border: '1px solid',
          },
          classNames: {
            toast: 'backdrop-blur-sm shadow-lg',
            title: 'font-semibold',
            description: 'text-sm',
          },
        }}
      />
    </ThemeProvider>
  );
}

export default App;