import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export const createPlatform = (scene: THREE.Scene, world: CANNON.World) => {
  const platformShape = new CANNON.Box(new CANNON.Vec3(14, 0.25, 8));
  const platformBody = new CANNON.Body({ 
    mass: 0,
    material: new CANNON.Material({ friction: 0.3, restitution: 0.3 })
  });
  platformBody.addShape(platformShape);
  platformBody.position.set(0, -0.25, 0);
  world.addBody(platformBody);

  const platformGeometry = new THREE.BoxGeometry(7, 0, 8);
  const platformMaterial = new THREE.MeshPhongMaterial({ color: 0x999999, transparent: true, opacity: 0 });
  const platformMesh = new THREE.Mesh(platformGeometry, platformMaterial);
  platformMesh.position.copy(platformBody.position as unknown as THREE.Vector3);
  scene.add(platformMesh);

  return { body: platformBody, mesh: platformMesh };
};