import React from 'react';
import { TimeEntry } from '../types/timeEntry';

interface TimeTrackingProgressProps {
  entries: TimeEntry[];
  startDate: Date;
  endDate: Date;
}

const TimeTrackingProgress: React.FC<TimeTrackingProgressProps> = ({
  entries,
  startDate,
  endDate,
}) => {
  // 计算日期范围内的每一天
  const getDaysArray = (start: Date, end: Date) => {
    const arr = [];
    const dt = new Date(start);
    while (dt <= end) {
      arr.push(new Date(dt));
      dt.setDate(dt.getDate() + 1);
    }
    return arr;
  };

  const days = getDaysArray(startDate, endDate);
  
  // 计算每天的记录时间（分钟）
  const getDayTrackedMinutes = (date: Date, entries: TimeEntry[]) => {
    const dateStr = date.toISOString().slice(0, 10);
    const dayEntries = entries.filter(e => e.date === dateStr);
    
    // 创建一个长度为1440的数组（24小时 * 60分钟），记录每分钟是否被覆盖
    const minutesCovered = new Array(1440).fill(false);
    
    dayEntries.forEach(entry => {
      if (!entry.startTime || !entry.endTime) return;
      
      // 解析时间
      const [startHour, startMin] = entry.startTime.split(/[: ]/).map(Number);
      const [endHour, endMin] = entry.endTime.split(/[: ]/).map(Number);
      
      // 转换为分钟
      let start = startHour * 60 + startMin;
      let end = endHour * 60 + endMin;
      
      // 处理跨天的情况
      if (end < start) {
        if (start <= 1440) { // 如果开始时间在当天
          end = 1440; // 截止到午夜
        } else {
          start = 0; // 从午夜开始
        }
      }
      
      // 标记这段时间内的每一分钟
      for (let i = Math.max(0, start); i < Math.min(1440, end); i++) {
        minutesCovered[i] = true;
      }
    });
    
    // 计算被覆盖的分钟数
    return minutesCovered.filter(Boolean).length;
  };

  // 每天的有效时间为16小时（清醒时间）
  const DAILY_ACTIVE_MINUTES = 16 * 60;

  // 计算每天的统计数据
  const dailyStats = days.map(day => {
    const trackedMinutes = getDayTrackedMinutes(day, entries);
    const percentage = Math.min(100, (trackedMinutes / DAILY_ACTIVE_MINUTES) * 100);
    return {
      date: day,
      trackedMinutes,
      percentage,
    };
  });

  // 计算总体覆盖率
  const totalTrackedMinutes = dailyStats.reduce((sum, stat) => sum + stat.trackedMinutes, 0);
  const totalTrackableMinutes = days.length * DAILY_ACTIVE_MINUTES;
  const totalPercentage = Math.min(100, (totalTrackedMinutes / totalTrackableMinutes) * 100);

  return (
    <div style={{ marginBottom: 24 }}>
      <h4 style={{ margin: '0 0 16px 0', fontSize: 16 }}>清醒时间记录覆盖率</h4>
      <div style={{ fontSize: 13, color: '#666', marginTop: -12, marginBottom: 16 }}>
        基于每天16小时清醒时间计算（不包括睡眠时间）
      </div>
      
      {/* 总体进度条 */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 14, color: '#666' }}>总体覆盖率</span>
          <span style={{ fontSize: 14, fontWeight: 500 }}>{totalPercentage.toFixed(1)}%</span>
        </div>
        <div style={{ 
          height: 8, 
          backgroundColor: '#eee', 
          borderRadius: 4,
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${totalPercentage}%`,
            height: '100%',
            backgroundColor: totalPercentage >= 70 ? '#4CAF50' : totalPercentage >= 40 ? '#FFC107' : '#FF5722',
            borderRadius: 4,
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>

      {/* 每日进度条 */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
        gap: '12px'
      }}>
        {dailyStats.map(stat => (
          <div key={stat.date.toISOString()} style={{ fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
              <span style={{ color: '#666' }}>
                {stat.date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
              </span>
              <span style={{ fontWeight: 500 }}>
                {(stat.trackedMinutes / 60).toFixed(1)}h
              </span>
            </div>
            <div style={{ 
              height: 4, 
              backgroundColor: '#eee', 
              borderRadius: 2,
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${stat.percentage}%`,
                height: '100%',
                backgroundColor: stat.percentage >= 70 ? '#4CAF50' : stat.percentage >= 40 ? '#FFC107' : '#FF5722',
                borderRadius: 2,
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimeTrackingProgress;
