import React, { useEffect, useState } from "react";
import { createSupplier, fetchSuppliers, updateSupplier, deleteSupplier } from "../services/api";

const Suppliers = () => {
  let companyId = null;
  try {
    companyId = JSON.parse(localStorage.getItem("sbfm_company") || "{}").id || null;
  } catch {}
  const [form, setForm] = useState({
    name: "",
    contact: "",
    openingPayable: "",
  });
  const [status, setStatus] = useState("");
  const [suppliers, setSuppliers] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus("");
    if (!form.name.trim()) {
      setStatus("Supplier name is required.");
      return;
    }
    const payload = {
      companyId,
      name: form.name,
      contact: form.contact,
      openingPayable: Number(form.openingPayable || 0),
    };

    if (editingId) {
      updateSupplier(editingId, payload)
        .then((saved) => {
          setSuppliers((prev) => prev.map((s) => (s.id === saved.id ? saved : s)));
          setForm({ name: "", contact: "", openingPayable: "" });
          setEditingId(null);
          setStatus("Supplier updated successfully.");
        })
        .catch((err) => {
          setStatus(err.message || "Could not update supplier.");
        });
    } else {
      createSupplier(payload)
        .then((saved) => {
          setSuppliers((prev) => [saved, ...prev]);
          setForm({ name: "", contact: "", openingPayable: "" });
          setStatus("Supplier added successfully.");
        })
        .catch((err) => {
          setStatus(err.message || "Could not add supplier.");
        });
    }
  };

  useEffect(() => {
    fetchSuppliers(companyId)
      .then((data) => setSuppliers(Array.isArray(data) ? data : []))
      .catch(() => setSuppliers([]));
  }, [companyId]);

  return (
    <div className="page suppliers-page">
      <div className="split-grid suppliers-layout">
        <form className="form card suppliers-form" onSubmit={handleSubmit}>
          <h3>{editingId ? "Edit Supplier" : "Add Supplier"}</h3>
          <label htmlFor="name">Supplier Name</label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="Supplier name"
            value={form.name}
            onChange={handleChange}
          />

          <label htmlFor="contact">Contact</label>
          <input
            id="contact"
            name="contact"
            type="text"
            placeholder="Phone or email"
            value={form.contact}
            onChange={handleChange}
          />

          <label htmlFor="openingPayable">Opening Payable Amount</label>
          <input
            id="openingPayable"
            name="openingPayable"
            type="number"
            placeholder="0.00"
            value={form.openingPayable}
            onChange={handleChange}
          />

          {status && <div className="form-status">{status}</div>}

          <div className="action-row">
            <button className="btn" type="submit">
              {editingId ? "Update Supplier" : "Add Supplier"}
            </button>
            {editingId && (
              <button
                type="button"
                className="btn ghost"
                onClick={() => {
                  setEditingId(null);
                  setForm({ name: "", contact: "", openingPayable: "" });
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="card suppliers-list-card">
          <h3>Supplier List</h3>
          <div className="list">
            {suppliers.length === 0 && (
              <div className="muted">No suppliers added yet.</div>
            )}
            {suppliers.map((s) => (
              <div key={s.id} className="list-row">
                <div>
                  <strong>{s.name}</strong>
                  <div className="muted">{s.contact || "No contact"}</div>
                </div>
                <div className="list-actions">
                  <div
                    className={`status ${Number(s.openingPayable || 0) > 0 ? "pending" : "clear"}`}
                  >
                    {Number(s.openingPayable || 0) > 0
                      ? `Pending ₹${Number(s.openingPayable || 0).toLocaleString()}`
                      : "No Pending"}
                  </div>
                  <div className="table-actions">
                    <button
                      type="button"
                      className="btn small ghost"
                      onClick={() => {
                        setEditingId(s.id);
                        setForm({
                          name: s.name || "",
                          contact: s.contact || "",
                          openingPayable: s.openingPayable ?? "",
                        });
                      }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn small"
                      onClick={async () => {
                        const ok = window.confirm(`Delete supplier "${s.name}"?`);
                        if (!ok) return;
                        try {
                          await deleteSupplier(s.id);
                          setSuppliers((prev) => prev.filter((x) => x.id !== s.id));
                          setStatus("Supplier deleted.");
                        } catch (err) {
                          setStatus(err.message || "Could not delete supplier.");
                        }
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="muted small">Pending payments show what you still need to pay.</p>
        </div>
      </div>
    </div>
  );
};

export default Suppliers;
