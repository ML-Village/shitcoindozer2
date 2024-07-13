import React, { useRef, useEffect, useState } from 'react';
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
const INITIAL_COINS = 20;

const coins = [
  { id: 'doge', name: 'Dogecoin', balance: 1000, image: '/dogecoin.png' },
  { id: 'shib', name: 'Shiba Inu', balance: 5000, image: '/coin:shiba.png' },
  { id: 'safemoon', name: 'SafeMoon', balance: 10000, image: '/coin:safemoon.png' },
  { id: 'solana', name: 'Solana', balance: 50000, image: '/solana.png' },
  { id: 'pepe', name: 'Pepe', balance: 100000, image: '/pepecoin.png' },
];

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
  const [selectedCoin, setSelectedCoin] = useState(coins[0]);
  const pusherRef = useRef<{ body: CANNON.Body; mesh: THREE.Mesh; imageMesh: THREE.Mesh | null }>({ body: new CANNON.Body(), mesh: new THREE.Mesh(), imageMesh: null });

  const handleSpawnCoin = () => {
    spawnCoin(coinPoolRef, coinsRef, worldRef, sceneRef, setCoinCount, MAX_COINS);
  };

  useEffect(() => {
    const updateContainerSize = () => {
      if (mountRef.current) {
        const { clientWidth, clientHeight } = mountRef.current;
        setContainerSize({ width: clientWidth, height: clientHeight });
      }
    };
    console.log(coinCount);
    const init = () => {
      updateContainerSize();
      const { scene, camera, renderer, world, pusher } = initScene(containerSize);
      sceneRef.current = scene;
      cameraRef.current = camera;
      rendererRef.current = renderer;
      worldRef.current = world;
      pusherRef.current = pusher;

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
    
        // Update pusher and image
        const amplitude = 0.4;
        const frequency = 0.005;
        pusherRef.current.body.position.z = -4.5 + Math.sin(time * frequency) * amplitude;
        pusherRef.current.mesh.position.copy(pusherRef.current.body.position as unknown as THREE.Vector3);
        
        if (pusherRef.current.imageMesh) {
          // Update image position relative to pusher
          pusherRef.current.imageMesh.position.copy(pusherRef.current.mesh.position);
          pusherRef.current.imageMesh.position.y += 0; // Adjust this value to move the image up or down
          pusherRef.current.imageMesh.position.z += -5; // Adjust this value to move the image closer to or further from the pusher
    
          // Maintain the rotation
          pusherRef.current.imageMesh.rotation.x = -Math.PI / 2 + 1.3;
        }
    
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

    return () => {
      if (mountRef.current && rendererRef.current?.domElement) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      window.removeEventListener('resize', updateContainerSize);
    };
  }, []);

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
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: 'absolute',
          top: '-10px', // Adjust this value to shift the video up
          left: '50%',
          height: '400px', // Let the height adjust automatically
          transform: 'translateX(-50%) scale(1)', // Center horizontally and scale down slightly
          objectFit: 'cover',
          zIndex: 1,
        }}
      >
        <source src='/dance.mp4' type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div style={{
        position: 'absolute',
        top: '-40px',
        left: 0,
        right: 0,
        bottom: '40px',
        backgroundImage: 'url("/bgmockup.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transform: 'scale(1.1)',
        zIndex: 2,
      }} />
      
        <div ref={mountRef} style={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: '80px', // Leave space for the bottom bar
          maxHeight: 'calc(100% - 80px)', // Ensure it doesn't overlap with the bar
          zIndex: 3,
        }} />
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '80px',
          background: 'rgba(255, 255, 255, 0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 10px',
          zIndex: 10, // Ensure the bar is above other elements
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            overflowX: 'auto',
            width: 'calc(100% - 140px)', // Adjust based on the width of the right side content
            paddingBottom: '10px', // To show scrollbar
          }}>
            {coins.map((coin) => (
              <div
                key={coin.id}
                onClick={() => setSelectedCoin(coin)}
                style={{
                  marginRight: '10px',
                  cursor: 'pointer',
                  position: 'relative',
                  flexShrink: 0, // Prevent coins from shrinking
                }}
              >
                <img
                  src={coin.image}
                  alt={coin.name}
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    border: selectedCoin.id === coin.id ? '3px solid #4CAF50' : 'none',
                  }}
                />
              </div>
            ))}
          </div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center',
            marginLeft: '10px',
            flexShrink: 0, // Prevent this section from shrinking
          }}>
            <div style={{ marginRight: '10px', textAlign: 'right' }}>
              <div style={{ fontSize: '12px' }}>{selectedCoin.name}</div>
              <div style={{ fontSize: '12px' }}>{selectedCoin.balance} coins</div>
            </div>
            <button 
              onClick={handleSpawnCoin}
              style={{
                background: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer',
                fontSize: '24px',
                fontWeight: 'bold',
              }}
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoinDozerGame;