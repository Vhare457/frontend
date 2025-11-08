const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5068/api";

export const authService = {
  async login(email, password) {
    console.log("🔐 Logging in:", email);

    const response = await fetch(`${API_URL}/Auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    console.log("🔐 Login response status:", response.status);

    if (!response.ok) {
      // Try to parse error response
      let errorMessage = "Login failed";
      try {
        const errorData = await response.json();
        console.error("🔐 Login error data:", errorData);
        // Handle various error response formats
        if (typeof errorData === "string") {
          errorMessage = errorData;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.errors) {
          // Handle validation errors
          const validationErrors = Object.values(errorData.errors)
            .flat()
            .join(", ");
          errorMessage = validationErrors || errorMessage;
        } else if (errorData.title) {
          errorMessage = errorData.title;
        }
      } catch {
        // If response is not JSON, try to read as text
        const errorText = await response.text();
        console.error("🔐 Login error text:", errorText);
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log("🔐 Login response data:", data);

    // Store token and user info
    localStorage.setItem("token", data.token);

    // Store complete response including employerId/jobSeekerId
    const userInfo = {
      userId: data.userId,
      role: data.role,
      email: email,
      ...data.user,
      employerId: data.employerId,
      jobSeekerId: data.jobSeekerId,
      adminId: data.adminId,
    };

    console.log("🔐 Storing user info:", userInfo);
    localStorage.setItem("user", JSON.stringify(userInfo));

    return data;
  },

  async register(userData) {
    console.log("📝 Registering user:", userData);

    const response = await fetch(`${API_URL}/Auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    console.log("📝 Registration response status:", response.status);

    if (!response.ok) {
      // Try to parse error response
      let errorMessage = "Registration failed";
      try {
        const errorData = await response.json();
        console.error("📝 Registration error data:", errorData);
        // Handle various error response formats
        if (typeof errorData === "string") {
          errorMessage = errorData;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.errors) {
          // Handle validation errors
          const validationErrors = Object.values(errorData.errors)
            .flat()
            .join(", ");
          errorMessage = validationErrors || errorMessage;
        } else if (errorData.title) {
          errorMessage = errorData.title;
        }
      } catch {
        // If response is not JSON, try to read as text
        const errorText = await response.text();
        console.error("📝 Registration error text:", errorText);
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log("📝 Registration successful:", data);

    return data;
  },
};
