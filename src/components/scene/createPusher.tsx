import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export const createPusher = (scene: THREE.Scene, world: CANNON.World) => {
  const pusherShape = new CANNON.Box(new CANNON.Vec3(3.5, 1, 1));
  const pusherBody = new CANNON.Body({ 
    mass: 0,
    material: new CANNON.Material({ friction: 0.5, restitution: 0.3 })
  });
  pusherBody.addShape(pusherShape);
  pusherBody.position.set(0, 0.01, -4.5);
  world.addBody(pusherBody);

  const pusherGeometry = new THREE.BoxGeometry(7, 1, 2);
  const pusherMaterial = new THREE.MeshPhongMaterial({ color: 0x555555 });
  const pusherMesh = new THREE.Mesh(pusherGeometry, pusherMaterial);
  pusherMesh.position.copy(pusherBody.position as unknown as THREE.Vector3);
  scene.add(pusherMesh);

  return { body: pusherBody, mesh: pusherMesh };
};