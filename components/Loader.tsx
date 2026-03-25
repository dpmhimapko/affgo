import React from 'react';
import { Spinner } from './Spinner';

interface LoaderProps {
    message?: string;
}

const Loader: React.FC<LoaderProps> = ({ message }) => {
    return (
        <div className="flex flex-col items-center justify-center p-4">
            <Spinner className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
            {message && <p className="mt-3 text-sm font-medium text-slate-500 dark:text-slate-400 animate-pulse">{message}</p>}
        </div>
    );
};

export default Loader;