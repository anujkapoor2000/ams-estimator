// src/exportNew.js
// Bridges the current opp object → exportUtils.js expected data shape
// Then calls the existing PPTX/PDF generators

import { exportToPptx, exportToPdf } from "./exportUtils.js";
import {
  calcBase, blendedCostRate, blendedSellRate, getSellRate,
  splitFTE, buildPlan, LOCATIONS, ROLES, DELIVERY_CENTRES,
  AI_GAIN_CURVE, FTE_HRS, SP_HRS, KT_OVERHEAD,
} from "./store/appData.js";

export async function exportOppToPptx(opp, currency, fxRate) {
  const data = buildExportData(opp, currency, fxRate);
  await exportToPptx(data);
}

export async function exportOppToPdf(opp, currency, fxRate) {
  const data = buildExportData(opp, currency, fxRate);
  await exportToPdf(data);
}

function buildExportData(opp, currency, fxRate) {
  const {
    mods, intgs, spY, spS, ktMo, calMo, totalYrs,
    avgL2, avgL3, tkt, covKey, cont,
    client, clientCity, clientRegion, engRef,
    dlocs, ls, rates, margins, fixedSell,
  } = opp;

  const sym = currency === "USD" ? "$" : "£";
  const fx  = (currency === "GBP" && fxRate) ? fxRate : 1;

  // Convert rates to display currency
  const displayRates = Object.fromEntries(
    Object.entries(rates).map(([k, v]) => [k, Math.round(v * fx)])
  );

  const base     = calcBase(mods || [], spS, spY, avgL2, avgL3, tkt);
  const intgHrs  = (intgs || []).length * 60;
  const annBase  = base.totalL2 + base.totalL3 + base.totalEnh + intgHrs;
  const blendC   = blendedCostRate(ls, displayRates);
  const blendS   = blendedSellRate(ls, displayRates, margins, fixedSell);
  const plan     = buildPlan(base, intgHrs, ktMo, calMo, totalYrs, blendC, blendS, cont);
  const totalFTE = Math.round(annBase / FTE_HRS * 10) / 10;
  const locFTEs  = splitFTE(totalFTE, ls);

  const totCost    = plan.reduce((s, r) => s + r.costWC, 0);
  const totRaw     = plan.reduce((s, r) => s + r.rawCost, 0);
  const contAmt    = totCost - totRaw;

  // Build ktHrs, calHrs, ssHrs from year 1 plan
  const y1 = plan[0] || {};
  const ktHrs  = y1.ktH  || 0;
  const calHrs = y1.calH || 0;
  const ssHrs  = y1.ssH  || 0;

  // Role breakdown
  const roles = ROLES.map(r => {
    const h = base.totalL2 * r.l2w + base.totalL3 * r.l3w + base.totalEnh * r.enhw
            + intgHrs * (r.key === "intg" ? 0.5 : r.key === "sdm" ? 0.1 : 0);
    return { ...r, hrs: Math.round(h), fte: Math.round(h / FTE_HRS * 10) / 10 };
  }).filter(r => r.fte > 0);

  // Coverage label
  const covLabels = {
    "8x5":  "Normal Business Hours (8x5)",
    "12x5": "Extended Hours (12x5)",
    "12x7": "Extended + Weekend (12x7)",
    "24x7": "24×7 Full Managed Service",
  };

  // Delivery location details
  const deliveryLocDetails = DELIVERY_CENTRES.filter(d => (dlocs || []).includes(d.key));

  // Build annual array in the old shape:
  // { y, hrs, l2, l3, enh, intg, raw, cost }
  // Old code uses annual[0].l2 etc. — map from new plan rows
  const annual = plan.map((r, i) => {
    const ssIdx = Math.max(0, i);
    const gain  = AI_GAIN_CURVE[Math.min(ssIdx, AI_GAIN_CURVE.length - 1)];
    return {
      y:    r.yr,
      hrs:  r.totalH,
      l2:   i === 0 ? Math.round(base.totalL2 * (1 + (ktMo / 12) * KT_OVERHEAD))
                    : Math.round(base.totalL2 * (1 - gain)),
      l3:   i === 0 ? Math.round(base.totalL3 * (1 + (ktMo / 12) * KT_OVERHEAD))
                    : Math.round(base.totalL3 * (1 - gain)),
      enh:  i === 0 ? Math.round(base.totalEnh * Math.max(0, 1 - ktMo / 12 - calMo / 12))
                    : Math.round(base.totalEnh * (1 - gain)),
      intg: Math.round(intgHrs * (1 - gain)),
      raw:  r.rawCost,
      cost: r.costWC,
    };
  });

  // Pad annual to at least 3 entries (old exportUtils reads annual[1], annual[2])
  while (annual.length < 3) {
    const last = annual[annual.length - 1];
    annual.push({ ...last, y: last.y + 1 });
  }

  return {
    // Identity
    clientName:        client || "",
    clientCity:        clientCity || "",
    clientRegion:      clientRegion || "",
    engagementRef:     engRef || "",
    currency,

    // Scope
    selectedModules:     mods || [],
    selectedIntegrations: intgs || [],
    serviceCoverage:    covLabels[covKey] || covKey,
    avgHrsL2:           avgL2,
    avgHrsL3:           avgL3,
    ticketsPerMonth:    tkt,
    contingency:        cont,

    // Team
    spPerSprint:        spS,
    sprintsPerYear:     spY,
    teamRate:           Math.round(blendC),
    locSplit:           ls,
    rates:              displayRates,
    locations:          LOCATIONS,
    deliveryLocDetails,

    // Calculations
    base,
    annual,
    totalBaseHrs:       annBase,
    integrationHrs:     intgHrs,
    totalProgramCost:   totCost,
    totalRaw:           totRaw,
    contingencyAmt:     contAmt,
    ktHrs,
    calHrs,
    ssHrs,
    totalFTE,
    locFTEs,
    roles,
    ktMonths:           ktMo,
    calMonths:          calMo,
  };
}
