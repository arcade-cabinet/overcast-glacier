import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import * as THREE from "three";

export const Resize = () => {
  const { camera, size } = useThree();

  useEffect(() => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return;

    // Adjust FOV based on aspect ratio to keep gameplay visible
    const aspect = size.width / size.height;
    if (aspect < 1) {
      // Portrait
      camera.fov = 80;
      camera.position.z = 15; // Pull back slightly
      camera.position.y = 7;
    } else {
      // Landscape
      camera.fov = 60;
      camera.position.z = 10;
      camera.position.y = 5;
    }
    camera.updateProjectionMatrix();
  }, [size, camera]);

  return null;
};
