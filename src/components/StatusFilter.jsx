import React from 'react';
import './StatusFilter.css';

// 定义所有可能的状态选项，"ALL" 代表不过滤
const STATUS_OPTIONS = ['ALL', 'RUNNING', 'DOWN', 'DEGRADED', 'OFFLINE'];

/**
 * 应用状态筛选下拉菜单组件
 * @param {string} currentFilter - 当前选中的状态
 * @param {function} onFilterChange - 当选择变化时调用的回调函数
 */
export default function StatusFilter({ currentFilter, onFilterChange }) {
  return (
    <div className="status-filter-wrapper">
      <label htmlFor="status-select" className="status-filter-label">状态筛选:</label>
      <select 
        id="status-select"
        className="status-filter-select"
        value={currentFilter}
        onChange={(e) => onFilterChange(e.target.value)}
      >
        {STATUS_OPTIONS.map(status => (
          <option key={status} value={status}>
            {status === 'ALL' ? '所有状态' : status}
          </option>
        ))}
      </select>
    </div>
  );
}
