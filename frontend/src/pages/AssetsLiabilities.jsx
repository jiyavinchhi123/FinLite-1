import React, { useEffect, useState } from "react";
import { getCompanyByOwner, updateCompany } from "../services/api";

const simpleFields = [
  { key: "openingCash", label: "Cash in hand" },
  { key: "openingBank", label: "Bank balance" },
  { key: "closingStocks", label: "Current stock value" },
  { key: "loanCredit", label: "Loan balance (if any)" },
  { key: "freeholdLand", label: "Land value (if owned)" },
  { key: "landAndBuilding", label: "Building value (if owned)" },
  { key: "interestOnDrawingsRate", label: "Interest on withdrawals (%)" },
  { key: "interestOnDrawingsDate", label: "Withdrawals since (date)" },
];

const AssetsLiabilities = () => {
  const [company, setCompany] = useState(null);
  const [form, setForm] = useState({});
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let ownerId = null;
    try {
      ownerId = JSON.parse(localStorage.getItem("sbfm_user") || "{}").id || null;
    } catch {}
    if (!ownerId) return;
    getCompanyByOwner(ownerId)
      .then((data) => {
        setCompany(data || null);
        setForm(data || {});
      })
      .catch(() => {
        setCompany(null);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!company?.id) {
      setStatus("Create company first.");
      return;
    }
    setStatus("");
    setLoading(true);
    try {
      const payload = { ...company, ...form };
      const zeroFields = [
        "goodwill",
        "patents",
        "businessPremises",
        "plantAndMachinery",
        "furnitureAndFixtures",
        "looseTools",
        "loanDebit",
        "billsReceivable",
        "interestOnCapital",
        "drawings",
        "interestOnDrawings",
        "incomeTax",
        "reservesAndSurplus",
        "mortgage",
        "providentFund",
        "bankOverdraft",
        "billsPayable",
      ];
      zeroFields.forEach((key) => {
        payload[key] = 0;
      });
      simpleFields.forEach((field) => {
        if (field.key === "interestOnDrawingsDate") return;
        payload[field.key] = Number(payload[field.key] || 0);
      });
      const updated = await updateCompany(company.id, payload);
      localStorage.setItem("sbfm_company", JSON.stringify(updated));
      setCompany(updated);
      setStatus("Saved successfully.");
    } catch (err) {
      setStatus(err.message || "Could not save.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h2>Business Details</h2>
      <p className="muted">Enter just these 4 values. The rest will be handled automatically.</p>
      <form className="form card" onSubmit={handleSubmit}>
        <div className="grid-two">
          {simpleFields.map((field) => (
            <div key={field.key} className="form-group">
              <label htmlFor={field.key}>{field.label}</label>
              <input
                id={field.key}
                name={field.key}
                type={field.key === "interestOnDrawingsDate" ? "date" : "number"}
                placeholder={field.key === "interestOnDrawingsDate" ? "" : "0"}
                value={form[field.key] ?? ""}
                onChange={handleChange}
              />
            </div>
          ))}
        </div>

        {status && <div className="form-status">{status}</div>}
        <button className="btn" type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save"}
        </button>
      </form>
    </div>
  );
};

export default AssetsLiabilities;
