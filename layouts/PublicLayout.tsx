import Footer from "@/components/navigation/public/Footer";
import NavBar from "@/components/navigation/public/NavBar";
import React, { ReactNode } from "react";

const PublicLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="grid min-h-screen bg-slate-50">
      <NavBar />
      {children}
      <Footer />
    </div>
  );
};

export default PublicLayout;
