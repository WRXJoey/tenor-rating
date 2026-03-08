export function getRelativeTime(timestamp) {
  const now = new Date();
  const posted = new Date(timestamp);
  const diffMs = now - posted;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  const plural = (count, word) => `${count} ${word}${count !== 1 ? 's' : ''} ago`;

  if (diffSecs  < 60) return plural(diffSecs,                  'second');
  if (diffMins  < 60) return plural(diffMins,                  'minute');
  if (diffHours < 24) return plural(diffHours,                 'hour');
  if (diffDays  <  7) return plural(diffDays,                  'day');
  if (diffDays  < 30) return plural(Math.floor(diffDays / 7),  'week');

  return posted.toLocaleDateString();
}
