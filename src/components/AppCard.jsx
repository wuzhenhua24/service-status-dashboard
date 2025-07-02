// src/components/AppCard.jsx (Corrected Version)
import React from 'react';
import './AppCard.css';

const statusStyles = {
  RUNNING: { glowClass: 'glow-green' },
  DEGRADED: { glowClass: 'glow-yellow' },
  DOWN: { glowClass: 'glow-red' },
  STARTING: { glowClass: 'glow-blue' },
};

// 我们将 dnd-kit 的 props 显式地命名出来，增加代码可读性
const AppCard = React.forwardRef(({ app, onClick, dndAttributes, dndListeners, style }, ref) => {
  const styleInfo = statusStyles[app.status] || {};

  return (
    // 在这一个 div 上绑定所有需要的属性和事件
    <div
      ref={ref}
      style={style} // 来自 useSortable 的 transform 和 transition
      {...dndAttributes} // 来自 useSortable 的属性 (e.g., role, aria-*)
      {...dndListeners} // 来自 useSortable 的拖拽事件监听器
      onClick={onClick} // 我们自己的点击事件监听器
      className={`app-card ${styleInfo.glowClass || ''}`}
    >
      <div className="card-content">
        <h3 className="app-name">{app.name}</h3>
        <p className={`app-status-text status-${app.status.toLowerCase()}`}>
          {app.status}
        </p>
      </div>
    </div>
  );
});

export default AppCard;