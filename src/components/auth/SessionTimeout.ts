import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Adjust based on your router setup
import { useAppDispatch } from "../../hooks/hooks";
import { logoutUser } from "../../redux/services/authService";

const SessionTimeout: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const timeoutDuration: number = 15 * 60 * 10000; // 15 minutes in milliseconds
  let activityTimer: NodeJS.Timeout | undefined;

  // Function to handle user activity
  const handleUserActivity = () => {
    if (activityTimer) {
      clearTimeout(activityTimer); // Clear the previous timer
    }
    startTimer(); // Start a new timer
  };

  // Function to start the timer
  const startTimer = () => {
    activityTimer = setTimeout(() => {
      // Clear user session (e.g., remove tokens from sessionStorage)
      dispatch(logoutUser());

      // Redirect to the login page
      navigate("/login");
    }, timeoutDuration);
  };

  useEffect(() => {
    // Start the timer when the component mounts
    startTimer();

    // Add event listeners for user activity
    window.addEventListener("mousemove", handleUserActivity);
    window.addEventListener("keydown", handleUserActivity);
    window.addEventListener("click", handleUserActivity);

    // Cleanup event listeners and timer when the component unmounts
    return () => {
      if (activityTimer) {
        clearTimeout(activityTimer);
      }
      window.removeEventListener("mousemove", handleUserActivity);
      window.removeEventListener("keydown", handleUserActivity);
      window.removeEventListener("click", handleUserActivity);
    };
  }, []); // Empty dependency array ensures this runs once

  return null; // This component does not render anything
};

export default SessionTimeout;
