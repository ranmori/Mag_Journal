import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import Navbar from "./Navbar.jsx";
import { useLocation } from "react-router-dom";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
const hideChrome = location.pathname.startsWith("/viewer");

  return (
    <div className="flex flex-col h-screen">
  {!hideChrome && <Navbar toggleSidebar={() => setSidebarOpen((v) => !v)} />}

  <div className="flex flex-1">
    {!hideChrome && <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />}
    <main className="flex-1 overflow-auto">
      <Outlet />
    </main>
  </div>
</div>
  );
}