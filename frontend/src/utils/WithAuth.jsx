import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const WithAuth = (WrappedComponent) => {
  const AuthComponent = (props) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/auth");
      } else {
        setLoading(false);
      }
    }, [navigate]);

    if (loading) {
      return null; 
    }

    return <WrappedComponent {...props} />;
  };

  return AuthComponent;
};

export default WithAuth;
