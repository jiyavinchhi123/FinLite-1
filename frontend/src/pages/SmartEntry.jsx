import React, { useState } from "react";
import { analyzeSmartEntry, addMoneyOut, addMoneyIn } from "../services/api";

const SmartEntry = () => {
  let companyId = null;
  try {
    companyId = JSON.parse(localStorage.getItem("sbfm_company") || "{}").id || null;
  } catch {}
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [extracted, setExtracted] = useState(null);
  const [saving, setSaving] = useState(false);
  const formatAmount = (amount, currency) => {
    if (!amount || Number(amount) === 0) return "Not found";
    return currency ? `${currency} ${amount}` : `${amount}`;
  };

  const handleAnalyze = async () => {
    if (!text.trim()) {
      setStatus("Please type something to analyze.");
      return;
    }
    setStatus("");
    setLoading(true);
    try {
      const result = await analyzeSmartEntry({ text });
      setExtracted({
        expenseType: result.expenseType || result.category || "Other",
        amount: result.amount || 0,
        paymentMode: result.paymentMode || result.payment_mode || "",
        entryType: result.entryType || result.entry_type || "expense",
        currency: result.currency || "",
        counterparty: result.counterparty || "",
        pending: result.pending === true || result.pending === "true",
      });
    } catch (err) {
      setStatus(err.message || "Could not analyze");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!extracted) return;
    setSaving(true);
    setStatus("");
    try {
      if (extracted.entryType === "income") {
        await addMoneyIn({
          companyId,
          customerName: extracted.counterparty || "Smart Entry",
          amount: Number(extracted.amount || 0),
          paymentMode: extracted.pending ? null : (extracted.paymentMode || "Cash"),
          pending: extracted.pending,
          notes: text,
          source: "smart-entry",
        });
      } else {
        await addMoneyOut({
          companyId,
          paidTo: extracted.counterparty || "Smart Entry",
          amount: Number(extracted.amount || 0),
          paymentMode: extracted.pending ? null : (extracted.paymentMode || "Cash"),
          category: extracted.expenseType,
          note: text,
          pending: extracted.pending,
          source: "smart-entry",
        });
      }
      setStatus("Saved to Money Out.");
      setText("");
      setExtracted(null);
    } catch (err) {
      setStatus(err.message || "Could not save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page smart-entry-page">
      <h2>Smart Entry</h2>
      <div className="card">
        <p>Type a short sentence like: "paid 5000 rent in cash" or "received 5000 for sales"</p>
        <textarea
          placeholder="Describe the payment in plain words"
          rows="4"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button className="btn" type="button" onClick={handleAnalyze} disabled={loading}>
          {loading ? "Analyzing..." : "Analyze"}
        </button>
      </div>

      {extracted && (
        <div className="card">
          <h3>Review & Confirm</h3>
          <div className="review-grid">
            <div>
              <span className="muted">Entry Type</span>
              <div>{extracted.entryType === "income" ? "Money In" : "Money Out"}</div>
            </div>
            <div>
              <span className="muted">
                {extracted.entryType === "income" ? "Received From" : "Paid To"}
              </span>
              <div>{extracted.counterparty || "-"}</div>
            </div>
            <div>
              <span className="muted">Category</span>
              <div>{extracted.expenseType}</div>
            </div>
            <div>
              <span className="muted">Amount</span>
              <div>{formatAmount(extracted.amount, extracted.currency)}</div>
            </div>
            <div>
              <span className="muted">Payment Mode</span>
              <div>{extracted.pending ? "-" : (extracted.paymentMode || "Cash")}</div>
            </div>
            <div>
              <span className="muted">Payment Status</span>
              <div>{extracted.pending ? "Pending" : "Paid"}</div>
            </div>
          </div>
          <button className="btn" type="button" onClick={handleConfirm} disabled={saving}>
            {saving ? "Saving..." : "Confirm & Save"}
          </button>
        </div>
      )}

      {status && <div className="form-status">{status}</div>}
    </div>
  );
};

export default SmartEntry;
