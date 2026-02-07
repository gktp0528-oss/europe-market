import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigationType } from 'react-router-dom';

const PageTransition = ({ children }) => {
    const location = useLocation();
    const navigationType = useNavigationType(); // 'PUSH', 'POP', or 'REPLACE'
    const [direction, setDirection] = useState('forward');

    useEffect(() => {
        // Determine direction based on navigation type
        if (navigationType === 'POP') {
            setDirection('back');
        } else {
            setDirection('forward');
        }
    }, [location.pathname, navigationType]);

    const variants = {
        initial: (dir) => ({
            x: dir === 'forward' ? '100%' : '-25%', // Slight parallax for back gesture
            opacity: dir === 'forward' ? 1 : 0.5,
            zIndex: dir === 'forward' ? 2 : 1, // Ensure arriving page is on top
            boxShadow: dir === 'forward' ? '-5px 0 25px rgba(0,0,0,0.1)' : 'none'
        }),
        animate: {
            x: '0%',
            opacity: 1,
            zIndex: 1,
            transition: {
                // Native iOS-like spring physics
                type: 'spring',
                stiffness: 260,
                damping: 30,
                mass: 1
            }
        },
        exit: (dir) => ({
            x: dir === 'forward' ? '-25%' : '100%', // Slight parallax for exit
            opacity: dir === 'forward' ? 0.5 : 1,
            zIndex: dir === 'forward' ? 1 : 2, // Ensure leaving page is below or above correctly
            boxShadow: dir === 'forward' ? 'none' : '-5px 0 25px rgba(0,0,0,0.1)',
            transition: {
                type: 'spring',
                stiffness: 260,
                damping: 30,
                mass: 1
            }
        })
    };

    return (
        <motion.div
            key={location.pathname}
            custom={direction}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{
                position: 'absolute',
                width: '100%',
                minHeight: '100vh',
                background: 'white', // Ensure no transparency overlap
                top: 0,
                left: 0,
                overflowX: 'hidden'
            }}
        >
            {children}
        </motion.div>
    );
};

export default PageTransition;
