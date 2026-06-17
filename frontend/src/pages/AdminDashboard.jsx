import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { adminAPI } from "../services/api";
import { validateForm } from "../utils/validation";

const roleBadge = (role) => {
  const map = { ADMIN: "badge-admin", USER: "badge-user", OWNER: "badge-owner" };
  return <span className={`badge ${map[role]}`}>{role}</span>;
};

const AdminDashboard = ({ user, onLogout }) => {
  const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 });
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [userFilters, setUserFilters] = useState({
    name: "", email: "", address: "", role: "", sortBy: "", sortOrder: "asc",
  });
  const [storeFilters, setStoreFilters] = useState({
    name: "", email: "", address: "", sortBy: "", sortOrder: "asc",
  });
  const [showUserModal, setShowUserModal] = useState(false);
  const [showStoreModal, setShowStoreModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userForm, setUserForm] = useState({
    name: "", email: "", address: "", password: "", role: "USER",
  });
  const [storeForm, setStoreForm] = useState({
    name: "", email: "", address: "", ownerId: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    const { data } = await adminAPI.getDashboard();
    setStats(data);
  };

  const fetchUsers = async () => {
    const params = Object.fromEntries(
      Object.entries(userFilters).filter(([, v]) => v)
    );
    const { data } = await adminAPI.getUsers(params);
    setUsers(data);
  };

  const fetchStores = async () => {
    const params = Object.fromEntries(
      Object.entries(storeFilters).filter(([, v]) => v)
    );
    const { data } = await adminAPI.getStores(params);
    setStores(data);
  };

  useEffect(() => {
    fetchDashboard();
    fetchUsers();
    fetchStores();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [userFilters.sortBy, userFilters.sortOrder]);

  useEffect(() => {
    fetchStores();
  }, [storeFilters.sortBy, storeFilters.sortOrder]);

  const handleUserFilterChange = (e) => {
    setUserFilters({ ...userFilters, [e.target.name]: e.target.value });
  };

  const handleStoreFilterChange = (e) => {
    setStoreFilters({ ...storeFilters, [e.target.name]: e.target.value });
  };

  const toggleSort = (table, field) => {
    if (table === "user") {
      setUserFilters((prev) => ({
        ...prev,
        sortBy: field,
        sortOrder: prev.sortBy === field && prev.sortOrder === "asc" ? "desc" : "asc",
      }));
    } else {
      setStoreFilters((prev) => ({
        ...prev,
        sortBy: field,
        sortOrder: prev.sortBy === field && prev.sortOrder === "asc" ? "desc" : "asc",
      }));
    }
  };

  const sortIcon = (table, field) => {
    const filters = table === "user" ? userFilters : storeFilters;
    if (filters.sortBy !== field) return " ↕";
    return filters.sortOrder === "asc" ? " ↑" : " ↓";
  };

  const handleViewUser = async (userId) => {
    try {
      const { data } = await adminAPI.getUserById(userId);
      setSelectedUser(data);
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to load user details");
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm(userForm);
    if (!userForm.role) validationErrors.role = "Role is required";
    setFormErrors(validationErrors);
    if (Object.values(validationErrors).some((v) => v)) return;

    try {
      await adminAPI.addUser(userForm);
      setMessage("User added successfully");
      setShowUserModal(false);
      setUserForm({ name: "", email: "", address: "", password: "", role: "USER" });
      fetchDashboard();
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to add user");
    }
  };

  const handleAddStore = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.addStore({
        ...storeForm,
        ownerId: storeForm.ownerId ? parseInt(storeForm.ownerId) : null,
      });
      setMessage("Store added successfully");
      setShowStoreModal(false);
      setStoreForm({ name: "", email: "", address: "", ownerId: "" });
      fetchDashboard();
      fetchStores();
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to add store");
    }
  };

  const ownerUsers = users.filter((u) => u.role === "OWNER");

  return (
    <>
      <Navbar user={user} onLogout={onLogout} />
      <div className="container">
        <div className="dashboard-header">
          <h1>Admin Dashboard</h1>
          <p>Manage users, stores, and view system statistics</p>
        </div>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Users</h3>
            <div className="value">{stats.totalUsers}</div>
          </div>
          <div className="stat-card">
            <h3>Total Stores</h3>
            <div className="value">{stats.totalStores}</div>
          </div>
          <div className="stat-card">
            <h3>Total Ratings</h3>
            <div className="value">{stats.totalRatings}</div>
          </div>
        </div>

        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h2>Users</h2>
            <button className="btn btn-primary btn-sm" onClick={() => setShowUserModal(true)}>
              + Add User
            </button>
          </div>

          <div className="filters">
            <input name="name" placeholder="Search name" value={userFilters.name} onChange={handleUserFilterChange} />
            <input name="email" placeholder="Search email" value={userFilters.email} onChange={handleUserFilterChange} />
            <input name="address" placeholder="Search address" value={userFilters.address} onChange={handleUserFilterChange} />
            <select name="role" value={userFilters.role} onChange={handleUserFilterChange}>
              <option value="">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="USER">User</option>
              <option value="OWNER">Owner</option>
            </select>
            <button className="btn btn-secondary btn-sm" onClick={fetchUsers}>Search</button>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th className="sortable" onClick={() => toggleSort("user", "name")}>
                    Name{sortIcon("user", "name")}
                  </th>
                  <th className="sortable" onClick={() => toggleSort("user", "email")}>
                    Email{sortIcon("user", "email")}
                  </th>
                  <th className="sortable" onClick={() => toggleSort("user", "address")}>
                    Address{sortIcon("user", "address")}
                  </th>
                  <th className="sortable" onClick={() => toggleSort("user", "role")}>
                    Role{sortIcon("user", "role")}
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.address}</td>
                    <td>{roleBadge(u.role)}</td>
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={() => handleViewUser(u.id)}>
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h2>Stores</h2>
            <button className="btn btn-primary btn-sm" onClick={() => setShowStoreModal(true)}>
              + Add Store
            </button>
          </div>

          <div className="filters">
            <input name="name" placeholder="Search name" value={storeFilters.name} onChange={handleStoreFilterChange} />
            <input name="email" placeholder="Search email" value={storeFilters.email} onChange={handleStoreFilterChange} />
            <input name="address" placeholder="Search address" value={storeFilters.address} onChange={handleStoreFilterChange} />
            <button className="btn btn-secondary btn-sm" onClick={fetchStores}>Search</button>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th className="sortable" onClick={() => toggleSort("store", "name")}>
                    Name{sortIcon("store", "name")}
                  </th>
                  <th className="sortable" onClick={() => toggleSort("store", "email")}>
                    Email{sortIcon("store", "email")}
                  </th>
                  <th className="sortable" onClick={() => toggleSort("store", "address")}>
                    Address{sortIcon("store", "address")}
                  </th>
                  <th className="sortable" onClick={() => toggleSort("store", "rating")}>
                    Rating{sortIcon("store", "rating")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {stores.map((s) => (
                  <tr key={s.id}>
                    <td>{s.name}</td>
                    <td>{s.email}</td>
                    <td>{s.address}</td>
                    <td><strong>{s.rating || "0.0"}</strong> / 5</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedUser && (
        <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>User Details</h3>
            <div className="detail-grid">
              <div><strong>Name:</strong> {selectedUser.name}</div>
              <div><strong>Email:</strong> {selectedUser.email}</div>
              <div><strong>Address:</strong> {selectedUser.address}</div>
              <div><strong>Role:</strong> {roleBadge(selectedUser.role)}</div>
              {selectedUser.role === "OWNER" && (
                <>
                  {selectedUser.store && (
                    <div><strong>Store:</strong> {selectedUser.store.name}</div>
                  )}
                  <div><strong>Store Rating:</strong> {selectedUser.rating ?? "N/A"} / 5</div>
                </>
              )}
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setSelectedUser(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {showUserModal && (
        <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Add New User</h3>
            <form onSubmit={handleAddUser}>
              {["name", "email", "address", "password"].map((field) => (
                <div className="form-group" key={field}>
                  <label>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                  <input
                    name={field}
                    type={field === "password" ? "password" : field === "email" ? "email" : "text"}
                    value={userForm[field]}
                    onChange={(e) => setUserForm({ ...userForm, [field]: e.target.value })}
                    required
                  />
                  {formErrors[field] && <div className="error">{formErrors[field]}</div>}
                </div>
              ))}
              <div className="form-group">
                <label>Role</label>
                <select value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}>
                  <option value="USER">User</option>
                  <option value="OWNER">Owner</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowUserModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add User</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showStoreModal && (
        <div className="modal-overlay" onClick={() => setShowStoreModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Add New Store</h3>
            <form onSubmit={handleAddStore}>
              <div className="form-group">
                <label>Name</label>
                <input value={storeForm.name} onChange={(e) => setStoreForm({ ...storeForm, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={storeForm.email} onChange={(e) => setStoreForm({ ...storeForm, email: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Address</label>
                <textarea value={storeForm.address} onChange={(e) => setStoreForm({ ...storeForm, address: e.target.value })} required rows="3" />
              </div>
              <div className="form-group">
                <label>Owner (optional)</label>
                <select value={storeForm.ownerId} onChange={(e) => setStoreForm({ ...storeForm, ownerId: e.target.value })}>
                  <option value="">No owner</option>
                  {ownerUsers.map((u) => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowStoreModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Store</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminDashboard;
