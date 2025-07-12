import axios from "axios";
import { DateTime } from "luxon";

const API_KEY = process.env.HOLIDAY_API_KEY;
const API_URL = process.env.HOLIDAY_API_URL;

// Known Egyptian holidays for 2025
const KNOWN_EGYPTIAN_HOLIDAYS_2025 = [
  // From your images - 2025 holidays
  "2025-01-01", // New Year's Day
  "2025-01-06", // Orthodox Christmas Eve
  "2025-01-07", // Orthodox Christmas Day
  "2025-01-25", // Revolution Day 2011 / National Police Day
  "2025-03-20", // March Equinox
  "2025-03-21", // Festival of Breaking the Fast
  "2025-03-22", // Second Day of the Festival of Breaking the Fast
  "2025-03-23", // Third Day of the Festival of Breaking the Fast
  "2025-04-12", // Orthodox Easter
  "2025-04-13", // Spring Festival
  "2025-04-25", // Sinai Liberation Day
  "2025-05-01", // Labor Day
  "2025-05-26", // Arafat Day
  "2025-05-27", // Feast of the Sacrifice
  "2025-05-28", // Second Day of the Feast of the Sacrifice
  "2025-05-29", // Third Day of the Feast of the Sacrifice
  "2025-06-16", // Islamic New Year's Day
  "2025-06-21", // June Solstice
  "2025-06-30", // 30 June Day
  "2025-07-23", // Revolution Day
  "2025-08-26", // Birth of the Prophet
  "2025-09-23", // September Equinox
  "2025-10-06", // Armed Forces Day
  "2025-12-21", // December Solstice
  "2025-12-31" // New Year's Eve
];

// Known Egyptian holidays for 2026
const KNOWN_EGYPTIAN_HOLIDAYS_2026 = [
  // From your images - 2026 holidays
  "2026-01-01", // New Year's Day
  "2026-01-06", // Orthodox Christmas Eve
  "2026-01-07", // Orthodox Christmas Day
  "2026-01-25", // Revolution Day 2011 / National Police Day
  "2026-03-20", // March Equinox
  "2026-03-21", // Festival of Breaking the Fast
  "2026-03-22", // Second Day of the Festival of Breaking the Fast
  "2026-03-23", // Third Day of the Festival of Breaking the Fast
  "2026-04-12", // Orthodox Easter
  "2026-04-13", // Spring Festival
  "2026-04-25", // Sinai Liberation Day
  "2026-05-01", // Labor Day
  "2026-05-26", // Arafat Day
  "2026-05-27", // Feast of the Sacrifice
  "2026-05-28", // Second Day of the Feast of the Sacrifice
  "2026-05-29", // Third Day of the Feast of the Sacrifice
  "2026-06-16", // Islamic New Year's Day
  "2026-06-21", // June Solstice
  "2026-06-30", // 30 June Day
  "2026-07-23", // Revolution Day
  "2026-08-26", // Birth of the Prophet
  "2026-09-23", // September Equinox
  "2026-10-06", // Armed Forces Day
  "2026-12-21", // December Solstice
  "2026-12-31" // New Year's Eve
];

// Combined holidays list
const ALL_KNOWN_HOLIDAYS = [
  ...KNOWN_EGYPTIAN_HOLIDAYS_2025,
  ...KNOWN_EGYPTIAN_HOLIDAYS_2026
];

export async function isEgyptHoliday(date: DateTime): Promise<boolean> {
  // If API credentials are not configured, use fallback
  if (!API_KEY || !API_URL) {
    console.warn(
      "[HolidayService] Holiday API not configured, using fallback holiday list"
    );
    return checkFallbackHolidays(date.toISODate()!);
  }

  try {
    console.log(
      `[HolidayService] Checking if ${date.toISODate()} is an Egyptian holiday...`
    );

    const response = await axios.get(API_URL, {
      params: {
        key: API_KEY,
        country: "EG",
        year: date.year,
        month: date.month,
        day: date.day,
        public: true
      }
    });

    const holidays = response.data.holidays as {
      date: string;
      name?: string;
    }[];
    const isHoliday = holidays.some((h) => h.date === date.toISODate());

    if (isHoliday) {
      const holidayName =
        holidays.find((h) => h.date === date.toISODate())?.name ||
        "Unknown Holiday";
      console.log(
        `[HolidayService] ${date.toISODate()} is a holiday: ${holidayName}`
      );
    } else {
      console.log(`[HolidayService] ${date.toISODate()} is not a holiday`);
    }

    return isHoliday;
  } catch (err: unknown) {
    let message = "Unknown error";

    if (err instanceof Error) {
      message = err.message;
    }

    if (typeof err === "object" && err !== null && "response" in err) {
      const response = (err as any).response;
      const status = response?.status;

      if (status === 402) {
        console.error(
          "[HolidayService] API Payment Required (402) - API key may have expired. Using fallback."
        );
      } else if (status === 401) {
        console.error(
          "[HolidayService] API Unauthorized (401) - Invalid API key. Using fallback."
        );
      } else {
        console.error(
          `[HolidayService] API Error ${status} for ${date.toISODate()}. Using fallback.`
        );
      }
    } else {
      console.error(
        `[HolidayService] Failed to fetch holiday data for ${date.toISODate()}: ${message}. Using fallback.`
      );
    }

    return checkFallbackHolidays(date.toISODate() ?? "");
  }
}

