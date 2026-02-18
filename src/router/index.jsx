import { Routes, Route, Navigate } from "react-router-dom";
import PropTypes from "prop-types";
import Users from "../pages/User/Users";
import Account from "../pages/User/Account";
import TeamOne from "./../pages/Team/TeamOne/TeamOne";
import TeamTwo from "./../pages/Team/TeamTwo/TeamTwo";
import Files from "./../pages/Files/Files";
import Report from "../pages/Report/Report";
import Login from "../pages/Auth/Login";

function Router({ isAuthenticated }) {
  const guard = (element) =>
    isAuthenticated ? element : <Navigate to="/login" replace />;

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/report" replace /> : <Login />
        }
      />
      <Route
        path="/"
        element={
          <Navigate to={isAuthenticated ? "/report" : "/login"} replace />
        }
      />
      <Route path="/report" element={guard(<Report />)} />
      <Route path="/user/users" element={guard(<Users />)} />
      <Route path="/user/account" element={guard(<Account />)} />
      <Route path="/TeamOne" element={guard(<TeamOne />)} />
      <Route path="/TeamTwo" element={guard(<TeamTwo />)} />
      <Route path="/Files" element={guard(<Files />)} />
      <Route
        path="*"
        element={
          <Navigate to={isAuthenticated ? "/report" : "/login"} replace />
        }
      />
    </Routes>
  );
}

Router.propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
};

export default Router;
