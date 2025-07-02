import React, { useState, useMemo, useRef } from 'react';
import axios from 'axios';

// 虚拟化列表库
import { useVirtualizer } from '@tanstack/react-virtual';

// 拖拽库
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// 自定义 Hook 和组件
import { useAppStatus } from './hooks/useAppStatus';
import AppCard from './components/AppCard';
import AppDetailModal from './components/AppDetailModal';
import SearchInput from './components/SearchInput';
import StatusFilter from './components/StatusFilter';
import './App.css';

// 可排序的包装组件，它将 useSortable 的 props 传递给 AppCard
function SortableAppCard({ app, onCardClick }) {
  const { 
    attributes, 
    listeners, 
    setNodeRef, 
    transform, 
    transition 
  } = useSortable({ id: app.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <AppCard
      ref={setNodeRef}
      style={style}
      app={app}
      dndAttributes={attributes}
      dndListeners={listeners}
      onClick={() => onCardClick(app)} 
    />
  );
}

/**
 * 主应用组件 (最终完整版)
 */
function App() {
  // --- 1. 数据和状态管理 ---
  const { apps, loading, isConnected, setApps } = useAppStatus();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [appDetails, setAppDetails] = useState({ loading: false, owners: [] });


  // --- 2. 派生状态和计算 ---
  const filteredApps = useMemo(() => {
    let result = apps;

    // 首先，根据状态进行筛选
    if (statusFilter !== 'ALL') {
      result = result.filter(app => app.status === statusFilter);
    }

    // 然后，在状态筛选的基础上，再根据名称进行搜索
    if (searchQuery) {
      result = result.filter(app =>
        app.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return result;
  }, [apps, searchQuery, statusFilter]);


  // --- 3. 虚拟化网格核心逻辑 ---
  const parentRef = useRef();
  const columnCount = 4; // 与 App.css 中的 grid-template-columns 保持同步
  const rowCount = Math.ceil(filteredApps.length / columnCount);

  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 200, // 预估每一行的高度 (卡片高度 + 垂直间距)
    overscan: 5,
  });


  // --- 4. 事件处理器 ---
  const handleCardClick = async (app) => {
    setSelectedApp(app);
    setIsModalOpen(true);
    setAppDetails({ loading: true, owners: [] });

    try {
      const response = await axios.get(`/app/detail?app=${app.name}`);
      const owners = response.data?.data?.roleUser?.OWNER || [];
      setAppDetails({ loading: false, owners: owners });
    } catch (error) {
      console.error("Failed to fetch app details:", error);
      setAppDetails({ loading: false, owners: ['获取负责人失败'] });
    }
  };

  // ✅ 步骤 1: 简化 closeModal，它只负责关闭
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // ✅ 步骤 2: 创建一个新的回调函数，专门用于在动画结束后重置状态
  const handleModalExited = () => {
    setAppDetails({ loading: false, owners: [] });
    setSelectedApp(null);
  };
  
  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: {
      delay: 250,
      tolerance: 5,
    },
  }));

  function handleDragEnd(event) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
        const oldIndex = apps.findIndex((app) => app.id === active.id);
        const newIndex = apps.findIndex((app) => app.id === over.id);
        if (oldIndex !== -1 && newIndex !== -1) {
            setApps(arrayMove(apps, oldIndex, newIndex));
        }
    }
  }

  // --- 5. 渲染 JSX ---
  return (
    <>
      <div ref={parentRef} className="dashboard-container">
        <header className="dashboard-header">
          <h1>服务状态大盘</h1>
          <p className="connection-status">
            WebSocket: {isConnected ? '🟢 已连接' : '🔴 已断开'}
          </p>
          <div className="filters-container">
            <SearchInput
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <StatusFilter
              currentFilter={statusFilter}
              onFilterChange={setStatusFilter}
            />
          </div>
        </header>
        
        {loading ? ( <div className="loading-indicator">正在初始化大盘，请稍候...</div> ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={filteredApps.map(app => app.id)} strategy={rectSortingStrategy}>
              
              <div
                className="virtual-list-container"
                style={{ height: `${rowVirtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }}
              >
                {rowVirtualizer.getVirtualItems().map(virtualRow => {
                  const itemsInRow = [];
                  const startIndex = virtualRow.index * columnCount;
                  const endIndex = Math.min(startIndex + columnCount, filteredApps.length);
                  for (let i = startIndex; i < endIndex; i++) {
                    itemsInRow.push(filteredApps[i]);
                  }

                  return (
                    <div
                      key={virtualRow.key}
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', transform: `translateY(${virtualRow.start}px)` }}
                    >
                      <div className="virtual-grid-row">
                        {itemsInRow.map(app => (
                          app && (
                            <SortableAppCard
                              key={app.id}
                              app={app}
                              onCardClick={handleCardClick}
                            />
                          )
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </SortableContext>
            
            {filteredApps.length === 0 && searchQuery && !loading && (
              <div className="no-results">
                未找到名为 "{searchQuery}" 的应用
              </div>
            )}
          </DndContext>
        )}
      </div>
      
      <AppDetailModal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        app={selectedApp} 
        details={appDetails}
        onExited={handleModalExited} 
      />
    </>
  );
}

export default App;
