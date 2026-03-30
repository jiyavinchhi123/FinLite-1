import React, { useEffect, useState } from "react";
import { addMoneyOut, fetchSuppliers, fetchExpense, updateMoneyOut, deleteMoneyOut } from "../services/api";

const CATEGORIES = [
  "Rent",
  "Salary",
  "Electricity",
  "Purchase",
  "Machinery",
  "Furniture",
  "Equipment",
  "Investments",
  "Loan Given",
  "Loan Repayment",
  "Property Loan Repayment",
  "Owner Withdrawals",
  "Other",
];
const PAYMENT_MODES = ["Cash", "Bank", "UPI"];

const MoneyOut = () => {
  let companyId = null;
  try {
    companyId = JSON.parse(localStorage.getItem("sbfm_company") || "{}").id || null;
  } catch {}
  const today = new Date().toISOString().slice(0, 10);
  const [paidNow, setPaidNow] = useState("yes");
  const [form, setForm] = useState({
    supplierId: "",
    paidTo: "",
    amount: "",
    paymentMode: "Cash",
    category: "",
    note: "",
    purchaseDate: "",
    transactionDate: today,
    depreciationRate: "",
  });
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [editingId, setEditingId] = useState(null);
  useEffect(() => {
    fetchSuppliers(companyId)
      .then((data) => setSuppliers(Array.isArray(data) ? data : []))
      .catch(() => setSuppliers([]));
    refreshTransactions();
  }, [companyId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "supplierId") {
      const selected = suppliers.find((s) => s.id === value);
      setForm((prev) => ({
        ...prev,
        supplierId: value,
        paidTo: selected?.name || "",
        note: prev.note,
      }));
      return;
    }
    if (name === "category") {
      const assetDefaults = ["Machinery", "Furniture", "Equipment"];
      setForm((prev) => ({
        ...prev,
        category: value,
        purchaseDate: assetDefaults.includes(value) ? prev.purchaseDate : "",
        depreciationRate:
          assetDefaults.includes(value) && !prev.depreciationRate ? "10" : "",
      }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const isAssetCategory = ["Machinery", "Furniture", "Equipment"].includes(
    form.category
  );
  const isOwnerWithdrawals = form.category === "Owner Withdrawals";

  const refreshTransactions = () => {
    fetchExpense(companyId)
      .then((data) => setTransactions(Array.isArray(data) ? data : []))
      .catch(() => setTransactions([]));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");
    setLoading(true);
    try {
      const resolvedPaidTo =
        suppliers.find((s) => s.id === form.supplierId)?.name || form.paidTo || "";
      const payload = {
        companyId,
        paidTo: resolvedPaidTo,
        supplierId: form.supplierId || null,
        amount: Number(form.amount || 0),
        paymentMode: paidNow === "yes" ? form.paymentMode : null,
        category: form.category,
        note: form.note,
        pending: paidNow === "no",
        transactionDate: form.transactionDate || today,
        purchaseDate: form.purchaseDate || null,
        depreciationRate: isAssetCategory
          ? (form.depreciationRate ? Number(form.depreciationRate) : 10)
          : null,
      };
      if (editingId) {
        await updateMoneyOut(editingId, payload);
        setStatus("Expense updated.");
      } else {
        await addMoneyOut(payload);
        setStatus("Expense saved.");
      }
      setForm({
        supplierId: "",
        paidTo: "",
        amount: "",
        paymentMode: "Cash",
        category: "",
        note: "",
        purchaseDate: "",
        transactionDate: today,
        depreciationRate: "",
      });
      setEditingId(null);
      setPaidNow("yes");
      refreshTransactions();
    } catch (err) {
      setStatus(err.message || "Could not save");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page money-out-page">
      <h2>Money Out</h2>
      <form className="form card" onSubmit={handleSubmit}>
        <label htmlFor="supplierId">Paid To</label>
        {suppliers.length > 0 ? (
          <select
            id="supplierId"
            name="supplierId"
            value={form.supplierId}
            onChange={handleChange}
          >
            <option value="">Select a supplier</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        ) : (
          <>
            <input
              id="paidTo"
              name="paidTo"
              type="text"
              placeholder="Type supplier / person name"
              value={form.paidTo}
              onChange={handleChange}
            />
            <div className="muted small">No suppliers found. Add one in Suppliers.</div>
          </>
        )}

        <label htmlFor="amount">Amount</label>
        <input
          id="amount"
          name="amount"
          type="number"
          placeholder="0.00"
          value={form.amount}
          onChange={handleChange}
        />

        <label>Paid Now?</label>
        <div className="radio-group">
          <label>
            <input
              type="radio"
              name="paidNow"
              value="yes"
              checked={paidNow === "yes"}
              onChange={() => setPaidNow("yes")}
            />
            Yes
          </label>
          <label>
            <input
              type="radio"
              name="paidNow"
              value="no"
              checked={paidNow === "no"}
              onChange={() => setPaidNow("no")}
            />
            No
          </label>
        </div>

        {paidNow === "no" && (
          <div className="pending-note">Marked as pending payment.</div>
        )}

        <label htmlFor="paymentMode">Payment Mode</label>
        <select
          id="paymentMode"
          name="paymentMode"
          value={form.paymentMode}
          onChange={handleChange}
          disabled={paidNow === "no"}
        >
          {PAYMENT_MODES.map((mode) => (
            <option key={mode} value={mode}>
              {mode}
            </option>
          ))}
        </select>

        <label htmlFor="category">Category</label>
        <select
          id="category"
          name="category"
          value={form.category}
          onChange={handleChange}
        >
          <option value="">Select a category</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <label htmlFor="transactionDate">Transaction Date</label>
        <input
          id="transactionDate"
          name="transactionDate"
          type="date"
          value={form.transactionDate}
          onChange={handleChange}
        />

        {isAssetCategory && (
          <>
            <label htmlFor="purchaseDate">Purchase Date</label>
            <input
              id="purchaseDate"
              name="purchaseDate"
              type="date"
              value={form.purchaseDate}
              onChange={handleChange}
            />

            <label htmlFor="depreciationRate">Depreciation % per year</label>
            <input
              id="depreciationRate"
              name="depreciationRate"
              type="number"
              placeholder="10"
              value={form.depreciationRate}
              onChange={handleChange}
            />
          </>
        )}


        <label htmlFor="note">Note (optional)</label>
        <input
          id="note"
          name="note"
          type="text"
          placeholder="Optional"
          value={form.note}
          onChange={handleChange}
        />

        {status && <div className="form-status">{status}</div>}

        <div className="action-row">
          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Saving..." : editingId ? "Update Money Out" : "Save Money Out"}
          </button>
          {editingId && (
            <button
              type="button"
              className="btn ghost"
              onClick={() => {
                setEditingId(null);
                setForm({
                  supplierId: "",
                  paidTo: "",
                  amount: "",
                  paymentMode: "Cash",
                  category: "",
                  note: "",
                  purchaseDate: "",
                  transactionDate: today,
                  depreciationRate: "",
                });
                setPaidNow("yes");
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="card">
        <h3>Money Out Transactions</h3>
        <div className="table">
          <div className="table-row table-head">
            <div>Date</div>
            <div>Paid To</div>
            <div>Amount</div>
            <div>Mode</div>
            <div>Category</div>
            <div>Status</div>
            <div>Actions</div>
          </div>
          {transactions.length === 0 && (
            <div className="table-row">
              <div className="muted">No transactions yet.</div>
            </div>
          )}
          {transactions.map((t, idx) => (
            <div key={t.id || idx} className="table-row">
              <div>
                {t.transactionDate
                  ? new Date(t.transactionDate).toLocaleDateString()
                  : t.purchaseDate
                  ? new Date(t.purchaseDate).toLocaleDateString()
                  : t.createdAt
                  ? new Date(t.createdAt).toLocaleDateString()
                  : "-"}
              </div>
              <div>{t.paidTo || "Expense"}</div>
              <div>₹{Number(t.amount || 0).toLocaleString()}</div>
              <div>{t.paymentMode || "-"}</div>
              <div>{t.category || "-"}</div>
              <div>
                <span
                  className={`money-status ${
                    t?.pending === true ||
                    t?.pending === "true" ||
                    (t?.pending == null && !t?.paymentMode)
                      ? "pending"
                      : "paid"
                  }`}
                >
                  {t?.pending === true ||
                  t?.pending === "true" ||
                  (t?.pending == null && !t?.paymentMode)
                    ? "Pending"
                    : "Paid"}
                </span>
              </div>
              <div className="table-actions">
                <button
                  type="button"
                  className="btn small ghost"
                  onClick={() => {
                    setEditingId(t.id || null);
                    setPaidNow(t?.pending ? "no" : "yes");
                    setForm({
                      supplierId: "",
                      paidTo: t.paidTo || "",
                      amount: t.amount || "",
                      paymentMode: t.paymentMode || "Cash",
                      category: t.category || "",
                      note: t.note || "",
                      purchaseDate: t.purchaseDate
                        ? new Date(t.purchaseDate).toISOString().slice(0, 10)
                        : "",
                      transactionDate: t.transactionDate
                        ? new Date(t.transactionDate).toISOString().slice(0, 10)
                        : today,
                      depreciationRate: t.depreciationRate || "",
                    });
                  }}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="btn small"
                  onClick={async () => {
                    if (!t?.id) return;
                    const ok = window.confirm("Delete this Money Out entry?");
                    if (!ok) return;
                    try {
                      await deleteMoneyOut(t.id);
                      refreshTransactions();
                    } catch (err) {
                      setStatus(err.message || "Could not delete");
                    }
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MoneyOut;
