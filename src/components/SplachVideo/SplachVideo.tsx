import { useState, useRef, useEffect } from "react";

export const SplashScreen = ({
    onSkip,
    onDisableFuture,
  }: {
    onSkip: () => void;
    onDisableFuture: () => void;
  }) => {
    const [isVisible, setIsVisible] = useState(true);
    const videoRef = useRef(null);
  
    useEffect(() => {
      const video: HTMLVideoElement | null = videoRef.current;
  
      if (video != null) {
        (video as HTMLVideoElement).addEventListener("ended", handleSkip);
        const playPromise = (video as HTMLVideoElement).play();
  
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.error("Video play failed:", error);
            handleSkip();
          });
        }
      }
  
      return () => {
        if (video) {
          (video as HTMLVideoElement).removeEventListener("ended", handleSkip);
        }
      };
    }, []);
  
    const handleSkip = () => {
      setIsVisible(false);
      onSkip();
    };
  
    const handleDisable = () => {
      setIsVisible(false);
      localStorage.setItem("showSplash", "false");
      onDisableFuture();
    };
  
    if (!isVisible) return null;
  
    return (
      <div className="splash-container">
        <video ref={videoRef} autoPlay muted playsInline className="splash-video">
          <source src="video.webm" type="video/webm" />
          <source src="video.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
  
        <div className="splash-buttons">
          <button onClick={handleSkip} className="skip-button">
            Skip
          </button>
          <button onClick={handleDisable} className="disable-button">
            Don't Show Again
          </button>
        </div>
      </div>
    );
  };