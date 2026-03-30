import React, { useEffect, useMemo, useState } from "react";
import { fetchIncome, fetchExpense, getCompanyByOwner } from "../services/api";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";

const BusinessSummary = () => {
  const [income, setIncome] = useState([]);
  const [expense, setExpense] = useState([]);
  const [company, setCompany] = useState({});

  useEffect(() => {
    let ownerId = null;
    let companyId = null;
    try {
      const user = JSON.parse(localStorage.getItem("sbfm_user") || "{}");
      ownerId = user.id || null;
      companyId = JSON.parse(localStorage.getItem("sbfm_company") || "{}").id || null;
    } catch {}

    if (ownerId) {
      getCompanyByOwner(ownerId)
        .then((data) => setCompany(data || {}))
        .catch(() => setCompany({}));
    }

    fetchIncome(companyId)
      .then((data) => setIncome(Array.isArray(data) ? data : []))
      .catch(() => setIncome([]));
    fetchExpense(companyId)
      .then((data) => setExpense(Array.isArray(data) ? data : []))
      .catch(() => setExpense([]));
  }, []);

  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  const monthlyIncome = income.filter((t) => {
    const d = new Date(t.createdAt || t.date || now);
    return d.getMonth() === month && d.getFullYear() === year;
  });

  const monthlyExpense = expense.filter((t) => {
    const d = new Date(t.createdAt || t.date || now);
    return d.getMonth() === month && d.getFullYear() === year;
  });

  const monthlyTransactions = useMemo(() => {
    const isPendingEntry = (t) =>
      t?.pending === true ||
      t?.pending === "true" ||
      (t?.pending == null && !t?.paymentMode);

    const mappedIncome = monthlyIncome.map((t) => {
      const pending = isPendingEntry(t);
      return {
        type: "income",
        amount: Number(t.amount || 0),
        paymentMode: t.paymentMode || "-",
        status: pending ? "Pending" : "Received",
        name: t.customerName || t.receivedFrom || "Customer",
        category: t.category || "Sales",
        date: t.transactionDate || t.createdAt || t.date || null,
      };
    });
    const mappedExpense = monthlyExpense.map((t) => {
      const pending = isPendingEntry(t);
      return {
        type: "expense",
        amount: Number(t.amount || 0),
        paymentMode: t.paymentMode || "-",
        status: pending ? "Pending" : "Paid",
        name: t.paidTo || "Supplier",
        category: t.category || "Other",
        date: t.transactionDate || t.createdAt || t.date || null,
      };
    });
    return [...mappedIncome, ...mappedExpense].sort((a, b) => {
      const da = a.date ? new Date(a.date).getTime() : 0;
      const db = b.date ? new Date(b.date).getTime() : 0;
      return db - da;
    });
  }, [monthlyIncome, monthlyExpense]);

  const totalIncome = monthlyIncome.reduce((s, t) => s + Number(t.amount || 0), 0);
  const totalExpense = monthlyExpense.reduce((s, t) => s + Number(t.amount || 0), 0);
  const pendingPayments =
    monthlyIncome.filter((t) => t.pending).reduce((s, t) => s + Number(t.amount || 0), 0) +
    monthlyExpense.filter((t) => t.pending).reduce((s, t) => s + Number(t.amount || 0), 0);

  const formatCurrency = (value) =>
    `\u20B9${Number(value || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const allIncome = income.reduce((s, t) => s + Number(t.amount || 0), 0);
  const allExpense = expense.reduce((s, t) => s + Number(t.amount || 0), 0);
  const retainedEarnings = allIncome - allExpense;

  const sumByMode = (entries, mode) =>
    entries
      .filter((e) => String(e.paymentMode || "").toLowerCase() === mode)
      .filter((e) => !e.pending)
      .reduce((s, e) => s + Number(e.amount || 0), 0);

  const openingCash = Number(company.openingCash || 0);
  const openingBank = Number(company.openingBank || 0);
  const cash = openingCash + sumByMode(income, "cash") - sumByMode(expense, "cash");
  const bank = openingBank + sumByMode(income, "bank") - sumByMode(expense, "bank");
  const upi = sumByMode(income, "upi") - sumByMode(expense, "upi");
  const wallet = sumByMode(income, "wallet") - sumByMode(expense, "wallet");
  const businessMoney = cash + bank + upi + wallet;
  const netProfit = totalIncome - totalExpense;
  const growthRate = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;
  const accountsReceivable = income.filter((t) => t.pending).reduce((s, t) => s + Number(t.amount || 0), 0);
  const accountsPayable = expense.filter((t) => t.pending).reduce((s, t) => s + Number(t.amount || 0), 0);

  const balanceSheet = {
    assets: {
      cash,
      bank,
      upi,
      wallet,
      inventory: 0,
      machinery: 0,
      building: 0,
      accountsReceivable,
    },
    liabilities: {
      loans: 0,
      creditors: accountsPayable,
      taxesPayable: 0,
    },
    equity: {
      ownerCapital: Number(company.ownerCapital || 0),
      retainedEarnings,
      profitLoss: retainedEarnings,
    },
  };

  const downloadBalanceSheetPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Balance Sheet", 14, 16);
    doc.setFontSize(10);
    doc.text(`Company: ${company.name || "Business"}`, 14, 24);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 30);

    const rows = [
      ["Assets", ""],
      ["Cash", `INR ${balanceSheet.assets.cash.toLocaleString()}`],
      ["Bank", `INR ${balanceSheet.assets.bank.toLocaleString()}`],
      ["UPI", `INR ${balanceSheet.assets.upi.toLocaleString()}`],
      ["Wallet", `INR ${balanceSheet.assets.wallet.toLocaleString()}`],
      ["Inventory", `INR ${balanceSheet.assets.inventory.toLocaleString()}`],
      ["Machinery", `INR ${balanceSheet.assets.machinery.toLocaleString()}`],
      ["Building", `INR ${balanceSheet.assets.building.toLocaleString()}`],
      ["Accounts Receivable", `INR ${balanceSheet.assets.accountsReceivable.toLocaleString()}`],
      ["", ""],
      ["Liabilities", ""],
      ["Loans", `INR ${balanceSheet.liabilities.loans.toLocaleString()}`],
      ["Creditors / Accounts Payable", `INR ${balanceSheet.liabilities.creditors.toLocaleString()}`],
      ["Taxes Payable", `INR ${balanceSheet.liabilities.taxesPayable.toLocaleString()}`],
      ["", ""],
      ["Equity", ""],
      ["Owner's Capital", `INR ${balanceSheet.equity.ownerCapital.toLocaleString()}`],
      ["Retained Earnings", `INR ${balanceSheet.equity.retainedEarnings.toLocaleString()}`],
      ["Profit / Loss", `INR ${balanceSheet.equity.profitLoss.toLocaleString()}`],
    ];

    let y = 40;
    rows.forEach(([label, value]) => {
      doc.text(label, 14, y);
      doc.text(value, 120, y);
      y += 6;
    });

    doc.save("balance-sheet.pdf");
  };

  const downloadBalanceSheetXlsx = () => {
    const data = [
      ["Section", "Item", "Amount (INR)"],
      ["Assets", "Cash", balanceSheet.assets.cash],
      ["Assets", "Bank", balanceSheet.assets.bank],
      ["Assets", "UPI", balanceSheet.assets.upi],
      ["Assets", "Wallet", balanceSheet.assets.wallet],
      ["Assets", "Inventory", balanceSheet.assets.inventory],
      ["Assets", "Machinery", balanceSheet.assets.machinery],
      ["Assets", "Building", balanceSheet.assets.building],
      ["Assets", "Accounts Receivable", balanceSheet.assets.accountsReceivable],
      ["Liabilities", "Loans", balanceSheet.liabilities.loans],
      ["Liabilities", "Creditors / Accounts Payable", balanceSheet.liabilities.creditors],
      ["Liabilities", "Taxes Payable", balanceSheet.liabilities.taxesPayable],
      ["Equity", "Owner's Capital", balanceSheet.equity.ownerCapital],
      ["Equity", "Retained Earnings", balanceSheet.equity.retainedEarnings],
      ["Equity", "Profit / Loss", balanceSheet.equity.profitLoss],
    ];
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "BalanceSheet");
    XLSX.writeFile(wb, "balance-sheet.xlsx");
  };

  const downloadTaxReportPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Business Report (Tax Filing)", 14, 16);
    doc.setFontSize(10);
    doc.text(`Company: ${company.name || "Business"}`, 14, 24);
    doc.text(`Financial Year Start: ${company.fiscalStart || "-"}`, 14, 30);

    doc.text(`Total Income: INR ${allIncome.toLocaleString()}`, 14, 38);
    doc.text(`Total Expense: INR ${allExpense.toLocaleString()}`, 14, 44);
    doc.text(`Profit/Loss: INR ${(allIncome - allExpense).toLocaleString()}`, 14, 50);

    let y = 60;
    doc.setFontSize(11);
    doc.text("Transactions", 14, y);
    y += 6;
    doc.setFontSize(9);
    const rows = [...income, ...expense]
      .map((t) => ({
        date: t.createdAt ? new Date(t.createdAt).toLocaleDateString() : "-",
        type: t.customerName || t.paidTo ? (t.paidTo ? "Expense" : "Income") : "Entry",
        name: t.customerName || t.paidTo || "-",
        amount: Number(t.amount || 0),
        mode: t.paymentMode || "-",
      }))
      .slice(0, 40);

    rows.forEach((r) => {
      doc.text(`${r.date} | ${r.type} | ${r.name} | INR ${r.amount.toLocaleString()} | ${r.mode}`, 14, y);
      y += 5;
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
    });

    doc.save("tax-report.pdf");
  };

  return (
    <div className="page business-summary-page">
      <div className="summary-stats">
        <div className="summary-stat-card">
          <div className="summary-stat-head">
            <div className="summary-stat-label">Business Money</div>
            <div className="summary-stat-icon">₹</div>
          </div>
          <div className="summary-stat-value">{formatCurrency(businessMoney)}</div>
          <div className="summary-stat-chip positive">Available across cash, bank and UPI</div>
        </div>

        <div className="summary-stat-card">
          <div className="summary-stat-head">
            <div className="summary-stat-label">Money In (This Month)</div>
            <div className="summary-stat-icon">↗</div>
          </div>
          <div className="summary-stat-value">{formatCurrency(totalIncome)}</div>
          <div className="summary-stat-chip positive">Income collected this month</div>
        </div>

        <div className="summary-stat-card">
          <div className="summary-stat-head">
            <div className="summary-stat-label">Money Out (This Month)</div>
            <div className="summary-stat-icon">↘</div>
          </div>
          <div className="summary-stat-value">{formatCurrency(totalExpense)}</div>
          <div className="summary-stat-chip negative">Expenses paid this month</div>
        </div>

        <div className="summary-stat-card">
          <div className="summary-stat-head">
            <div className="summary-stat-label">Pending Payments</div>
            <div className="summary-stat-icon">%</div>
          </div>
          <div className="summary-stat-value">{formatCurrency(pendingPayments)}</div>
          <div className="summary-stat-chip neutral">
            {`${growthRate >= 0 ? "+" : ""}${growthRate.toFixed(1)}% monthly balance`}
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Monthly Transaction History</h3>
        <div className="table summary-table">
          <div className="table-row table-head">
            <div>Date</div>
            <div>Name</div>
            <div>Type</div>
            <div>Category</div>
            <div>Amount</div>
            <div>Mode</div>
            <div>Status</div>
          </div>
          {monthlyTransactions.length === 0 && (
            <div className="table-row">
              <div className="muted">No transactions this month.</div>
            </div>
          )}
          {monthlyTransactions.map((t, idx) => (
            <div key={`${t.type}-${idx}`} className="table-row">
              <div>{t.date ? new Date(t.date).toLocaleDateString() : "-"}</div>
              <div>{t.name}</div>
              <div className={`pill ${t.type}`}>{t.type === "income" ? "Money In" : "Money Out"}</div>
              <div>{t.category}</div>
              <div className={`amount ${t.type}`}>{formatCurrency(t.amount)}</div>
              <div>{t.paymentMode}</div>
              <div>
                <span className={`money-status ${t.status === "Pending" ? "pending" : "paid"}`}>
                  {t.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BusinessSummary;
