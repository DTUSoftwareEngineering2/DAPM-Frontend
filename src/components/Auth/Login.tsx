import { useRef, useState, useEffect } from "react";
import axios from "../../services/backendAPI";
import { AxiosError } from "axios";
import useAuth from "../../hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";

// s232976
// Function for handling login
const Login = () => {
  const { setAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const emailRef = useRef<HTMLInputElement>(null);
  const errRef = useRef<HTMLParagraphElement>(null);

  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    emailRef.current && emailRef.current.focus();
  }, []);

  useEffect(() => {
    setErrMsg("");
  }, [email, pwd]);

  // function for handling submit of form
  // if FE validation is passed, request is made to the endpoint
  // if request is successful, user is logged in and navigated to the home page
  // in case if request is not successful, error message is displayed
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "Auth/login",
        JSON.stringify({ email, password: pwd })
      );
      setAuth({
        email,
        pwd,
        accessToken: response.data.accessToken,
        role: response.data.user.userRole,
      });
      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("role", response.data.user.userRole.toString());
      setEmail("");
      setPwd("");
      navigate(from, { replace: true });
    } catch (err) {
      if (err instanceof AxiosError) {
        if (!err?.response) {
          setErrMsg("No Server Response");
        } else if (err.response?.status === 400) {
          setErrMsg("Missing Emailname or Password");
        } else if (err.response?.status === 401) {
          setErrMsg("Unauthorized, contact Admin or or Manager");
        } else {
          setErrMsg("Login Failed");
        }
      }
    }
  };
  // HTML for Login form
  return (
    <section>
      <p
        ref={errRef}
        className={errMsg ? "errmsg" : "offscreen"}
        aria-live="assertive">
        {errMsg}
      </p>
      <h1>Sign In</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Email:</label>
        <input
          type="text"
          id="email"
          ref={emailRef}
          autoComplete="off"
          onChange={e => setEmail(e.target.value)}
          value={email}
          required></input>{" "}
        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          onChange={e => setPwd(e.target.value)}
          value={pwd}
          required></input>{" "}
        <button disabled={!email || !pwd}>Sign In</button>
      </form>
      <p>
        Need an Account? <br />
        <a href="/register">Sign Up</a>
      </p>
    </section>
  );
};

export default Login;
