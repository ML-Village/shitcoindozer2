import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { initScene } from './scene/initScene';
import { 
  Coin, 
  initCoinPool, 
  spawnCoin, 
  spawnInitialCoins 
} from './coin';

const MAX_COINS = 100;
const COIN_POOL_SIZE = 150;
const INITIAL_COINS = 20; // Number of coins to spawn initially

const CoinDozerGame: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const worldRef = useRef<CANNON.World | null>(null);
  const coinsRef = useRef<Coin[]>([]);
  const coinPoolRef = useRef<Coin[]>([]);
  const [coinCount, setCoinCount] = useState<number>(0);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  const handleSpawnCoin = () => {
    spawnCoin(coinPoolRef, coinsRef, worldRef, sceneRef, setCoinCount, MAX_COINS);
  };

  useEffect(() => {
    let pusherBody: CANNON.Body;
    let pusherMesh: THREE.Mesh;

    const updateContainerSize = () => {
      if (mountRef.current) {
        const { clientWidth, clientHeight } = mountRef.current;
        setContainerSize({ width: clientWidth, height: clientHeight });
      }
    };

    const init = () => {
      updateContainerSize();
      const { scene, camera, renderer, world, pusher } = initScene(containerSize);
      sceneRef.current = scene;
      cameraRef.current = camera;
      rendererRef.current = renderer;
      worldRef.current = world;
      pusherBody = pusher.body;
      pusherMesh = pusher.mesh;

      if (mountRef.current) {
        mountRef.current.appendChild(renderer.domElement);
      }

      initCoinPool(coinPoolRef, COIN_POOL_SIZE);
      spawnInitialCoins(coinPoolRef, coinsRef, worldRef, sceneRef, setCoinCount, INITIAL_COINS);
    };

    const animate = (time: number) => {
      requestAnimationFrame(animate);
  
      if (worldRef.current && sceneRef.current && cameraRef.current && rendererRef.current) {
        worldRef.current.step(1 / 60);
  
        // Update pusher
        const amplitude = 1.5;
        const frequency = 0.005;
        pusherBody.position.z = -4.5 + Math.sin(time * frequency) * amplitude;
        pusherMesh.position.copy(pusherBody.position as unknown as THREE.Vector3);
  
        // Update active coins
        for (let i = coinsRef.current.length - 1; i >= 0; i--) {
          const coin = coinsRef.current[i];
          
          const distanceFromCenter = coin.body.position.distanceTo(new CANNON.Vec3(0, 0, 0));
          const speed = coin.body.velocity.length();
          
          if (distanceFromCenter > 8 || speed < 0.1) {
            coin.body.position.y += coin.body.velocity.y / 60;
            coin.body.velocity.y -= 9.82 / 60;
          } else {
            coin.mesh.position.copy(coin.body.position as unknown as THREE.Vector3);
            coin.mesh.quaternion.copy(coin.body.quaternion as unknown as THREE.Quaternion);
          }
  
          if (coin.body.position.y < -2 || coin.body.position.z > 5) {
            worldRef.current.removeBody(coin.body);
            sceneRef.current.remove(coin.mesh);
            coin.active = false;
            coinsRef.current.splice(i, 1);
            setCoinCount(prevCount => prevCount - 1);
          }
        }
  
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    init();
    animate(0);

    window.addEventListener('resize', updateContainerSize);

    // Cleanup function
    return () => {
      if (mountRef.current && rendererRef.current?.domElement) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      window.removeEventListener('resize', updateContainerSize);
    };
  }, [initCoinPool, spawnInitialCoins]);

  useEffect(() => {
    if (cameraRef.current && rendererRef.current && containerSize.width && containerSize.height) {
      cameraRef.current.aspect = containerSize.width / containerSize.height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(containerSize.width, containerSize.height);
    }
  }, [containerSize]);

  return (
    <div style={{ 
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      height: '100vh',
      backgroundColor: '#000'
    }}>
      <div style={{
        position: 'relative', 
        width: '100%',
        maxWidth: '400px',
        height: '100vh',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backgroundImage: 'url("/bgmockup.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transform: 'scale(1.1)',
        }} />
        <div ref={mountRef} style={{ 
          position: 'relative',
          width: '100%',
          height: '100%',
          maxHeight: '1000px',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '2px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(255, 255, 255, 0.7)',
          padding: '10px',
          borderRadius: '0px',
        }}>
          <button onClick={handleSpawnCoin} style={{
            padding: '5px 10px',
            fontSize: '16px',
            cursor: 'pointer'
          }}>
            Spawn Coin
          </button>
        </div>
      </div>
    </div>
    
  );
};

export default CoinDozerGame;