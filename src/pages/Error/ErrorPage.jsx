import { Button } from "antd";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

const pageMap = {
  403: {
    title: "No permission",
    description:
      "The page you’re trying to access has restricted access. Please refer to your system administrator.",
  },
  404: {
    title: "Sorry, page not found!",
    description:
      "Sorry, we couldn’t find the page you’re looking for. Perhaps you’ve mistyped the URL? Be sure to check your spelling.",
  },
  500: {
    title: "500 Internal server error",
    description: "There was an error, please try again later.",
  },
};

function ErrorPage({ code = 404 }) {
  const content = pageMap[code] || pageMap[404];

  return (
    <div
      style={{
        minHeight: "calc(100vh - 114px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 600,
          textAlign: "center",
        }}
      >
        <h1 style={{ marginBottom: 8 }}>{content.title}</h1>
        <p style={{ marginBottom: 32, color: "#5f7387" }}>
          {content.description}
        </p>
        <div
          style={{
            fontSize: 92,
            fontWeight: 700,
            lineHeight: 1,
            color: "#1d4fd7",
            marginBottom: 28,
          }}
        >
          {code}
        </div>
        <Link to="/report">
          <Button
            type="primary"
            style={{
              height: 44,
              paddingInline: 24,
              borderRadius: 10,
            }}
          >
            Go to home
          </Button>
        </Link>
      </div>
    </div>
  );
}

ErrorPage.propTypes = {
  code: PropTypes.number,
};

export default ErrorPage;
