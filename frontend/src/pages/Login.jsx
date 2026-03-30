import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getCompanyByOwner, loginUser } from "../services/api";
import finliteLogo from "../components/Finlite logo.png";

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const next = {};
    if (!form.email.trim()) next.email = "Email is required";
    if (!form.password.trim()) next.password = "Password is required";
    if (form.password && form.password.length < 6) next.password = "Use at least 6 characters";
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
    try {
      const user = await loginUser({ email: form.email, password: form.password });
      if (user?.id) {
        localStorage.setItem("sbfm_user", JSON.stringify(user));
        localStorage.removeItem("sbfm_company");
        const company = await getCompanyByOwner(user.id);
        if (company && (company.id || company.name)) {
          localStorage.setItem("sbfm_company", JSON.stringify(company));
          navigate("/app");
          return;
        }
      }
      localStorage.removeItem("sbfm_company");
      navigate("/app/create-company");
    } catch (err) {
      setStatus(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="auth-screen">
      <div className="auth-content">
        <div className="page auth">
          <img className="auth-card-logo" src={finliteLogo} alt="FinLite logo" />
          <h2>Log In</h2>
          <form className="form" onSubmit={handleSubmit}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@business.com"
              value={form.email}
              onChange={handleChange}
            />
            {errors.email && <div className="form-error">{errors.email}</div>}

            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Your password"
              value={form.password}
              onChange={handleChange}
            />
            {errors.password && <div className="form-error">{errors.password}</div>}

            {status && <div className="form-status">{status}</div>}

            <button className="btn" type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Log In"}
            </button>
          </form>
          <div className="form-footer">
            New here? <Link to="/register">Create an account</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
