// CV/Resume Service
// Handles CV file operations

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5068/api";

export const cvService = {
  /**
   * Download CV file
   * @param {number} fileId - The CV file ID
   * @returns {Promise<Blob>} File blob
   */
  async downloadCV(fileId) {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/FileUpload/cv/${fileId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to download CV");
      }

      return await response.blob();
    } catch (error) {
      console.error("Error downloading CV:", error);
      throw error;
    }
  },

  /**
   * Get CV file as URL for viewing
   * @param {number} fileId - The CV file ID
   * @returns {Promise<string>} Blob URL for viewing
   */
  async getCVUrl(fileId) {
    try {
      const blob = await this.downloadCV(fileId);
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error("Error getting CV URL:", error);
      throw error;
    }
  },

  /**
   * Get CV file information
   * @param {number} fileId - The CV file ID
   * @returns {Promise<Object>} File information
   */
  async getCVInfo(fileId) {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/FileUpload/info/${fileId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch CV info");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching CV info:", error);
      throw error;
    }
  },

  /**
   * View CV (get file data)
   * @param {number} fileId - The CV file ID
   * @returns {Promise<Blob>} File data
   */
  async viewCV(fileId) {
    return await this.downloadCV(fileId);
  },

  /**
   * Validate CV access
   * This is a frontend check - the backend enforces the actual security
   * @param {number} fileId - The CV file ID
   * @returns {Promise<boolean>} Access status
   */
  async validateCVAccess(fileId) {
    try {
      await this.getCVInfo(fileId);
      return true;
    } catch (error) {
      console.error("CV access denied:", error);
      return false;
    }
  },

  /**
   * Get CV file by job seeker ID
   * @param {Object} jobSeeker - Job seeker object with resumeFileId
   * @returns {Promise<string|null>} CV URL or null
   */
  async getCVByJobSeeker(jobSeeker) {
    try {
      if (!jobSeeker?.resumeFileId) {
        return null;
      }

      return await this.getCVUrl(jobSeeker.resumeFileId);
    } catch (error) {
      console.error("Error getting CV by job seeker:", error);
      return null;
    }
  },

  /**
   * Download CV and trigger browser download
   * @param {number} fileId - The CV file ID
   * @param {string} filename - The filename to save as
   */
  async downloadAndSaveCV(fileId, filename = "resume.pdf") {
    try {
      const blob = await this.downloadCV(fileId);
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the URL object
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading and saving CV:", error);
      throw error;
    }
  },
};
