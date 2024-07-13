import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { initLights } from './initLights';
import { createPlatform } from './createPlatform';
import { createPusher } from './createPusher';
import { createWalls } from './createWalls';

export const initScene = (containerSize: { width: number; height: number }) => {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, containerSize.width / containerSize.height, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(containerSize.width, containerSize.height);
  renderer.setPixelRatio(window.devicePixelRatio);

  camera.position.set(0, 15 * 0.7 , 12* 0.7 );
  const lookAtPoint = new THREE.Vector3(0, 4, 0);
  camera.lookAt(lookAtPoint);

  initLights(scene);

  const world = new CANNON.World();
  world.gravity.set(0, -17, 0);

  createPlatform(scene, world);
  const pusher = createPusher(scene, world, '/Sweeper.png');
  createWalls(scene, world);

  return { scene, camera, renderer, world, pusher };
};