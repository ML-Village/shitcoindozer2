import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { Coin } from '../../types/gameTypes';
import { GAME_CONFIG } from '../../config/gameConfig';

/**
 * Updates the positions of coins and removes coins that are out of bounds.
 * @param coins - Array of active coins
 * @param world - CANNON.js world instance
 * @param scene - THREE.js scene instance
 * @returns Updated array of active coins
 */
export const updateCoins = (coins: Coin[], world: CANNON.World, scene: THREE.Scene): Coin[] => {
  return coins.filter(coin => {
    const distanceFromCenter = coin.body.position.distanceTo(new CANNON.Vec3(0, 0, 0));
    const speed = coin.body.velocity.length();
    
    if (distanceFromCenter > GAME_CONFIG.COIN_DISTANCE_THRESHOLD || speed < GAME_CONFIG.COIN_SPEED_THRESHOLD) {
      // Apply gravity manually for coins that are far from center or moving slowly
      coin.body.position.y += coin.body.velocity.y / 60;
      coin.body.velocity.y -= GAME_CONFIG.GRAVITY / 60;
    } else {
      // Update mesh position and rotation for active coins
      coin.mesh.position.copy(coin.body.position as unknown as THREE.Vector3);
      coin.mesh.quaternion.copy(coin.body.quaternion as unknown as THREE.Quaternion);
    }

    // Check if coin is out of bounds
    if (coin.body.position.y < GAME_CONFIG.COIN_REMOVAL_THRESHOLD_Y || 
        coin.body.position.z > GAME_CONFIG.COIN_REMOVAL_THRESHOLD_Z) {
      // Remove coin from physics world and scene
      world.removeBody(coin.body);
      scene.remove(coin.mesh);
      coin.active = false;
      return false; // Remove coin from array
    }
    return true; // Keep coin in array
  });
};