import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";
import { validateForm } from "../utils/validation";

const Register = ({ onLogin }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    const fieldErrors = validateForm({ [name]: value });
    setErrors((prev) => ({ ...prev, ...fieldErrors, [name]: fieldErrors[name] || "" }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm(form);
    setErrors(validationErrors);

    if (Object.values(validationErrors).some((v) => v)) return;

    setLoading(true);
    setError("");

    try {
      const { data } = await authAPI.register(form);
      onLogin(data.token, data.user);
      navigate("/user");
    } catch (err) {
      const msg = err.response?.data?.msg || "Registration failed";
      const apiErrors = err.response?.data?.errors;
      setError(apiErrors ? apiErrors.join(", ") : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Create Account</h1>
        <p>Register as a normal user on the platform</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name (20-60 characters)</label>
            <input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Your full name"
            />
            {errors.name && <div className="error">{errors.name}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="you@example.com"
            />
            {errors.email && <div className="error">{errors.email}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="address">Address (max 400 characters)</label>
            <textarea
              id="address"
              name="address"
              value={form.address}
              onChange={handleChange}
              required
              rows="3"
              placeholder="Your address"
            />
            {errors.address && <div className="error">{errors.address}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              placeholder="8-16 chars, 1 uppercase, 1 special"
            />
            {errors.password && <div className="error">{errors.password}</div>}
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/">Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
