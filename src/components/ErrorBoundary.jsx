import React from "react";
import PropTypes from "prop-types";
import ErrorPage from "../pages/Error/ErrorPage";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error("Unhandled UI error:", error);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorPage code={500} />;
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ErrorBoundary;
