import React, { useState, Suspense, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { XR, ARButton } from '@react-three/xr';
import { OrbitControls, Stage, Html, PerformanceMonitor, Environment, useGLTF } from '@react-three/drei';

// Dummy product data
const products = [
  {
    id: 1,
    name: 'Headphone',
    model: '/models/headphone.glb',
    image: '/images/headphone.png',
    price: '$99',
    description: 'High-quality wireless headphones for immersive sound.'
  },
  {
    id: 2,
    name: 'Gaming Laptop',
    model: '/models/gaming_laptop.glb',
    image: '/images/gaming_laptop.png',
    price: '$1499',
    description: 'High-performance gaming laptop for immersive experiences.'
  },
  // Add more products and their .glb model paths
];

type Product = typeof products[number];

function ProductCard({ product, onSelect }: { product: Product; onSelect: (p: Product) => void }) {
  return (
    <div
      className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition p-4 cursor-pointer flex flex-col items-center w-60"
      onClick={() => onSelect(product)}
    >
      <img src={product.image} alt={product.name} className="w-32 h-32 object-contain mb-2" />
      <div className="font-semibold text-lg mb-1">{product.name}</div>
      <div className="text-gray-500 text-sm mb-1">{product.price}</div>
      <div className="text-gray-400 text-xs text-center">{product.description}</div>
    </div>
  );
}

function ProductList({ onSelect }: { onSelect: (p: Product) => void }) {
  return (
    <div className="flex flex-wrap gap-8 justify-center mt-10">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} onSelect={onSelect} />
      ))}
    </div>
  );
}

function ProductModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

function ARViewer({ product, onBack }: { product: Product; onBack: () => void }) {
  const controlsRef = useRef<any>(null);
  const [dpr, setDpr] = useState(1.5);
  const [resetKey, setResetKey] = useState(0);

  // Reset view handler
  const handleResetView = () => {
    setResetKey((k) => k + 1);
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex flex-col items-center justify-center px-2 py-4 overflow-auto">
      <button
        onClick={onBack}
        className="absolute top-6 left-6 bg-white rounded-full p-3 shadow-lg hover:bg-blue-100 transition"
        aria-label="Back"
      >
        ← Back
      </button>
      <div className="bg-white rounded-xl shadow-xl p-6 flex flex-col items-center max-w-lg w-full">
        <div className="text-xl font-bold mb-2">{product.name}</div>
        <div className="text-gray-600 mb-1">{product.price}</div>
        <div className="text-gray-400 mb-4 text-center">{product.description}</div>
        <div className="w-full h-[400px] bg-gray-100 rounded-lg overflow-hidden relative">
          <Canvas
            key={resetKey}
            camera={{ position: [0, 1, 3], fov: 50 }}
            dpr={dpr}
            performance={{ min: 0.5 }}
            className="w-full h-full"
          >
            <PerformanceMonitor onIncline={() => setDpr(2)} onDecline={() => setDpr(1)} />
            <Suspense fallback={<Html center className="text-lg">Loading...</Html>}>
              <Stage environment={null} intensity={0.8} adjustCamera>
                <ProductModel url={product.model} />
              </Stage>
              <Environment preset="city" background={false} />
            </Suspense>
            <OrbitControls
              ref={controlsRef}
              makeDefault
              enablePan={false}
              enableDamping
              dampingFactor={0.1}
              minDistance={1}
              maxDistance={10}
            />
          </Canvas>
          <button
            onClick={handleResetView}
            className="absolute top-3 right-3 bg-white rounded-full p-2 shadow hover:bg-blue-100 transition text-xs"
            aria-label="Reset View"
          >
            ⟳
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [selected, setSelected] = useState<Product | null>(null);

  // Preload models for better UX
  useEffect(() => {
    products.forEach((p) => {
      try {
        useGLTF.preload(p.model);
      } catch {}
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
      <header className="py-8 text-center">
        <h1 className="text-4xl font-extrabold text-blue-700 mb-2">Creatix AR Product Viewer</h1>
        <p className="text-gray-500">Select a product to view it in 3D/AR</p>
      </header>
      {!selected ? (
        <ProductList onSelect={setSelected} />
      ) : (
        <ARViewer product={selected} onBack={() => setSelected(null)} />
      )}
      <footer className="text-center text-xs text-gray-400 py-6">&copy; {new Date().getFullYear()} Creatix AR</footer>
    </div>
  );
} 