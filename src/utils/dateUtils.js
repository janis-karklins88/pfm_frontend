// src/utils/dateUtils.js

export const getCurrentMonthRange = () => {
  const now = new Date();
  const firstDay = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  const lastDayDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const lastDay = `${lastDayDate.getFullYear()}-${String(lastDayDate.getMonth() + 1).padStart(2, '0')}-${String(lastDayDate.getDate()).padStart(2, '0')}`;
  
  return { startDate: firstDay, endDate: lastDay };
};

export const getPreviousMonthRange = () => {
  const now = new Date();
  const firstDayDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const firstDay = `${firstDayDate.getFullYear()}-${String(firstDayDate.getMonth() + 1).padStart(2, '0')}-01`;
  const lastDayDate = new Date(now.getFullYear(), now.getMonth(), 0);
  const lastDay = `${lastDayDate.getFullYear()}-${String(lastDayDate.getMonth() + 1).padStart(2, '0')}-${String(lastDayDate.getDate()).padStart(2, '0')}`;
  
  return { startDate: firstDay, endDate: lastDay };
};

export const getNextMonthRange = () => {
  const now = new Date();
  const firstDayDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const firstDay = `${firstDayDate.getFullYear()}-${String(firstDayDate.getMonth() + 1).padStart(2, '0')}-01`;
  const lastDayDate = new Date(now.getFullYear(), now.getMonth() + 2, 0);
  const lastDay = `${lastDayDate.getFullYear()}-${String(lastDayDate.getMonth() + 1).padStart(2, '0')}-${String(lastDayDate.getDate()).padStart(2, '0')}`;
  
  return { startDate: firstDay, endDate: lastDay };
};


export const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit'
  });
};


  