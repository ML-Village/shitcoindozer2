import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export interface Coin {
  body: CANNON.Body;
  mesh: THREE.Mesh;
  active: boolean;
}

export interface GameState {
  scene: THREE.Scene | null;
  world: CANNON.World | null;
  coins: Coin[];
  coinPool: Coin[];
  coinCount: number;
  renderer: THREE.WebGLRenderer | null;
  camera: THREE.PerspectiveCamera | null;
}

export interface GameSize {
  width: number;
  height: number;
}

export interface SceneObjects {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  world: CANNON.World;
  pusher: {
    body: CANNON.Body;
    mesh: THREE.Mesh;
  };
}