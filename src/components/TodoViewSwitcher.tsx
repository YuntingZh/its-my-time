import React, { useState, useRef, useEffect } from 'react';
import { Todo } from '../types/todo';
import QuadrantView from './QuadrantView';

interface TodoViewSwitcherProps {
  todos: Todo[];
  onUpdate: (todo: Todo) => void;
  children: React.ReactNode;
}

const TodoViewSwitcher: React.FC<TodoViewSwitcherProps> = ({ todos, onUpdate, children }) => {
  const [currentView, setCurrentView] = useState<'list' | 'quadrant'>('list');
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 最小滑动距离，防止误触
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe && currentView === 'list') {
      setCurrentView('quadrant');
    } else if (isRightSwipe && currentView === 'quadrant') {
      setCurrentView('list');
    }
  };

  // 处理视图切换的动画
  useEffect(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    container.style.transition = 'transform 0.3s ease-out';
    container.style.transform = `translateX(${currentView === 'list' ? '0' : '-50%'})`;
  }, [currentView]);

  return (
    <div style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
      {/* 视图切换指示器 */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '8px',
        marginBottom: '16px',
      }}>
        <button
          onClick={() => setCurrentView('list')}
          style={{
            padding: '8px 16px',
            borderRadius: '20px',
            border: 'none',
            background: currentView === 'list' ? '#5C67F2' : '#E0E0E0',
            color: currentView === 'list' ? '#fff' : '#666',
            cursor: 'pointer',
          }}
        >
          列表视图
        </button>
        <button
          onClick={() => setCurrentView('quadrant')}
          style={{
            padding: '8px 16px',
            borderRadius: '20px',
            border: 'none',
            background: currentView === 'quadrant' ? '#5C67F2' : '#E0E0E0',
            color: currentView === 'quadrant' ? '#fff' : '#666',
            cursor: 'pointer',
          }}
        >
          四象限视图
        </button>
      </div>

      {/* 可滑动的容器 */}
      <div
        ref={containerRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
          display: 'flex',
          width: '200%',
          transform: 'translateX(0)',
          willChange: 'transform',
        }}
      >
        {/* 列表视图 */}
        <div style={{ width: '50%', padding: '0 16px' }}>
          {children}
        </div>

        {/* 四象限视图 */}
        <div style={{ width: '50%', padding: '0 16px' }}>
          <QuadrantView todos={todos} onUpdate={onUpdate} />
        </div>
      </div>
    </div>
  );
};

export default TodoViewSwitcher;
