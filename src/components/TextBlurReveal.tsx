import React from 'react';
import { motion } from 'motion/react';

interface TextBlurRevealProps {
  text: string;
  className?: string;
  delay?: number;
  wordClassName?: string;
  duration?: number;
  stagger?: number;
}

export default function TextBlurReveal({
  text,
  className = '',
  delay = 0,
  wordClassName = '',
  duration = 1.1, // Half the speed (slower, smoother reveal)
  stagger = 0.16,
}: TextBlurRevealProps) {
  const words = text.split(' ');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: stagger,
        delayChildren: delay,
      },
    },
  };

  const wordVariants = {
    hidden: {
      opacity: 0,
      filter: 'blur(12px)',
      y: 14,
    },
    visible: {
      opacity: 1,
      filter: 'blur(0px)',
      y: 0,
      transition: {
        duration: duration,
        ease: [0.2, 0.65, 0.3, 0.9],
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`inline-flex flex-wrap items-center gap-x-1.5 gap-y-0.5 ${className}`}
    >
      {words.map((word, index) => (
        <motion.span
          key={`${word}-${index}`}
          variants={wordVariants}
          className={`inline-block ${wordClassName}`}
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
}
