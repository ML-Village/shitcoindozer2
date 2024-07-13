import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { MutableRefObject } from 'react';
import { Coin, SelectedCoin } from './types';
import { createSpecialCoin } from './createCoin';

export const spawnCoin = (
  coinPoolRef: MutableRefObject<Coin[]>,
  coinsRef: MutableRefObject<Coin[]>,
  worldRef: MutableRefObject<CANNON.World | null>,
  sceneRef: MutableRefObject<THREE.Scene | null>,
  setCoinCount: (update: (prevCount: number) => number) => void,
  selectedCoin: SelectedCoin
) => {
  console.log(coinPoolRef);
  const coin = createSpecialCoin(selectedCoin.image);
  coin.body.position.set(Math.random() * 6.5 - 4, 4, -4);
  coin.body.velocity.set(0, 0, 0);
  coin.body.angularVelocity.set(0, 0, 0);
  coin.body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2);

  if(worldRef.current) {
    worldRef.current.addBody(coin.body);
  }
  if (sceneRef.current) {
    sceneRef.current.add(coin.mesh);
  }
  coin.mesh.renderOrder = 5; // Adjust this value as needed
  coinsRef.current.push(coin);
  setCoinCount(prevCount => prevCount + 1);
};