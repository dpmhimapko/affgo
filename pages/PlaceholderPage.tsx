import React from 'react';

interface PlaceholderPageProps {
  title: string;
  description: string;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title, description }) => (
  <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
    <h1 className="text-3xl font-bold mb-4">{title}</h1>
    <p>{description}</p>
  </div>
);
