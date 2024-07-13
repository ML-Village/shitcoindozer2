import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { Coin } from './types';

export const createCoin = (): Coin => {
  const radius = 1;
  const height = 0.33;

  const shape = new CANNON.Cylinder(radius, radius, height, 20);
  const body = new CANNON.Body({
    mass: 1,
    shape: shape,
    material: new CANNON.Material({ friction: 1, restitution: 1 }),
  });
  body.linearDamping = 0.3;
  body.angularDamping = 0.5;

  const geometry = new THREE.CylinderGeometry(radius, radius, height, 32);
  const material = new THREE.MeshPhongMaterial({ color: 0xffff00 });
  const mesh = new THREE.Mesh(geometry, material);

  return { body, mesh, active: false };
};

export const createSpecialCoin = (imageURL: string): Coin => {
  const radius = 1;
  const height = 0.33;

  const shape = new CANNON.Cylinder(radius, radius, height, 20);
  const body = new CANNON.Body({
    mass: 1,
    shape: shape,
    material: new CANNON.Material({ friction: 1, restitution: 1 }),
  });
  body.linearDamping = 0.3;
  body.angularDamping = 0.5;

  // Load the texture from the imageURL
  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load(imageURL);

  // Create the material with the texture
  const material = new THREE.MeshPhongMaterial({ map: texture });

  // Create the geometry for the coin
  const geometry = new THREE.CylinderGeometry(radius, radius, height, 32);

  // Create the mesh with the geometry and textured material
  const mesh = new THREE.Mesh(geometry, material);

  return { body, mesh, active: false };
};