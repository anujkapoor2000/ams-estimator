// src/exportNew.js — bridges opp object → exportUtils.js data shape
import { exportToPptx, exportToPdf } from "./exportUtils.js";
import {
  calcBase, blendedCostRate, blendedSellRate,
  splitFTE, buildPlan, LOCATIONS, ROLES, DELIVERY_CENTRES,
  AI_GAIN_CURVE, FTE_HRS, KT_OVERHEAD,
} from "./store/appData.js";

export async function exportOppToPptx(opp, currency, fxRate) {
  try {
    const data = buildExportData(opp, currency, fxRate);
    await exportToPptx(data);
  } catch(err) {
    console.error("PPTX export error:", err);
    throw err;
  }
}

export async function exportOppToPdf(opp, currency, fxRate) {
  try {
    const data = buildExportData(opp, currency, fxRate);
    await exportToPdf(data);
  } catch(err) {
    console.error("PDF export error:", err);
    throw err;
  }
}

function buildExportData(opp, currency, fxRate) {
  const {
    mods=[], intgs=[], spY=26, spS=20, ktMo=3, calMo=3, totalYrs=3,
    avgL2=4, avgL3=12, tkt=60, covKey="8x5", cont=10,
    client="", clientCity="", clientRegion="", engRef="",
    dlocs=[], ls={onsite:12,offshore:45,nearMX:18,nearMA:15,alchemy:10},
    rates={}, margins={}, fixedSell={},
  } = opp;

  const sym = currency === "USD" ? "$" : "£";
  const fx  = (currency === "GBP" && fxRate) ? fxRate : 1;

  // Convert rates to display currency
  const displayRates = Object.fromEntries(
    Object.entries(rates).map(([k, v]) => [k, Math.round(v * fx)])
  );

  // exportUtils.js expects old key names: nearshoreM / nearshoreMO
  // Translate our ls keys to the old shape so exportUtils.js works unchanged
  const locSplitLegacy = {
    onsite:     ls.onsite    || 0,
    offshore:   ls.offshore  || 0,
    nearshoreM: ls.nearMX    || 0,  // old name for Mexico
    nearshoreMO:ls.nearMA    || 0,  // old name for Morocco
    alchemy:    ls.alchemy   || 0,
  };

  const base    = calcBase(mods, spS, spY, avgL2, avgL3, tkt);
  const intgHrs = intgs.length * 60;
  const annBase = base.totalL2 + base.totalL3 + base.totalEnh + intgHrs;
  const blendC  = blendedCostRate(ls, displayRates);
  const blendS  = blendedSellRate(ls, displayRates, margins, fixedSell);

  // Pass ls so plan rows get ftePerYear
  const plan    = buildPlan(base, intgHrs, ktMo, calMo, totalYrs, blendC, blendS, cont, ls);
  const totalFTE = Math.round(annBase / FTE_HRS * 10) / 10;
  const locFTEs  = splitFTE(totalFTE, ls);

  const totCost = plan.reduce((s, r) => s + r.costWC, 0);
  const totRaw  = plan.reduce((s, r) => s + r.rawCost, 0);
  const y1      = plan[0] || {};

  // Role breakdown
  const roles = ROLES.map(r => {
    const h = base.totalL2*r.l2w + base.totalL3*r.l3w + base.totalEnh*r.enhw
            + intgHrs*(r.key==="intg"?0.5:r.key==="sdm"?0.1:0);
    return { ...r, hrs: Math.round(h), fte: Math.round(h/FTE_HRS*10)/10 };
  }).filter(r => r.fte > 0);

  // Annual array — old shape: {hrs, l2, l3, enh, intg, raw, cost}
  const annual = plan.map((r, i) => {
    const gain = AI_GAIN_CURVE[Math.min(i, AI_GAIN_CURVE.length-1)];
    return {
      y:    r.yr,
      hrs:  r.totalH,
      l2:   i===0 ? Math.round(base.totalL2*(1+(ktMo/12)*KT_OVERHEAD)) : Math.round(base.totalL2*(1-gain)),
      l3:   i===0 ? Math.round(base.totalL3*(1+(ktMo/12)*KT_OVERHEAD)) : Math.round(base.totalL3*(1-gain)),
      enh:  i===0 ? Math.round(base.totalEnh*Math.max(0,1-ktMo/12-calMo/12)) : Math.round(base.totalEnh*(1-gain)),
      intg: Math.round(intgHrs*(1-gain)),
      raw:  r.rawCost,
      cost: r.costWC,
    };
  });
  // exportUtils reads annual[1] and annual[2] — pad to at least 3
  while(annual.length < 3) {
    const last = annual[annual.length-1];
    annual.push({...last, y: last.y+1});
  }

  const covLabels = {"8x5":"Normal Business Hours (8x5)","12x5":"Extended Hours (12x5)","12x7":"Extended + Weekend (12x7)","24x7":"24×7 Full Managed Service"};

  return {
    // Identity
    clientName:         client,
    clientCity:         clientCity,
    clientRegion:       clientRegion,
    engagementRef:      engRef,
    currency,

    // Scope
    selectedModules:       mods,
    selectedIntegrations:  intgs,
    serviceCoverage:       covLabels[covKey] || covKey,
    avgHrsL2:              avgL2,
    avgHrsL3:              avgL3,
    ticketsPerMonth:       tkt,
    contingency:           cont,
    spPerSprint:           spS,
    sprintsPerYear:        spY,

    // Team — use legacy key names for locSplit so exportUtils works
    teamRate:              Math.round(blendC),
    locSplit:              locSplitLegacy,
    rates:                 displayRates,
    locations:             LOCATIONS,
    deliveryLocDetails:    DELIVERY_CENTRES.filter(d => dlocs.includes(d.key)),

    // Calculations
    base,
    annual,
    totalBaseHrs:       annBase,
    integrationHrs:     intgHrs,
    totalProgramCost:   totCost,
    totalRaw:           totRaw,
    contingencyAmt:     totCost - totRaw,
    ktHrs:              y1.ktH  || 0,
    calHrs:             y1.calH || 0,
    ssHrs:              y1.ssH  || 0,
    totalFTE,
    locFTEs,
    roles,
    ktMonths:           ktMo,
    calMonths:          calMo,
  };
}
