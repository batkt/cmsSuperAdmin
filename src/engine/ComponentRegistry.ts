import { FC } from 'react';

export interface ComponentMetadata {
  type: string;
  label: string;
  schema?: any; // Add zod schemas here if needed
}

export const componentRegistry: Record<string, ComponentMetadata> = {
  header: { type: 'header', label: 'Header' },
  hero: { type: 'hero', label: 'Hero Section' },
  about: { type: 'about', label: 'About Us' },
  service: { type: 'service', label: 'Services' },
  contact: { type: 'contact', label: 'Contact Form' },
  footer: { type: 'footer', label: 'Footer' },
  grid: { type: 'grid', label: 'Grid Layout' },
  twocolumn: { type: 'twocolumn', label: 'Two Column Layout' },
  card: { type: 'card', label: 'Card' },
};
