// s232976
// Testing of Register component
// Regex patterns for validating email and password inputs
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PWD_REGEX = /^(?=.*[a-z])[a-zA-Z0-_]{8,24}$/;

// Mock Axios POST function to simulate API response during testing
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
        isAxiosError: true,
        response: {
          status: 409,
          data: { message: "Username Taken" },
        },
      });
    }
  });
}

// Simulates the behavior of the Register component
function Register() {
  // Component state variables
  let email = '', pwd = '', matchPwd = '', firstName = '', lastName = '', organization = '';

  // State setters for test inputs
  const setEmail = (value) => email = value;
  const setPwd = (value) => pwd = value;
  const setMatchPwd = (value) => matchPwd = value;
  const setFirstName = (value) => firstName = value;
  const setLastName = (value) => lastName = value;
  const setOrganization = (value) => organization = value;

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate input fields
    if (!EMAIL_REGEX.test(email) || !PWD_REGEX.test(pwd) || pwd !== matchPwd) {
      return Promise.resolve("Invalid Entry");
    }

    // Mock API call to simulate registration logic
    return mockAxiosPost("Auth/signup", {
      email, lastName, firstName, organization, password: pwd,
    })
      .then(() => "Registration Success")
      .catch((err) => err.response?.status === 409 ? "Username Taken" : "Registration Failed");
  };

  return {
    setEmail, setPwd, setMatchPwd, setFirstName, setLastName, setOrganization, handleSubmit,
  };
}

// Runs a series of tests on the Register component
async function runRegisterTest() {
  console.log("Running Register component tests...");

  const register = Register();

  // Test 1: Successful registration
  console.log("\nTest 1: Successful registration...");
  register.setEmail("test@test.com");
  register.setPwd("password");
  register.setMatchPwd("password");
  register.setFirstName("John");
  register.setLastName("Doe");
  register.setOrganization("Org1");
  const result1 = await register.handleSubmit({ preventDefault: () => {} });
  console.log("Expected: Registration Success");
  console.log("Actual:", result1);

  // Test 2: Username already taken
  console.log("\nTest 2: Username already taken...");
  register.setEmail("taken@test.com");
  register.setPwd("password");
  register.setMatchPwd("password");
  const result2 = await register.handleSubmit({ preventDefault: () => {} });
  console.log("Expected: Username Taken");
  console.log("Actual:", result2);

  // Test 3: Passwords do not match
  console.log("\nTest 3: Mismatched passwords...");
  register.setEmail("test@test.com");
  register.setPwd("password123");
  register.setMatchPwd("password321");
  const result3 = await register.handleSubmit({ preventDefault: () => {} });
  console.log("Expected: Invalid Entry");
  console.log("Actual:", result3);

  // Test 4: Invalid email format
  console.log("\nTest 4: Invalid email format...");
  register.setEmail("invalid-email");
  register.setPwd("password");
  register.setMatchPwd("password");
  const result4 = await register.handleSubmit({ preventDefault: () => {} });
  console.log("Expected: Invalid Entry");
  console.log("Actual:", result4);
}

// Executes all test cases
runRegisterTest();
