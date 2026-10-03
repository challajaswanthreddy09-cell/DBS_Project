import React from "react";

/**
 * Reusable KPI Stat Card
 * Displays a single key library circulation metric with icon and badge.
 */
export default function StatCard({ title, value, icon: Icon, badge, variant = "default", helperText }) {
  return (
    <div className={`stat-card stat-card-${variant}`}>
      <div className="stat-card-header">
        <span className="stat-card-title">{title}</span>
        {Icon && (
          <div className={`stat-card-icon-wrap stat-icon-${variant}`}>
            <Icon size={20} />
          </div>
        )}
      </div>

      <div className="stat-card-body">
        <div className="stat-card-value">{value}</div>
        {badge && <span className={`stat-badge stat-badge-${variant}`}>{badge}</span>}
      </div>

      {helperText && <p className="stat-card-helper">{helperText}</p>}
    </div>
  );
}
