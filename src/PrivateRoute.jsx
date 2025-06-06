import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "./utils/supabase";

export default function PrivateRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        navigate("/login");
      } else {
        setLoading(false);
      }
    });
  }, [navigate]);

  if (loading) return null; // or a spinner

  return children;
}
