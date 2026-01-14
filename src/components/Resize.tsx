import { ScreenOrientation } from "@capacitor/screen-orientation";
import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import * as THREE from "three";

export const Resize = () => {
  const { camera, size, gl } = useThree();

  useEffect(() => {
    const handleResize = () => {
        if (!(camera instanceof THREE.PerspectiveCamera)) return;

        const aspect = window.innerWidth / window.innerHeight;
        
        // Dynamic FOV based on aspect ratio to maintain vertical visibility
        // If portrait (aspect < 1), we need wider FOV to see same width, 
        // OR pull camera back. We are pulling back in Player.tsx mostly, 
        // but here we can fine tune.
        
        if (aspect < 1) {
            // Portrait
            camera.fov = 90; 
        } else {
            // Landscape
            camera.fov = 60;
        }
        
        camera.updateProjectionMatrix();
        gl.setSize(window.innerWidth, window.innerHeight);
    };

    // Listen to window resize (handles rotation on web/mobile mostly)
    window.addEventListener("resize", handleResize);
    
    // Also listen to Capacitor Orientation changes
    ScreenOrientation.addListener('screenOrientationChange', () => {
        setTimeout(handleResize, 100); // Small delay for layout to settle
    });

    handleResize(); // Initial check

    return () => {
      window.removeEventListener("resize", handleResize);
      ScreenOrientation.removeAllListeners();
    };
  }, [camera, gl]);

  return null;
};