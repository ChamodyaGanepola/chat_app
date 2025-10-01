import React, { useState, useEffect } from "react";
import "./Auth.css";
import Logo from "../images/chat.png";
import { logIn, signUp, clearAuthError } from "../../actions/AuthActions.js";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const Auth = () => {
  // Initial empty form data
  const initialState = {
    firstname: "",
    lastname: "",
    username: "",
    password: "",
    confirmpass: "",
  };
 
  // Get loading state from Redux (true when login/signup is in progress)
  const loading = useSelector((state) => state.authReducer.loading);
  // Get error state
  const error = useSelector((state) => state.authReducer.error);

  // No need Hook to redirect user after login/signup. since in App.jsx route automatically changes based on auth state.
  //const navigate = useNavigate();
  
  // Hook to dispatch actions to Redux store
  const dispatch = useDispatch();
  // State to toggle between Login and Signup
  const [isSignUp, setIsSignUp] = useState(false);
  // Store form data
  const [data, setData] = useState(initialState);
  // Check confirm password match
  const [confirmPass, setConfirmPass] = useState(true);

  // Reset the form fields
  const resetForm = () => {
    setData(initialState);
    setConfirmPass(true);
  };

  // Update state when input fields change
const handleChange = (e) => {
  setData({ ...data, [e.target.name]: e.target.value });

  // Clear confirm password error as soon as user types in password/confirm fields
  if (!confirmPass && (e.target.name === "password" || e.target.name === "confirmpass")) {
    setConfirmPass(true);
  }

  // Clear login/signup error when typing in any field
  if (error) dispatch(clearAuthError());
};



  //to clear errors when the component mounts:
  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);


  // Handle form submit (Login or Signup)
 
  const handleSubmit = (e) => {
  e.preventDefault();
  if (isSignUp) {
    // If SignUp → check if passwords match
    if (data.password === data.confirmpass) {
      setConfirmPass(true); // only set true when passwords match
      dispatch(signUp(data));
    } else {
      setConfirmPass(false); // show error if passwords don't match
    }
  } else {
    //logIn(data) as preparing a package. dispatch(package) sends it to the store. Redux Thunk opens the package and does the job inside.
    dispatch(logIn(data));
  }
};


  return (
    <div className="Auth">
      {/* left side with logo */}

      <div className="a-left">
        <img src={Logo} alt="Logo" className="logoImage" />

        <div className="welcomeText">
          <span className="helloText">Hello</span>
          <span className="pinkChampsText">
            PinkChamps!{" "}
            <span role="img" aria-label="wave">
              👋
            </span>
          </span>
          <p className="description">
            Welcome to PinkChamps – chat with your friends in real time and
            enjoy every moment! <br />
            First, create an account or log in to your existing account. Then,
            start chatting with any available users and make new friends
            instantly.
          </p>
        </div>
        <div className="copyright">
          © {new Date().getFullYear()} PinkChamps. All rights reserved.
        </div>
      </div>

      {/* right side with form */}

      <div className="a-right">
        <h1 className="pinkChampsTopic">PinkChamps</h1>
        <form className="infoForm authForm" onSubmit={handleSubmit}>
          {/* Heading changes based on Login/Signup */}
          <h2>{isSignUp ? "Register" : "Login"}</h2>
          {/* Show Firstname/Lastname fields only in SignUp mode */}
          {isSignUp && (
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
          )}
          {/* Username input  for both mode*/}
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
          </div>

          {/* Password input (and Confirm Password only in SignUp mode) */}
          {/* Password input */}
          <div className="inputGroup">
            <input
              required
              type="password"
              className="infoInput"
              placeholder="Password"
              name="password"
              value={data.password}
              onChange={handleChange}
            />
            {isSignUp && (
              <input
                required
                type="password"
                className="infoInput"
                name="confirmpass"
                placeholder="Confirm Password"
                onChange={handleChange}
              />
            )}
          </div>

          {/* Confirm password error */}
          <span
            style={{
              color: "red",
              fontSize: "12px",
              alignSelf: "flex-end",
              marginRight: "5px",
              display: confirmPass ? "none" : "block",
            }}
          >
            *Confirm password is not same
          </span>

          {/* Login error */}
          {!isSignUp && error && (
            <span style={{ color: "red", fontSize: "12px" }}>{error}</span>
          )}

          <div>
            {/* Switch between Login and SignUp */}
            <span
              style={{
                fontSize: "12px",
                cursor: "pointer",
                textDecoration: "underline",
              }}
              onClick={() => {
                resetForm();
                setIsSignUp((prev) => !prev);
                dispatch(clearAuthError()); // clear error when switching forms
              }}
            >
              {isSignUp
                ? "Already have an account Login"
                : "Don't have an account Sign up"}
            </span>
            {/* Submit button shows Loading while Redux is processing */}
            <button
              className="button infoButton"
              type="Submit"
              disabled={loading}
            >
              {loading ? "Loading..." : isSignUp ? "SignUp" : "Login"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Auth;
