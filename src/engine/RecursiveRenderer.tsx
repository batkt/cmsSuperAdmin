import React from 'react';
import { bgMap, alignMap, containerPaddingMap } from './Tokens';
import Button from '../components/Button';
import Hero from '../components/Hero';
import Header from '../components/Header';
import About from '../components/About';
import Footer from '../components/Footer';
import Container from '../components/Container';
import Grid from '../components/layouts/Grid';
import TwoColumn from '../components/layouts/TwoColumn';
import Card from '../components/layouts/Card';

export interface ComponentInstance {
  id: string;
  type: string;
  props?: Record<string, any>;
  children?: ComponentInstance[];
}

export interface RendererProps {
  instance: ComponentInstance;
  isEditMode?: boolean;
}

const componentMap: Record<string, React.ComponentType<any>> = {
  button: Button,
  hero: Hero,
  header: Header,
  about: About,
  footer: Footer,
  container: Container,
  grid: Grid,
  twocolumn: TwoColumn,
  card: Card,
};

export const RecursiveRenderer: React.FC<RendererProps> = ({ instance, isEditMode = false }) => {
  const { id, type, props = {}, children = [] } = instance;

  // Find actual component from map, or use a basic div block if not found
  const ElementType = componentMap[type.toLowerCase()];

  if (!ElementType) {
    return (
      <div className="p-4 border-2 border-red-500 border-dashed bg-red-50 text-red-700">
        Unknown component type: {type}
      </div>
    );
  }

  const elementProps: any = {
    key: id,
    id: isEditMode ? `edit-node-${id}` : undefined,
    'data-type': type,
    ...props
  };

  // If we have children, we recursively render them
  // For specialized layouts like TwoColumn, props may dictate how children are passed,
  // but for generic slot testing, we pass mapped children directly.
  let renderedChildren: React.ReactNode = null;
  if (children && children.length > 0) {
    renderedChildren = children.map((child) => (
      <RecursiveRenderer key={child.id} instance={child} isEditMode={isEditMode} />
    ));
  }

  // Pre-process TwoColumn children mapping safely if it has exactly left/right children 
  // (Assuming indices 0 is left and 1 is right)
  if (type === 'twocolumn' && children.length >= 2) {
    elementProps.leftContent = <RecursiveRenderer instance={children[0]} isEditMode={isEditMode} />;
    elementProps.rightContent = <RecursiveRenderer instance={children[1]} isEditMode={isEditMode} />;
    renderedChildren = null; // Don't pass regular children
  }

  return (
    <div 
      className={`relative group ${isEditMode ? 'hover:ring-2 hover:ring-blue-400 p-1 m-1 transition-all' : ''}`}
      onClick={(e) => {
        if (isEditMode) {
          e.stopPropagation();
          console.log('Selected node:', id);
          // Dispatch a custom event to notify builder
          window.dispatchEvent(new CustomEvent('cms:select-node', { detail: { id } }));
        }
      }}
    >
      <ElementType {...elementProps}>
        {renderedChildren}
      </ElementType>
      
      {isEditMode && (
        <div className="absolute top-0 right-0 -translate-y-full opacity-0 group-hover:opacity-100 bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-t font-semibold z-50 pointer-events-none transition-opacity">
          {type}
        </div>
      )}
    </div>
  );
};
