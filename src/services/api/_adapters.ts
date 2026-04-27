// Wire-format adapters for the TS API cutover.
//
// The TS API returns flat snake_case with string-valued enums (matching the
// PG types). WebFront's existing types and the Analysis class were built for
// the C# wire format: camelCase + integer-valued enums + nested envelopes
// (state, attribution, access, record). Rather than touch every component
// and template, we reshape on the client side here, in one file.
//
// Enum integer values mirror C# enum positions — sourced from FunderMapsApi
// src/lib/inquiry-enums.ts. Keep in sync if those change.

// ---------------------------------------------------------------------------
// Numeric coercion
// ---------------------------------------------------------------------------

// postgres.js returns numeric/decimal/bigint columns as strings. Cast to
// number in the adapter so downstream code (charts, formatters) sees real
// numbers and IUserProfile/IAnalysis typings stay accurate.
function num(v: unknown): number | undefined {
  if (v === null || v === undefined) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

// ---------------------------------------------------------------------------
// Enum string → int dictionaries (match C# wire format positions)
// ---------------------------------------------------------------------------

const E = {
  inquiry_type: new Map<string, number>([
    ["additional_research", 0], ["monitoring", 1], ["note", 2], ["quickscan", 3],
    ["unknown", 4], ["demolition_research", 5], ["second_opinion", 6],
    ["archive_research", 7], ["architectural_research", 8], ["foundation_advice", 9],
    ["inspectionpit", 10], ["foundation_research", 11], ["ground_water_level_research", 12],
    ["soil_investigation", 13], ["facade_scan", 14],
  ]),
  audit_status: new Map<string, number>([
    ["todo", 0], ["pending", 1], ["done", 2], ["discarded", 3],
    ["pending_review", 4], ["rejected", 5],
  ]),
  access_policy: new Map<string, number>([["public", 0], ["private", 1]]),
  foundation_type: new Map<string, number>([
    ["wood", 0], ["wood_amsterdam", 1], ["wood_rotterdam", 2], ["concrete", 3],
    ["no_pile", 4], ["no_pile_masonry", 5], ["no_pile_strips", 6],
    ["no_pile_bearing_floor", 7], ["no_pile_concrete_floor", 8], ["no_pile_slit", 9],
    ["wood_charger", 10], ["weighted_pile", 11], ["combined", 12], ["steel_pile", 13],
    ["other", 14], ["wood_rotterdam_amsterdam", 15], ["wood_rotterdam_arch", 16],
    ["wood_amsterdam_arch", 17],
  ]),
  enforcement_term: new Map<string, number>([
    ["term05", 0], ["term510", 1], ["term1020", 2], ["term5", 3], ["term10", 4],
    ["term15", 5], ["term20", 6], ["term25", 7], ["term30", 8], ["term40", 9],
  ]),
  foundation_damage_cause: new Map<string, number>([
    ["drainage", 0], ["construction_flaw", 1], ["drystand", 2], ["overcharge", 3],
    ["overcharge_negative_cling", 4], ["negative_cling", 5], ["bio_infection", 6],
    ["fungus_infection", 8], ["bio_fungus_infection", 9], ["foundation_flaw", 10],
    ["construction_heave", 11], ["subsidence", 12], ["vegetation", 13],
    ["gas", 14], ["vibrations", 15], ["partial_foundation_recovery", 16],
    ["japanese_knotweed", 17], ["groundwater_level_reduction", 18],
  ]),
  foundation_damage_characteristics: new Map<string, number>([
    ["jamming_door_window", 0], ["crack", 1], ["skewed", 2], ["crawlspace_flooding", 3],
    ["threshold_above_subsurface", 4], ["threshold_below_subsurface", 5],
    ["crooked_floor_wall", 6],
  ]),
  environment_damage_characteristics: new Map<string, number>([
    ["subsidence", 0], ["sagging_sewer_connection", 1], ["sagging_cables_pipes", 2],
    ["flooding", 3], ["foundation_damage_nearby", 4], ["elevation", 5],
    ["increasing_traffic", 6], ["construction_nearby", 7], ["vegetation_nearby", 8],
    ["sewage_leakage", 9], ["low_ground_water", 10],
  ]),
  foundation_quality: new Map<string, number>([
    ["bad", 0], ["mediocre", 1], ["tolerable", 2], ["good", 3],
    ["mediocre_good", 4], ["mediocre_bad", 5],
  ]),
  reliability: new Map<string, number>([
    ["indicative", 0], ["established", 1], ["cluster", 2], ["supercluster", 3],
  ]),
  recovery_type: new Map<string, number>([
    ["table", 0], ["beam_on_pile", 1], ["pile_lowering", 2], ["pile_in_wall", 3],
    ["injection", 4], ["unknown", 5],
  ]),
  recovery_document_type: new Map<string, number>([
    ["permit", 0], ["recovery_report", 1], ["consolidation_report", 2],
    ["additional_research", 3], ["damage_research", 4], ["foundation_research", 5],
    ["mediation", 6], ["unknown", 7],
  ]),
  foundation_risk: new Map<string, number>([
    ["a", 0], ["b", 1], ["c", 2], ["d", 3], ["e", 4],
  ]),
  incident_question_type: new Map<string, number>([
    ["other", 0], ["foundation_advice", 1], ["loan", 2], ["consequences", 3],
    ["legal", 4], ["preliminary_recovery", 5], ["risks", 6], ["energy_saving", 7],
    ["wood", 8], ["concrete", 9], ["foundation_age", 10], ["construction_inspection", 11],
    ["recovery_costs", 12], ["recovery_methods", 13], ["other_question", 14],
  ]),
} as const;

type EnumName = keyof typeof E;

function toEnumInt(name: EnumName, value: unknown): number | undefined {
  if (value === null || value === undefined) return undefined;
  const i = E[name].get(value as string);
  return i;
}

function toEnumIntArray(name: EnumName, values: unknown): number[] {
  if (!Array.isArray(values)) return [];
  const out: number[] = [];
  for (const v of values) {
    const i = E[name].get(v as string);
    if (i !== undefined) out.push(i);
  }
  return out;
}

// ---------------------------------------------------------------------------
// IAnalysis (consumed by Analysis class)
// ---------------------------------------------------------------------------

export function adaptAnalysis(raw: Record<string, unknown>): Record<string, unknown> {
  // Pass shape that matches IAnalysis. Building/address IDs aren't returned
  // by the new endpoint (it only takes building_id and SELECTs from a matview
  // keyed on building_id); we surface the input id where possible.
  return {
    buildingId: raw.building_id ?? '',
    externalBuildingId: raw.building_id ?? '',
    addressId: '',
    externalAddressId: '',
    neighborhoodId: raw.neighborhood_id ?? '',
    constructionYear: num(raw.construction_year),
    constructionYearReliability: toEnumInt("reliability", raw.construction_year_reliability),
    recoveryType: toEnumInt("recovery_type", raw.recovery_type),
    restorationCosts: num(raw.restoration_costs),
    height: num(raw.height),
    velocity: num(raw.velocity),
    groundWaterLevel: num(raw.ground_water_level),
    groundLevel: num(raw.ground_level),
    soil: raw.soil,
    surfaceArea: num(raw.surface_area),
    damageCause: toEnumInt("foundation_damage_cause", raw.damage_cause),
    enforcementTerm: toEnumInt("enforcement_term", raw.enforcement_term),
    overallQuality: toEnumInt("foundation_quality", raw.overall_quality),
    inquiryType: toEnumInt("inquiry_type", raw.inquiry_type),
    foundationType: toEnumInt("foundation_type", raw.foundation_type),
    foundationTypeReliability: toEnumInt("reliability", raw.foundation_type_reliability),
    drystand: num(raw.drystand),
    drystandReliability: toEnumInt("reliability", raw.drystand_risk_reliability),
    drystandRisk: toEnumInt("foundation_risk", raw.drystand_risk),
    dewateringDepth: num(raw.dewatering_depth),
    dewateringDepthReliability: toEnumInt("reliability", raw.dewatering_depth_risk_reliability),
    dewateringDepthRisk: toEnumInt("foundation_risk", raw.dewatering_depth_risk),
    bioInfectionReliability: toEnumInt("reliability", raw.bio_infection_risk_reliability),
    bioInfectionRisk: toEnumInt("foundation_risk", raw.bio_infection_risk),
    unclassifiedRisk: toEnumInt("foundation_risk", raw.unclassified_risk),
  };
}

// ---------------------------------------------------------------------------
// IStatistics
// ---------------------------------------------------------------------------

interface RawStatistics {
  foundation_type_distribution: { foundation_type: string; percentage: string }[];
  construction_year_distribution: { year_from: number; count: string }[];
  foundation_risk_distribution: { foundation_risk: string; percentage: string }[];
  data_collected_percentage: string | null;
  total_building_restored_count: string | number | null;
  total_incident_count: { year: number; count: string }[];
  municipality_incident_count: { year: number; count: string }[];
  total_report_count: { year: number; count: string }[];
  municipality_report_count: { year: number; count: string }[];
}

export function adaptStatistics(raw: RawStatistics): Record<string, unknown> {
  // Risk distribution: TS API returns rows {foundation_risk: "a", percentage: 6.79}.
  // WebFront expects {percentageA, percentageB, percentageC, percentageD, percentageE}.
  const riskByLetter: Record<string, number> = { a: 0, b: 0, c: 0, d: 0, e: 0 };
  for (const row of raw.foundation_risk_distribution ?? []) {
    riskByLetter[row.foundation_risk] = num(row.percentage) ?? 0;
  }

  return {
    foundationTypeDistribution: {
      foundationTypes: (raw.foundation_type_distribution ?? []).map((r) => ({
        foundationType: toEnumInt("foundation_type", r.foundation_type),
        percentage: num(r.percentage) ?? 0,
      })),
    },
    constructionYearDistribution: {
      decades: (raw.construction_year_distribution ?? []).map((r) => ({
        decade: {
          yearFrom: `${r.year_from}-01-01T00:00:00+00:00`,
          yearTo: `${r.year_from + 9}-12-31T00:00:00+00:00`,
        },
        totalCount: num(r.count) ?? 0,
      })),
    },
    foundationRiskDistribution: {
      percentageA: riskByLetter.a,
      percentageB: riskByLetter.b,
      percentageC: riskByLetter.c,
      percentageD: riskByLetter.d,
      percentageE: riskByLetter.e,
    },
    dataCollectedPercentage: num(raw.data_collected_percentage) ?? 0,
    totalBuildingRestoredCount: num(raw.total_building_restored_count) ?? 0,
    totalIncidentCount: (raw.total_incident_count ?? []).map((r) => ({
      year: r.year, totalCount: num(r.count) ?? 0,
    })),
    municipalityIncidentCount: (raw.municipality_incident_count ?? []).map((r) => ({
      year: r.year, totalCount: num(r.count) ?? 0,
    })),
    totalReportCount: (raw.total_report_count ?? []).map((r) => ({
      year: r.year, totalCount: num(r.count) ?? 0,
    })),
    municipalityReportCount: (raw.municipality_report_count ?? []).map((r) => ({
      year: r.year, totalCount: num(r.count) ?? 0,
    })),
  };
}

// ---------------------------------------------------------------------------
// IGeoLocationData (composite geocoder building-info)
// ---------------------------------------------------------------------------

export function adaptGeoLocationData(raw: Record<string, unknown>): Record<string, unknown> {
  const street = (raw.street as string) ?? '';
  const number = (raw.building_number as string) ?? '';
  const postal = (raw.postal_code as string) ?? '';
  const city = (raw.city as string) ?? '';
  const fullAddress = `${street} ${number}, ${postal} ${city}`.trim();

  return {
    building: {
      id: raw.building_id ?? '',
      externalId: raw.building_id ?? '',
      neighborhoodId: raw.neighborhood_id ?? null,
    },
    address: {
      id: raw.address_id ?? '',
      externalId: raw.address_external_id ?? '',
      buildingId: raw.building_id ?? '',
      buildingNumber: number,
      postalCode: postal,
      street,
      city,
      fullAddress,
    },
    residence: null,
    neighborhood: raw.neighborhood_id ? {
      id: raw.neighborhood_id,
      externalId: raw.neighborhood_external_id,
      name: raw.neighborhood_name,
    } : null,
    district: raw.district_id ? {
      id: raw.district_id,
      externalId: raw.district_external_id,
      name: raw.district_name,
    } : null,
    municipality: raw.municipality_id ? {
      id: raw.municipality_id,
      externalId: raw.municipality_external_id,
      name: raw.municipality_name,
    } : null,
    state: raw.state_id ? {
      id: raw.state_id,
      externalId: raw.state_external_id,
      name: raw.state_name,
    } : null,
  };
}

// ---------------------------------------------------------------------------
// Inquiry / Recovery parents (build C#-shape envelopes from flat snake_case)
// ---------------------------------------------------------------------------

interface RawAttributedRow extends Record<string, unknown> {
  attribution_reviewer?: string | null;
  attribution_reviewer_name?: string | null;
  attribution_creator?: string | null;
  attribution_creator_name?: string | null;
  attribution_owner?: string | null;
  attribution_owner_name?: string | null;
  attribution_contractor?: number | null;
  attribution_contractor_name?: string | null;
  audit_status?: string;
  access_policy?: string;
  create_date?: string | null;
  update_date?: string | null;
  delete_date?: string | null;
}

function envelopes(raw: RawAttributedRow): {
  attribution: object; state: object; access: object; record: object;
} {
  return {
    attribution: {
      reviewer: raw.attribution_reviewer ?? null,
      reviewerName: raw.attribution_reviewer_name ?? null,
      creator: raw.attribution_creator ?? null,
      creatorName: raw.attribution_creator_name ?? null,
      owner: raw.attribution_owner ?? null,
      ownerName: raw.attribution_owner_name ?? null,
      contractor: raw.attribution_contractor ?? null,
      contractorName: raw.attribution_contractor_name ?? null,
    },
    state: {
      auditStatus: toEnumInt("audit_status", raw.audit_status),
    },
    access: {
      accessPolicy: toEnumInt("access_policy", raw.access_policy),
    },
    record: {
      createDate: raw.create_date ?? null,
      updateDate: raw.update_date ?? null,
      deleteDate: raw.delete_date ?? null,
    },
  };
}

export function adaptInquiry(raw: Record<string, unknown>): Record<string, unknown> {
  const r = raw as RawAttributedRow;
  return {
    id: raw.id,
    identifier: raw.id,
    documentName: raw.document_name ?? '',
    inspection: !!raw.inspection,
    jointMeasurement: !!raw.joint_measurement,
    floorMeasurement: !!raw.floor_measurement,
    note: raw.note ?? null,
    documentDate: raw.document_date ?? '',
    documentFile: raw.document_file ?? '',
    type: toEnumInt("inquiry_type", raw.type),
    standardF3o: !!raw.standard_f3o,
    ...envelopes(r),
  };
}

export function adaptRecovery(raw: Record<string, unknown>): Record<string, unknown> {
  const r = raw as RawAttributedRow;
  return {
    id: raw.id,
    identifier: raw.id,
    documentName: raw.document_name ?? '',
    type: toEnumInt("recovery_document_type", raw.type),
    documentFile: raw.document_file ?? '',
    documentDate: raw.document_date ?? '',
    note: raw.note ?? null,
    ...envelopes(r),
  };
}

// ---------------------------------------------------------------------------
// Inquiry / Recovery samples — pass through with snake→camel for known fields
// ---------------------------------------------------------------------------

export function adaptInquirySample(raw: Record<string, unknown>): Record<string, unknown> {
  // Sample shapes are wide (~40 fields). For now pass through with the known
  // top-level renames; component templates that read snake_case fields will
  // pick them up. Extend if bugs surface.
  return {
    id: raw.id,
    inquiry: raw.inquiry_id,
    address: raw.address ?? null,
    building: raw.building_id ?? null,
    note: raw.note ?? null,
    builtYear: raw.built_year ?? null,
    createDate: raw.create_date,
    updateDate: raw.update_date,
    deleteDate: raw.delete_date,
    ...raw,
  };
}

export function adaptRecoverySample(raw: Record<string, unknown>): Record<string, unknown> {
  return {
    id: raw.id,
    recovery: raw.recovery_id,
    note: raw.note ?? null,
    pileType: raw.pile_type,
    permitDate: raw.permit_date,
    recoveryDate: raw.recovery_date,
    contractor: raw.contractor_id,
    building: raw.building_id,
    createDate: raw.create_date,
    updateDate: raw.update_date,
    deleteDate: raw.delete_date,
    ...raw,
  };
}

// ---------------------------------------------------------------------------
// Incident
// ---------------------------------------------------------------------------

export function adaptIncident(raw: Record<string, unknown>): Record<string, unknown> {
  return {
    id: raw.id,
    clientId: undefined,
    clientName: 'FunderMaps',
    foundationType: toEnumInt("foundation_type", raw.foundation_type),
    chainedBuilding: !!raw.chained_building,
    owner: !!raw.owner,
    foundationRecovery: !!raw.foundation_recovery,
    neighborRecovery: !!raw.neighbor_recovery,
    foundationDamageCause: toEnumInt("foundation_damage_cause", raw.foundation_damage_cause),
    documentFile: raw.document_file ?? [],
    note: raw.note ?? null,
    internalNote: raw.internal_note ?? null,
    foundationDamageCharacteristics: toEnumIntArray("foundation_damage_characteristics", raw.foundation_damage_characteristics),
    environmentDamageCharacteristics: toEnumIntArray("environment_damage_characteristics", raw.environment_damage_characteristics),
    email: raw.contact ?? '',
    name: raw.contact_name ?? null,
    phoneNumber: raw.contact_phone_number ?? null,
    address: '',
    building: raw.building_id ?? '',
    auditStatus: toEnumInt("audit_status", raw.audit_status),
    incidentQuestionType: toEnumInt("incident_question_type", raw.question_type),
    meta: raw.metadata ?? {},
  };
}

// ---------------------------------------------------------------------------
// ICombinedReportData (5-array report endpoint)
// ---------------------------------------------------------------------------

interface RawReport {
  incidents: Record<string, unknown>[];
  inquiries: Record<string, unknown>[];
  inquiry_samples: Record<string, unknown>[];
  recoveries: Record<string, unknown>[];
  recovery_samples: Record<string, unknown>[];
}

export function adaptCombinedReport(raw: RawReport): Record<string, unknown> {
  return {
    incidents: (raw.incidents ?? []).map(adaptIncident),
    inquiries: (raw.inquiries ?? []).map(adaptInquiry),
    inquirySamples: (raw.inquiry_samples ?? []).map(adaptInquirySample),
    recoveries: (raw.recoveries ?? []).map(adaptRecovery),
    recoverySamples: (raw.recovery_samples ?? []).map(adaptRecoverySample),
  };
}
