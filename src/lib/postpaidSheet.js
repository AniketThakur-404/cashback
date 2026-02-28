const MIN_QRS_PER_SHEET = 25;
const TARGET_SHEET_COUNT = 4000;
const MAX_QRS_PER_SHEET = 500;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export const resolvePostpaidSheetSize = (totalQrs) => {
  const total = Math.max(0, Number.parseInt(totalQrs, 10) || 0);
  if (!total) return MIN_QRS_PER_SHEET;

  const rawSize = Math.ceil(total / TARGET_SHEET_COUNT);
  const bounded = clamp(rawSize, MIN_QRS_PER_SHEET, MAX_QRS_PER_SHEET);
  const aligned = Math.ceil(bounded / MIN_QRS_PER_SHEET) * MIN_QRS_PER_SHEET;
  return clamp(aligned, MIN_QRS_PER_SHEET, MAX_QRS_PER_SHEET);
};

export const resolvePostpaidSheetCount = (totalQrs) => {
  const total = Math.max(0, Number.parseInt(totalQrs, 10) || 0);
  if (!total) return 0;
  return Math.ceil(total / resolvePostpaidSheetSize(total));
};

