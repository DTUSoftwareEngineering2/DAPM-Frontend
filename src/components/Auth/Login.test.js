
// s232976
// testing of Login component

// Mock of Axios post request, manually setting correct and incorrect responses
function mockAxiosPost(url, data) {
  return new Promise((resolve, reject) => {
    if (data.email === "test@test.com" && data.password === "password") {
      resolve({
        data: {
          accessToken: "0123456789",
          user: { userRole: 1 },
        },
      });
    } else {
      reject({
        isAxiosError: true, // Ensure error mimics AxiosError structure
        response: {
          status: 401,
          data: { message: "Unauthorized" }, // Include error message if needed
        },
      });
    }
  });
}


// Mock of Login component logic
function Login() {
  let email = '';
  let pwd = '';
  let errMsg = '';

  const setEmail = (value) => email = value;
  const setPwd = (value) => pwd = value;

// Function for handling submit of form, and error message
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(email, pwd);
    try {
      const response = await mockAxiosPost("Auth/login", { email, password: pwd });
      errMsg = ''; // Clear error message on success
      console.log("Login Success:", response.data);
    } catch (err) {
      if (err.response?.status === 401) {
        console.log("ErrMsg: Unauthorized, contact Admin or Manager");
      } else {
        console.log("Login Failed");
      }
    }
  };

  return {
    email,
    pwd,
    errMsg,
    handleSubmit,
    setEmail,
    setPwd
  };
}

// Test runner function
function runTest() {
  console.log("Running tests...");
  const login = Login();

  // Test 1: Simulate correct login credentials
  console.log("Test 1: Successful login with correct credentials...");
  login.setEmail("test@test.com");
  login.setPwd("password");
  login.handleSubmit({ preventDefault: () => {} });
  console.log("Expected: No error message (successful login)");
  console.log("Actual: ", login.errMsg);

  // Test 2: Simulate incorrect login credentials
  setTimeout(() => {
      console.log("\nTest 2: Failed login with incorrect credentials...");
      login.setEmail("wrong@test.com");
      login.setPwd("wrongpassword");
      login.handleSubmit({ preventDefault: () => {} });
      console.log("Expected: Unauthorized, contact Admin or Manager");
  }, 1000)
}

runTest();
