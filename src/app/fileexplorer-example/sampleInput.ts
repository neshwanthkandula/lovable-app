
export const sampleFileInput = {
  'project/package.json': `{
  "name": "quantum-forge",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "next dev --turbo",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:push": "prisma db push"
  },
  "dependencies": {
    "@ai-sdk/google": "^1.0.0",
    "@inngest/next": "^3.46.0",
    "@prisma/client": "^7.0.0",
    "next": "15.3.4",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "zod": "^4.1.12"
  }
}`,

  'project/app/layout.tsx': `import { GeistSans } from 'geist/font/sans';
import { ThemeProvider } from '@/components/providers/quantum-theme';
import './globals.css';

export const metadata = {
  title: 'Quantum Forge - AI Code Generator',
  description: 'Transform ideas into production-ready code',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={GeistSans.className}>
        <ThemeProvider attribute="class" defaultTheme="dark">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}`,

  'project/app/page.tsx': `'use client';

import { NeuralCanvas } from '@/components/canvas/neural-canvas';
import { CodeOrchestrator } from '@/lib/hooks/use-quantum-orchestrator';

export default function QuantumForge() {
  return (
    <CodeOrchestrator>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <NeuralCanvas />
      </div>
    </CodeOrchestrator>
  );
}`,

  'project/components/canvas/neural-canvas.tsx': `'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QuantumNode } from './quantum-node';
import { NeuralConnection } from './neural-connection';

interface NodeData {
  id: string;
  type: 'input' | 'processing' | 'output';
  position: { x: number; y: number };
  content: string;
}

export function NeuralCanvas() {
  const [nodes, setNodes] = useState<NodeData[]>([
    {
      id: 'node-1',
      type: 'input',
      position: { x: 100, y: 200 },
      content: 'User Prompt'
    },
    {
      id: 'node-2', 
      type: 'processing',
      position: { x: 400, y: 200 },
      content: 'AI Analysis'
    },
    {
      id: 'node-3',
      type: 'output', 
      position: { x: 700, y: 200 },
      content: 'Generated Code'
    }
  ]);

  const addNode = useCallback((type: NodeData['type']) => {
    const newNode: NodeData = {
      id: \`node-$\{Date.now()}\`,
      type,
      position: { x: Math.random() * 600 + 100, y: Math.random() * 400 + 100 },
      content: \`New $\{type} Node\`
    };
    setNodes(prev => [...prev, newNode]);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <AnimatePresence>
        {nodes.map((node) => (
          <QuantumNode
            key={node.id}
            node={node}
            onDrag={(position) => {
              setNodes(prev => prev.map(n => 
                n.id === node.id ? { ...n, position } : n
              ));
            }}
          />
        ))}
      </AnimatePresence>
      
      {/* Neural connections between nodes */}
      {nodes.slice(0, -1).map((node, index) => (
        <NeuralConnection
          key={\`connection-$\{node.id}\`}
          from={node.position}
          to={nodes[index + 1]?.position}
        />
      ))}
      
      <div className="absolute top-4 left-4 flex gap-2">
        <button
          onClick={() => addNode('input')}
          className="px-4 py-2 bg-blue-600 rounded-lg text-white font-semibold"
        >
          Add Input
        </button>
        <button
          onClick={() => addNode('processing')} 
          className="px-4 py-2 bg-purple-600 rounded-lg text-white font-semibold"
        >
          Add Processor
        </button>
        <button
          onClick={() => addNode('output')}
          className="px-4 py-2 bg-green-600 rounded-lg text-white font-semibold"
        >
          Add Output
        </button>
      </div>
    </div>
  );
}`,

  'project/components/canvas/quantum-node.tsx': `'use client';

import { motion } from 'framer-motion';
import { useRef } from 'react';

interface QuantumNodeProps {
  node: {
    id: string;
    type: 'input' | 'processing' | 'output';
    position: { x: number; y: number };
    content: string;
  };
  onDrag: (position: { x: number; y: number }) => void;
}

export function QuantumNode({ node, onDrag }: QuantumNodeProps) {
  const nodeRef = useRef<HTMLDivElement>(null);

  const getNodeStyle = (type: string) => {
    switch (type) {
      case 'input':
        return 'bg-gradient-to-br from-blue-500 to-cyan-400 border-2 border-cyan-300';
      case 'processing':
        return 'bg-gradient-to-br from-purple-500 to-pink-400 border-2 border-purple-300';
      case 'output':
        return 'bg-gradient-to-br from-green-500 to-emerald-400 border-2 border-emerald-300';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <motion.div
      ref={nodeRef}
      className={\`absolute w-48 h-24 rounded-2xl shadow-2xl \${getNodeStyle(node.type)} cursor-grab active:cursor-grabbing\`}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ 
        scale: 1, 
        opacity: 1,
        x: node.position.x,
        y: node.position.y
      }}
      drag
      dragConstraints={nodeRef}
      dragElastic={0.1}
      onDrag={(event, info) => {
        onDrag({
          x: node.position.x + info.delta.x,
          y: node.position.y + info.delta.y
        });
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="flex items-center justify-center h-full text-white font-semibold text-center p-4">
        {node.content}
      </div>
    </motion.div>
  );
}`,

  'project/components/canvas/neural-connection.tsx': `'use client';

import { motion } from 'framer-motion';

interface NeuralConnectionProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
}

export function NeuralConnection({ from, to }: NeuralConnectionProps) {
  const pathData = \`M \${from.x + 96} \${from.y + 48} C \${(from.x + to.x) / 2} \${from.y} \${(from.x + to.x) / 2} \${to.y} \${to.x} \${to.y + 48}\`;

  return (
    <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
      <motion.path
        d={pathData}
        stroke="url(#neuralGradient)"
        strokeWidth="3"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      />
      <defs>
        <linearGradient id="neuralGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="50%" stopColor="#c084fc" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>
      </defs>
    </svg>
  );
}`,

  'project/components/providers/quantum-theme.tsx': `'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light' | 'system';

interface ThemeProviderProps {
  children: React.ReactNode;
  attribute?: string;
  defaultTheme?: Theme;
}

const ThemeContext = createContext<{
  theme: Theme;
  setTheme: (theme: Theme) => void;
} | null>(null);

export function ThemeProvider({ 
  children, 
  attribute = "class",
  defaultTheme = "system"
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};`,

  'project/lib/hooks/use-quantum-orchestrator.ts': `'use client';

import { createContext, useContext, useReducer, ReactNode } from 'react';

interface QuantumState {
  nodes: any[];
  connections: any[];
  activeNode: string | null;
  codeOutput: string;
  isGenerating: boolean;
}

type QuantumAction = 
  | { type: 'ADD_NODE'; payload: any }
  | { type: 'UPDATE_NODE'; payload: { id: string; updates: any } }
  | { type: 'SET_ACTIVE_NODE'; payload: string | null }
  | { type: 'SET_CODE_OUTPUT'; payload: string }
  | { type: 'SET_GENERATING'; payload: boolean };

const QuantumContext = createContext<{
  state: QuantumState;
  dispatch: React.Dispatch<QuantumAction>;
} | null>(null);

function quantumReducer(state: QuantumState, action: QuantumAction): QuantumState {
  switch (action.type) {
    case 'ADD_NODE':
      return {
        ...state,
        nodes: [...state.nodes, action.payload]
      };
    case 'UPDATE_NODE':
      return {
        ...state,
        nodes: state.nodes.map(node => 
          node.id === action.payload.id 
            ? { ...node, ...action.payload.updates }
            : node
        )
      };
    case 'SET_ACTIVE_NODE':
      return {
        ...state,
        activeNode: action.payload
      };
    case 'SET_CODE_OUTPUT':
      return {
        ...state,
        codeOutput: action.payload
      };
    case 'SET_GENERATING':
      return {
        ...state,
        isGenerating: action.payload
      };
    default:
      return state;
  }
}

const initialState: QuantumState = {
  nodes: [],
  connections: [],
  activeNode: null,
  codeOutput: '',
  isGenerating: false
};

export function CodeOrchestrator({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(quantumReducer, initialState);

  return (
    <QuantumContext.Provider value={{ state, dispatch }}>
      {children}
    </QuantumContext.Provider>
  );
}

export const useQuantumOrchestrator = () => {
  const context = useContext(QuantumContext);
  if (!context) {
    throw new Error('useQuantumOrchestrator must be used within a CodeOrchestrator');
  }
  return context;
};`,

  'types/quantum.ts': `export interface NeuralNode {
  id: string;
  type: 'input' | 'processing' | 'output' | 'custom';
  position: Vector2;
  data: Record<string, any>;
  connections: string[];
}

export interface Vector2 {
  x: number;
  y: number;
}

export interface CodeGenerationRequest {
  prompt: string;
  context: NeuralNode[];
  constraints?: string[];
  targetLanguage: 'typescript' | 'javascript' | 'python';
}

export interface CodeGenerationResponse {
  code: string;
  explanation: string;
  dependencies: string[];
  executionTime: number;
  confidence: number;
}`,

  'project/utils/neural-utils.ts': `import { NeuralNode, Vector2 } from '@/types/quantum';

export function calculateNodeDistance(a: Vector2, b: Vector2): number {
  return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
}

export function findOptimalConnectionPath(
  nodes: NeuralNode[], 
  fromId: string, 
  toId: string
): string[] {
  // Simplified pathfinding algorithm
  const fromNode = nodes.find(n => n.id === fromId);
  const toNode = nodes.find(n => n.id === toId);
  
  if (!fromNode || !toNode) return [];
  
  return [fromId, toId]; // Basic direct connection
}

export function generateNodeId(prefix: string = 'node'): string {
  return \`$\{prefix}-$\{Date.now()}-$\{Math.random().toString(36).substr(2, 9)}\`;
}`
}