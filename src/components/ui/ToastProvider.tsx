import { Toaster } from "sonner";

export function ToastProvider() {
  return (
    <Toaster
      position="bottom-center"
      richColors
      toastOptions={{
        className: "font-body",
      }}
    />
  );
}
