import axios from "axios";
import { DateTime } from "luxon";

const API_KEY = process.env.HOLIDAY_API_KEY;
const API_URL = process.env.HOLIDAY_API_URL;

export async function isEgyptHoliday(date: DateTime): Promise<boolean> {
  try {
    const response = await axios.get(API_URL!, {
      params: {
        key: API_KEY,
        country: "EG",
        year: date.year,
        month: date.month,
        day: date.day,
        public: true
      }
    });

    const holidays = response.data.holidays as { date: string }[];
    return holidays.some((h) => h.date === date.toISODate());
  } catch (err) {
    const error = err as Error;
    console.error("Failed to fetch holiday data:", error.message);
    return false;
  }
}
