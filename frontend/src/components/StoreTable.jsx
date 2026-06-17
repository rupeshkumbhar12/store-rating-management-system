const StoreTable = ({ stores, onRate, onUpdateRating, sortBy, sortOrder, onSort }) => {
  const sortIcon = (field) => {
    if (sortBy !== field) return " ↕";
    return sortOrder === "asc" ? " ↑" : " ↓";
  };

  const handleSort = (field) => {
    if (!onSort) return;
    onSort(field);
  };

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th className="sortable" onClick={() => handleSort("name")}>
              Store Name{sortIcon("name")}
            </th>
            <th className="sortable" onClick={() => handleSort("address")}>
              Address{sortIcon("address")}
            </th>
            <th className="sortable" onClick={() => handleSort("overallRating")}>
              Overall Rating{sortIcon("overallRating")}
            </th>
            <th className="sortable" onClick={() => handleSort("userRating")}>
              Your Rating{sortIcon("userRating")}
            </th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {stores.length === 0 ? (
            <tr>
              <td colSpan="5" style={{ textAlign: "center", color: "#64748b" }}>
                No stores found
              </td>
            </tr>
          ) : (
            stores.map((store) => (
              <tr key={store.id}>
                <td>{store.name}</td>
                <td>{store.address}</td>
                <td>
                  <strong>{store.overallRating}</strong> / 5
                </td>
                <td>
                  {store.userRating ? `${store.userRating} / 5` : "Not rated"}
                </td>
                <td>
                  {store.userRating ? (
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => onUpdateRating(store)}
                    >
                      Update Rating
                    </button>
                  ) : (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => onRate(store)}
                    >
                      Submit Rating
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default StoreTable;
