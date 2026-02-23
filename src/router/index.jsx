import { Routes, Route, Navigate } from "react-router-dom";
import PropTypes from "prop-types";
import Users from "../pages/User/Users";
import Account from "../pages/User/Account";
// import Files from "./../pages/Files/Files";
import Report from "../pages/Report/Report";
import Instruments from "../pages/Instruments";
import Login from "../pages/Login";
import ErrorPage from "../pages/Error/ErrorPage";

const canAccessUsersPage = (role) => {
  const normalizedRole = String(role || "").toLowerCase();
  return normalizedRole === "admin" || normalizedRole === "boss";
};

function Router({ isAuthenticated, onLogin, userRole }) {
  const guard = (element) =>
    isAuthenticated ? element : <Navigate to="/login" replace />;

  const usersRouteElement =
    isAuthenticated && !canAccessUsersPage(userRole) ? (
      <Navigate to="/403" replace />
    ) : (
      <Users />
    );

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/report" replace />
          ) : (
            <Login onLogin={onLogin} />
          )
        }
      />
      <Route
        path="/"
        element={
          <Navigate to={isAuthenticated ? "/report" : "/login"} replace />
        }
      />
      <Route path="/report" element={guard(<Report />)} />
      <Route path="/instruments" element={guard(<Instruments />)} />
      <Route path="/user/users" element={guard(usersRouteElement)} />
      <Route path="/user/account" element={guard(<Account />)} />
      <Route path="/403" element={<ErrorPage code={403} />} />
      <Route path="/404" element={<ErrorPage code={404} />} />
      <Route path="/500" element={<ErrorPage code={500} />} />
      {/* <Route path="/Files" element={guard(<Files />)} /> */}
      <Route path="*" element={<ErrorPage code={404} />} />
    </Routes>
  );
}

Router.propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
  onLogin: PropTypes.func.isRequired,
  userRole: PropTypes.string,
};

export default Router;
