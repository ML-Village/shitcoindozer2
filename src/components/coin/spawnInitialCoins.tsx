import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { MutableRefObject } from 'react';
import { Coin } from './types';
import { getInactiveCoin } from './getInactiveCoin';

export const spawnInitialCoins = (
  coinPoolRef: MutableRefObject<Coin[]>,
  coinsRef: MutableRefObject<Coin[]>,
  worldRef: MutableRefObject<CANNON.World | null>,
  sceneRef: MutableRefObject<THREE.Scene | null>,
  setCoinCount: (count: number) => void,
  INITIAL_COINS: number
) => {
  const platformWidth = 7;
  const platformDepth = 10;
  const margin = 0.5;

  for (let i = 0; i < INITIAL_COINS; i++) {
    const coin = getInactiveCoin(coinPoolRef);
    if (!coin || !worldRef.current || !sceneRef.current) break;

    const x = Math.random() * (platformWidth - 2 * margin) - (platformWidth / 2 - margin);
    const z = Math.random() * (platformDepth - 2 * margin) - (platformDepth / 2 - margin);
    
    coin.active = true;
    coin.body.position.set(x, 0.05, z);
    coin.body.velocity.set(0, 0, 0);
    coin.body.angularVelocity.set(0, 0, 0);
    
    const randomRotation = Math.random() * Math.PI * 2;
    coin.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), randomRotation);

    worldRef.current.addBody(coin.body);
    sceneRef.current.add(coin.mesh);
    coinsRef.current.push(coin);
  }
  setCoinCount(INITIAL_COINS);
};