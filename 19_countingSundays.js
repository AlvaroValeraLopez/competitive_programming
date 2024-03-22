function countSundays() {
    let sundays = 0;
    let dayOfWeek = 1; // 0 is Sunday, 1 is Monday, ..., 6 is Saturday. Jan 1, 1900 is a Monday
  
    // Move forward to Jan 1, 1901
    dayOfWeek = (dayOfWeek + 365) % 7;
  
    for (let year = 1901; year <= 2000; year++) {
      let daysInMonth = [31, (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      for (let month = 0; month < 12; month++) {
        if (dayOfWeek === 0) {
          sundays++;
        }
        dayOfWeek = (dayOfWeek + daysInMonth[month]) % 7;
      }
    }
    return sundays;
  }
  
  console.log(countSundays());
  