import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { MutableRefObject } from 'react';
import { Coin, SelectedCoin } from './types';
import { createSpecialCoin } from './createCoin';

export const spawnCoin = (
  coinPoolRef: React.MutableRefObject<Coin[]>,
  coinsRef: React.MutableRefObject<Coin[]>,
  worldRef: React.MutableRefObject<CANNON.World | null>,
  sceneRef: React.MutableRefObject<THREE.Scene | null>,
  setCoinCount: React.Dispatch<React.SetStateAction<number>>,
  selectedCoin: SelectedCoin,
  dropperPosition?: CANNON.Vec3
) => {
  const coin = createSpecialCoin(selectedCoin.image);
  if (!coin || !worldRef.current || !sceneRef.current) return;

  coin.active = true;
  if (dropperPosition) {
    coin.body.position.set(
      dropperPosition.x,
      dropperPosition.y - 1, // Spawn slightly below the dropper
      dropperPosition.z + 0.05
    );
  } else {
    coin.body.position.set(0, 10, -2); // Default position if dropper position is not provided
  }
  coin.body.velocity.set(0, 0, 0);
  coin.body.angularVelocity.set(0, 0, 0);
  coin.body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2);

  worldRef.current.addBody(coin.body);
  sceneRef.current.add(coin.mesh);
  coinsRef.current.push(coin);
  setCoinCount(prevCount => prevCount + 1);
};