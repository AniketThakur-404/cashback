export const formatAmount = (value) => {
  const num = typeof value === "number" ? value : parseFloat(value);
  if (isNaN(num)) return "0.00";
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

export const formatShortDate = (value) => {
  if (!value) return "—";
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch (e) {
    return "—";
  }
};

export const parseNumericValue = (value, fallback = 0) => {
  if (value === undefined || value === null || value === "") return fallback;
  const num = parseFloat(value);
  return isNaN(num) ? fallback : num;
};

const romanCache = {};
export const toRoman = (num) => {
  if (num <= 0) return "";
  if (romanCache[num]) return romanCache[num];

  const lookup = [
    ["M", 1000],
    ["CM", 900],
    ["D", 500],
    ["CD", 400],
    ["C", 100],
    ["XC", 90],
    ["L", 50],
    ["XL", 40],
    ["X", 10],
    ["IX", 9],
    ["V", 5],
    ["IV", 4],
    ["I", 1],
  ];
  let res = "";
  let n = num;
  for (const [k, v] of lookup) {
    while (n >= v) {
      res += k;
      n -= v;
    }
  }
  romanCache[num] = res;
  return res;
};

export const buildAllocationGroups = (allocations) => {
  if (!Array.isArray(allocations)) return [];
  const grouped = new Map();

  allocations.forEach((alloc) => {
    const price = parseNumericValue(alloc?.cashbackAmount, 0);
    const quantity = parseInt(alloc?.quantity, 10) || 0;
    const key = price.toFixed(2);
    if (!grouped.has(key)) {
      grouped.set(key, { price, quantity: 0, totalBudget: 0 });
    }
    const group = grouped.get(key);
    const rowBudget = parseNumericValue(alloc?.totalBudget, 0);
    group.quantity += quantity;
    group.totalBudget += rowBudget || price * quantity;
  });

  return Array.from(grouped.values()).sort((a, b) => a.price - b.price);
};
