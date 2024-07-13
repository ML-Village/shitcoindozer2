import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export const createPusher = (scene: THREE.Scene, world: CANNON.World, imageUrl: string) => {
  // Create pusher body and mesh as before
  const pusherShape = new CANNON.Box(new CANNON.Vec3(3.5, 1, 1));
  const pusherBody = new CANNON.Body({ 
    mass: 0,
    material: new CANNON.Material({ friction: 0.5, restitution: 0.3 })
  });
  pusherBody.addShape(pusherShape);
  pusherBody.position.set(0, 0.01, -4.5);
  world.addBody(pusherBody);

  const pusherGeometry = new THREE.BoxGeometry(7, 1, 2);
  const pusherMaterial = new THREE.MeshPhongMaterial({ color: 0x555555, transparent: true, opacity: 0 });
  const pusherMesh = new THREE.Mesh(pusherGeometry, pusherMaterial);
  pusherMesh.position.copy(pusherBody.position as unknown as THREE.Vector3);
  scene.add(pusherMesh);

  // Create image plane
  const loader = new THREE.TextureLoader();
  const texture = loader.load(imageUrl);
  const imageGeometry = new THREE.PlaneGeometry(7, 2); // Adjust size as needed
  const imageMaterial = new THREE.MeshBasicMaterial({ 
    map: texture, 
    transparent: true,
    side: THREE.DoubleSide
  });
  const imageMesh = new THREE.Mesh(imageGeometry, imageMaterial);

  // Position the image in front of the pusher
  imageMesh.position.copy(pusherMesh.position);
  imageMesh.position.z += 1.01; // Slightly in front of the pusher
  imageMesh.rotation.y = Math.PI; // Face the image towards the camera

  // Add the image to the scene
  scene.add(imageMesh);

  return { 
    body: pusherBody, 
    mesh: pusherMesh,
    imageMesh: imageMesh 
  };
};