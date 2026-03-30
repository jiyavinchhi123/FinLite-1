import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { updateCompany } from "../services/api";

const Header = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", fiscalStart: "", businessType: "" });
  const menuRef = useRef(null);
  let user = {};
  let company = {};
  try {
    user = JSON.parse(localStorage.getItem("sbfm_user") || "{}");
    company = JSON.parse(localStorage.getItem("sbfm_company") || "{}");
  } catch {}
  const handleLogout = () => {
    localStorage.removeItem("sbfm_user");
    localStorage.removeItem("sbfm_company");
    navigate("/login");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
        setEditOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const openEdit = () => {
    setEditForm({
      name: company.name || "",
      fiscalStart: company.fiscalStart
        ? new Date(company.fiscalStart).toISOString().slice(0, 10)
        : "",
      businessType: company.businessType || "",
    });
    setEditOpen(true);
  };

  const saveEdit = async () => {
    if (!company?.id) return;
    setSaving(true);
    try {
      const payload = {
        ...company,
        name: editForm.name,
        fiscalStart: editForm.fiscalStart || null,
        businessType: editForm.businessType,
      };
      const updated = await updateCompany(company.id, payload);
      localStorage.setItem("sbfm_company", JSON.stringify(updated));
      setEditOpen(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <header className="header">
      <div />
      <div className="profile" ref={menuRef}>
        <button className="btn ghost profile-trigger-icon" type="button" onClick={() => setOpen((v) => !v)}>
          <span className="profile-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" role="img" focusable="false" aria-hidden="true">
              <path
                d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5Z"
                fill="currentColor"
              />
            </svg>
          </span>
          <span className="profile-trigger-text">Profile</span>
        </button>
        {open && (
          <div className="profile-menu">
            <div className="profile-name">{user.name || "Business Owner"}</div>
            <div className="profile-line">
              <span className="profile-line-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" role="img" focusable="false">
                  <path
                    d="M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm0 2v.2l8 4.9 8-4.9V7H4Zm16 10V9.3l-7.4 4.6a1.4 1.4 0 0 1-1.2 0L4 9.3V17h16Z"
                    fill="currentColor"
                  />
                </svg>
              </span>
              <span>Email: {user.email || "-"}</span>
            </div>
            <div className="profile-line">
              <span className="profile-line-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" role="img" focusable="false">
                  <path
                    d="M3 21V7l9-4 9 4v14h-6v-5H9v5H3Zm6-7h6V9H9v5Z"
                    fill="currentColor"
                  />
                </svg>
              </span>
              <span>Business: {company.name || "-"}</span>
            </div>
            <div className="profile-line">
              <span className="profile-line-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" role="img" focusable="false">
                  <path
                    d="M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm0 6h10V6H7v2Zm0 4h10v-2H7v2Zm0 4h7v-2H7v2Z"
                    fill="currentColor"
                  />
                </svg>
              </span>
              <span>
                Financial Year:{" "}
                {company.fiscalStart
                  ? new Date(company.fiscalStart).toLocaleDateString()
                  : "-"}
              </span>
            </div>
            <div className="profile-line">
              <span className="profile-line-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" role="img" focusable="false">
                  <path
                    d="M4 5h16a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm2 4v2h4V9H6Zm6 0v2h6V9h-6Zm-6 4v2h4v-2H6Zm6 0v2h6v-2h-6Z"
                    fill="currentColor"
                  />
                </svg>
              </span>
              <span>Type: {company.businessType || "-"}</span>
            </div>
            {editOpen && (
              <div className="form-group">
                <label htmlFor="editCompanyName">Company Name</label>
                <input
                  id="editCompanyName"
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                />
                <label htmlFor="editFiscalStart">Financial Year Start</label>
                <input
                  id="editFiscalStart"
                  type="date"
                  value={editForm.fiscalStart}
                  onChange={(e) => setEditForm((p) => ({ ...p, fiscalStart: e.target.value }))}
                />
                <label htmlFor="editBusinessType">Business Type</label>
                <select
                  id="editBusinessType"
                  value={editForm.businessType}
                  onChange={(e) => setEditForm((p) => ({ ...p, businessType: e.target.value }))}
                >
                  <option value="">Select type</option>
                  <option value="Retail">Retail</option>
                  <option value="Wholesale">Wholesale</option>
                  <option value="Service">Service</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Restaurant">Restaurant</option>
                  <option value="Pharmacy">Pharmacy</option>
                  <option value="Other">Other</option>
                </select>
                <div className="action-row">
                  <button className="btn" type="button" onClick={saveEdit} disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                  <button className="btn ghost" type="button" onClick={() => setEditOpen(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
            {!editOpen && (
              <button className="btn ghost" type="button" onClick={openEdit}>
                Edit Profile
              </button>
            )}
            <button className="btn ghost" type="button" onClick={handleLogout}>
              <span className="profile-line-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" role="img" focusable="false">
                  <path
                    d="M14 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2v-2h-2v2H5V5h7v2h2Zm4.6 4-3.2-3.2 1.4-1.4L22.4 12l-5.6 5.6-1.4-1.4 3.2-3.2H9v-2h9.6Z"
                    fill="currentColor"
                  />
                </svg>
              </span>
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
