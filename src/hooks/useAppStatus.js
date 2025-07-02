import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

// heimdall 应用的 API 和 WebSocket 地址
// 将它们定义为常量，方便未来修改
const API_BASE_URL = '/api/v1';
// 之前是: 'ws://localhost:8080/api/v1/status'
// 现在是:
// 我们需要根据当前页面的协议(http/https)动态生成 WebSocket URL
const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const WEBSOCKET_URL = `${wsProtocol}//${window.location.host}/api/v1/status`;

/**
 * 一个自定义的 React Hook，用于管理应用状态的获取和实时更新。
 * 它遵循“先通过 HTTP 拉取全量快照，再通过 WebSocket 接收增量更新”的最佳实践。
 */
export function useAppStatus() {
  // --- State Management ---
  // 存储所有应用对象的数组
  const [apps, setApps] = useState([]);
  // 用于跟踪初始数据是否正在加载
  const [loading, setLoading] =useState(true);
  // 用于跟踪 WebSocket 的连接状态
  const [isConnected, setIsConnected] = useState(false);
  
  // 使用 useRef 来持有 WebSocket 实例，避免因组件重渲染而重复创建
  const ws = useRef(null);

  // --- Effect Hook for Data Fetching and WebSocket Connection ---
  // 使用一个空的依赖数组 [] 来确保这个 effect 只在组件首次挂载时运行一次
  useEffect(() => {
    
    // 1. 定义一个异步函数来获取初始的全量数据
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        console.log('Attempting to fetch initial app statuses...');
        const response = await axios.get(`${API_BASE_URL}/status/all`);
        
        // 核心：后端的 /status/all 接口直接返回一个数组，所以 response.data 就是我们需要的列表
        setApps(response.data); 
        
        console.log(`✅ Successfully fetched ${response.data.length} initial app statuses.`);

      } catch (error) {
        console.error('❌ Failed to fetch initial app statuses:', error);
        // 即使获取失败，也设置一个空数组，避免 UI 因 undefined 而报错
        setApps([]);
      } finally {
        setLoading(false);
      }
    };

    // 2. 首先执行获取初始数据的操作
    fetchInitialData();

    // 3. 然后，建立 WebSocket 连接用于接收后续的实时更新
    console.log('Attempting to establish WebSocket connection...');
    ws.current = new WebSocket(WEBSOCKET_URL);

    // --- WebSocket Event Handlers ---

    ws.current.onopen = () => {
      console.log('✅ WebSocket connection established.');
      setIsConnected(true);
    };

    ws.current.onmessage = (event) => {
      try {
        // 解析从后端推送过来的 JSON 消息
        const updatedApp = JSON.parse(event.data);
        console.log('📩 Received status update via WebSocket:', updatedApp);
        
        // 使用函数式更新来设置状态，这能确保我们总是基于最新的状态进行修改
        setApps(prevApps => 
          // 遍历现有的 apps 数组
          prevApps.map(app => 
            // 如果找到 id 匹配的应用，就用新数据更新它；否则，保持原样
            app.id === updatedApp.id ? { ...app, ...updatedApp } : app
          )
        );
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    ws.current.onclose = () => {
      console.log('❌ WebSocket connection closed.');
      setIsConnected(false);
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error observed:', error);
      // 在这里可以根据需要实现重连逻辑
    };

    // --- Cleanup Function ---
    // 这个函数会在组件被销毁（unmount）时自动调用，至关重要！
    return () => {
      if (ws.current) {
        console.log('Cleaning up WebSocket connection...');
        ws.current.close(); // 优雅地关闭 WebSocket 连接，防止内存泄漏
      }
    };
  }, []); 

  // --- Return Value ---
  // 将需要给 UI 组件使用的状态和函数返回出去
  return { apps, loading, isConnected, setApps };
}