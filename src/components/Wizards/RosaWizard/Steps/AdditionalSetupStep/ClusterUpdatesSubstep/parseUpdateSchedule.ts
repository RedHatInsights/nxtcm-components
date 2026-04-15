/**
 * Parses a five-field cron string into the hour (field 1) and day-of-week (field 4) used by the UI.
 * Returns empty strings if the input is missing or not long enough to read those fields.
 */
const parseUpdateSchedule = (cronString: string): [string, string] => {
  if (!cronString) {
    return ['', ''];
  }

  const parts = cronString.split(' ');
  if (parts.length < 5) {
    return ['', ''];
  }

  const hour = parts[1];
  const day = parts[4];

  return [hour, day];
};

export default parseUpdateSchedule;
