import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';

const MAX_COINS = 100;
const COIN_POOL_SIZE = 150;
const INITIAL_COINS = 20; // Number of coins to spawn initially

interface Coin {
  body: CANNON.Body;
  mesh: THREE.Mesh;
  active: boolean;
}

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

  const createCoin = useCallback((): Coin => {
    const radius = 0.75;
    const height = 0.2;

    const shape = new CANNON.Cylinder(radius, radius, height, 20);
    const body = new CANNON.Body({
      mass: 1,
      shape: shape,
      material: new CANNON.Material({ friction: 0.3, restitution: 0.3 }),
    });
    body.linearDamping = 0.3;
    body.angularDamping = 0.5;

    const geometry = new THREE.CylinderGeometry(radius, radius, height, 32);
    const material = new THREE.MeshPhongMaterial({ color: 0xffff00 });
    const mesh = new THREE.Mesh(geometry, material);

    return { body, mesh, active: false };
  }, []);

  const initCoinPool = useCallback(() => {
    for (let i = 0; i < COIN_POOL_SIZE; i++) {
      coinPoolRef.current.push(createCoin());
    }
  }, [createCoin]);

  const getInactiveCoin = useCallback((): Coin | undefined => {
    return coinPoolRef.current.find(coin => !coin.active);
  }, []);

  const spawnCoin = useCallback(() => {
    if (coinCount >= MAX_COINS) return;

    const coin = getInactiveCoin();
    if (!coin || !worldRef.current || !sceneRef.current) return;

    coin.active = true;
    coin.body.position.set(Math.random() * 6.5 - 4, 5, -4);
    coin.body.velocity.set(0, 0, 0);
    coin.body.angularVelocity.set(0, 0, 0);
    coin.body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2);

    worldRef.current.addBody(coin.body);
    sceneRef.current.add(coin.mesh);
    coinsRef.current.push(coin);
    setCoinCount(prevCount => prevCount + 1);
  }, [coinCount, getInactiveCoin]);

  const spawnInitialCoins = useCallback(() => {
    const platformWidth = 7; // Width of the platform
    const platformDepth = 10; // Depth of the platform
    const margin = 0.5; // Margin from the edges

    for (let i = 0; i < INITIAL_COINS; i++) {
      const coin = getInactiveCoin();
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
  }, [getInactiveCoin]);

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

      // Three.js setup
      sceneRef.current = new THREE.Scene();
      cameraRef.current = new THREE.PerspectiveCamera(75, containerSize.width / containerSize.height, 0.1, 1000);
      rendererRef.current = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      rendererRef.current.setSize(containerSize.width, containerSize.height);
      rendererRef.current.setPixelRatio(window.devicePixelRatio);
      if (mountRef.current) {
        mountRef.current.appendChild(rendererRef.current.domElement);
      }

      cameraRef.current.position.set(0, 15*0.75, 12*0.75);
      const lookAtPoint = new THREE.Vector3(0, 3, 0);
      cameraRef.current.lookAt(lookAtPoint);

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      sceneRef.current.add(ambientLight);
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
      directionalLight.position.set(10, 10, 10);
      sceneRef.current.add(directionalLight);

      // Cannon.js setup
      worldRef.current = new CANNON.World();
      worldRef.current.gravity.set(0, -9.82, 0);

      // Create platform
      const platformShape = new CANNON.Box(new CANNON.Vec3(14, 0.25, 10));
      const platformBody = new CANNON.Body({ 
        mass: 0,
        material: new CANNON.Material({ friction: 0.3, restitution: 0.3 })
      });
      platformBody.addShape(platformShape);
      platformBody.position.set(0, -0.25, 0);
      worldRef.current.addBody(platformBody);

      const platformGeometry = new THREE.BoxGeometry(7, 0.5, 10);
      const platformMaterial = new THREE.MeshPhongMaterial({ color: 0x999999 });
      const platformMesh = new THREE.Mesh(platformGeometry, platformMaterial);
      platformMesh.position.copy(platformBody.position as unknown as THREE.Vector3);
      sceneRef.current.add(platformMesh);

      // Create pusher (dozer)
      const pusherShape = new CANNON.Box(new CANNON.Vec3(3.5, 1, 1));
      pusherBody = new CANNON.Body({ 
        mass: 0,
        material: new CANNON.Material({ friction: 0.5, restitution: 0.3 })
      });
      pusherBody.addShape(pusherShape);
      pusherBody.position.set(0, 0.01, -4.5);
      worldRef.current.addBody(pusherBody);

      const pusherGeometry = new THREE.BoxGeometry(7, 1, 2);
      const pusherMaterial = new THREE.MeshPhongMaterial({ color: 0x555555 });
      pusherMesh = new THREE.Mesh(pusherGeometry, pusherMaterial);
      pusherMesh.position.copy(pusherBody.position as unknown as THREE.Vector3);
      sceneRef.current.add(pusherMesh);

      // Create walls
      const wallShape = new CANNON.Box(new CANNON.Vec3(0.25, 10, 5));
      const wallMaterial = new CANNON.Material({ friction: 0.3, restitution: 0.3 });
      const leftWallBody = new CANNON.Body({ mass: 0, material: wallMaterial });
      const rightWallBody = new CANNON.Body({ mass: 0, material: wallMaterial });
      leftWallBody.addShape(wallShape);
      rightWallBody.addShape(wallShape);
      leftWallBody.position.set(-3.75, 1, 0);
      rightWallBody.position.set(3.75, 1, 0);
      worldRef.current.addBody(leftWallBody);
      worldRef.current.addBody(rightWallBody);

      const wallGeometry = new THREE.BoxGeometry(0.5, 2, 10);
      const wallMaterial3js = new THREE.MeshPhongMaterial({ color: 0x8888ff, transparent: true, opacity: 0 });
      const leftWallMesh = new THREE.Mesh(wallGeometry, wallMaterial3js);
      const rightWallMesh = new THREE.Mesh(wallGeometry, wallMaterial3js);
      leftWallMesh.position.copy(leftWallBody.position as unknown as THREE.Vector3);
      rightWallMesh.position.copy(rightWallBody.position as unknown as THREE.Vector3);
      sceneRef.current.add(leftWallMesh);
      sceneRef.current.add(rightWallMesh);

      const backWallShape = new CANNON.Box(new CANNON.Vec3(5, 1, 0.25));
      const backWallBody = new CANNON.Body({ mass: 0, material: wallMaterial });
      backWallBody.addShape(backWallShape);
      backWallBody.position.set(0, 1, -5.25);
      worldRef.current.addBody(backWallBody);

      const backWallGeometry = new THREE.BoxGeometry(10, 2, 0.5);
      const backWallMesh = new THREE.Mesh(backWallGeometry, wallMaterial3js);
      backWallMesh.position.copy(backWallBody.position as unknown as THREE.Vector3);
      sceneRef.current.add(backWallMesh);

      initCoinPool();
      spawnInitialCoins(); 
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
        //maxWidth: '400px',
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
          maxHeight: '667px',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '2px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(255, 255, 255, 0.7)',
          padding: '10px',
          borderRadius: '5px',
        }}>
          <button onClick={spawnCoin} style={{
            padding: '10px 20px',
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