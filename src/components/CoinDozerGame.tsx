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
import WalletButton from './viem/WalletButton';
import BackgroundMusic from './scene/BackgroundMusic';

const COIN_POOL_SIZE = 150;
const INITIAL_COINS = 20;
const coinDropSound = new Audio('coindrop.mp3');
const coinThrowSound = new Audio('cointhrow.mp3');

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
  const [showMatrix, setShowMatrix] = useState(false);

  const handleSpawnCoin = () => {
    spawnCoin(coinPoolRef, coinsRef, worldRef, sceneRef, setCoinCount, selectedCoin);
    coinThrowSound.play().catch(error => console.error("Error playing the sound:", error));
  };

  useEffect(() => {
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
      pusherRef.current = pusher;

      if (mountRef.current) {
        mountRef.current.appendChild(renderer.domElement);
      }

      initCoinPool(coinPoolRef, COIN_POOL_SIZE);
      spawnInitialCoins(coinPoolRef, coinsRef, worldRef, sceneRef, setCoinCount, INITIAL_COINS);
    };

    const animate = (time: number) => {
      requestAnimationFrame(animate);

      console.log(coinCount);
    
      if (worldRef.current && sceneRef.current && cameraRef.current && rendererRef.current) {
        worldRef.current.step(1 / 60);
    
        // Update pusher and image
        const amplitude = 1;
        const frequency = 0.005;
        pusherRef.current.body.position.z = -4.5 + Math.sin(time * frequency) * amplitude;
        pusherRef.current.mesh.position.copy(pusherRef.current.body.position as unknown as THREE.Vector3);
        
        if (pusherRef.current.imageMesh) {
          // Update image position relative to pusher
          pusherRef.current.imageMesh.position.copy(pusherRef.current.mesh.position);
          pusherRef.current.imageMesh.position.y += 3; // Adjust this value to move the image up or down
          pusherRef.current.imageMesh.position.z += 0; // Adjust this value to move the image closer to or further from the pusher
    
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
    
          if (coin.body.position.y < -2 || coin.body.position.z > 7) {
            worldRef.current.removeBody(coin.body);
            sceneRef.current.remove(coin.mesh);
            coin.active = false;
            coinsRef.current.splice(i, 1);
            setCoinCount(prevCount => prevCount - 1);
            coinDropSound.play().catch(error => console.error("Error playing the sound:", error));
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
    <div className="flex justify-center items-center w-full h-screen bg-black">
      <MainContent 
        showMatrix={showMatrix} 
        setShowMatrix={setShowMatrix} 
        selectedCoin={selectedCoin}
        setSelectedCoin={setSelectedCoin}
        coins={coins}
        handleSpawnCoin={handleSpawnCoin}
        mountRef={mountRef}
      />
    </div>
  );
};

const MainContent: React.FC<{
  showMatrix: boolean;
  setShowMatrix: React.Dispatch<React.SetStateAction<boolean>>;
  selectedCoin: typeof coins[0];
  setSelectedCoin: React.Dispatch<React.SetStateAction<typeof coins[0]>>;
  coins: typeof coins;
  handleSpawnCoin: () => void;
  mountRef: React.RefObject<HTMLDivElement>;
}> = ({ showMatrix, setShowMatrix, selectedCoin, setSelectedCoin, coins, handleSpawnCoin, mountRef }) => {
  return (
    <div className="relative w-full max-w-md h-screen overflow-hidden">
      <div>
        <ToggleMatrixButton showMatrix={showMatrix} setShowMatrix={setShowMatrix} />
        <MatrixOverlay showMatrix={showMatrix} />
      </div>
      <Header />
      <WalletButtonWrapper />
      <BackgroundMusic src="background.mp3" />
      <BackgroundVideo />
      <BackgroundImage />
      <ContentMount mountRef={mountRef} />
      <BottomBar 
        coins={coins} 
        selectedCoin={selectedCoin} 
        setSelectedCoin={setSelectedCoin} 
        handleSpawnCoin={handleSpawnCoin} 
      />
    </div>
  );
};

const ToggleMatrixButton: React.FC<{
  showMatrix: boolean;
  setShowMatrix: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ showMatrix, setShowMatrix }) => (
  <button 
    onClick={() => setShowMatrix(!showMatrix)} 
    className="absolute top-0 left-0 z-50"
  >
    ➡️
  </button>
);

const MatrixOverlay: React.FC<{ showMatrix: boolean }> = ({ showMatrix }) => (
  showMatrix && (
    <div className="absolute top-10 left-0 bg-gray-500 bg-opacity-50 p-2 z-50">
      <p className="font-mono m-0">Contract State</p>
      <p className="font-mono m-0">0 1 0 1 0</p>
      <p className="font-mono m-0">1 0 1 0 1</p>
      <p className="font-mono m-0">0 1 0 1 0</p>
      <p className="font-mono m-0">1 0 1 0 1</p>
      <p className="font-mono m-0">0 1 0 1 0</p>
    </div>
  )
);

const Header: React.FC = () => (
  <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-50 py-2 px-3 text-white text-sm bg-opacity-90 rounded cursor-pointer">
    NEAR AA
  </div>
);

const WalletButtonWrapper: React.FC = () => (
  <div className="absolute top-12 right-2 z-50">
    <WalletButton />
  </div>
);

const BackgroundVideo: React.FC = () => (
  <video autoPlay loop muted playsInline className="absolute top-0 left-1/2 transform -translate-x-1/2 h-[440px] object-cover z-1">
    <source src='/dance.mp4' type="video/mp4" />
    Your browser does not support the video tag.
  </video>
);

const BackgroundImage: React.FC = () => (
  <div className="absolute top-[-80px] left-5 right-5 bottom-10 bg-cover bg-center" style={{ backgroundImage: 'url("/bgmockup.png")', transform: 'scale(1.1)', zIndex: 0 }} />
);

const ContentMount: React.FC<{ mountRef: React.RefObject<HTMLDivElement> }> = ({ mountRef }) => (
  <div ref={mountRef} className="absolute top-0 left-0 right-0 bottom-20 max-h-[calc(100%-80px)] z-3" />
);

const BottomBar: React.FC<{
  coins: typeof coins;
  selectedCoin: typeof coins[0];
  setSelectedCoin: React.Dispatch<React.SetStateAction<typeof coins[0]>>;
  handleSpawnCoin: () => void;
}> = ({ coins, selectedCoin, setSelectedCoin, handleSpawnCoin }) => (
  <div className="absolute bottom-0 left-0 w-full h-20 bg-white bg-opacity-90 flex items-center justify-between px-2 z-10">
    <div className="flex items-center overflow-x-auto w-[calc(100%-140px)] pb-2">
      {coins.map((coin) => (
        <CoinItem 
          key={coin.id} 
          coin={coin} 
          selectedCoin={selectedCoin} 
          setSelectedCoin={setSelectedCoin} 
        />
      ))}
    </div>
    <CoinInfoAndButton 
      selectedCoin={selectedCoin} 
      handleSpawnCoin={handleSpawnCoin} 
    />
  </div>
);

const CoinItem: React.FC<{
  coin: typeof coins[0];
  selectedCoin: typeof coins[0];
  setSelectedCoin: React.Dispatch<React.SetStateAction<typeof coins[0]>>;
}> = ({ coin, selectedCoin, setSelectedCoin }) => (
  <div onClick={() => setSelectedCoin(coin)} className="mr-2 cursor-pointer relative flex-shrink-0">
    <img 
      src={coin.image} 
      alt={coin.name} 
      className={`w-12 h-12 rounded-full ${selectedCoin.id === coin.id ? 'border-3 border-green-500' : ''}`}
    />
  </div>
);

const CoinInfoAndButton: React.FC<{
  selectedCoin: typeof coins[0];
  handleSpawnCoin: () => void;
}> = ({ selectedCoin, handleSpawnCoin }) => (
  <div className="flex items-center ml-2 flex-shrink-0">
    <div className="mr-2 text-right">
      <div className="text-xs">{selectedCoin.name}</div>
      <div className="text-xs">{selectedCoin.balance} coins</div>
    </div>
    <button 
      onClick={handleSpawnCoin} 
      className="bg-green-500 text-white border-none rounded-full w-12 h-12 flex justify-center items-center cursor-pointer text-2xl font-bold"
    >
      +
    </button>
  </div>
);

export default CoinDozerGame;