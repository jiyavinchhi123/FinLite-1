import React, { useEffect, useState } from "react";
import { createCustomer, fetchCustomers, updateCustomer, deleteCustomer } from "../services/api";

const Customers = () => {
  let companyId = null;
  try {
    companyId = JSON.parse(localStorage.getItem("sbfm_company") || "{}").id || null;
  } catch {}
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    email: "",
    address: "",
    openingBalance: "",
  });
  const [status, setStatus] = useState("");
  const [customers, setCustomers] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus("");
    if (!form.name.trim()) {
      setStatus("Customer name is required.");
      return;
    }
    const payload = {
      companyId,
      name: form.name,
      mobile: form.mobile,
      email: form.email,
      address: form.address,
      openingBalance: Number(form.openingBalance || 0),
    };

    if (editingId) {
      updateCustomer(editingId, payload)
        .then((saved) => {
          setCustomers((prev) => prev.map((c) => (c.id === saved.id ? saved : c)));
          setForm({ name: "", mobile: "", email: "", address: "", openingBalance: "" });
          setEditingId(null);
          setStatus("Customer updated successfully.");
        })
        .catch((err) => {
          setStatus(err.message || "Could not update customer.");
        });
    } else {
      createCustomer(payload)
        .then((saved) => {
          setCustomers((prev) => [saved, ...prev]);
          setForm({ name: "", mobile: "", email: "", address: "", openingBalance: "" });
          setStatus("Customer added successfully.");
        })
        .catch((err) => {
          setStatus(err.message || "Could not add customer.");
        });
    }
  };

  useEffect(() => {
    fetchCustomers(companyId)
      .then((data) => setCustomers(Array.isArray(data) ? data : []))
      .catch(() => setCustomers([]));
  }, [companyId]);

  return (
    <div className="page customers-page">
      <div className="split-grid">
        <form className="form card" onSubmit={handleSubmit}>
          <h3>{editingId ? "Edit Customer" : "Add Customer"}</h3>
          <label htmlFor="name">Customer Name</label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="Customer name"
            value={form.name}
            onChange={handleChange}
          />

          <label htmlFor="mobile">Mobile</label>
          <input
            id="mobile"
            name="mobile"
            type="tel"
            placeholder="Mobile number"
            value={form.mobile}
            onChange={handleChange}
          />

          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="customer@email.com"
            value={form.email}
            onChange={handleChange}
          />

          <label htmlFor="address">Address</label>
          <input
            id="address"
            name="address"
            type="text"
            placeholder="City, State"
            value={form.address}
            onChange={handleChange}
          />

          <label htmlFor="openingBalance">Opening Balance</label>
          <input
            id="openingBalance"
            name="openingBalance"
            type="number"
            placeholder="0.00"
            value={form.openingBalance}
            onChange={handleChange}
          />

          {status && <div className="form-status">{status}</div>}

          <div className="action-row">
            <button className="btn" type="submit">
              {editingId ? "Update Customer" : "Add Customer"}
            </button>
            {editingId && (
              <button
                type="button"
                className="btn ghost"
                onClick={() => {
                  setEditingId(null);
                  setForm({ name: "", mobile: "", email: "", address: "", openingBalance: "" });
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="card">
          <h3>Customer List</h3>
          <div className="list">
            {customers.length === 0 && (
              <div className="muted">No customers added yet.</div>
            )}
            {customers.map((c) => (
              <div key={c.id} className="list-row">
                <div>
                  <strong>{c.name}</strong>
                  <div className="muted">{c.mobile || "No mobile"}</div>
                  <div className="muted">{c.email || "No email"}</div>
                </div>
                <div className="list-actions">
                  <div
                    className={`status ${Number(c.openingBalance || 0) > 0 ? "pending" : "clear"}`}
                  >
                    {Number(c.openingBalance || 0) > 0
                      ? `Pending ₹${Number(c.openingBalance || 0).toLocaleString()}`
                      : "No Pending"}
                  </div>
                  <div className="table-actions">
                    <button
                      type="button"
                      className="btn small ghost"
                      onClick={() => {
                        setEditingId(c.id);
                        setForm({
                          name: c.name || "",
                          mobile: c.mobile || "",
                          email: c.email || "",
                          address: c.address || "",
                          openingBalance: c.openingBalance ?? "",
                        });
                      }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn small"
                      onClick={async () => {
                        const ok = window.confirm("Delete this customer?");
                        if (!ok) return;
                        try {
                          await deleteCustomer(c.id);
                          setCustomers((prev) => prev.filter((x) => x.id !== c.id));
                        } catch (err) {
                          setStatus(err.message || "Could not delete customer.");
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
        </div>
      </div>
    </div>
  );
};

export default Customers;
