import { useRef, useState, useEffect } from "react";
import { AxiosError } from "axios";
import axios from "../../services/backendAPI";
import {
  faCheck,
  faTimes,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAppSelector } from "../../hooks/hooks";
import { getOrganizations } from "../../redux/selectors/apiSelector";
import { Organization } from "../../redux/states/apiState";
import { useNavigate } from "react-router-dom";

// s232976
// Component for user registration
const Register = () => {
  const navigate = useNavigate();
  // Organizations are fetched from the redux store enabling users to sign up to a specific organization
  const organizations: Organization[] = useAppSelector(getOrganizations);

  // Regex for validating email and password
  const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const PWD_REGEX = /^(?=.*[a-z])[a-zA-Z0-_]{8,24}$/;
  const emailRef = useRef<HTMLInputElement>(null);
  const errRef = useRef<HTMLParagraphElement>(null);

  // use effects and form elements declared for form validation and user feedback
  const [email, setUser] = useState("");
  const [validEmail, setValidEmail] = useState(false);
  const [emailFocus, setEmailFocus] = useState(false);
  const [pwd, setPwd] = useState("");
  const [validPwd, setValidPwd] = useState(false);
  const [pwdFocus, setPwdFocus] = useState(false);
  const [matchPwd, setMatchPwd] = useState("");
  const [validMatch, setValidMatch] = useState(false);
  const [matchFocus, setMatchFocus] = useState(false);
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [organization, setOrganization] = useState("");
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    emailRef.current && emailRef.current.focus();
  }, []);

  useEffect(() => {
    setValidEmail(EMAIL_REGEX.test(email));
  }, [email]);

  useEffect(() => {
    setValidPwd(PWD_REGEX.test(pwd));
    setValidMatch(pwd === matchPwd);
  }, [pwd, matchPwd]);

  useEffect(() => {
    setErrMsg("");
  }, [email, pwd, matchPwd]);

  // function for handling submit of form
  // if FE validation is passed, request is made to the endpoint
  // if request is successful, user is logged in and navigated to the Login page
  // login is always required before accessing the application
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v1 = EMAIL_REGEX.test(email);
    const v2 = PWD_REGEX.test(pwd);
    if (!v1 || !v2) {
      setErrMsg("Invalid Entry");
      return;
    }
    try {
      await axios.post(
        "Auth/signup",
        JSON.stringify({
          email,
          lastName,
          firstName,
          organization,
          password: pwd,
        })
      );
      navigate("/login", { replace: true });
    } catch (err) {
      if (err instanceof AxiosError) {
        if (!err?.response) {
          setErrMsg("No Server Response");
        } else if (err.response?.status === 409) {
          setErrMsg("Username Taken");
        } else {
          setErrMsg("Registration Failed");
        }
        errRef.current?.focus();
      }
    }
  };

  // form for user registration
  // form fields are validated and user feedback is provided
  return (
    <section>
      <p
        ref={errRef}
        className={errMsg ? "errmsg" : "offscreen"}
        aria-live="assertive">
        {errMsg}
      </p>
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">
          Email:
          <FontAwesomeIcon
            icon={faCheck}
            className={validEmail ? "valid" : "hide"}
          />
          <FontAwesomeIcon
            icon={faTimes}
            className={validEmail || !email ? "hide" : "invalid"}
          />
        </label>
        <input
          type="text"
          id="email"
          ref={emailRef}
          autoComplete="off"
          onChange={e => setUser(e.target.value)}
          value={email}
          required
          aria-invalid={validEmail ? "false" : "true"}
          aria-describedby="uidnote"
          onFocus={() => setEmailFocus(true)}
          onBlur={() => setEmailFocus(false)}
        />
        <p
          id="uidnote"
          className={
            emailFocus && email && !validEmail ? "instructions" : "offscreen"
          }>
          <FontAwesomeIcon icon={faInfoCircle} />
          3 to 32 characters.
          <br />
          Must be a valid email address.
        </p>

        <label htmlFor="lastName">Last Name:</label>
        <input
          type="text"
          id="lastName"
          onChange={e => setLastName(e.target.value)}
          value={lastName}
          required
        />

        <label htmlFor="firstName">First Name:</label>
        <input
          type="text"
          id="firstName"
          onChange={e => setFirstName(e.target.value)}
          value={firstName}
          required
        />

        <label htmlFor="organization">Organization:</label>
        <select
          id="organization"
          value={organization}
          onChange={e => setOrganization(e.target.value)}
          required>
          <option value="">Select organization</option>
          {organizations.map(org => (
            <option key={org.id} value={org.id}>
              {org.name}
            </option>
          ))}
        </select>
        <label htmlFor="password">
          Password:
          <FontAwesomeIcon
            icon={faCheck}
            className={validPwd ? "valid" : "hide"}
          />
          <FontAwesomeIcon
            icon={faTimes}
            className={validPwd || !pwd ? "hide" : "invalid"}
          />
        </label>
        <input
          type="password"
          id="password"
          onChange={e => setPwd(e.target.value)}
          value={pwd}
          required
          aria-invalid={validPwd ? "false" : "true"}
          aria-describedby="pwdnote"
          onFocus={() => setPwdFocus(true)}
          onBlur={() => setPwdFocus(false)}
        />
        <p
          id="pwdnote"
          className={pwdFocus && !validPwd ? "instructions" : "offscreen"}>
          <FontAwesomeIcon icon={faInfoCircle} />
          8 to 24 characters.
          <br />
          Allowed special characters:
          {" Hyphens, Underscores), Numbers"}
        </p>

        <label htmlFor="confirm_pwd">
          Confirm Password:
          <FontAwesomeIcon
            icon={faCheck}
            className={validMatch && matchPwd ? "valid" : "hide"}
          />
          <FontAwesomeIcon
            icon={faTimes}
            className={validMatch || !matchPwd ? "hide" : "invalid"}
          />
        </label>
        <input
          type="password"
          id="confirm_pwd"
          onChange={e => setMatchPwd(e.target.value)}
          value={matchPwd}
          required
          aria-invalid={validMatch ? "false" : "true"}
          aria-describedby="confirmnote"
          onFocus={() => setMatchFocus(true)}
          onBlur={() => setMatchFocus(false)}
        />
        <p
          id="confirmnote"
          className={matchFocus && !validMatch ? "instructions" : "offscreen"}>
          <FontAwesomeIcon icon={faInfoCircle} />
          Must match the first password input field.
        </p>

        <button
          disabled={!validEmail || !validPwd || !validMatch ? true : false}>
          Sign Up
        </button>
      </form>
      <p>
        Already registered?
        <br />
        <span className="line">
          <a href="/login">Sign In</a>
        </span>
      </p>
    </section>
  );
};
export default Register;
