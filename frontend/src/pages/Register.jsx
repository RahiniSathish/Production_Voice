import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function Register() {
  const navigate = useNavigate();

  // Redirect to login page since we have combined login/register
  useEffect(() => {
    navigate("/login");
  }, [navigate]);

  return null;
}

