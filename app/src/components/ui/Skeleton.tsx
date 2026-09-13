import React from 'react';

const Skeleton: React.FC<{ width?: string; height?: string; className?: string }> = ({
  width = '100%',
  height = '20px',
  className = '',
}) => {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-slate-200/60 ${className}`}
      style={{ width, height }}
      aria-hidden="true"
    >
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/55 to-transparent [animation:shimmer_1.6s_ease-in-out_infinite]" />
    </div>
  );
};

export default Skeleton;