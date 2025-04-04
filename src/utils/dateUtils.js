// src/utils/dateUtils.js

export const getCurrentMonthRange = () => {
  const now = new Date();
  // Get the first day of the current month in local time
  const firstDay = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  
  // Calculate the last day of the month by creating a date for the 0th day of the next month
  const lastDayDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const lastDay = `${lastDayDate.getFullYear()}-${String(lastDayDate.getMonth() + 1).padStart(2, '0')}-${String(lastDayDate.getDate()).padStart(2, '0')}`;
  
  return { startDate: firstDay, endDate: lastDay };
};

export const getPreviousMonthRange = () => {
  const now = new Date();
  // Get the first day of the previous month
  const firstDayDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const firstDay = `${firstDayDate.getFullYear()}-${String(firstDayDate.getMonth() + 1).padStart(2, '0')}-01`;

  // Get the last day of the previous month
  const lastDayDate = new Date(now.getFullYear(), now.getMonth(), 0);
  const lastDay = `${lastDayDate.getFullYear()}-${String(lastDayDate.getMonth() + 1).padStart(2, '0')}-${String(lastDayDate.getDate()).padStart(2, '0')}`;
  
  return { startDate: firstDay, endDate: lastDay };
};
  