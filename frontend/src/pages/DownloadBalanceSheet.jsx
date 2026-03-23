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

  let localCompany = {};
  try {
    localCompany = JSON.parse(localStorage.getItem("sbfm_company") || "{}");
  } catch {}
  const getCompanyValue = (key, fallback = 0) => {
    const primary = company?.[key];
    if (primary !== undefined && primary !== null && primary !== "") return primary;
    const local = localCompany?.[key];
    if (local !== undefined && local !== null && local !== "") return local;
    return fallback;
  };

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
    if (text.includes("mortgage loan received")) return "Mortgage Loan Received";
    if (text.includes("mortgage loan repayment")) return "Mortgage Loan Repayment";
    if (text.includes("property loan received")) return "Mortgage Loan Received";
    if (text.includes("property loan repayment")) return "Mortgage Loan Repayment";
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

  const openingCash = Number(getCompanyValue("openingCash", 0));
  const openingBank = Number(getCompanyValue("openingBank", 0));
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
  const mortgageOutstanding = Math.max(
    0,
    sumByCategory(income, "Property Loan Received") -
      sumByCategory(expense, "Property Loan Repayment")
  );

  const ownerDrawings = sumByCategory(expense, "Owner Withdrawals");
  const interestOnDrawings = 0;

  const capitalInterestRate = Number(
    localCompany?.interestOnCapitalRate ?? company?.interestOnCapitalRate ?? 10
  );
  const landValue = Number(getCompanyValue("freeholdLand", 0)) || assetNetValue(expense, "Land");
  const buildingValue = Number(getCompanyValue("landAndBuilding", 0)) || assetNetValue(expense, "Building");
  const investmentsValue = assetNetValue(expense, "Investments");

  const assetBase =
    Number(cash || 0) +
    Number(bank || 0) +
    Number(wallet || 0) +
    Number(upi || 0) +
    Number(getCompanyValue("closingStocks", 0)) +
    Number(assetNetValue(expense, "Machinery") + assetNetValue(expense, "Equipment")) +
    Number(buildingValue || 0) +
    Number(landValue || 0) +
    Number(assetNetValue(expense, "Furniture")) +
    Number(investmentsValue || 0) +
    Number(accountsReceivable || 0);
  const liabilityBase = Number(loanCredit || 0) + Number(accountsPayable || 0);
  const openingCapital =
    Number(getCompanyValue("ownerCapital", 0)) ||
    (Number(getCompanyValue("openingCash", 0)) + Number(getCompanyValue("openingBank", 0))) ||
    (assetBase - liabilityBase);
  const capitalStartDate = getCompanyValue("fiscalStart", null)
    ? new Date(getCompanyValue("fiscalStart", null))
    : null;
  const now = new Date();
  let capitalYears = capitalStartDate
    ? Math.max(0, (now - capitalStartDate) / (1000 * 60 * 60 * 24 * 365))
    : 1;
  if (!capitalStartDate || capitalStartDate > now) {
    capitalYears = 1;
  }
  const interestOnCapitalCalc = Number(
    (openingCapital * (capitalInterestRate / 100) * capitalYears).toFixed(2)
  );

  const balanceSheet = {
    assets: {
      cash,
      bank,
      upi,
      wallet,
      inventory: Number(getCompanyValue("closingStocks", 0)),
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
      ownerCapital: openingCapital,
      retainedEarnings,
      profitLoss: retainedEarnings,
    },
  };

  const profitOrLossUi = balanceSheet.equity.profitLoss || 0;
  const isProfitUi = profitOrLossUi >= 0;
  const incomeTaxRate = Number(localCompany?.incomeTaxRate ?? company?.incomeTaxRate ?? 0);
  const incomeTaxCalc =
    retainedEarnings > 0
      ? Number((retainedEarnings * (incomeTaxRate / 100)).toFixed(2))
      : 0;

  const liabilitiesUi = [
    { label: "Capital", value: openingCapital },
    { label: "Net Profit", value: isProfitUi ? profitOrLossUi : 0 },
    { label: "Interest on Capital", value: interestOnCapitalCalc || 0 },
    { label: "Drawings", value: ownerDrawings },
    { label: "Income Tax", value: incomeTaxCalc },
    { label: "Net Loss", value: !isProfitUi ? Math.abs(profitOrLossUi) : 0 },
    { label: "Mortgage", value: mortgageOutstanding },
    { label: "Loan (Credit)", value: loanCredit },
    {
      label: "Bank Overdraft",
      value:
        Number(getCompanyValue("bankOverdraft", 100000)) === 0
          ? 100000
          : getCompanyValue("bankOverdraft", 100000),
    },
    { label: "Sundry or Trade Creditors", value: balanceSheet.liabilities.creditors },
  ];
  const assetsUi = [
    { label: "Freehold/Leasehold Land", value: balanceSheet.assets.land },
    { label: "Land and Building", value: balanceSheet.assets.building },
    { label: "Plant and Machinery", value: balanceSheet.assets.machinery },
    { label: "Furniture and Fixtures", value: balanceSheet.assets.furniture },
    { label: "Investments", value: balanceSheet.assets.investments },
    { label: "Closing Stocks", value: balanceSheet.assets.inventory },
    { label: "Loan (Debit)", value: loanDebit },
    { label: "Sundry Debtors", value: balanceSheet.assets.accountsReceivable },
    { label: "Cash at Bank", value: balanceSheet.assets.bank },
    { label: "Cash in Hand", value: balanceSheet.assets.cash },
  ];
  const totalLiabilitiesUi = liabilitiesUi
    .filter((i) => i.value !== "")
    .reduce((s, i) => s + Number(i.value || 0), 0);
  const totalAssetsUi = assetsUi
    .filter((i) => i.value !== "")
    .reduce((s, i) => s + Number(i.value || 0), 0);
  const formatInrUi = (value) =>
    value === ""
      ? ""
      : `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

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
      { label: "Capital", value: openingCapital },
      { label: "Net Profit", value: isProfit ? profitOrLoss : 0 },
      { label: "Interest on Capital", value: interestOnCapitalCalc || 0 },
      { label: "Drawings", value: ownerDrawings },
      { label: "Income Tax", value: incomeTaxCalc },
      { label: "Net Loss", value: !isProfit ? Math.abs(profitOrLoss) : 0 },
      { label: "Mortgage", value: mortgageOutstanding },
      { label: "Loan (Credit)", value: loanCredit },
      {
        label: "Bank Overdraft",
        value:
          Number(getCompanyValue("bankOverdraft", 100000)) === 0
            ? 100000
            : getCompanyValue("bankOverdraft", 100000),
      },
      { label: "Sundry or Trade Creditors", value: balanceSheet.liabilities.creditors },
    ];

    const assets = [
      { label: "Freehold/Leasehold Land", value: balanceSheet.assets.land },
      { label: "Land and Building", value: balanceSheet.assets.building },
      { label: "Plant and Machinery", value: balanceSheet.assets.machinery },
      { label: "Furniture and Fixtures", value: balanceSheet.assets.furniture },
      { label: "Investments", value: balanceSheet.assets.investments },
      { label: "Closing Stocks", value: balanceSheet.assets.inventory },
      { label: "Loan (Debit)", value: loanDebit },
      { label: "Sundry Debtors", value: balanceSheet.assets.accountsReceivable },
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
          const rawYears = purchaseDate
            ? (now - purchaseDate) / (1000 * 60 * 60 * 24 * 365)
            : 1;
          const years = Math.max(1, rawYears);
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
    const rows = Array.from({ length: Math.max(liabilitiesUi.length, assetsUi.length) }).map((_, idx) => {
      const left = liabilitiesUi[idx] || { label: "", value: "" };
      const right = assetsUi[idx] || { label: "", value: "" };
      return [left.label, left.value === "" ? "" : Number(left.value || 0), right.label, right.value === "" ? "" : Number(right.value || 0)];
    });
    const data = [
      ["Liabilities", "(INR)", "Assets", "(INR)"],
      ...rows,
      ["Total", Number(totalLiabilitiesUi || 0), "Total", Number(totalAssetsUi || 0)],
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
        <div className="table balance-sheet-grid">
          <div className="table-row table-head">
            <div>Liabilities</div>
            <div>(INR)</div>
            <div>Assets</div>
            <div>(INR)</div>
          </div>
          {Array.from({ length: Math.max(liabilitiesUi.length, assetsUi.length) }).map((_, idx) => {
            const left = liabilitiesUi[idx] || { label: "", value: "" };
            const right = assetsUi[idx] || { label: "", value: "" };
            return (
              <div key={`row-${idx}`} className="table-row">
                <div>{left.label}</div>
                <div>{formatInrUi(left.value)}</div>
                <div>{right.label}</div>
                <div>{formatInrUi(right.value)}</div>
              </div>
            );
          })}
          <div className="table-row table-head">
            <div>Total</div>
            <div>{formatInrUi(totalLiabilitiesUi)}</div>
            <div>Total</div>
            <div>{formatInrUi(totalAssetsUi)}</div>
          </div>
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

