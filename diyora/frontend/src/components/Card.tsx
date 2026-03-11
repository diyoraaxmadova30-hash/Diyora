import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'glass' | 'outline';
}

export const Card: React.FC<CardProps> = ({
    className,
    variant = 'default',
    children,
    ...props
}) => {
    const variants = {
        default: 'bg-white shadow-sm border border-slate-100',
        glass: 'glass',
        outline: 'bg-transparent border-2 border-slate-100',
    };

    return (
        <div
            className={cn(
                'rounded-3xl p-6 transition-all duration-300',
                variants[variant],
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};
