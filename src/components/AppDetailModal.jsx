import React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import './AppDetailModal.css';

/**
 * 应用详情模态框组件 (最终修复版)
 * 我们简化了 JSX 结构，使其更加标准和健壮
 */
export default function AppDetailModal({ isOpen, onClose, app, details, onExited }) {

  const renderOwnerContent = () => {
    if (details.loading) {
      return <span>正在加载...</span>;
    }
    if (!details.owners || details.owners.length === 0) {
      return <span>暂无负责人信息</span>;
    }
    return <span>{details.owners.join(', ')}</span>;
  };

  return (
    <Transition appear show={isOpen} as={Fragment} afterLeave={onExited}>
      <Dialog as="div" className="modal-container" onClose={onClose}>
        {/* 第一层 Transition.Child 用于背景遮罩层的过渡动画
        */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="modal-backdrop" />
        </Transition.Child>

        {/* 这个容器负责将模态框内容在屏幕中居中
        */}
        <div className="modal-content-wrapper">
          <div className="modal-content-inner">
            {/* 第二层 Transition.Child 用于模态框面板本身的过渡动画 (缩放、淡入)
            */}
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="modal-panel">
                <Dialog.Title as="h3" className="modal-title">
                  {app?.name} - 应用详情
                </Dialog.Title>
                
                <div className="modal-content">
                  <ul className="details-list">
                    <li>
                      <strong>当前状态:</strong>
                      <span>{app?.status || 'N/A'}</span>
                    </li>
                    <li>
                      <strong>负责人:</strong>
                      {renderOwnerContent()}
                    </li>
                  </ul>
                </div>

                <div className="modal-footer">
                  <button type="button" className="close-button" onClick={onClose}>
                    关闭
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
