// Interview Service
// Handles interview scheduling and management

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5068/api";
export const interviewService = {
  /**
   * Create a new interview schedule
   * @param {Object} interviewData - Interview details
   * @returns {Promise<Object>} Created interview
   */
  async createInterview(interviewData) {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/InterviewSchedule`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(interviewData),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));

        // Handle specific error cases
        if (response.status === 409) {
          throw new Error(
            error.message ||
              "An interview has already been scheduled for this applicant."
          );
        }

        throw new Error(error.message || "Failed to create interview");
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating interview:", error);
      throw error;
    }
  },

  /**
   * Get all interview schedules
   * @returns {Promise<Array>} Array of interviews
   */
  async getAllInterviews() {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/InterviewSchedule`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch interviews");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching interviews:", error);
      throw error;
    }
  },

  /**
   * Get all interviews for a specific job seeker
   * @param {number} jobSeekerId - The job seeker ID
   * @returns {Promise<Array>} Array of interviews
   */
  async getInterviewsByJobSeeker(jobSeekerId) {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/InterviewSchedule/jobseeker/${jobSeekerId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch interviews");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching interviews for job seeker:", error);
      throw error;
    }
  },

  /**
   * Get interview by application ID
   * @param {number} applicationId - The application ID
   * @returns {Promise<Object|null>} Interview details or null
   */
  async getInterviewByApplication(applicationId) {
    try {
      const allInterviews = await this.getAllInterviews();

      return (
        allInterviews.find(
          (interview) => interview.jobApplicationId === applicationId
        ) || null
      );
    } catch (error) {
      console.error("Error fetching interview by application:", error);
      throw error;
    }
  },

  /**
   * Get interview by ID
   * @param {number} interviewId - The interview ID
   * @returns {Promise<Object>} Interview details
   */
  async getInterviewById(interviewId) {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/InterviewSchedule/${interviewId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch interview");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching interview by ID:", error);
      throw error;
    }
  },

  /**
   * Update an existing interview
   * @param {number} interviewId - The interview ID
   * @param {Object} interviewData - Updated interview data
   * @returns {Promise<void>}
   */
  async updateInterview(interviewId, interviewData) {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/InterviewSchedule/${interviewId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(interviewData),
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || "Failed to update interview");
      }
    } catch (error) {
      console.error("Error updating interview:", error);
      throw error;
    }
  },

  /**
   * Delete/Cancel an interview
   * @param {number} interviewId - The interview ID
   * @returns {Promise<void>}
   */
  async deleteInterview(interviewId) {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/InterviewSchedule/${interviewId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete interview");
      }
    } catch (error) {
      console.error("Error deleting interview:", error);
      throw error;
    }
  },

  /**
   * Get upcoming interviews
   * @returns {Promise<Array>} Array of upcoming interviews
   */
  async getUpcomingInterviews() {
    try {
      const allInterviews = await this.getAllInterviews();
      const now = new Date();

      return allInterviews
        .filter((interview) => new Date(interview.scheduleDate) >= now)
        .sort((a, b) => new Date(a.scheduleDate) - new Date(b.scheduleDate));
    } catch (error) {
      console.error("Error fetching upcoming interviews:", error);
      throw error;
    }
  },

  /**
   * Get past interviews
   * @returns {Promise<Array>} Array of past interviews
   */
  async getPastInterviews() {
    try {
      const allInterviews = await this.getAllInterviews();
      const now = new Date();

      return allInterviews
        .filter((interview) => new Date(interview.scheduleDate) < now)
        .sort((a, b) => new Date(b.scheduleDate) - new Date(a.scheduleDate));
    } catch (error) {
      console.error("Error fetching past interviews:", error);
      throw error;
    }
  },

  /**
   * Get today's interviews
   * @returns {Promise<Array>} Array of today's interviews
   */
  async getTodaysInterviews() {
    try {
      const allInterviews = await this.getAllInterviews();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      return allInterviews.filter((interview) => {
        const interviewDate = new Date(interview.scheduleDate);
        return interviewDate >= today && interviewDate < tomorrow;
      });
    } catch (error) {
      console.error("Error fetching today's interviews:", error);
      throw error;
    }
  },
};
