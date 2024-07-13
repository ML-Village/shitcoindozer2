import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export const createDropper = (scene: THREE.Scene, world: CANNON.World) => {
  // Create dropper body
  const dropperShape = new CANNON.Box(new CANNON.Vec3(1, 1, 1));
  const dropperBody = new CANNON.Body({ 
    mass: 0, // Keep it massless so it doesn't fall
    material: new CANNON.Material({ friction: 0.5, restitution: 0.3 })
  });
  dropperBody.addShape(dropperShape);
  dropperBody.position.set(0, 10, -3); // Position it high above the scene
  world.addBody(dropperBody);

  // Create dropper mesh (can be visible for debugging)
  const dropperGeometry = new THREE.BoxGeometry(0.01, 0.01, 0.01);
  const dropperMaterial = new THREE.MeshBasicMaterial({ 
    color: 0x00ff00,
    transparent: true,
    opacity: 0 // Semi-transparent for visibility
  });
  const dropperMesh = new THREE.Mesh(dropperGeometry, dropperMaterial);
  dropperMesh.position.copy(dropperBody.position as unknown as THREE.Vector3);
  scene.add(dropperMesh);

  // Create image plane
  const loader = new THREE.TextureLoader();
  const texture = loader.load("dropper.png", (loadedTexture) => {
    // Update geometry once the texture is loaded
    const imageAspect = loadedTexture.image.width / loadedTexture.image.height;
    const imageWidth = 2.3;
    const imageHeight = imageWidth / imageAspect;
    imageMesh.geometry = new THREE.PlaneGeometry(imageWidth, imageHeight);
    imageMesh.position.y = dropperMesh.position.y - imageHeight / 2;
  });
  texture.colorSpace = THREE.SRGBColorSpace;

  // Use a temporary geometry, it will be updated when the texture loads
  const imageGeometry = new THREE.PlaneGeometry(1, 1);
  const imageMaterial = new THREE.MeshPhongMaterial({ 
    map: texture, 
    transparent: true,
    side: THREE.DoubleSide,
    depthTest: true,
    depthWrite: true
  });
  const imageMesh = new THREE.Mesh(imageGeometry, imageMaterial);

  // Position the image (will be adjusted when texture loads)
  imageMesh.position.copy(dropperMesh.position);
  imageMesh.position.y -= 1.5;

  imageMesh.renderOrder = 6;

  scene.add(imageMesh);

  // Function to update dropper position
  const updatePosition = (time: number) => {
    const amplitude = 3; // Range of movement
    const frequency = 0.0025; // Speed of movement
    dropperBody.position.x = amplitude * Math.sin(time * frequency);
    dropperMesh.position.copy(dropperBody.position as unknown as THREE.Vector3);
    imageMesh.position.copy(dropperBody.position as unknown as THREE.Vector3);
    imageMesh.position.y -= 1.5; // Maintain vertical offset
  };

  // Function to drop a coin
  const dropCoin = (createCoin: () => void) => {
    // This function will be called to create and drop a coin
    createCoin();
  };

  return { 
    body: dropperBody, 
    mesh: dropperMesh,
    imageMesh: imageMesh,
    updatePosition,
    dropCoin
  };
};