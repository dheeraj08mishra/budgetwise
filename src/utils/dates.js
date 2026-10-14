import { format } from "date-fns";

// Today's date in the user's own timezone, as "YYYY-MM-DD".
// (toISOString() gives the UTC date, which is yesterday in IST before 05:30.)
export const todayString = () => format(new Date(), "yyyy-MM-dd");
