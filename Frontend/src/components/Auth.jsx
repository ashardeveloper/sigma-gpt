import { useState, useContext } from "react";
import { MyContext } from "../MyContext";
import styles from "./Auth.module.css";
import { v1 as uuidv1 } from "uuid";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

function Auth({ mode }) {
  const {
    setToken,
    setUser,
    setIsAuthenticated,
    setPrevChats,
    setReply,
    setPrompt,
    setNewChat,
    setCurrThreadId,
    setIsGuest,
  } = useContext(MyContext);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;

  //const [isLogin, setIsLogin] = useState(true);
  const isLogin = mode === "login";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async () => {
    const endpoint = isLogin
      ? `${API_URL}/api/auth/login`
      : `${API_URL}/api/auth/signup`;

    const body = isLogin
      ? {
          email: formData.email,
          password: formData.password,
        }
      : formData;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error);
        return;
      }

      // Signup success
      if (!isLogin) {
        alert("Account created successfully. Please login.");

        setFormData({
          name: "",
          email: "",
          password: "",
        });

        navigate("/login");

        return;
      }

      // Login success

      localStorage.setItem("token", data.token);

      setPrevChats([]);
      setReply(null);
      setPrompt("");
      setNewChat(true);
      setCurrThreadId(uuidv1());

      setToken(data.token);
      setUser(data.user);
      setIsAuthenticated(true);
      navigate("/chat");
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }
  };

  const continueAsGuest = () => {
    setIsGuest(true);

    setIsAuthenticated(true);

    navigate("/chat");
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <h1 className={styles.heading}>
          {isLogin ? "Welcome Back" : "Create Account"}
        </h1>

        {!isLogin && (
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            className={styles.input}
          />
        )}

        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
          className={styles.input}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className={styles.input}
        />

        <button className={styles.submitBtn} onClick={handleSubmit}>
          {isLogin ? "Login" : "Sign Up"}
        </button>

        <button className={styles.guestBtn} onClick={continueAsGuest}>
          Continue as Guest →
        </button>

        <p className={styles.switchText}>
          {isLogin ? "Don't have an account?" : "Already have an account?"}
        </p>

        {isLogin ? (
          <Link to="/signup" className={styles.switchBtn}>
            Create Account
          </Link>
        ) : (
          <Link to="/login" className={styles.switchBtn}>
            Login Instead
          </Link>
        )}
      </div>
    </div>
  );
}

export default Auth;
