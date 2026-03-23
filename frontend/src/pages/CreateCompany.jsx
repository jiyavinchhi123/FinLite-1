import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createCompany } from "../services/api";

const BUSINESS_TYPES = [
  "Retail",
  "Food & Beverage",
  "Services",
  "Manufacturing",
  "Healthcare",
  "Education",
  "Technology",
  "Other",
];

const CreateCompany = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    type: "",
    openingCash: "",
    openingBank: "",
    fiscalStart: "",
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Company name is required";
    if (!form.type) next.type = "Business type is required";
    if (form.openingCash === "") next.openingCash = "Opening cash is required";
    if (form.openingBank === "") next.openingBank = "Opening bank is required";
    if (!form.fiscalStart) next.fiscalStart = "Start date is required";

    const cash = Number(form.openingCash);
    const bank = Number(form.openingBank);
    if (form.openingCash !== "" && Number.isNaN(cash)) next.openingCash = "Enter a number";
    if (form.openingBank !== "" && Number.isNaN(bank)) next.openingBank = "Enter a number";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setStatus("");
    setLoading(true);

    const cash = Number(form.openingCash);
    const bank = Number(form.openingBank);
    const ownerCapital = cash + bank; // Internal calculation; do not show to the user.
    let ownerId = null;
    try {
      const user = JSON.parse(localStorage.getItem("sbfm_user") || "{}");
      ownerId = user.id || null;
    } catch {}

    try {
      const saved = await createCompany({
        ownerId,
        name: form.name,
        businessType: form.type,
        openingCash: cash,
        openingBank: bank,
        fiscalStart: form.fiscalStart,
        ownerCapital,
      });
      localStorage.setItem(
        "sbfm_company",
        JSON.stringify(saved || {
          ownerId,
          name: form.name,
          businessType: form.type,
          openingCash: cash,
          openingBank: bank,
          fiscalStart: form.fiscalStart,
          ownerCapital,
        })
      );
      setStatus("Company created successfully. Redirecting...");
      setTimeout(() => navigate("/app"), 600);
    } catch (err) {
      setStatus(err.message || "Could not create company");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h2>Set Up Your Business</h2>
      <form className="form" onSubmit={handleSubmit}>
        <label htmlFor="name">Company Name</label>
        <input
          id="name"
          name="name"
          type="text"
          placeholder="Smart Bakery"
          value={form.name}
          onChange={handleChange}
        />
        {errors.name && <div className="form-error">{errors.name}</div>}

        <label htmlFor="type">Business Type</label>
        <select id="type" name="type" value={form.type} onChange={handleChange}>
          <option value="">Select a type</option>
          {BUSINESS_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        {errors.type && <div className="form-error">{errors.type}</div>}

        <label htmlFor="openingCash">Opening Cash Balance</label>
        <input
          id="openingCash"
          name="openingCash"
          type="number"
          placeholder="0.00"
          value={form.openingCash}
          onChange={handleChange}
        />
        {errors.openingCash && <div className="form-error">{errors.openingCash}</div>}

        <label htmlFor="openingBank">Opening Bank Balance</label>
        <input
          id="openingBank"
          name="openingBank"
          type="number"
          placeholder="0.00"
          value={form.openingBank}
          onChange={handleChange}
        />
        {errors.openingBank && <div className="form-error">{errors.openingBank}</div>}

        <label htmlFor="fiscalStart">Financial Year Start Date</label>
        <input
          id="fiscalStart"
          name="fiscalStart"
          type="date"
          value={form.fiscalStart}
          onChange={handleChange}
        />
        {errors.fiscalStart && <div className="form-error">{errors.fiscalStart}</div>}

        {status && <div className="form-status">{status}</div>}

        <button className="btn" type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Business"}
        </button>
      </form>
    </div>
  );
};

export default CreateCompany;
