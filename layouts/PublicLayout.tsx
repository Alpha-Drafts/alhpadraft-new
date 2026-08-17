import Footer from "@/components/navigation/public/Footer";
import NavBar from "@/components/navigation/public/NavBar";
import React, { ReactNode } from "react";

const PublicLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div
      className="grid min-h-screen"
      style={{ backgroundColor: "var(--color-surface-background)" }}
    >
      <NavBar />
      {children}
      <Footer />
    </div>
  );
};

export default PublicLayout;
