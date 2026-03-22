import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Outlet, useLocation, useNavigate } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CreateCompany from "./pages/CreateCompany";
import BusinessSummary from "./pages/BusinessSummary";
import AssetsLiabilities from "./pages/AssetsLiabilities";
import Customers from "./pages/Customers";
import Suppliers from "./pages/Suppliers";
import MoneyIn from "./pages/MoneyIn";
import MoneyOut from "./pages/MoneyOut";
import SmartEntry from "./pages/SmartEntry";
import DownloadBalanceSheet from "./pages/DownloadBalanceSheet";

const AppLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let company = null;
    let userId = null;
    try {
      company = JSON.parse(localStorage.getItem("sbfm_company") || "null");
      userId = JSON.parse(localStorage.getItem("sbfm_user") || "{}").id || null;
    } catch {}

    const hasCompany =
      company &&
      (company.id || company.name) &&
      (!company.ownerId || !userId || company.ownerId === userId);
    const isCreateCompany = location.pathname === "/app/create-company";
    if (!hasCompany && !isCreateCompany) {
      navigate("/app/create-company", { replace: true });
    }
  }, [location.pathname, navigate]);

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-area">
        <Header />
        <div className="page-area">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="create-company" element={<CreateCompany />} />
          <Route path="summary" element={<BusinessSummary />} />
          <Route path="assets-liabilities" element={<AssetsLiabilities />} />
          <Route path="download-balance-sheet" element={<DownloadBalanceSheet />} />
          <Route path="customers" element={<Customers />} />
          <Route path="suppliers" element={<Suppliers />} />
          <Route path="money-in" element={<MoneyIn />} />
          <Route path="money-out" element={<MoneyOut />} />
          <Route path="smart-entry" element={<SmartEntry />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
