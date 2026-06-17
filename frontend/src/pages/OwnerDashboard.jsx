import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { ownerAPI } from "../services/api";

const OwnerDashboard = ({ user, onLogout }) => {
  const [averageRating, setAverageRating] = useState(0);
  const [ratedUsers, setRatedUsers] = useState([]);
  const [sortBy, setSortBy] = useState("user");
  const [sortOrder, setSortOrder] = useState("asc");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [avgRes, usersRes] = await Promise.all([
          ownerAPI.getAverageRating(),
          ownerAPI.getRatedUsers(),
        ]);
        setAverageRating(avgRes.data.averageRating);
        setRatedUsers(usersRes.data);
      } catch (err) {
        setError(err.response?.data?.msg || "Failed to load owner data. Ensure a store is assigned to you.");
      }
    };
    fetchData();
  }, []);

  const toggleSort = (field) => {
    setSortBy(field);
    setSortOrder((prev) => (sortBy === field && prev === "asc" ? "desc" : "asc"));
  };

  const sortIcon = (field) => {
    if (sortBy !== field) return " ↕";
    return sortOrder === "asc" ? " ↑" : " ↓";
  };

  const sortedUsers = [...ratedUsers].sort((a, b) => {
    const direction = sortOrder === "asc" ? 1 : -1;
    if (sortBy === "rating") {
      return (a.rating - b.rating) * direction;
    }
    return a.user.localeCompare(b.user) * direction;
  });

  return (
    <>
      <Navbar user={user} onLogout={onLogout} onMessage={setMessage} />
      <div className="container">
        <div className="dashboard-header">
          <h1>Store Owner Dashboard</h1>
          <p>View your store's ratings and customer feedback</p>
        </div>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        <div className="stats-grid">
          <div className="stat-card">
            <h3>Average Rating</h3>
            <div className="value">{averageRating} / 5</div>
          </div>
          <div className="stat-card">
            <h3>Total Ratings</h3>
            <div className="value">{ratedUsers.length}</div>
          </div>
        </div>

        <div className="card">
          <h2>Users Who Rated Your Store</h2>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th className="sortable" onClick={() => toggleSort("user")}>
                    User{sortIcon("user")}
                  </th>
                  <th className="sortable" onClick={() => toggleSort("rating")}>
                    Rating{sortIcon("rating")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedUsers.length === 0 ? (
                  <tr>
                    <td colSpan="2" style={{ textAlign: "center", color: "#64748b" }}>
                      No ratings yet
                    </td>
                  </tr>
                ) : (
                  sortedUsers.map((item, index) => (
                    <tr key={index}>
                      <td>{item.user}</td>
                      <td>
                        <strong>{item.rating}</strong> / 5
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default OwnerDashboard;
