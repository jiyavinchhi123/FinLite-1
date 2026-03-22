import React, { useEffect, useState } from "react";
import { getCompanyByOwner, fetchIncome, fetchExpense } from "../services/api";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";

const DownloadBalanceSheet = () => {
  const [company, setCompany] = useState({});
  const [income, setIncome] = useState([]);
  const [expense, setExpense] = useState([]);

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

  const isPending = (entry) =>
    entry?.pending === true ||
    entry?.pending === "true" ||
    (entry?.pending == null && !entry?.paymentMode);

  const sumByMode = (entries, mode) =>
    entries
      .filter((e) => String(e.paymentMode || "").toLowerCase() === mode)
      .filter((e) => !isPending(e))
      .reduce((s, e) => s + Number(e.amount || 0), 0);

  const normalizeCategory = (value) =>
    String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim()
      .replace(/\s+/g, " ");

  const inferCategory = (entry) => {
    const explicit = String(entry.category || "").trim();
    if (explicit) return explicit;
    const text = String(entry.notes || entry.note || "").toLowerCase();
    if (text.includes("loan received")) return "Loan Received";
    if (text.includes("loan repayment")) return "Loan Repayment";
    if (text.includes("loan given")) return "Loan Given";
    if (text.includes("loan recovery")) return "Loan Recovery";
    return "";
  };

  const sumByCategory = (entries, category) =>
    entries
      .filter((e) => normalizeCategory(inferCategory(e)) === normalizeCategory(category))
      .reduce((s, e) => s + Number(e.amount || 0), 0);

  const assetNetValue = (entries, category) => {
    const now = new Date();
    return entries
      .filter((e) => String(e.category || "").toLowerCase() === category.toLowerCase())
      .reduce((sum, e) => {
        const amount = Number(e.amount || 0);
        const rate = Number(e.depreciationRate || 10);
        const dateStr = e.purchaseDate || e.transactionDate || e.createdAt || e.date || null;
        const purchaseDate = dateStr ? new Date(dateStr) : now;
        const years = Math.max(0, (now - purchaseDate) / (1000 * 60 * 60 * 24 * 365));
        const depreciation = Math.min(amount, amount * (rate / 100) * years);
        return sum + Math.max(0, amount - depreciation);
      }, 0);
  };

  const openingCash = Number(company.openingCash || 0);
  const openingBank = Number(company.openingBank || 0);
  const cash = openingCash + sumByMode(income, "cash") - sumByMode(expense, "cash");
  const bank =
    openingBank +
    sumByMode(income, "bank") +
    sumByMode(income, "upi") -
    sumByMode(expense, "bank") -
    sumByMode(expense, "upi");
  const upi = 0;
  const wallet = sumByMode(income, "wallet") - sumByMode(expense, "wallet");
  const accountsReceivable = income
    .filter((t) => isPending(t))
    .reduce((s, t) => s + Number(t.amount || 0), 0);
  const accountsPayable = expense
    .filter((t) => isPending(t))
    .reduce((s, t) => s + Number(t.amount || 0), 0);

  const allIncome = income.reduce((s, t) => s + Number(t.amount || 0), 0);
  const allExpense = expense.reduce((s, t) => s + Number(t.amount || 0), 0);
  const retainedEarnings = allIncome - allExpense;

  const loanCredit = Math.max(
    0,
    sumByCategory(income, "Loan Received") - sumByCategory(expense, "Loan Repayment")
  );
  const loanDebit = Math.max(
    0,
    sumByCategory(expense, "Loan Given") - sumByCategory(income, "Loan Recovery")
  );

  const ownerDrawings = sumByCategory(expense, "Owner Withdrawals");
  const drawingsInterestRate = Number(company.interestOnDrawingsRate || 0) || 10;
  const drawingsStartDate = company.interestOnDrawingsDate ? new Date(company.interestOnDrawingsDate) : null;
  const drawingsYears = drawingsStartDate
    ? Math.max(0, (new Date() - drawingsStartDate) / (1000 * 60 * 60 * 24 * 365))
    : 1;

  const drawingsEntries = expense.filter(
    (e) => normalizeCategory(inferCategory(e)) === normalizeCategory("Owner Withdrawals")
  );
  const interestFromEntries = drawingsEntries.reduce((sum, e) => {
    const amount = Number(e.amount || 0);
    const rate = Number(e.depreciationRate || drawingsInterestRate || 0);
    const dateStr = e.purchaseDate || e.createdAt || e.date || null;
    const startDate = dateStr ? new Date(dateStr) : drawingsStartDate || new Date();
    const years = Math.max(0, (new Date() - startDate) / (1000 * 60 * 60 * 24 * 365)) || 1;
    return sum + amount * (rate / 100) * years;
  }, 0);

  const round2 = (value) =>
    Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;

  const interestOnDrawings = round2(
    drawingsEntries.length > 0
      ? interestFromEntries
      : ownerDrawings * (drawingsInterestRate / 100) * drawingsYears
  );

  const landValue = Number(company.freeholdLand || 0) || assetNetValue(expense, "Land");
  const buildingValue = Number(company.landAndBuilding || 0) || assetNetValue(expense, "Building");
  const investmentsValue = assetNetValue(expense, "Investments");

  const balanceSheet = {
    assets: {
      cash,
      bank,
      upi,
      wallet,
      inventory: Number(company.closingStocks || 0),
      machinery: assetNetValue(expense, "Machinery") + assetNetValue(expense, "Equipment"),
      building: buildingValue,
      land: landValue,
      furniture: assetNetValue(expense, "Furniture"),
      equipment: assetNetValue(expense, "Equipment"),
      investments: investmentsValue,
      accountsReceivable,
    },
    liabilities: {
      loans: loanCredit,
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
    const reportDate = new Date().toLocaleDateString();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(`Balance Sheet of ${company.name || "Business"}`, 105, 18, { align: "center" });
    doc.setFontSize(12);
    doc.text(`(as at ${reportDate})`, 105, 26, { align: "center" });

    const profitOrLoss = balanceSheet.equity.profitLoss || 0;
    const isProfit = profitOrLoss >= 0;

    const liabilities = [
      { label: "Capital", value: balanceSheet.equity.ownerCapital },
      { label: "Add: Net Profit", value: isProfit ? profitOrLoss : "" },
      { label: "Interest on Capital", value: company.interestOnCapital || 0 },
      { label: "Less: Drawings", value: ownerDrawings },
      { label: "Income Tax", value: company.incomeTax || 0 },
      { label: "Interest on Drawings", value: interestOnDrawings },
      { label: "Net Loss", value: !isProfit ? Math.abs(profitOrLoss) : "" },
      { label: "Reserves and Surplus", value: company.reservesAndSurplus || 0 },
      { label: "Mortgage", value: company.mortgage || 0 },
      { label: "Loan (Credit)", value: loanCredit },
      { label: "Employment Provident Fund", value: company.providentFund || 0 },
      { label: "Bank Overdraft", value: company.bankOverdraft || 0 },
      { label: "Bills Payable", value: company.billsPayable || 0 },
      { label: "Sundry or Trade Creditors", value: balanceSheet.liabilities.creditors },
    ];

    const assets = [
      { label: "Goodwill", value: company.goodwill || 0 },
      { label: "Patents and Trade Marks, etc.", value: company.patents || 0 },
      { label: "Business Premises", value: company.businessPremises || 0 },
      { label: "Freehold/Leasehold Land", value: balanceSheet.assets.land },
      { label: "Land and Building", value: balanceSheet.assets.building },
      { label: "Plant and Machinery", value: balanceSheet.assets.machinery },
      { label: "Furniture and Fixtures", value: balanceSheet.assets.furniture },
      { label: "Investments", value: balanceSheet.assets.investments },
      { label: "Closing Stocks", value: balanceSheet.assets.inventory },
      { label: "Loan (Debit)", value: loanDebit },
      { label: "Sundry Debtors", value: balanceSheet.assets.accountsReceivable },
      { label: "Bills Receivable", value: company.billsReceivable || 0 },
      { label: "Cash at Bank", value: balanceSheet.assets.bank },
      { label: "Cash in Hand", value: balanceSheet.assets.cash },
    ];

    const startY = 36;
    const baseRowHeight = 7;
    const pageWidth = doc.internal.pageSize.getWidth();
    const leftMargin = 12;
    const rightMargin = 12;
    const availableWidth = pageWidth - leftMargin - rightMargin;

    const drawCell = (
      x,
      y,
      w,
      h,
      text,
      align = "left",
      bold = false,
      fill = null,
      textColor = [0, 0, 0]
    ) => {
      if (fill) {
        doc.setFillColor(fill[0], fill[1], fill[2]);
        doc.rect(x, y, w, h, "F");
      }
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.rect(x, y, w, h);
      doc.setFont("helvetica", bold ? "bold" : "normal");
      const textX = align === "right" ? x + w - 2 : x + 2;
      const textLines = Array.isArray(text) ? text : [String(text)];
      const lineHeight = 4.2;
      const startY = y + 5;
      textLines.forEach((line, idx) => {
        doc.text(line, textX, startY + idx * lineHeight, { align });
      });
    };

    const headerFill = [64, 126, 222];
    doc.setFontSize(11);

    const measureText = (text) => doc.getTextWidth(String(text || ""));
    const labelMax = Math.max(
      measureText("Liabilities"),
      ...liabilities.map((l) => measureText(l.label)),
      measureText("Assets"),
      ...assets.map((a) => measureText(a.label))
    );
    const valueMax = Math.max(
      measureText("(INR)"),
      ...liabilities.map((l) => measureText(l.value === "" ? "" : Number(l.value || 0).toLocaleString(undefined, { maximumFractionDigits: 2 }))),
      ...assets.map((a) => measureText(a.value === "" ? "" : Number(a.value || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })))
    );

    const padding = 6;
    let labelWidth = labelMax + padding;
    let valueWidth = Math.max(22, valueMax + padding);
    const totalDesired = labelWidth * 2 + valueWidth * 2;
    if (totalDesired > availableWidth) {
      const scale = availableWidth / totalDesired;
      labelWidth = labelWidth * scale;
      valueWidth = valueWidth * scale;
    }
    const colWidths = [labelWidth, valueWidth, labelWidth, valueWidth];
    const startX = leftMargin + (availableWidth - (labelWidth * 2 + valueWidth * 2)) / 2;

    drawCell(startX, startY, colWidths[0], baseRowHeight, "Liabilities", "left", true, headerFill, [255, 255, 255]);
    drawCell(startX + colWidths[0], startY, colWidths[1], baseRowHeight, "(INR)", "right", true, headerFill, [255, 255, 255]);
    drawCell(startX + colWidths[0] + colWidths[1], startY, colWidths[2], baseRowHeight, "Assets", "left", true, headerFill, [255, 255, 255]);
    drawCell(
      startX + colWidths[0] + colWidths[1] + colWidths[2],
      startY,
      colWidths[3],
      baseRowHeight,
      "(INR)",
      "right",
      true,
      headerFill,
      [255, 255, 255]
    );

    doc.setFontSize(10);
    let y = startY + baseRowHeight;
    const maxRows = Math.max(liabilities.length, assets.length);
    for (let i = 0; i < maxRows; i += 1) {
      const left = liabilities[i] || { label: "", value: "" };
      const right = assets[i] || { label: "", value: "" };
      const leftLines = doc.splitTextToSize(left.label || "", colWidths[0] - 4);
      const rightLines = doc.splitTextToSize(right.label || "", colWidths[2] - 4);
      const lines = Math.max(leftLines.length, rightLines.length, 1);
      const rowHeight = Math.max(baseRowHeight, lines * 4.2 + 3);
      drawCell(startX, y, colWidths[0], rowHeight, leftLines, "left");
      drawCell(
        startX + colWidths[0],
        y,
        colWidths[1],
        rowHeight,
        left.value === "" ? "" : Number(left.value || 0).toLocaleString(undefined, { maximumFractionDigits: 2 }),
        "right"
      );
      drawCell(
        startX + colWidths[0] + colWidths[1],
        y,
        colWidths[2],
        rowHeight,
        rightLines,
        "left"
      );
      drawCell(
        startX + colWidths[0] + colWidths[1] + colWidths[2],
        y,
        colWidths[3],
        rowHeight,
        right.value === "" ? "" : Number(right.value || 0).toLocaleString(undefined, { maximumFractionDigits: 2 }),
        "right"
      );
      y += rowHeight;
    }

    const totalLiabilities = liabilities
      .filter((i) => i.value !== "")
      .reduce((s, i) => s + Number(i.value || 0), 0);
    const totalAssets = assets
      .filter((i) => i.value !== "")
      .reduce((s, i) => s + Number(i.value || 0), 0);

    drawCell(startX, y, colWidths[0], baseRowHeight, "Total", "left", true);
    drawCell(
      startX + colWidths[0],
      y,
      colWidths[1],
      baseRowHeight,
      totalLiabilities.toLocaleString(undefined, { maximumFractionDigits: 2 }),
      "right",
      true
    );
    drawCell(
      startX + colWidths[0] + colWidths[1],
      y,
      colWidths[2],
      baseRowHeight,
      "Total",
      "left",
      true
    );
    drawCell(
      startX + colWidths[0] + colWidths[1] + colWidths[2],
      y,
      colWidths[3],
      baseRowHeight,
      totalAssets.toLocaleString(undefined, { maximumFractionDigits: 2 }),
      "right",
      true
    );

    doc.save("balance-sheet.pdf");
  };

  const downloadCompleteReportPdf = () => {
    const doc = new jsPDF();
    const nowStr = new Date().toLocaleDateString();

    const drawTable = (startY, header, rows) => {
      const startX = 14;
      const colWidths = header.map(() => 180 / header.length);
      const rowHeight = 7;
      const drawRow = (y, cells, head = false) => {
        let x = startX;
        cells.forEach((cell, i) => {
          doc.rect(x, y, colWidths[i], rowHeight);
          doc.setFont("helvetica", head ? "bold" : "normal");
          doc.text(String(cell), x + 2, y + 5);
          x += colWidths[i];
        });
      };
      drawRow(startY, header, true);
      let y = startY + rowHeight;
      rows.forEach((r) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
          drawRow(y, header, true);
          y += rowHeight;
        }
        drawRow(y, r, false);
        y += rowHeight;
      });
      return y + 6;
    };

    doc.setFontSize(14);
    doc.text("Complete Business Report", 14, 16);
    doc.setFontSize(10);
    doc.text(`Company: ${company.name || "Business"}`, 14, 24);
    doc.text(`Date: ${nowStr}`, 14, 30);

    let y = 40;
    doc.setFontSize(12);
    doc.text("Balance Sheet", 14, y);
    y += 6;
    doc.setFontSize(9);
    y = drawTable(
      y,
      ["Section", "Item", "Amount (INR)"],
      [
        ["Assets", "Cash", balanceSheet.assets.cash.toLocaleString()],
        ["Assets", "Bank", balanceSheet.assets.bank.toLocaleString()],
        ["Assets", "UPI", balanceSheet.assets.upi.toLocaleString()],
        ["Assets", "Wallet", balanceSheet.assets.wallet.toLocaleString()],
        ["Assets", "Inventory", balanceSheet.assets.inventory.toLocaleString()],
        ["Assets", "Machinery", balanceSheet.assets.machinery.toLocaleString()],
        ["Assets", "Building", balanceSheet.assets.building.toLocaleString()],
        ["Assets", "Accounts Receivable", balanceSheet.assets.accountsReceivable.toLocaleString()],
        ["Liabilities", "Loans", balanceSheet.liabilities.loans.toLocaleString()],
        ["Liabilities", "Creditors / Accounts Payable", balanceSheet.liabilities.creditors.toLocaleString()],
        ["Liabilities", "Taxes Payable", balanceSheet.liabilities.taxesPayable.toLocaleString()],
        ["Equity", "Owner's Capital", balanceSheet.equity.ownerCapital.toLocaleString()],
        ["Equity", "Retained Earnings", balanceSheet.equity.retainedEarnings.toLocaleString()],
        ["Equity", "Profit / Loss", balanceSheet.equity.profitLoss.toLocaleString()],
      ]
    );

    doc.setFontSize(12);
    doc.text("Profit and Loss Statement", 14, y);
    y += 6;
    doc.setFontSize(9);
    y = drawTable(
      y,
      ["Item", "Amount (INR)"],
      [
        ["Total Income", allIncome.toLocaleString()],
        ["Total Expenses", allExpense.toLocaleString()],
        ["Net Profit/Loss", (allIncome - allExpense).toLocaleString()],
      ]
    );

    doc.setFontSize(12);
    doc.text("Income Statement / Revenue Details", 14, y);
    y += 6;
    doc.setFontSize(9);
    const incomeRows = income.map((t) => [
      new Date(t.createdAt || t.date || new Date()).toLocaleDateString(),
      t.customerName || t.receivedFrom || "Customer",
      t.paymentMode || "-",
      Number(t.amount || 0).toLocaleString(),
    ]);
    y = drawTable(y, ["Date", "Customer", "Mode", "Amount (INR)"], incomeRows);

    doc.setFontSize(12);
    doc.text("Expense Report", 14, y);
    y += 6;
    doc.setFontSize(9);
    const expenseRows = expense.map((t) => [
      new Date(t.createdAt || t.date || new Date()).toLocaleDateString(),
      t.paidTo || "Supplier",
      t.category || "-",
      Number(t.amount || 0).toLocaleString(),
    ]);
    y = drawTable(y, ["Date", "Supplier", "Category", "Amount (INR)"], expenseRows);

    doc.setFontSize(12);
    doc.text("Tax Computation Report", 14, y);
    y += 6;
    doc.setFontSize(9);
    y = drawTable(
      y,
      ["Item", "Amount (INR)"],
      [
        ["Total Income", allIncome.toLocaleString()],
        ["Allowable Expenses", allExpense.toLocaleString()],
        ["Taxable Income (Approx.)", (allIncome - allExpense).toLocaleString()],
        ["Tax Payable (Estimate)", "0"],
      ]
    );

    doc.setFontSize(12);
    doc.text("Depreciation Report", 14, y);
    y += 6;
    doc.setFontSize(9);
    const assetDepreciation = (entries, category) => {
      const now = new Date();
      return entries
        .filter((e) => String(e.category || "").toLowerCase() === category.toLowerCase())
        .reduce((sum, e) => {
          const amount = Number(e.amount || 0);
          const rate = Number(e.depreciationRate || 10);
          const dateStr = e.purchaseDate || e.transactionDate || e.createdAt || e.date || null;
          const purchaseDate = dateStr ? new Date(dateStr) : null;
          const years = purchaseDate
            ? Math.max(0, (now - purchaseDate) / (1000 * 60 * 60 * 24 * 365))
            : 1;
          const depreciation = Math.min(amount, amount * (rate / 100) * years);
          return sum + Math.max(0, depreciation);
        }, 0);
    };
    y = drawTable(
      y,
      ["Asset", "Depreciation (INR)"],
      [
        ["Machinery", assetDepreciation(expense, "Machinery").toLocaleString(undefined, { maximumFractionDigits: 2 })],
        ["Furniture", assetDepreciation(expense, "Furniture").toLocaleString(undefined, { maximumFractionDigits: 2 })],
        ["Equipment", assetDepreciation(expense, "Equipment").toLocaleString(undefined, { maximumFractionDigits: 2 })],
      ]
    );

    doc.setFontSize(12);
    doc.text("Cash Flow Statement", 14, y);
    y += 6;
    doc.setFontSize(9);
    y = drawTable(
      y,
      ["Item", "Amount (INR)"],
      [
        ["Cash Inflows", allIncome.toLocaleString()],
        ["Cash Outflows", allExpense.toLocaleString()],
        ["Net Cash Flow", (allIncome - allExpense).toLocaleString()],
      ]
    );

    doc.setFontSize(12);
    doc.text("Ledger Summary / Transaction Summary", 14, y);
    y += 6;
    doc.setFontSize(9);
    const ledgerRows = [...income, ...expense]
      .map((t) => ({
        date: new Date(t.createdAt || t.date || new Date()).toLocaleDateString(),
        name: t.customerName || t.paidTo || "Entry",
        type: t.paidTo ? "Expense" : "Income",
        amount: Number(t.amount || 0).toLocaleString(),
        mode: t.paymentMode || "-",
      }))
      .slice(0, 60)
      .map((t) => [t.date, t.name, t.type, t.amount, t.mode]);
    drawTable(y, ["Date", "Name", "Type", "Amount (INR)", "Mode"], ledgerRows);

    doc.save("complete-report.pdf");
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

  return (
    <div className="page balance-sheet-page">
      <h2>Download Balance Sheet</h2>
      <div className="card">
        <p>Download your business balance sheet in PDF or XLSX format.</p>
        <div className="table balance-table">
          <div className="table-row table-head">
            <div>Section</div>
            <div>Item</div>
            <div>Amount (INR)</div>
          </div>
          {[
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
          ].map(([section, item, amount]) => (
            <div key={`${section}-${item}`} className="table-row">
              <div>{section}</div>
              <div>{item}</div>
              <div>₹{Number(amount || 0).toLocaleString()}</div>
            </div>
          ))}
        </div>
        <div className="action-row">
          <button className="btn" type="button" onClick={downloadBalanceSheetPdf}>
            Download Balance Sheet (PDF)
          </button>
          <button className="btn" type="button" onClick={downloadBalanceSheetXlsx}>
            Download Balance Sheet (XLSX)
          </button>
          <button className="btn" type="button" onClick={downloadCompleteReportPdf}>
            Download Complete Report (PDF)
          </button>
        </div>
      </div>
    </div>
  );
};

export default DownloadBalanceSheet;
