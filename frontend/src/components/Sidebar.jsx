import React from "react";
import { Link, NavLink } from "react-router-dom";
import finliteLogo from "./Finlite logo.png";

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <Link className="sidebar-logo" to="/app">
        <img className="sidebar-logo-image" src={finliteLogo} alt="FinLite logo" />
      </Link>
      <nav className="nav">
        <NavLink to="/app" end>Dashboard</NavLink>
        <NavLink to="/app/summary">Business Summary</NavLink>
        <NavLink to="/app/assets-liabilities">Business Details</NavLink>
        <NavLink to="/app/customers">Customers</NavLink>
        <NavLink to="/app/suppliers">Suppliers</NavLink>
        <NavLink to="/app/money-in">Money In</NavLink>
        <NavLink to="/app/money-out">Money Out</NavLink>
        <NavLink to="/app/smart-entry">Smart Entry</NavLink>
        <NavLink to="/app/download-balance-sheet">Download Report</NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
