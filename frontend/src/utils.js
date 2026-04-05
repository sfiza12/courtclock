import { parseISO, format } from 'date-fns';

export const formatDetention = (days) => {
  if (days === null || days === undefined) return "N/A";
  if (days < 30) return `${days} days`;
  
  const years = Math.floor(days / 365);
  const remainingDays = days % 365;
  const months = Math.floor(remainingDays / 30);
  
  if (years > 0) {
    return months > 0 ? `${years} yrs ${months} mo` : `${years} yrs`;
  }
  return `${months} mo`;
};

export const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    return format(parseISO(dateString), 'd MMM yyyy');
  } catch (e) {
    return String(dateString);
  }
};

export const formatScore = (score) => {
  if (score === null || score === undefined) return "N/A";
  return Number(score).toFixed(1);
};
