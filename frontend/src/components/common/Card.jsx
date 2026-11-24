import React from 'react';

export const Card = ({
  children,
  title,
  subtitle,
  icon: Icon,
  action,
  className = '',
  headerClassName = '',
  glow = false,
}) => {
  return (
    <div
      className={`bg-cyber-navy/80 border border-cyber-border rounded-xl backdrop-blur-sm transition-all duration-200 ${
        glow ? 'shadow-glow-cyan border-cyan-500/40' : 'hover:border-cyber-borderBright'
      } ${className}`}
    >
      {(title || Icon || action) && (
        <div
          className={`flex items-center justify-between px-5 py-4 border-b border-cyber-border/70 ${headerClassName}`}
        >
          <div className="flex items-center gap-2.5">
            {Icon && <Icon className="w-5 h-5 text-cyber-cyan" />}
            <div>
              {title && <h3 className="text-base font-semibold text-slate-100">{title}</h3>}
              {subtitle && <p className="text-xs text-cyber-textMuted mt-0.5">{subtitle}</p>}
            </div>
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
};