/**
 * Check against known Egyptian holidays as fallback
 */
function checkFallbackHolidays(dateString: string): boolean {
  const isKnownHoliday = ALL_KNOWN_HOLIDAYS.includes(dateString);

  if (isKnownHoliday) {
    console.log(
      `[HolidayService] ${dateString} is a known Egyptian holiday (fallback list)`
    );
  } else {
    console.log(
      `[HolidayService] ${dateString} is not in known holiday list (fallback)`
    );
  }

  return isKnownHoliday;
}

/**
 * Get list of known holidays for a specific year
 */
export function getKnownHolidays(year?: number): string[] {
  if (year === 2025) {
    return [...KNOWN_EGYPTIAN_HOLIDAYS_2025];
  } else if (year === 2026) {
    return [...KNOWN_EGYPTIAN_HOLIDAYS_2026];
  } else {
    return [...ALL_KNOWN_HOLIDAYS];
  }
}

/**
 * Add a holiday to the known holidays list (for manual override)
 */
export function addKnownHoliday(dateString: string): void {
  if (!ALL_KNOWN_HOLIDAYS.includes(dateString)) {
    ALL_KNOWN_HOLIDAYS.push(dateString);
    ALL_KNOWN_HOLIDAYS.sort();
    console.log(`[HolidayService] Added ${dateString} to known holidays list`);
  }
}

/**
 * Check if a specific date is a known holiday (without API call)
 */
export function isKnownHoliday(dateString: string): boolean {
  return ALL_KNOWN_HOLIDAYS.includes(dateString);
}

/**
 * Get holiday name for a specific date (from known holidays)
 */
export function getHolidayName(dateString: string): string | null {
  const holidayNames: { [key: string]: string } = {
    // 2025 holidays
    "2025-01-01": "New Year's Day",
    "2025-01-06": "Orthodox Christmas Eve",
    "2025-01-07": "Orthodox Christmas Day",
    "2025-01-25": "Revolution Day 2011 / National Police Day",
    "2025-03-20": "March Equinox",
    "2025-03-21": "Festival of Breaking the Fast",
    "2025-03-22": "Second Day of the Festival of Breaking the Fast",
    "2025-03-23": "Third Day of the Festival of Breaking the Fast",
    "2025-04-12": "Orthodox Easter",
    "2025-04-13": "Spring Festival",
    "2025-04-25": "Sinai Liberation Day",
    "2025-05-01": "Labor Day",
    "2025-05-26": "Arafat Day",
    "2025-05-27": "Feast of the Sacrifice",
    "2025-05-28": "Second Day of the Feast of the Sacrifice",
    "2025-05-29": "Third Day of the Feast of the Sacrifice",
    "2025-06-16": "Islamic New Year's Day",
    "2025-06-21": "June Solstice",
    "2025-06-30": "30 June Day",
    "2025-07-23": "Revolution Day",
    "2025-08-26": "Birth of the Prophet",
    "2025-09-23": "September Equinox",
    "2025-10-06": "Armed Forces Day",
    "2025-12-21": "December Solstice",
    "2025-12-31": "New Year's Eve",

    // 2026 holidays (same names, different dates if needed)
    "2026-01-01": "New Year's Day",
    "2026-01-06": "Orthodox Christmas Eve",
    "2026-01-07": "Orthodox Christmas Day",
    "2026-01-25": "Revolution Day 2011 / National Police Day",
    "2026-03-20": "March Equinox",
    "2026-03-21": "Festival of Breaking the Fast",
    "2026-03-22": "Second Day of the Festival of Breaking the Fast",
    "2026-03-23": "Third Day of the Festival of Breaking the Fast",
    "2026-04-12": "Orthodox Easter",
    "2026-04-13": "Spring Festival",
    "2026-04-25": "Sinai Liberation Day",
    "2026-05-01": "Labor Day",
    "2026-05-26": "Arafat Day",
    "2026-05-27": "Feast of the Sacrifice",
    "2026-05-28": "Second Day of the Feast of the Sacrifice",
    "2026-05-29": "Third Day of the Feast of the Sacrifice",
    "2026-06-16": "Islamic New Year's Day",
    "2026-06-21": "June Solstice",
    "2026-06-30": "30 June Day",
    "2026-07-23": "Revolution Day",
    "2026-08-26": "Birth of the Prophet",
    "2026-09-23": "September Equinox",
    "2026-10-06": "Armed Forces Day",
    "2026-12-21": "December Solstice",
    "2026-12-31": "New Year's Eve"
  };

  return holidayNames[dateString] || null;
}
