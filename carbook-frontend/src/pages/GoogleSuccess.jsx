import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const GoogleSuccess = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const hasHandledSuccess = useRef(false);

  useEffect(() => {
    if (!hasHandledSuccess.current) {
      handleGoogleSuccess();
      hasHandledSuccess.current = true;
    }
  }, []);

  const handleGoogleSuccess = async () => {
    try {
      const { data } = await axiosInstance.get("/auth/me");
      login(data.user);
      toast.success(`Welcome, ${data.user.name}! 🎉`);
      navigate("/");
    } catch (error) {
      toast.error("Google login failed. Please try again.");
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="text-gray-400">Completing Google login...</p>
    </div>
  );
};

export default GoogleSuccess;
