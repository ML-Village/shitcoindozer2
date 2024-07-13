import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export interface Coin {
  body: CANNON.Body;
  mesh: THREE.Mesh;
  active: boolean;
}