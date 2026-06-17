import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ChangePasswordModal from "./ChangePasswordModal";

const Navbar = ({ user, onLogout, onMessage }) => {
  const navigate = useNavigate();
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const handleLogout = () => {
    onLogout();
    navigate("/");
  };

  const roleLabel = {
    ADMIN: "Admin",
    USER: "User",
    OWNER: "Store Owner",
  };

  const canChangePassword = user && (user.role === "USER" || user.role === "OWNER");

  return (
    <>
      <nav className="navbar">
        <div className="navbar-brand">Store Rating System</div>
        <div className="navbar-actions">
          {user && (
            <span className="navbar-user">
              {user.name} ({roleLabel[user.role] || user.role})
            </span>
          )}
          {canChangePassword && (
            <button className="btn btn-secondary btn-sm" onClick={() => setShowPasswordModal(true)}>
              Change Password
            </button>
          )}
          <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      {showPasswordModal && (
        <ChangePasswordModal
          onClose={() => setShowPasswordModal(false)}
          onSuccess={(msg) => onMessage?.(msg)}
        />
      )}
    </>
  );
};

export default Navbar;
