'use client'

import { useWorkspace } from '@/contexts/workspace-context'
import { useState, useEffect } from 'react'

// Get day name abbreviation
const getDayName = (dayIndex: number): string => {
  return ['Mon', '', 'Wed', '', 'Fri', ''][dayIndex]
}

// Get month name
const getMonthName = (month: number): string => {
  return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][month]
}

// Get days for the last 6 months (similar to GitHub)
const getDaysForLastSixMonths = () => {
  const days = []
  const today = new Date()
  const endDate = new Date()
  
  // Go back 6 months
  const startDate = new Date(today)
  startDate.setMonth(startDate.getMonth() - 6)
  startDate.setDate(1)
  
  // Fill in all dates
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d))
  }
  
  return days
}

interface ActivityLevel {
  date: Date;
  count: number;
  level: 0 | 1 | 2 | 3 | 4; // 0 = no activity, 4 = highest activity
}

interface MonthLabel {
  month: number;
  position: number;
}

export function ActivityGrid() {
  const { tasks } = useWorkspace()
  const [activityData, setActivityData] = useState<ActivityLevel[]>([])
  const days = getDaysForLastSixMonths()
  
  // Process tasks into activity data
  useEffect(() => {
    // Create a map of dates to count completed tasks
    const dateCountMap: { [key: string]: number } = {}
    
    // Add some sample data for testing (will show up even without tasks)
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    
    dateCountMap[today.toISOString().split('T')[0]] = 5;
    dateCountMap[yesterday.toISOString().split('T')[0]] = 3;
    dateCountMap[twoDaysAgo.toISOString().split('T')[0]] = 1;
    
    // Add actual task data
    tasks.forEach(task => {
      if (task.status === 'completed' && task.updated_at) {
        const date = new Date(task.updated_at)
        const dateKey = date.toISOString().split('T')[0]
        
        if (!dateCountMap[dateKey]) {
          dateCountMap[dateKey] = 0
        }
        dateCountMap[dateKey]++
      }
    })
    
    // Convert days to activity levels
    const activity = days.map(date => {
      const dateKey = date.toISOString().split('T')[0]
      const count = dateCountMap[dateKey] || 0
      
      // Calculate activity level
      let level: 0 | 1 | 2 | 3 | 4 = 0
      if (count > 0) {
        if (count >= 5) level = 4
        else if (count >= 3) level = 3
        else if (count >= 2) level = 2
        else level = 1
      }
      
      return {
        date,
        count,
        level
      }
    })
    
    setActivityData(activity)
  }, [tasks, days])
  
  // Prepare grid data for display
  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  // Group by weeks - First create empty grid with 7 rows for days of week
  const weekGrid: ActivityLevel[][] = Array(7).fill(null).map(() => []);
  
  // Fill the grid with activity data
  activityData.forEach(day => {
    // Get day of week (0 = Sunday, so we adjust to make Monday=0)
    let dayOfWeek = day.date.getDay() - 1;
    if (dayOfWeek < 0) dayOfWeek = 6; // Sunday becomes 6
    
    weekGrid[dayOfWeek].push(day);
  });
  
  // Get month labels
  const monthLabels: MonthLabel[] = [];
  let currentMonth = -1;
  
  if (weekGrid[0]?.length > 0) {
    // Iterate through first row (Mondays) to find month boundaries
    weekGrid[0].forEach((day, index) => {
      const month = day.date.getMonth();
      if (month !== currentMonth) {
        monthLabels.push({
          month,
          position: index
        });
        currentMonth = month;
      }
    });
  }
  
  return (
    <div className="border rounded-lg p-6 bg-white shadow-sm mb-8">
      <h3 className="text-2xl font-medium mb-6">Task Activity</h3>
      
      <div className="overflow-x-auto">
        <div className="flex flex-col min-w-max">
          <div className="flex">
            {/* Day labels column */}
            <div className="flex flex-col mr-4 text-sm text-gray-500">
              <div className="h-[18px] mb-2">Mon</div>
              <div className="h-[18px] mb-2">Wed</div>
              <div className="h-[18px]">Fri</div>
            </div>
            
            {/* Activity grid and month labels */}
            <div className="flex flex-col">
              {/* Month labels row */}
              <div className="flex mb-2 ml-2">
                {monthLabels.map((label, i) => (
                  <div 
                    key={i} 
                    className="text-sm text-gray-500"
                    style={{ 
                      marginRight: i < monthLabels.length - 1 ? 
                        `${(monthLabels[i+1].position - label.position) * 20 - 30}px` : 0 
                    }}
                  >
                    {getMonthName(label.month)}
                  </div>
                ))}
              </div>
              
              {/* Grid rows */}
              {weekdays.map((day, rowIndex) => (
                // Only show Mon, Wed, Fri labels
                (rowIndex === 0 || rowIndex === 2 || rowIndex === 4) && (
                  <div key={rowIndex} className="flex mb-1">
                    {weekGrid[rowIndex]?.map((cell, colIndex) => (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        className={`w-[16px] h-[16px] mr-1 mb-1 rounded-sm ${
                          cell.level === 0 ? 'bg-[#ebedf0]' :
                          cell.level === 1 ? 'bg-[#9be9a8]' :
                          cell.level === 2 ? 'bg-[#40c463]' :
                          cell.level === 3 ? 'bg-[#30a14e]' :
                          'bg-[#216e39]'
                        }`}
                        title={`${cell.date.toDateString()}: ${cell.count} tasks completed`}
                      />
                    ))}
                  </div>
                )
              ))}
            </div>
          </div>
          
          {/* Legend */}
          <div className="flex items-center justify-end gap-2 mt-8 text-sm text-gray-500">
            <span>Less</span>
            <div className="w-[16px] h-[16px] rounded-sm bg-[#ebedf0]"></div>
            <div className="w-[16px] h-[16px] rounded-sm bg-[#9be9a8]"></div>
            <div className="w-[16px] h-[16px] rounded-sm bg-[#40c463]"></div>
            <div className="w-[16px] h-[16px] rounded-sm bg-[#30a14e]"></div>
            <div className="w-[16px] h-[16px] rounded-sm bg-[#216e39]"></div>
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  )
} 