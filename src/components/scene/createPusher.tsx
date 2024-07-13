import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export const createPusher = (scene: THREE.Scene, world: CANNON.World, imageUrl: string) => {
  // Create pusher body
  const pusherShape = new CANNON.Box(new CANNON.Vec3(4, 12, 0.5));
  const pusherBody = new CANNON.Body({ 
    mass: 0,
    material: new CANNON.Material({ friction: 0.5, restitution: 0.3 })
  });
  pusherBody.addShape(pusherShape);
  pusherBody.position.set(0, 0, -4.5);
  world.addBody(pusherBody);

  // Create pusher mesh (invisible)
  const pusherGeometry = new THREE.BoxGeometry(7, 6, 1);
  const pusherMaterial = new THREE.MeshBasicMaterial({ 
    color: 0x555555, 
    visible: false, // Make the pusher mesh invisible
  });
  const pusherMesh = new THREE.Mesh(pusherGeometry, pusherMaterial);
  pusherMesh.position.copy(pusherBody.position as unknown as THREE.Vector3);
  scene.add(pusherMesh);

  // Create image plane
  const loader = new THREE.TextureLoader();
  const texture = loader.load(imageUrl);
  texture.colorSpace = THREE.SRGBColorSpace;

  const imageAspect = texture.image ? texture.image.width / texture.image.height : 1;
  const imageWidth = 7;
  const imageHeight = imageWidth / imageAspect - 0.5;

  const imageGeometry = new THREE.PlaneGeometry(imageWidth, imageHeight);
  const imageMaterial = new THREE.MeshPhongMaterial({ 
    map: texture, 
    transparent: true,
    side: THREE.FrontSide,
    depthTest: true,
    depthWrite: false
});
  const imageMesh = new THREE.Mesh(imageGeometry, imageMaterial);

  // Position and orient the image
  imageMesh.position.copy(pusherMesh.position);
  imageMesh.position.y += 0.1; // Adjust this value to move the image up or down
  imageMesh.position.z += 4; // Adjust this value to move the image closer to or further from the pusher

  // Rotate to face the camera
  imageMesh.rotation.x = -Math.PI / 2 + 1.3;

  imageMesh.renderOrder = 6;

  // Add the image to the scene
  scene.add(imageMesh);

  return { 
    body: pusherBody, 
    mesh: pusherMesh,
    imageMesh: imageMesh 
  };
};