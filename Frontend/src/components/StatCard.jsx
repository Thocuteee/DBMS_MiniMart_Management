import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import './StatCard.css';

const StatCard = ({ title, value, prefix, suffix, change, changeType, linkText, icon: Icon, iconBgClass }) => {
  const isPositive = changeType === 'positive';
  
  return (
    <div className="card stat-card">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="stat-title">{title}</h5>
        {change && (
          <span className={`stat-change ${isPositive ? 'text-success' : 'text-danger'}`}>
            {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {change}
          </span>
        )}
      </div>
      
      <div className="d-flex align-items-center gap-2 mb-4">
        {prefix && <span className="stat-prefix">{prefix}</span>}
        <h2 className="stat-value">{value}</h2>
        {suffix && <span className="stat-suffix">{suffix}</span>}
      </div>
      
      <div className="d-flex justify-content-between align-items-center">
        <a href="#" className="stat-link">{linkText}</a>
        <div className={`stat-icon-wrapper ${iconBgClass}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
