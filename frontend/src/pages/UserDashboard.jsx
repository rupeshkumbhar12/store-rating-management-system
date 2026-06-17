import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import StoreTable from "../components/StoreTable";
import { storeAPI, ratingAPI } from "../services/api";

const UserDashboard = ({ user, onLogout }) => {
  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState({ name: "", address: "" });
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [selectedStore, setSelectedStore] = useState(null);
  const [rating, setRating] = useState(0);
  const [isUpdate, setIsUpdate] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchStores = async (filters = search, sort = { sortBy, sortOrder }) => {
    try {
      const params = Object.fromEntries(
        Object.entries({ ...filters, ...sort }).filter(([, value]) => value)
      );
      const { data } = await storeAPI.getStores(params);
      setStores(data);
    } catch (err) {
      setError("Failed to load stores");
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  useEffect(() => {
    if (sortBy) {
      fetchStores(search, { sortBy, sortOrder });
    }
  }, [sortBy, sortOrder]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchStores(search, { sortBy, sortOrder });
  };

  const handleSort = (field) => {
    setSortBy(field);
    setSortOrder((prev) => (sortBy === field && prev === "asc" ? "desc" : "asc"));
  };

  const handleRate = (store) => {
    setSelectedStore(store);
    setRating(0);
    setIsUpdate(false);
  };

  const handleUpdateRating = (store) => {
    setSelectedStore(store);
    setRating(store.userRating || 0);
    setIsUpdate(true);
  };

  const submitRating = async () => {
    if (rating < 1 || rating > 5) {
      setError("Please select a rating between 1 and 5");
      return;
    }

    try {
      if (isUpdate) {
        await ratingAPI.updateRating(selectedStore.id, { rating });
        setMessage("Rating updated successfully");
      } else {
        await ratingAPI.submitRating({ storeId: selectedStore.id, rating });
        setMessage("Rating submitted successfully");
      }
      setSelectedStore(null);
      setRating(0);
      fetchStores(search, { sortBy, sortOrder });
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to submit rating");
    }
  };

  return (
    <>
      <Navbar user={user} onLogout={onLogout} onMessage={setMessage} />
      <div className="container">
        <div className="dashboard-header">
          <h1>User Dashboard</h1>
          <p>Browse stores and submit your ratings</p>
        </div>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        <div className="card">
          <form onSubmit={handleSearch} className="filters">
            <input
              name="name"
              placeholder="Search by store name"
              value={search.name}
              onChange={(e) => setSearch({ ...search, name: e.target.value })}
            />
            <input
              name="address"
              placeholder="Search by address"
              value={search.address}
              onChange={(e) => setSearch({ ...search, address: e.target.value })}
            />
            <button type="submit" className="btn btn-secondary btn-sm">Search</button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                const cleared = { name: "", address: "" };
                setSearch(cleared);
                fetchStores(cleared, { sortBy, sortOrder });
              }}
            >
              Clear
            </button>
          </form>

          <StoreTable
            stores={stores}
            onRate={handleRate}
            onUpdateRating={handleUpdateRating}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
          />
        </div>
      </div>

      {selectedStore && (
        <div className="modal-overlay" onClick={() => setSelectedStore(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{isUpdate ? "Update" : "Submit"} Rating for {selectedStore.name}</h3>
            <p style={{ color: "#64748b", marginBottom: "1rem" }}>Select a rating from 1 to 5 stars</p>
            <div className="rating-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`star-btn ${star <= rating ? "active" : ""}`}
                  onClick={() => setRating(star)}
                >
                  ★
                </button>
              ))}
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setSelectedStore(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={submitRating}>
                {isUpdate ? "Update" : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserDashboard;
