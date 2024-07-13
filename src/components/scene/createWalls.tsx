import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export const createWalls = (scene: THREE.Scene, world: CANNON.World) => {
  const wallShape = new CANNON.Box(new CANNON.Vec3(0.25, 10, 5));
  const wallMaterial = new CANNON.Material({ friction: 0.3, restitution: 0.3 });
  const leftWallBody = new CANNON.Body({ mass: 0, material: wallMaterial });
  const rightWallBody = new CANNON.Body({ mass: 0, material: wallMaterial });
  leftWallBody.addShape(wallShape);
  rightWallBody.addShape(wallShape);
  leftWallBody.position.set(-3.75, 1, 0);
  rightWallBody.position.set(3.75, 1, 0);
  world.addBody(leftWallBody);
  world.addBody(rightWallBody);

  const wallGeometry = new THREE.BoxGeometry(0.5, 2, 10);
  const wallMaterial3js = new THREE.MeshPhongMaterial({ color: 0x8888ff, transparent: true, opacity: 0 });
  const leftWallMesh = new THREE.Mesh(wallGeometry, wallMaterial3js);
  const rightWallMesh = new THREE.Mesh(wallGeometry, wallMaterial3js);
  leftWallMesh.position.copy(leftWallBody.position as unknown as THREE.Vector3);
  rightWallMesh.position.copy(rightWallBody.position as unknown as THREE.Vector3);
  scene.add(leftWallMesh);
  scene.add(rightWallMesh);

  const backWallShape = new CANNON.Box(new CANNON.Vec3(5, 1, 0.25));
  const backWallBody = new CANNON.Body({ mass: 0, material: wallMaterial });
  backWallBody.addShape(backWallShape);
  backWallBody.position.set(0, 1, -5.25);
  world.addBody(backWallBody);

  const backWallGeometry = new THREE.BoxGeometry(10, 2, 0.5);
  const backWallMesh = new THREE.Mesh(backWallGeometry, wallMaterial3js);
  backWallMesh.position.copy(backWallBody.position as unknown as THREE.Vector3);
  scene.add(backWallMesh);

  return {
    leftWall: { body: leftWallBody, mesh: leftWallMesh },
    rightWall: { body: rightWallBody, mesh: rightWallMesh },
    backWall: { body: backWallBody, mesh: backWallMesh }
  };
};