import React, { useEffect, useState } from "react";
import { addMoneyIn, fetchCustomers, fetchIncome, updateMoneyIn, deleteMoneyIn } from "../services/api";

const PAYMENT_MODES = ["Cash", "Bank", "UPI"];
const INCOME_CATEGORIES = [
  "Sales",
  "Loan Received",
  "Loan Recovery",
  "Property Loan Received",
  "Other",
];

const MoneyIn = () => {
  let companyId = null;
  try {
    companyId = JSON.parse(localStorage.getItem("sbfm_company") || "{}").id || null;
  } catch {}
  const today = new Date().toISOString().slice(0, 10);
  const [paidNow, setPaidNow] = useState("yes");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    customerId: "",
    mobile: "",
    address: "",
    amount: "",
    paymentMode: "Cash",
    category: "Sales",
    transactionDate: today,
  });
  const [quick, setQuick] = useState({
    receivedFrom: "",
    amount: "",
    paymentMode: "Cash",
    category: "Sales",
    transactionDate: today,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "customerId") {
      const selected = customers.find((c) => c.id === value);
      setForm((prev) => ({
        ...prev,
        customerId: value,
        mobile: selected?.mobile || "",
        address: selected?.address || "",
      }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleQuickChange = (e) => {
    const { name, value } = e.target;
    setQuick((prev) => ({ ...prev, [name]: value }));
  };

  const submitFull = async (e) => {
    e.preventDefault();
    setStatus("");
    setLoading(true);
    try {
      const selected = customers.find((c) => c.id === form.customerId);
      const payload = {
        companyId,
        customerId: form.customerId || null,
        customerName: selected?.name || "",
        mobile: form.mobile,
        address: form.address,
        amount: Number(form.amount || 0),
        category: form.category,
        transactionDate: form.transactionDate || today,
        paidNow: paidNow === "yes",
        paymentMode: paidNow === "yes" ? form.paymentMode : null,
        pending: paidNow === "no",
      };
      if (editingId) {
        await updateMoneyIn(editingId, payload);
        setStatus("Money In updated.");
      } else {
        await addMoneyIn(payload);
        setStatus("Money In saved.");
      }
      setForm({
        customerId: "",
        mobile: "",
        address: "",
        amount: "",
        paymentMode: "Cash",
        category: "Sales",
        transactionDate: today,
      });
      setEditingId(null);
      refreshTransactions();
    } catch (err) {
      setStatus(err.message || "Could not save");
    } finally {
      setLoading(false);
    }
  };

  const submitQuick = async (e) => {
    e.preventDefault();
    setStatus("");
    setLoading(true);
    try {
      await addMoneyIn({
        companyId,
        customerName: quick.receivedFrom,
        receivedFrom: quick.receivedFrom,
        amount: Number(quick.amount || 0),
        paymentMode: quick.paymentMode,
        category: quick.category,
        transactionDate: quick.transactionDate || today,
        quickEntry: true,
      });
      setStatus("Quick entry saved.");
      setQuick({ receivedFrom: "", amount: "", paymentMode: "Cash", category: "Sales", transactionDate: today });
      refreshTransactions();
    } catch (err) {
      setStatus(err.message || "Could not save");
    } finally {
      setLoading(false);
    }
  };

  const refreshTransactions = () => {
    fetchIncome(companyId)
      .then((data) => setTransactions(Array.isArray(data) ? data : []))
      .catch(() => setTransactions([]));
  };

  const handleEdit = (entry) => {
    setEditingId(entry.id || null);
    setPaidNow(entry.pending ? "no" : "yes");
    setForm({
      customerId: "",
      mobile: "",
      address: "",
      amount: entry.amount || "",
      paymentMode: entry.paymentMode || "Cash",
      category: entry.category || "Sales",
      transactionDate: entry.transactionDate
        ? new Date(entry.transactionDate).toISOString().slice(0, 10)
        : today,
    });
  };

  const handleDelete = async (entry) => {
    if (!entry?.id) return;
    const ok = window.confirm("Delete this Money In entry?");
    if (!ok) return;
    try {
      await deleteMoneyIn(entry.id);
      refreshTransactions();
    } catch (err) {
      setStatus(err.message || "Could not delete");
    }
  };

  const formatInr = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

  useEffect(() => {
    fetchCustomers(companyId)
      .then((data) => setCustomers(Array.isArray(data) ? data : []))
      .catch(() => setCustomers([]));
    refreshTransactions();
  }, [companyId]);

  return (
    <div className="page money-in-page">
      <div className="split-grid">
        <form className="form card" onSubmit={submitFull}>
          <h3>Customer Details</h3>
          <label htmlFor="customerId">Customer Name</label>
          <select
            id="customerId"
            name="customerId"
            value={form.customerId}
            onChange={handleChange}
          >
            <option value="">Select a customer</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <label htmlFor="mobile">Mobile Number</label>
          <input
            id="mobile"
            name="mobile"
            type="tel"
            placeholder="Mobile number"
            value={form.mobile}
            onChange={handleChange}
            readOnly
          />

          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="customer@email.com"
            value={
              customers.find((c) => c.id === form.customerId)?.email || ""
            }
            readOnly
          />

          <label htmlFor="address">Address</label>
          <input
            id="address"
            name="address"
            type="text"
            placeholder="City, State"
            value={form.address}
            onChange={handleChange}
            readOnly
          />

          <h3>Payment</h3>
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

          {paidNow === "yes" ? (
            <>
              <label htmlFor="paymentMode">Payment Mode</label>
              <select
                id="paymentMode"
                name="paymentMode"
                value={form.paymentMode}
                onChange={handleChange}
              >
                {PAYMENT_MODES.map((mode) => (
                  <option key={mode} value={mode}>
                    {mode}
                  </option>
                ))}
              </select>
            </>
          ) : (
            <div className="pending-note">Marked as pending payment.</div>
          )}

          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            value={form.category}
            onChange={handleChange}
          >
            {INCOME_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <label htmlFor="amount">Amount</label>
          <input
            id="amount"
            name="amount"
            type="number"
            placeholder="0.00"
            value={form.amount}
            onChange={handleChange}
          />

          <label htmlFor="transactionDate">Transaction Date</label>
          <input
            id="transactionDate"
            name="transactionDate"
            type="date"
            value={form.transactionDate}
            onChange={handleChange}
          />

          {status && <div className="form-status">{status}</div>}

          <div className="action-row">
            <button className="btn" type="submit" disabled={loading}>
              {loading ? "Saving..." : editingId ? "Update Money In" : "Save Money In"}
            </button>
            {editingId && (
              <button
                type="button"
                className="btn ghost"
                onClick={() => {
                  setEditingId(null);
                  setForm({
                    customerId: "",
                    mobile: "",
                    address: "",
                    amount: "",
                    paymentMode: "Cash",
                    category: "Sales",
                    transactionDate: today,
                  });
                  setPaidNow("yes");
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <form className="form card money-in-quick-form" onSubmit={submitQuick}>
          <h3>Money In (without bill)</h3>
          <label htmlFor="receivedFrom">Received From</label>
          <input
            id="receivedFrom"
            name="receivedFrom"
            type="text"
            placeholder="Customer or source"
            value={quick.receivedFrom}
            onChange={handleQuickChange}
          />

          <label htmlFor="quickAmount">Amount</label>
          <input
            id="quickAmount"
            name="amount"
            type="number"
            placeholder="0.00"
            value={quick.amount}
            onChange={handleQuickChange}
          />

          <label htmlFor="quickPaymentMode">Payment Mode</label>
          <select
            id="quickPaymentMode"
            name="paymentMode"
            value={quick.paymentMode}
            onChange={handleQuickChange}
          >
            {PAYMENT_MODES.map((mode) => (
              <option key={mode} value={mode}>
                {mode}
              </option>
            ))}
          </select>

          <label htmlFor="quickCategory">Category</label>
          <select
            id="quickCategory"
            name="category"
            value={quick.category}
            onChange={handleQuickChange}
          >
            {INCOME_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <label htmlFor="quickTransactionDate">Transaction Date</label>
          <input
            id="quickTransactionDate"
            name="transactionDate"
            type="date"
            value={quick.transactionDate}
            onChange={handleQuickChange}
          />

          {status && <div className="form-status">{status}</div>}

          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Saving..." : "Quick Save"}
          </button>
        </form>
      </div>

      <div className="card">
        <h3>Money In Transactions</h3>
        <div className="table money-in-table">
          <div className="table-row table-head">
            <div>Date</div>
            <div>Customer</div>
            <div>Category</div>
            <div>Amount</div>
            <div>Mode</div>
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
                  : t.createdAt
                  ? new Date(t.createdAt).toLocaleDateString()
                  : "-"}
              </div>
              <div>{t.receivedFrom || t.customerName || "Quick Entry"}</div>
              <div>{t.category || "Sales"}</div>
              <div>{formatInr(t.amount)}</div>
              <div>{t.paymentMode || "-"}</div>
              <div>
                <span className={`money-status ${t.pending ? "pending" : "paid"}`}>
                  {t.pending ? "Pending" : "Paid"}
                </span>
              </div>
              <div className="table-actions">
                <button type="button" className="btn small ghost" onClick={() => handleEdit(t)}>
                  Edit
                </button>
                <button type="button" className="btn small" onClick={() => handleDelete(t)}>
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

export default MoneyIn;
