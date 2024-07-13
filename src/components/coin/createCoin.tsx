import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { Coin } from './types';

export const createCoin = (): Coin => {
  const radius = 0.6;
  const height = 0.1;

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