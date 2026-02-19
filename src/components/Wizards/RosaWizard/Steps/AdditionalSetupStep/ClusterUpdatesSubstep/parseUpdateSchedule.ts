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
