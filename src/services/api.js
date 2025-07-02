// src/services/api.js
const initialApps = [
    { id: 'app-1', name: 'UserService', status: 'RUNNING' },
    { id: 'app-2', name: 'AuthService', status: 'RUNNING' },
    { id: 'app-3', name: 'PaymentGateway', status: 'DOWN' },
    { id: 'app-4', name: 'NotificationHub', status: 'DEGRADED' },
    { id: 'app-5', name: 'DataProcessor', status: 'RUNNING' },
    { id: 'app-6', name: 'LoggingService', status: 'RUNNING' },
    { id: 'app-7', name: 'APIGateway', status: 'DEGRADED' },
    { id: 'app-8', name: 'CacheProvider', status: 'STARTING' },
    // ... 你可以添加更多应用
  ];
  
const statuses = ['RUNNING', 'DEGRADED', 'DOWN', 'STARTING'];
  
  // 这个函数模拟一个一次性的HTTP请求，用于获取初始全量数据
export const getInitialAppList = () => {
    return new Promise(resolve => {
      // 模拟网络延迟
      setTimeout(() => {
        // 在真实场景中，这里应该返回所有应用的列表
        // 状态可以是 UNKNOWN 或后端记录的最后状态
        const initialList = [
          { id: 'UserService', name: 'UserService', status: 'UNKNOWN' },
          { id: 'AuthService', name: 'AuthService', status: 'UNKNOWN' },
          { id: 'PaymentGateway', name: 'PaymentGateway', status: 'UNKNOWN' },
          { id: 'NotificationHub', name: 'NotificationHub', status: 'UNKNOWN' },
          { id: 'DataProcessor', name: 'DataProcessor', status: 'UNKNOWN' },
          { id: 'LoggingService', name: 'LoggingService', status: 'UNKNOWN' },
          { id: 'APIGateway', name: 'APIGateway', status: 'UNKNOWN' },
          { id: 'CacheProvider', name: 'CacheProvider', status: 'UNKNOWN' },
        ];
        resolve(initialList);
      }, 500);
    });
  };


  // 模拟API调用
  export const fetchAllAppStatus = () => {
    return new Promise(resolve => {
      setTimeout(() => {
        // 随机改变一两个应用的状态来模拟动态变化
        const updatedApps = initialApps.map(app => {
          if (Math.random() < 0.1) { // 10%的概率改变状态
            const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
            return { ...app, status: newStatus };
          }
          return app;
        });
        resolve(updatedApps);
      }, 500); // 模拟网络延迟
    });
  };

  // 模拟的详细数据
const appDetailsData = {
    'app-1': { owner: '核心团队-张三', ip: '10.0.1.15', startTime: '2025-06-18 10:23:00', version: '1.2.5' },
    'app-2': { owner: '认证团队-李四', ip: '10.0.1.22', startTime: '2025-06-18 09:45:12', version: '2.0.1' },
    'app-3': { owner: '支付团队-王五', ip: '10.0.2.50', startTime: 'N/A', version: '3.1.0' },
    'app-4': { owner: '消息团队-赵六', ip: '10.0.3.18', startTime: '2025-06-17 23:10:45', version: '1.8.2' },
    // ... 其他应用的详情
  };
  
  // 新增：模拟根据ID获取应用详情的API
  export const fetchAppDetails = (appId) => {
    return new Promise(resolve => {
      setTimeout(() => {
        const details = appDetailsData[appId] || { owner: '未知', ip: 'N/A', startTime: 'N/A', version: 'N/A' };
        resolve(details);
      }, 300); // 模拟网络延迟
    });
  };