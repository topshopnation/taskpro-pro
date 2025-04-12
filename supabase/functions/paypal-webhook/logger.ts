
/**
 * Simple logger utility to standardize logging format
 */
export const logger = {
  info: (...args: any[]) => console.log(...args),
  error: (...args: any[]) => console.error(...args),
  debug: (...args: any[]) => console.debug(...args),
  warn: (...args: any[]) => console.warn(...args),
  
  // Log specific sections with clear visual separation
  section: (title: string, data?: any) => {
    console.log(`================ ${title.toUpperCase()} ================`);
    if (data) {
      if (typeof data === 'object') {
        console.log(JSON.stringify(data, null, 2));
      } else {
        console.log(data);
      }
    }
  }
};
