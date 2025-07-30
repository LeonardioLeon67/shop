"use client";

import { ReactNode } from "react";
import { Toaster } from "react-hot-toast";

const ClientLayout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      {/* Toast notifications */}
      <Toaster
        toastOptions={{
          duration: 3000,
        }}
      />
      {children}
    </>
  );
};

export default ClientLayout;