import React, { useState, useEffect } from "react";
import "./Auth.css";
import Logo from "../images/chat.png";
import { logIn, signUp, clearAuthError } from "../../actions/AuthActions.js";
import { useDispatch, useSelector } from "react-redux";

const Auth = () => {
  const dispatch = useDispatch();
  const loading = useSelector((state) => state.authReducer.loading);
  const error = useSelector((state) => state.authReducer.error);

  const [isSignUp, setIsSignUp] = useState(false);

  const initialState = {
    firstname: "",
    lastname: "",
    username: "",
    email: "",
    password: "",
    confirmpass: "",
    gender: "",
  };

  const [data, setData] = useState(initialState);
  const [confirmPass, setConfirmPass] = useState(true);

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });

    if (!confirmPass && (e.target.name === "password" || e.target.name === "confirmpass"))
      setConfirmPass(true);

    if (error) dispatch(clearAuthError());
  };

  const resetForm = () => {
    setData(initialState);
    setConfirmPass(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isSignUp) {
      if (data.password === data.confirmpass) {
        setConfirmPass(true);
        dispatch(signUp(data));
      } else {
        setConfirmPass(false);
      }
    } else {
      dispatch(logIn({ email: data.email, password: data.password }));
    }
  };

  return (
    <div className="Auth">
      <div className="a-left">
        <img src={Logo} alt="Logo" className="logoImage" />
        <div className="welcomeText">
          <span className="helloText">Hello</span>
          <span className="pinkChampsText">PinkChamps! 👋</span>
          <p className="description">
            Welcome to HealthPilot – AI guides your health journey. <br />
            {isSignUp ? "Create an account" : "Log in to your account"}.
          </p>
        </div>
        <div className="copyright">© {new Date().getFullYear()} HealthPilot. All rights reserved.</div>
      </div>

      <div className="a-right">
        <h1 className="pinkChampsTopic">PinkChamps</h1>
        <form className="infoForm authForm" onSubmit={handleSubmit}>
          <h2>{isSignUp ? "Register" : "Login"}</h2>

          {/* Signup only fields */}
          {isSignUp && (
            <>
              <div className="inputGroup">
                <input
                  required
                  type="text"
                  placeholder="First Name"
                  className="infoInput"
                  name="firstname"
                  value={data.firstname}
                  onChange={handleChange}
                />
                <input
                  required
                  type="text"
                  placeholder="Last Name"
                  className="infoInput"
                  name="lastname"
                  value={data.lastname}
                  onChange={handleChange}
                />
              </div>

              <div className="inputGroup">
                <input
                  required
                  type="text"
                  placeholder="Username"
                  className="infoInput"
                  name="username"
                  value={data.username}
                  onChange={handleChange}
                />
                <select
                  required
                  className="infoInput"
                  name="gender"
                  value={data.gender || ""}
                  onChange={handleChange}
                >
                  <option value="" disabled style={{ color: "#aaa" }}>Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </>
          )}

          {/* Email input (login & signup) */}
          <div className="inputGroup">
            <input
              required
              type="email"
              placeholder="Email"
              className="infoInput"
              name="email"
              value={data.email}
              onChange={handleChange}
            />
          </div>

          {/* Password input */}
          <div className="inputGroup">
            <input
              required
              type="password"
              placeholder="Password"
              className="infoInput"
              name="password"
              value={data.password}
              onChange={handleChange}
            />
            {isSignUp && (
              <input
                required
                type="password"
                placeholder="Confirm Password"
                className="infoInput"
                name="confirmpass"
                value={data.confirmpass}
                onChange={handleChange}
              />
            )}
          </div>

          {/* Confirm password error */}
          <span style={{ color: "red", fontSize: "12px", display: confirmPass ? "none" : "block" }}>
            *Confirm password is not same
          </span>

          {/* Login error */}
          {!isSignUp && error && <span style={{ color: "red", fontSize: "12px" }}>{error}</span>}

          <div>
            <span
              style={{ fontSize: "12px", cursor: "pointer", textDecoration: "underline" }}
              onClick={() => {
                resetForm();
                setIsSignUp((prev) => !prev);
                dispatch(clearAuthError());
              }}
            >
              {isSignUp ? "Already have an account? Login" : "Don't have an account? Sign up"}
            </span>

            <button className="button infoButton" type="submit" disabled={loading}>
              {loading ? "Loading..." : isSignUp ? "SignUp" : "Login"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Auth;
