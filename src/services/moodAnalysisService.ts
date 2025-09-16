import { TimeEntry, MoodData } from '../types/timeEntry';

// Simple mood keywords mapping
const moodKeywords: { [key: string]: string } = {
  '开心': 'happy',
  '快乐': 'happy',
  '高兴': 'happy',
  '兴奋': 'excited',
  '难过': 'sad',
  '伤心': 'sad',
  '生气': 'angry',
  '愤怒': 'angry',
  '焦虑': 'anxious',
  '担心': 'anxious',
  '累': 'tired',
  '疲惫': 'tired',
  '放松': 'relaxed',
  '平静': 'calm',
};

export function extractMoodFromText(text: string): MoodData | null {
  let detectedMood: string | null = null;
  let intensity = 3; // Default intensity

  // Check for mood keywords
  for (const [keyword, mood] of Object.entries(moodKeywords)) {
    if (text.includes(keyword)) {
      detectedMood = mood;
      // Look for intensity modifiers
      if (text.includes('很') || text.includes('特别')) {
        intensity = 4;
      } else if (text.includes('非常') || text.includes('超')) {
        intensity = 5;
      } else if (text.includes('有点') || text.includes('稍微')) {
        intensity = 2;
      }
      break;
    }
  }

  if (!detectedMood) {
    return null;
  }

  return {
    mood: detectedMood,
    intensity,
    notes: text
  };
}

export function generateDailySummary(entries: TimeEntry[]): string {
  const moodEntries = entries.filter(entry => entry.mood);
  
  if (moodEntries.length === 0) {
    return '今天没有记录心情。';
  }

  // Analyze mood patterns
  const moodCounts: { [key: string]: number } = {};
  let totalIntensity = 0;
  
  moodEntries.forEach(entry => {
    if (entry.mood) {
      moodCounts[entry.mood.mood] = (moodCounts[entry.mood.mood] || 0) + 1;
      totalIntensity += entry.mood.intensity;
    }
  });

  const dominantMood = Object.entries(moodCounts)
    .sort(([, a], [, b]) => b - a)[0][0];
  
  const averageIntensity = totalIntensity / moodEntries.length;

  // Generate summary
  let summary = `今天的心情总体是${dominantMood}`;
  
  if (averageIntensity >= 4) {
    summary += '，情绪波动比较强烈。';
  } else if (averageIntensity >= 3) {
    summary += '，情绪比较稳定。';
  } else {
    summary += '，情绪比较平和。';
  }

  // Add activity correlations
  const activities = moodEntries.map(entry => entry.activity).join('、');
  summary += `\n主要活动包括：${activities}。`;

  return summary;
}
