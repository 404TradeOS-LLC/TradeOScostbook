import { KnowledgeAssembly } from "../../types";

// Tree Service — Batch 01 (assemblies 1-10)
// Focus: foundational removal/hazard/rigging/pruning/stump/emergency work —
// the highest-frequency jobs a tree service estimator prices every week.
// Deliberately spans distinct categories (not just removal size tiers) so
// batch-02+ has room to go deep on each category without duplicating these.
export const batch01: KnowledgeAssembly[] = [
  {
    id: "tree-service.removal.small-tree-open-access",
    slug: "small-tree-open-access",
    version: 1,
    trade: "Tree Service",
    category: "Tree Removal",
    subcategory: "Standard Removal — Small Tree",
    name: "Tree Removal — Small Tree (Under 12\" DBH), Open Access",
    unitOfMeasure: "EA",
    description:
      "Fell and remove a small tree (under 12 in. DBH) with clear open access, direct-felling or light sectioning, no rigging or crane required.",
    customerDescription:
      "We safely take down your tree, cut it into manageable pieces, and haul away all the debris and trunk sections, leaving the area clean and clear.",
    contractorNotes:
      "Direct-fell where lean, lay, and drop zone allow. If any deadwood or a co-dominant leader could hang up on the way down, take it out first with a pole saw from the ground before the felling cut. No climbing is typically required at this size class.",
    typicalUseCase:
      "Residential backyard or side-yard tree with an unobstructed drop zone — no structures, fences, vehicles, or overhead utilities within the fall radius.",
    projectTypes: ["residential", "light-commercial"],
    constructionPhase: "maintenance",
    csiDivision: "31 13 13",
    requiredInputs: [
      { key: "dbhInches", label: "Trunk diameter at breast height", unit: "in", description: "Diameter measured ~4.5 ft above grade; drives felling/bucking time and disposal volume." },
      { key: "treeHeightFt", label: "Approximate tree height", unit: "ft", description: "Confirms this falls under the small-tree tier and sets drop-zone radius." },
      { key: "clearDropZone", label: "Unobstructed drop zone available", unit: "yes/no", description: "If no, route to the technical-rigging assembly instead." },
    ],
    optionalInputs: [
      { key: "speciesIfKnown", label: "Tree species", description: "Affects wood density, chipping rate, and whether it's a locally protected species." },
      { key: "woodRetentionRequested", label: "Customer wants rounds left for firewood", unit: "yes/no", description: "Reduces haul-off volume and disposal cost when true." },
    ],
    materialCategories: ["Bar and chain lubricant", "Two-cycle fuel mix", "Flagging / exclusion-zone tape"],
    laborCategories: ["Crew lead / chainsaw operator", "Ground laborer / chipper feeder"],
    equipmentCategories: ["Chainsaw (fell/limb/buck)", "Pole saw", "Brush chipper", "Chip truck or dump trailer"],
    safetyRequirements: [
      "ANSI Z133 chainsaw PPE: chaps, helmet with face shield, hearing protection, gloves",
      "Establish and flag an exclusion perimeter at 1.5x tree height before cutting",
      "Visual check for overhead and marked underground utilities before felling",
      "Confirmed escape routes at 45 degrees off the felling line before the back cut",
    ],
    riskFactors: [
      "Unexpected internal decay or lean shifting the actual fall direction",
      "Hidden irrigation lines or utilities near the base affecting stump work",
      "Incidental damage to adjacent fencing, turf, or landscape beds from limb drop",
      "Stinging-insect nests discovered mid-canopy",
    ],
    permitAwareness: [
      "Many municipalities require a removal permit above a protected DBH threshold or inside a tree-preservation overlay zone — verify before quoting",
      "HOA/architectural-review approval may be required in covenant-controlled communities",
    ],
    inspectionAwareness: [
      "No formal inspection is typically required for routine residential removal outside protected zones",
      "Jurisdictions with tree-preservation ordinances may require a post-removal compliance photo or replanting affidavit",
    ],
    codeConsiderations: [
      "Local tree-preservation ordinances may restrict removal of heritage or minimum-DBH trees without a permit",
      "Verify the tree sits fully on the customer's parcel before cutting to avoid a boundary-line dispute",
    ],
    dependencies: ["tree-service.stump-grinding.standard-stump-grinding", "tree-service.hauling.debris-haul-standard"],
    wasteDisposal: [
      "Brush and small limb wood chipped on-site into the chip truck or a tarped pile",
      "Trunk rounds hauled to a green-waste/mulch facility unless firewood retention is requested",
      "Stump left at grade for separate stump-grinding pricing unless bundled",
    ],
    proposalIntelligence: {
      scopeOfWork: [
        "Fell the tree in one piece or light sections as ground conditions allow",
        "Limb and buck the trunk into transportable lengths",
        "Chip brush and small-diameter wood on-site",
        "Haul all resulting debris from the property unless firewood retention is requested",
        "Leave the stump at grade for separate grinding unless bundled into this proposal",
      ],
      assumptions: [
        "Drop zone and equipment access path are clear of vehicles and obstructions on the day of service",
        "The chipper/chip truck can reach within normal hose/drag distance of the work area",
        "No underground utility conflicts exist within the immediate work area",
      ],
      exclusions: [
        "Stump grinding, unless separately listed as a bundled line item",
        "Restoration of turf or landscaping disturbed by incidental equipment access",
        "Removal of surface or subsurface roots beyond the stump face",
      ],
      warranty:
        "Workmanship warranty covers safe, complete removal as scoped; no warranty is implied on the health of adjacent retained trees or on landscaping disturbed by incidental equipment access.",
    },
    productionNotes: [
      "Typical crew: 2 (lead saw operator + one ground/chipper hand)",
      "Average production: 1-2 hours per tree at this size class under open access",
      "Chipper throughput, not the felling cut itself, is usually the production bottleneck",
    ],
    pricingHooks: [
      { kind: "laborRate", refSlug: "tree-service.crew-lead-climber", description: "Lead chainsaw operator / crew lead hourly rate", estimatedUnitOfMeasure: "HR" },
      { kind: "laborRate", refSlug: "tree-service.ground-laborer", description: "Ground crew / chipper-feed laborer hourly rate", estimatedUnitOfMeasure: "HR" },
      { kind: "equipment", refSlug: "tree-service.chainsaw", description: "Chainsaw ownership/operating cost", estimatedUnitOfMeasure: "HR" },
      { kind: "equipment", refSlug: "tree-service.brush-chipper", description: "Brush chipper ownership/operating cost", estimatedUnitOfMeasure: "HR" },
      { kind: "equipment", refSlug: "tree-service.chip-truck", description: "Chip truck / dump trailer for haul-off", estimatedUnitOfMeasure: "HR" },
      { kind: "material", refSlug: "tree-service.bar-chain-lube", description: "Bar and chain lubricant consumed per job", estimatedUnitOfMeasure: "EA" },
    ],
    aiNotes: [
      "Intake should request a photo with a scale reference (person, vehicle, door) to estimate DBH/height when the customer doesn't know exact measurements",
      "Distinguish this assembly from technical-rigging-restricted-access by explicitly confirming clearance to structures, fences, and utilities within the fall radius, not just tree size",
      "Species should refine labor-hour and chipping-rate estimates once a priced cost item exists for it",
    ],
  },
  {
    id: "tree-service.removal.medium-tree-open-access",
    slug: "medium-tree-open-access",
    version: 1,
    trade: "Tree Service",
    category: "Tree Removal",
    subcategory: "Standard Removal — Medium Tree",
    name: "Tree Removal — Medium Tree (12\"-24\" DBH), Open Access",
    unitOfMeasure: "EA",
    description:
      "Climb, section, and fell a medium tree (12-24 in. DBH) with open access; typically requires an aerial climb or lift to piece down the crown before the trunk is felled or sectioned.",
    customerDescription:
      "Our climber will work the tree from the top down, cutting it into sections that are lowered or dropped safely, then we grind or haul the remaining trunk and clean up all debris.",
    contractorNotes:
      "Above roughly 12 in. DBH with meaningful canopy spread, ground-only felling stops being the safe default — plan for a climb (spurs on removals only) or lift access to section the crown before the trunk goes. Confirm whether a straight ground-level fell is still viable given lean and canopy weight distribution.",
    typicalUseCase:
      "Established residential or commercial shade tree with room to fell the trunk but with a crown too large or heavy to safely drop as a single piece.",
    projectTypes: ["residential", "light-commercial", "commercial"],
    constructionPhase: "maintenance",
    csiDivision: "31 13 13",
    requiredInputs: [
      { key: "dbhInches", label: "Trunk diameter at breast height", unit: "in", description: "Places the tree in the 12-24 in. tier and drives climb vs. lift decision." },
      { key: "treeHeightFt", label: "Approximate tree height", unit: "ft", description: "Sets the number of sectioning cuts and rigging plan." },
      { key: "canopySpreadFt", label: "Canopy spread", unit: "ft", description: "Determines whether trunk can be felled whole or must be sectioned first." },
      { key: "aerialLiftAccessible", label: "Bucket truck can position at the tree", unit: "yes/no", description: "If yes, may substitute for a climb and change the equipment/labor mix." },
    ],
    optionalInputs: [
      { key: "speciesIfKnown", label: "Tree species", description: "Affects wood density, brittleness, and climb technique (e.g. brittle species need extra rigging caution)." },
      { key: "woodRetentionRequested", label: "Customer wants rounds left for firewood", unit: "yes/no", description: "Reduces haul-off volume when true." },
    ],
    materialCategories: ["Bar and chain lubricant", "Two-cycle fuel mix", "Rigging rope and slings (wear items)", "Flagging / exclusion-zone tape"],
    laborCategories: ["Certified climber / lead arborist", "Ground crew (rigging and chipping)", "Aerial lift operator (if lift used instead of climb)"],
    equipmentCategories: ["Chainsaw (climbing saw + ground saw)", "Rigging block and rope system", "Aerial lift / bucket truck (optional)", "Brush chipper", "Chip truck or dump trailer"],
    safetyRequirements: [
      "ANSI Z133 climbing and rigging protocols; climber tied in with redundant attachment at all times aloft",
      "Ground crew wears hard hats and stays clear of the rigging drop zone during piece lowering",
      "Pre-climb aerial inspection for decay, cavities, cracks, and hanging deadwood",
      "Established, flagged drop/rigging zone larger than the largest planned piece",
    ],
    riskFactors: [
      "Hidden internal decay discovered only once the climber is aloft, requiring a mid-job plan change",
      "Overhead or nearby utility lines constraining rigging direction",
      "Heavier-than-expected sections straining rigging gear or lowering devices",
      "Wind picking up mid-climb, forcing a work stoppage",
    ],
    permitAwareness: [
      "Removal permit required in many jurisdictions above a protected DBH threshold — this tier commonly crosses that threshold",
      "Street-tree or right-of-way trees typically require municipal forestry department sign-off regardless of DBH",
    ],
    inspectionAwareness: [
      "Utility companies may require notification before working near their overhead service drop",
      "Some municipalities inspect protected-size removals before permit issuance",
    ],
    codeConsiderations: [
      "Tree-preservation ordinances commonly apply mitigation/replacement-planting requirements at this size tier",
      "Setback and property-line confirmation before felling toward a boundary",
    ],
    dependencies: ["tree-service.removal.small-tree-open-access", "tree-service.stump-grinding.standard-stump-grinding", "tree-service.pruning.deadwooding-crown-cleaning"],
    wasteDisposal: [
      "Crown wood chipped on-site; larger trunk rounds hauled or bucked for firewood retention",
      "Trunk wood too large for the chipper hauled separately or split on-site",
      "Stump left at grade for separate grinding unless bundled",
    ],
    proposalIntelligence: {
      scopeOfWork: [
        "Climb (or lift-access) the tree and section the crown into manageable, controlled pieces",
        "Lower larger sections via rigging where free-drop is unsafe",
        "Fell or section the remaining trunk to grade",
        "Chip brush and limb wood on-site; buck trunk wood for haul-off or firewood",
        "Leave the stump at grade for separate grinding unless bundled",
      ],
      assumptions: [
        "Equipment access path supports a chip truck and, if used, an aerial lift",
        "No active utility conflict prevents safe rigging in the planned direction",
        "Weather conditions on service day permit safe aerial work (no high wind/lightning)",
      ],
      exclusions: [
        "Stump grinding, unless separately listed as a bundled line item",
        "Repair of turf, irrigation, or hardscape incidentally affected by rigging or equipment access",
        "Utility company line-clearance coordination beyond standard notification",
      ],
      warranty:
        "Workmanship warranty covers safe, complete removal as scoped; excludes weather-related rescheduling delays and any pre-existing site damage.",
    },
    productionNotes: [
      "Typical crew: 3 (climber/lead + 2 ground crew for rigging and chipping)",
      "Average production: 2-4 hours per tree depending on canopy density and rigging complexity",
      "Add lift mobilization time when a bucket truck substitutes for a climb",
    ],
    pricingHooks: [
      { kind: "laborRate", refSlug: "tree-service.certified-climber", description: "Certified climbing arborist hourly rate", estimatedUnitOfMeasure: "HR" },
      { kind: "laborRate", refSlug: "tree-service.ground-laborer", description: "Ground/rigging crew hourly rate", estimatedUnitOfMeasure: "HR" },
      { kind: "equipment", refSlug: "tree-service.rigging-kit", description: "Rigging block, rope, and hardware wear allowance", estimatedUnitOfMeasure: "EA" },
      { kind: "equipment", refSlug: "tree-service.aerial-lift", description: "Bucket truck / aerial lift, when substituted for a climb", estimatedUnitOfMeasure: "HR" },
      { kind: "equipment", refSlug: "tree-service.brush-chipper", description: "Brush chipper ownership/operating cost", estimatedUnitOfMeasure: "HR" },
      { kind: "childAssembly", refSlug: "tree-service.stump-grinding.standard-stump-grinding", description: "Optional bundled stump grind" },
    ],
    aiNotes: [
      "Ask specifically about canopy spread and lean, not just DBH — a tall narrow tree and a short wide-crowned tree at the same DBH price very differently",
      "If aerial lift access is confirmed, AI should suggest substituting lift-hours for climb-hours in the pricing hooks, not stacking both",
      "Flag for human review if requested DBH exceeds 24 in. — should route to large-tree or technical-rigging assemblies instead",
    ],
  },
  {
    id: "tree-service.removal.large-tree-open-access",
    slug: "large-tree-open-access",
    version: 1,
    trade: "Tree Service",
    category: "Tree Removal",
    subcategory: "Standard Removal — Large Tree",
    name: "Tree Removal — Large Tree (Over 24\" DBH), Open Access",
    unitOfMeasure: "EA",
    description:
      "Full technical climb and rigged removal of a large tree (over 24 in. DBH) with open access — no structures within fall/rigging radius, but size alone requires a full rigging plan and extended crew.",
    customerDescription:
      "This is a full technical takedown: our climbing arborist sections the tree from the top down using rigging to control every piece, and the crew processes and hauls everything as it comes down.",
    contractorNotes:
      "Even with open access, trunk diameter and canopy mass at this tier mean whole-piece felling is rarely viable — plan a full negative-rigging or block-and-tackle takedown with a speed-line or lowering device for trunk wood. Confirm ground bearing capacity for equipment near the base if soil is soft.",
    typicalUseCase:
      "Mature legacy shade tree, large hardwood, or landmark specimen being removed for health, hazard, or site-development reasons, with adequate open ground around it.",
    projectTypes: ["residential", "commercial", "land-clearing"],
    constructionPhase: "maintenance",
    csiDivision: "31 13 13",
    requiredInputs: [
      { key: "dbhInches", label: "Trunk diameter at breast height", unit: "in", description: "Confirms large-tree tier and drives trunk-sectioning weight calculations." },
      { key: "treeHeightFt", label: "Approximate tree height", unit: "ft", description: "Determines rigging plan length and number of pick points." },
      { key: "groundConditions", label: "Ground bearing/access condition near base", description: "Soft or sloped ground changes equipment staging and may require mats." },
      { key: "reasonForRemoval", label: "Reason for removal (health/hazard/site-development)", description: "Affects permit narrative and whether an arborist report is required." },
    ],
    optionalInputs: [
      { key: "speciesIfKnown", label: "Tree species", description: "Denser hardwoods increase rigging loads and production time significantly at this size." },
      { key: "woodRetentionRequested", label: "Customer wants trunk sections retained (milling/firewood)", unit: "yes/no", description: "May require different bucking lengths and additional handling equipment." },
    ],
    materialCategories: ["Bar and chain lubricant", "Two-cycle fuel mix", "Heavy rigging rope, slings, and hardware (wear items)", "Ground protection mats (if soft soil)"],
    laborCategories: ["Lead certified climbing arborist", "Second climber or rigging specialist", "Ground crew (rigging, bucking, chipping)", "Crew foreman / job supervisor"],
    equipmentCategories: ["Climbing saw and ground saws (multiple bar lengths)", "Heavy rigging block/lowering device", "Aerial lift (backup/inspection access)", "Grapple truck or knuckle-boom loader (large log handling)", "Brush chipper", "Chip truck and log truck"],
    safetyRequirements: [
      "Full ANSI Z133 rigging plan reviewed by the crew before the first cut, including pick-point loads and lowering-device ratings",
      "Two-climber redundancy or ground-based rescue plan established before aerial work begins",
      "Exclusion zone sized to the largest planned rigged piece plus swing radius",
      "Load calculations checked against rope/rigging hardware rated capacity for each major piece",
    ],
    riskFactors: [
      "Underestimated piece weight overloading rigging hardware or the anchor point",
      "Internal decay/cavities discovered aloft requiring a real-time rigging-plan change",
      "Soft or sloped ground affecting stability of a grapple truck or crane outrigger footprint",
      "Multi-hour aerial exposure increasing weather/fatigue risk",
    ],
    permitAwareness: [
      "Large/heritage-size removals almost universally require a municipal permit, and many jurisdictions require a certified arborist's report supporting the removal reason",
      "Mitigation/replacement tree planting requirements are common at this size tier",
    ],
    inspectionAwareness: [
      "City forester or urban-forestry inspector site visit is common before permit approval at this size",
      "Some jurisdictions require post-removal photo documentation for permit close-out",
    ],
    codeConsiderations: [
      "Heritage/specimen tree ordinances may apply additional protections or require a hearing for removal approval",
      "Verify no conservation easement or deed restriction covers the tree before quoting removal",
    ],
    dependencies: ["tree-service.removal.crane-assisted-removal", "tree-service.stump-grinding.standard-stump-grinding", "tree-service.hauling.debris-haul-standard"],
    wasteDisposal: [
      "Large trunk sections hauled via log truck to a mill, firewood processor, or disposal facility",
      "Crown and limb wood chipped on-site",
      "Stump left at grade for separate grinding (often requires a large-diameter stump grinder, priced separately)",
    ],
    proposalIntelligence: {
      scopeOfWork: [
        "Develop and execute a full rigging plan to section the crown and trunk in controlled pieces",
        "Lower all major pieces under rigging control to protect the surrounding site",
        "Process crown wood through the chipper on-site",
        "Buck and load trunk wood for haul-off via log truck",
        "Leave the stump at grade for separate large-diameter grinding unless bundled",
      ],
      assumptions: [
        "Ground near the base can support a chip truck, log truck, and grapple/loader equipment without matting, unless matting is separately quoted",
        "No structural, utility, or property-line conflict exists within the full rigging swing radius",
        "Any required removal permit is obtained by, or coordinated with, the customer before work begins",
      ],
      exclusions: [
        "Stump grinding at this diameter, unless separately listed as a bundled line item",
        "Ground protection matting, unless separately quoted for soft-soil conditions",
        "Arborist report or permit-application preparation, unless separately scoped",
      ],
      warranty:
        "Workmanship warranty covers safe, complete removal as scoped; excludes permit delays, weather rescheduling, and site conditions not disclosed at time of quote (e.g., undisclosed underground utilities).",
    },
    productionNotes: [
      "Typical crew: 4-5 (lead climber, second climber/rigger, 2-3 ground crew)",
      "Average production: 4-8+ hours depending on height, canopy mass, and rigging complexity; large legacy specimens can span a full day",
      "Log-handling equipment (grapple/knuckle-boom) materially speeds trunk processing versus manual bucking and loading",
    ],
    pricingHooks: [
      { kind: "laborRate", refSlug: "tree-service.certified-climber", description: "Lead climbing arborist hourly rate", estimatedUnitOfMeasure: "HR" },
      { kind: "laborRate", refSlug: "tree-service.second-climber-rigger", description: "Second climber / rigging specialist hourly rate", estimatedUnitOfMeasure: "HR" },
      { kind: "laborRate", refSlug: "tree-service.crew-foreman", description: "Job supervisor / foreman hourly rate", estimatedUnitOfMeasure: "HR" },
      { kind: "equipment", refSlug: "tree-service.grapple-truck", description: "Grapple truck / knuckle-boom loader for large log handling", estimatedUnitOfMeasure: "HR" },
      { kind: "equipment", refSlug: "tree-service.log-truck", description: "Log truck for trunk-wood haul-off", estimatedUnitOfMeasure: "HR" },
      { kind: "equipment", refSlug: "tree-service.brush-chipper", description: "Brush chipper ownership/operating cost", estimatedUnitOfMeasure: "HR" },
    ],
    aiNotes: [
      "If the customer mentions the tree is near power lines, a structure, or a fence, flag for human review and route toward crane-assisted or technical-rigging assemblies instead of this open-access one",
      "Large-tree jobs have wide time-estimate variance — AI should present a range, not a point estimate, until a crew lead confirms scope on-site",
      "Reason for removal (health/hazard/site-development) should be captured verbatim for permit-application reuse later, not just for internal classification",
    ],
  },
  {
    id: "tree-service.removal.technical-rigging-restricted-access",
    slug: "technical-rigging-restricted-access",
    version: 1,
    trade: "Tree Service",
    category: "Tree Removal",
    subcategory: "Technical Removal — Restricted Access",
    name: "Tree Removal — Technical Rigging, Restricted Access (Near Structures/Utilities)",
    unitOfMeasure: "EA",
    description:
      "Piece-by-piece technical removal of a tree in close proximity to structures, fences, utility lines, or other high-value targets where every section must be rigged and lowered under control — no free-drop felling permitted.",
    customerDescription:
      "Because your tree is close to your house/garage/lines, we can't simply fell it — our climber will remove it piece by piece, roping every section down gently so nothing falls freely near the target area.",
    contractorNotes:
      "Treat every cut as a rigged pick; there is no acceptable free-drop zone. Confirm target-protection plan (plywood/blankets over roofing, gutters, fencing) before the first cut. This assembly is defined by proximity risk, not tree size — a modest tree six feet from a bay window still requires this scope, not the standard-removal assemblies.",
    typicalUseCase:
      "Tree overhanging or immediately adjacent to a house, garage, shed, fence, pool enclosure, or overhead utility service drop, where any piece falling uncontrolled would cause property damage.",
    projectTypes: ["residential", "commercial"],
    constructionPhase: "maintenance",
    csiDivision: "31 13 13",
    requiredInputs: [
      { key: "dbhInches", label: "Trunk diameter at breast height", unit: "in", description: "Still needed for rigging-load planning even though pricing is access-driven, not size-driven." },
      { key: "targetsWithinFallRadius", label: "Structures/utilities within fall radius", description: "List every structure, fence line, pool, or utility service within reach of the canopy." },
      { key: "utilityServiceLineInvolved", label: "Overhead utility service line present", unit: "yes/no", description: "If yes, utility coordination/de-energization may be required before work begins." },
      { key: "targetProtectionRequired", label: "Physical protection needed for roofing/siding/fencing", unit: "yes/no", description: "Drives whether plywood/blanket staging is included." },
    ],
    optionalInputs: [
      { key: "craneAccessPossible", label: "Crane could stage on-site", unit: "yes/no", description: "If yes, may be more efficient/safer than full manual rigging — compare against the crane-assisted assembly." },
      { key: "woodRetentionRequested", label: "Customer wants rounds retained", unit: "yes/no", description: "Reduces haul-off volume when true." },
    ],
    materialCategories: ["Bar and chain lubricant", "Heavy rigging rope, slings, and hardware (wear items)", "Plywood/blanket target protection", "Flagging / exclusion-zone tape"],
    laborCategories: ["Lead certified climbing arborist", "Ground crew (rigging control, target protection, chipping)", "Crew foreman / job supervisor"],
    equipmentCategories: ["Climbing saw and ground saws", "Rigging block, port-a-wrap, or lowering device", "Aerial lift (alternative access where climbing is constrained)", "Brush chipper", "Chip truck"],
    safetyRequirements: [
      "Every piece rigged and lowered under control — no free-drop cuts permitted in this scope",
      "Target-protection staging (plywood/blankets) installed and inspected before cutting begins",
      "Utility company contacted for line clearance or temporary de-energization when the service drop is within working distance",
      "Ground crew stationed clear of all lowering lines with dedicated signal/communication protocol with the climber",
    ],
    riskFactors: [
      "Misjudged pick-point load causing an uncontrolled swing into a protected target",
      "Contact with an energized utility conductor if de-energization/clearance wasn't arranged",
      "Rigging hardware failure under a heavier-than-estimated section",
      "Limited working space restricting escape routes for the climber",
    ],
    permitAwareness: [
      "Removal permit requirements per local ordinance still apply regardless of the technical-access reason for removal",
      "Utility company permission/scheduling is effectively a second approval gate when a service line is involved",
    ],
    inspectionAwareness: [
      "Utility company may require their own crew or a certified line-clearance arborist to be present or to pre-clear conductors",
      "Property owner or HOA walk-through of protected surfaces before/after work is common on this scope",
    ],
    codeConsiderations: [
      "Utility line-clearance work near primary conductors may require CDL/line-clearance-certified personnel per utility and OSHA rules",
      "Standard tree-preservation and removal-permit ordinances still apply on top of the access constraints",
    ],
    dependencies: ["tree-service.removal.medium-tree-open-access", "tree-service.removal.crane-assisted-removal", "tree-service.utility-clearance.service-drop-clearance"],
    wasteDisposal: [
      "All wood chipped or bucked and hand-carried/hoisted clear of the protected target before haul-off",
      "Stump handling scoped separately given likely restricted grinder access",
    ],
    proposalIntelligence: {
      scopeOfWork: [
        "Install target protection over roofing, siding, fencing, or other at-risk surfaces before cutting",
        "Rig and lower every section under control; no free-drop cuts",
        "Coordinate with the utility company for line clearance if a service drop is within working distance",
        "Process and haul all resulting debris",
        "Remove target protection and inspect protected surfaces with the customer at job close-out",
      ],
      assumptions: [
        "Customer has granted access to any adjoining property needed for rigging anchor points or debris staging",
        "Utility coordination, if required, can be scheduled within the proposal's stated timeline",
        "No pre-existing damage to nearby structures is present that could be mistaken for job-caused damage",
      ],
      exclusions: [
        "Utility company de-energization fees or scheduling delays outside the contractor's control",
        "Repair of any pre-existing damage to structures or fencing near the work area",
        "Stump grinding, unless separately scoped given restricted grinder access",
      ],
      warranty:
        "Workmanship warranty covers safe, damage-free removal as scoped, contingent on accurate target and access information provided at time of quote; excludes utility-caused delays.",
    },
    productionNotes: [
      "Typical crew: 3-4 (lead climber, 2 ground crew, foreman)",
      "Production time driven by number of required rigging picks, not raw tree size — expect 1.5-3x the hours of an equivalent open-access removal",
      "Always compare against crane-assisted removal when crane staging is possible; a crane can often reduce total risk and cost versus fully manual rigging",
    ],
    pricingHooks: [
      { kind: "laborRate", refSlug: "tree-service.certified-climber", description: "Lead climbing arborist hourly rate", estimatedUnitOfMeasure: "HR" },
      { kind: "laborRate", refSlug: "tree-service.crew-foreman", description: "Job supervisor hourly rate", estimatedUnitOfMeasure: "HR" },
      { kind: "material", refSlug: "tree-service.target-protection-materials", description: "Plywood/blanket staging materials", estimatedUnitOfMeasure: "EA" },
      { kind: "equipment", refSlug: "tree-service.rigging-kit", description: "Heavy rigging block/lowering device and hardware", estimatedUnitOfMeasure: "EA" },
      { kind: "subcontractor", refSlug: "tree-service.line-clearance-utility-coordination", description: "Utility line-clearance coordination or de-energization, when required" },
    ],
    aiNotes: [
      "This assembly should be suggested whenever intake mentions proximity words like 'near', 'over', 'touching', or 'overhanging' a house/garage/fence/pool/lines, regardless of stated tree size",
      "Always surface the crane-assisted alternative for comparison when intake indicates a crane could plausibly stage on-site",
      "Utility involvement should be flagged as a scheduling-risk item, not folded silently into the base timeline",
    ],
  },
  {
    id: "tree-service.hazard-removal.dead-standing-hazard-tree",
    slug: "dead-standing-hazard-tree",
    version: 1,
    trade: "Tree Service",
    category: "Hazard Tree Removal",
    subcategory: "Dead or Structurally Compromised Standing Tree",
    name: "Hazard Tree Removal — Dead/Diseased Standing Tree",
    unitOfMeasure: "EA",
    description:
      "Removal of a dead, dying, or structurally compromised standing tree assessed as an active fall or limb-drop hazard, requiring elevated safety precautions and often expedited scheduling.",
    customerDescription:
      "Your tree has been assessed as a safety hazard due to decline, disease, or structural damage. We'll remove it using extra precautions for its unstable condition, prioritizing scheduling given the risk it poses.",
    contractorNotes:
      "Assume reduced wood strength throughout — branches and even the trunk may fail under normal chainsaw vibration or wind load that a healthy tree would tolerate. Prefer mechanical assist (crane, lift) over climbing whenever the tree shows significant decay, cavity, or root-plate movement; do not send a climber into a tree with an unassessed compromised root plate or trunk cavity.",
    typicalUseCase:
      "Standing dead tree, storm-damaged tree with a cracked or leaning trunk, or a tree flagged by a prior arborist assessment as high risk, located where its fall zone threatens a structure, driveway, or area of regular use.",
    projectTypes: ["residential", "commercial", "emergency"],
    constructionPhase: "maintenance",
    csiDivision: "31 13 13",
    requiredInputs: [
      { key: "hazardIndicators", label: "Observed hazard indicators", description: "e.g. no live foliage, visible cavity, cracked trunk, root-plate lifting, leaning onto structure." },
      { key: "fallZoneTargets", label: "What is within the fall zone", description: "Structures, driveways, walkways, or areas of regular pedestrian/vehicle use." },
      { key: "urgencyLevel", label: "Urgency (routine / expedited / emergency)", description: "Drives scheduling priority and crew mobilization approach." },
    ],
    optionalInputs: [
      { key: "priorArboristAssessment", label: "Prior written hazard assessment available", unit: "yes/no", description: "If available, informs the removal method plan and supports any permit application." },
      { key: "rootPlateMovementObserved", label: "Visible root-plate lifting or soil cracking", unit: "yes/no", description: "A strong signal to avoid climbing this tree entirely." },
    ],
    materialCategories: ["Bar and chain lubricant", "Heavy rigging rope, slings, and hardware (wear items)", "Flagging / exclusion-zone tape and barricades"],
    laborCategories: ["ISA Certified Arborist (hazard assessment)", "Lead climber or crane/lift operator", "Ground crew"],
    equipmentCategories: ["Aerial lift (preferred over climbing for compromised trees)", "Crane (for severely compromised trees)", "Chainsaw", "Brush chipper", "Chip truck"],
    safetyRequirements: [
      "Ground-based hazard assessment by a qualified arborist before any climbing decision is made",
      "Mechanical access (lift/crane) prioritized over climbing when decay, cavity, or root-plate movement is present",
      "Extended exclusion zone given unpredictable failure behavior of compromised wood",
      "Continuous visual monitoring of the tree during work for new cracking or movement",
    ],
    riskFactors: [
      "Sudden, unpredictable limb or trunk failure without normal warning signs",
      "Root-plate failure during work causing the whole tree to shift or fall",
      "Hidden internal decay far more extensive than visible externally",
      "Time pressure from urgency reducing planning time if treated as a pure emergency",
    ],
    permitAwareness: [
      "Many jurisdictions offer an expedited or hazard-exception permit path for a documented hazard tree, bypassing standard preservation-ordinance review",
      "A written arborist hazard assessment is often required to qualify for that expedited path",
    ],
    inspectionAwareness: [
      "Some municipalities require a hazard determination be verified by a city forester before permit issuance, even on an expedited path",
      "Insurance claims involving storm/hazard damage may require photo documentation before removal begins",
    ],
    codeConsiderations: [
      "Hazard-exception provisions in local tree ordinances typically require documented justification, not just contractor judgment",
      "Standard removal-permit and setback rules still apply once the hazard exception is granted",
    ],
    dependencies: ["tree-service.emergency-response.storm-hanger-leaner-removal", "tree-service.removal.crane-assisted-removal"],
    wasteDisposal: [
      "Wood processed and hauled per standard removal practice; decayed wood may have reduced value for firewood retention",
      "Stump handling scoped separately, noting root-plate condition may affect stump-grinding safety/method",
    ],
    proposalIntelligence: {
      scopeOfWork: [
        "Conduct a ground-based hazard assessment to confirm removal method (climb, lift, or crane)",
        "Remove the tree using the safest access method given its condition, prioritizing mechanical assist over climbing where warranted",
        "Process and haul all resulting debris",
        "Document tree condition with photos to support any permit or insurance requirement",
      ],
      assumptions: [
        "Access for a lift or crane exists if the assessment determines climbing is unsafe; otherwise scope shifts to more intensive rigging",
        "Any required hazard-exception permit documentation can be produced from the on-site assessment",
        "Weather conditions on service day support safe work given the tree's compromised state",
      ],
      exclusions: [
        "Formal written arborist hazard report/certification, unless separately scoped as a deliverable",
        "Insurance claim documentation or adjuster coordination beyond basic photo documentation",
        "Stump grinding, unless separately scoped",
      ],
      warranty:
        "Workmanship warranty covers safe removal execution as assessed; given the tree's pre-existing compromised condition, no warranty applies to conditions discovered mid-job that materially change the assessed risk or scope.",
    },
    productionNotes: [
      "Typical crew: 3-4, weighted toward mechanical-access equipment operators over climbers when the tree is significantly compromised",
      "Production time is highly variable and should be treated as an estimate pending on-site confirmation of the hazard assessment",
      "Expedite scheduling for high fall-zone-target risk (occupied structures, active driveways) ahead of lower-urgency hazard removals",
    ],
    pricingHooks: [
      { kind: "laborRate", refSlug: "tree-service.isa-certified-arborist", description: "ISA Certified Arborist hazard-assessment rate", estimatedUnitOfMeasure: "HR" },
      { kind: "laborRate", refSlug: "tree-service.certified-climber", description: "Climbing arborist hourly rate, when climbing is deemed safe", estimatedUnitOfMeasure: "HR" },
      { kind: "equipment", refSlug: "tree-service.aerial-lift", description: "Aerial lift, preferred access method for compromised trees", estimatedUnitOfMeasure: "HR" },
      { kind: "equipment", refSlug: "tree-service.crane", description: "Crane, for severely compromised trees where lift access is insufficient", estimatedUnitOfMeasure: "HR" },
    ],
    aiNotes: [
      "Never let intake auto-select a climbing-based removal assembly when hazard indicators are present — this should always route to human/arborist review of access method first",
      "Urgency level should influence scheduling suggestions, not safety scope — the safety requirements here don't relax just because a job is marked emergency",
      "Capture hazard indicators verbatim; they're the basis for any expedited-permit narrative later",
    ],
  },
  {
    id: "tree-service.removal.crane-assisted-removal",
    slug: "crane-assisted-removal",
    version: 1,
    trade: "Tree Service",
    category: "Tree Removal",
    subcategory: "Crane-Assisted Removal",
    name: "Crane-Assisted Tree Removal",
    unitOfMeasure: "EA",
    description:
      "Removal of a large or high-risk tree using a crane to lift and set down whole sections, reducing climbing time, rigging risk, and ground-impact damage compared to manual rigging alone.",
    customerDescription:
      "Given the size and location of this tree, we're bringing in a crane to lift entire sections out and set them down gently, which is faster and safer than a fully manual takedown.",
    contractorNotes:
      "Crane use shifts the cost driver from labor-hours to crane mobilization/standby time — confirm crane access, swing radius, ground bearing capacity for outriggers, and any overhead obstructions (power lines, other trees) before committing to this method. A certified rigger directs all picks; the crane operator does not make rigging judgment calls.",
    typicalUseCase:
      "Large tree near structures/utilities where technical manual rigging would be slow or high-risk, or any large-diameter removal where crane availability materially reduces total job risk and time.",
    projectTypes: ["residential", "commercial", "land-clearing"],
    constructionPhase: "maintenance",
    csiDivision: "31 13 13",
    requiredInputs: [
      { key: "craneAccessConfirmed", label: "Crane truck can access and set up at the site", unit: "yes/no", description: "Confirms driveway width, gate clearance, and turning radius support crane mobilization." },
      { key: "outriggerGroundConditions", label: "Ground bearing condition for outrigger pads", description: "Soft, sloped, or paved-over-utility ground may require mats or an alternate setup position." },
      { key: "overheadObstructions", label: "Overhead obstructions in the crane's working radius", description: "Power lines and neighboring trees materially constrain lift path and require coordination or exclusion." },
      { key: "dbhAndHeight", label: "Trunk diameter and tree height", unit: "in / ft", description: "Confirms the crane's rated lift capacity and boom length are sufficient for the heaviest section." },
    ],
    optionalInputs: [
      { key: "streetClosurePermitNeeded", label: "Street or lane closure required for crane staging", unit: "yes/no", description: "Adds permit/traffic-control scope if the crane must stage in a public right-of-way." },
    ],
    materialCategories: ["Rigging slings and hardware rated for crane picks", "Ground protection mats (outrigger pads)", "Bar and chain lubricant"],
    laborCategories: ["Certified rigger / signal person", "Climbing arborist (attaching rigging aloft)", "Crane operator (typically subcontracted crane service)", "Ground crew (processing and hauling set-down sections)"],
    equipmentCategories: ["Crane (mobile or truck-mounted, subcontracted or owned)", "Chainsaw", "Grapple truck or loader (log handling)", "Brush chipper", "Chip truck and log truck"],
    safetyRequirements: [
      "Certified rigger directs every pick; crane operator follows signal-person direction exclusively",
      "Load calculations confirmed against the crane's rated capacity chart for the boom angle and radius in use for each section",
      "Exclusion zone established under the entire crane swing radius, not just the tree's footprint",
      "Utility clearance confirmed for the crane boom's full range of motion, not just its resting position",
    ],
    riskFactors: [
      "Underestimated section weight exceeding rated crane capacity at the required radius",
      "Outrigger ground failure due to unassessed soft soil or a buried utility/void beneath the pad",
      "Boom contact with overhead lines during repositioning between picks",
      "Crane mobilization schedule slipping and cascading into other same-day jobs",
    ],
    permitAwareness: [
      "Street/lane closure permit required if the crane must stage in or swing over a public right-of-way",
      "Standard tree-removal permit requirements still apply independent of the crane method",
    ],
    inspectionAwareness: [
      "Crane operators/companies typically carry their own certification and insurance documentation that should be verified before scheduling",
      "Some municipalities require a traffic-control plan reviewed in advance for right-of-way crane staging",
    ],
    codeConsiderations: [
      "Crane operation near utility lines is subject to OSHA power-line-proximity rules (minimum clearance distances) independent of tree-specific regulation",
      "Right-of-way staging is subject to local traffic-control and street-closure ordinances",
    ],
    dependencies: ["tree-service.removal.large-tree-open-access", "tree-service.removal.technical-rigging-restricted-access", "tree-service.hazard-removal.dead-standing-hazard-tree"],
    wasteDisposal: [
      "Crane-set sections processed on the ground by the chipper/log crew rather than lowered piece-by-piece by hand",
      "Large logs loaded directly from the set-down zone onto a log truck via grapple/loader",
    ],
    proposalIntelligence: {
      scopeOfWork: [
        "Mobilize and set up the crane with outrigger ground protection as needed",
        "Attach rigging aloft and lift each section under signal-person direction to a designated set-down zone",
        "Process set-down sections: chip crown wood, buck and load trunk sections",
        "Demobilize the crane and restore the staging area",
      ],
      assumptions: [
        "Site access supports crane mobilization and outrigger setup without requiring separate site prep",
        "No unresolved overhead-line conflict prevents safe boom operation across the required swing radius",
        "Any required street/lane closure permit is obtained in time for the scheduled crane date",
      ],
      exclusions: [
        "Traffic-control plan preparation and street-closure permit fees, unless separately scoped",
        "Ground protection matting beyond standard outrigger pads, unless soft-soil conditions are identified requiring more",
        "Stump grinding, unless separately scoped",
      ],
      warranty:
        "Workmanship warranty covers safe execution of the crane-assisted removal as scoped; excludes delays from crane subcontractor scheduling, weather holds, or right-of-way permit timing outside the contractor's control.",
    },
    productionNotes: [
      "Typical crew: crane operator + certified rigger/signal person + climber + 2-3 ground crew",
      "Crane mobilization/demobilization and standby time often dominate total job cost more than the actual lift work",
      "Production is usually faster in climber-hours than manual rigging, but total job cost depends heavily on crane day-rate and mobilization distance",
    ],
    pricingHooks: [
      { kind: "subcontractor", refSlug: "tree-service.crane-service", description: "Crane and certified operator, typically subcontracted", estimatedUnitOfMeasure: "day" },
      { kind: "laborRate", refSlug: "tree-service.certified-rigger-signal-person", description: "Certified rigger / signal person hourly rate", estimatedUnitOfMeasure: "HR" },
      { kind: "laborRate", refSlug: "tree-service.certified-climber", description: "Climbing arborist hourly rate for aloft rigging attachment", estimatedUnitOfMeasure: "HR" },
      { kind: "equipment", refSlug: "tree-service.grapple-truck", description: "Grapple truck / loader for processing crane-set sections", estimatedUnitOfMeasure: "HR" },
    ],
    aiNotes: [
      "This assembly's cost is dominated by crane day-rate and mobilization distance, not tree size alone — AI should ask for site location/access before estimating, not just tree dimensions",
      "Recommend this assembly whenever a hazard or restricted-access removal's estimated manual-rigging hours would exceed roughly a full day, as a cost/risk comparison point",
      "Right-of-way staging should trigger a permit-timeline flag distinct from the standard tree-removal permit flag",
    ],
  },
  {
    id: "tree-service.stump-grinding.standard-stump-grinding",
    slug: "standard-stump-grinding",
    version: 1,
    trade: "Tree Service",
    category: "Stump Grinding",
    subcategory: "Standard Stump Grinding",
    name: "Stump Grinding — Standard",
    unitOfMeasure: "EA",
    description:
      "Mechanical grinding of a tree stump below grade using a self-propelled or towable stump grinder, including surface root flares within normal reach of the machine.",
    customerDescription:
      "We'll grind the stump down below ground level so it's no longer a tripping hazard or obstacle, and backfill the hole with the resulting wood chips and soil.",
    contractorNotes:
      "Confirm required grind depth with the customer up front — standard depth (4-6 in. below grade) is fine for turf restoration, but replanting or hardscape-over-stump work needs a deeper grind, which is a distinct pricing tier. Always locate irrigation, low-voltage lighting, and utility lines near the stump before grinding.",
    typicalUseCase:
      "Stump remaining after a tree removal (this job's own or a prior one), or an existing stump the customer wants cleared for lawn, landscaping, or general yard cleanup.",
    projectTypes: ["residential", "light-commercial"],
    constructionPhase: "maintenance",
    csiDivision: "31 13 13",
    requiredInputs: [
      { key: "stumpDiameterInches", label: "Stump diameter at grade", unit: "in", description: "Primary driver of grinding time; larger diameters take substantially longer." },
      { key: "gridAccessWidth", label: "Access width to reach the stump", unit: "in", description: "Confirms whether a standard or compact grinder is needed for gate/side-yard access." },
      { key: "desiredGrindDepth", label: "Desired grind depth below grade", unit: "in", description: "Standard vs. deep grind for replanting/hardscape changes the pricing tier." },
    ],
    optionalInputs: [
      { key: "surfaceRootsPresent", label: "Visible surface root flares extending beyond the stump", unit: "yes/no", description: "Additional surface roots within reach add grinding time." },
      { key: "backfillMaterialRequested", label: "Customer wants topsoil backfill instead of chip fill", unit: "yes/no", description: "Adds a material line item if requested." },
    ],
    materialCategories: ["Grinder teeth (wear items)", "Topsoil backfill (if requested in place of chip fill)"],
    laborCategories: ["Grinder operator", "Ground laborer (site protection, debris cleanup)"],
    equipmentCategories: ["Stump grinder (self-propelled or towable)", "Compact/mini stump grinder (restricted access)"],
    safetyRequirements: [
      "Utility/irrigation locate check before grinding near the stump",
      "Debris shields/flagging to contain thrown wood chips and soil from the grinding wheel",
      "Exclusion zone maintained around the grinder during operation",
    ],
    riskFactors: [
      "Buried irrigation, low-voltage lighting, or utility lines struck during grinding",
      "Embedded rock or metal (old fence anchors, nails) damaging grinder teeth",
      "Turf or hardscape damage from grinder tracks on soft or wet ground",
    ],
    permitAwareness: ["Stump grinding is rarely permit-triggering on its own, but confirm it isn't excluded from a removal permit's required scope in jurisdictions that regulate root-flare disturbance"],
    inspectionAwareness: ["No routine inspection expected for standard residential stump grinding"],
    codeConsiderations: ["Utility locate (e.g. 811 call) is a standard prerequisite before mechanical ground disturbance, independent of any tree-specific code"],
    dependencies: ["tree-service.removal.small-tree-open-access", "tree-service.removal.medium-tree-open-access", "tree-service.root-flare-excavation.root-flare-excavation-standard"],
    wasteDisposal: [
      "Resulting wood-chip/soil mix used to backfill the grind hole unless topsoil backfill is requested",
      "Excess grindings hauled off if the customer doesn't want them left on-site",
    ],
    proposalIntelligence: {
      scopeOfWork: [
        "Locate underground utilities/irrigation near the stump before grinding",
        "Grind the stump and reachable surface roots to the agreed depth below grade",
        "Backfill the resulting hole with grindings, or with topsoil if requested",
        "Clean up wood-chip debris from the surrounding area",
      ],
      assumptions: [
        "Grinder can access the stump without needing to cross a neighboring property",
        "No irrigation/utility conflict is discovered that the customer didn't disclose",
        "Ground is stable enough to support grinder weight without matting",
      ],
      exclusions: [
        "Deep-grind pricing for replanting or hardscape installation directly over the stump, unless separately scoped",
        "Lawn/turf reseeding or hardscape repair over the resulting hole",
        "Excavation or removal of large lateral roots beyond the grinder's normal reach",
      ],
      warranty:
        "Workmanship warranty covers a clean, complete grind to the agreed depth; no warranty on turf regrowth over the backfilled area or on roots extending beyond the grinder's working radius.",
    },
    productionNotes: [
      "Typical crew: 1-2 (operator + optional ground laborer)",
      "Average production: 20-45 minutes per stump for typical residential diameters under normal access",
      "Compact grinder access through a standard gate roughly doubles time versus a full-size grinder with open access",
    ],
    pricingHooks: [
      { kind: "laborRate", refSlug: "tree-service.grinder-operator", description: "Stump grinder operator hourly rate", estimatedUnitOfMeasure: "HR" },
      { kind: "equipment", refSlug: "tree-service.stump-grinder", description: "Stump grinder ownership/operating cost", estimatedUnitOfMeasure: "HR" },
      { kind: "equipment", refSlug: "tree-service.compact-stump-grinder", description: "Compact/mini grinder for restricted access", estimatedUnitOfMeasure: "HR" },
      { kind: "material", refSlug: "tree-service.topsoil-backfill", description: "Topsoil backfill, when requested instead of chip fill", estimatedUnitOfMeasure: "CY" },
    ],
    aiNotes: [
      "Always ask desired grind depth explicitly — 'standard' assumptions silently under-scope jobs where the customer plans to replant or pave over the stump",
      "Stump diameter should be estimated from the felled tree's DBH when this is bundled with a same-visit removal, not asked as a separate question",
      "Access width should trigger a compact-grinder cost-hook substitution, not just a time-multiplier note",
    ],
  },
  {
    id: "tree-service.pruning.crown-reduction-structural",
    slug: "crown-reduction-structural",
    version: 1,
    trade: "Tree Service",
    category: "Pruning",
    subcategory: "Crown Reduction",
    name: "Crown Reduction — Structural Pruning",
    unitOfMeasure: "EA",
    description:
      "ANSI A300-compliant reduction of a tree's overall crown size and weight by pruning back to lateral branches capable of assuming the terminal role, performed for clearance, storm-risk reduction, or structural correction.",
    customerDescription:
      "We'll selectively prune back the outer canopy to reduce the tree's overall size and weight in a way that keeps it healthy and natural-looking, improving clearance and reducing storm risk.",
    contractorNotes:
      "This is not topping — every reduction cut must go back to a lateral at least one-third the diameter of the limb being removed, per ANSI A300 Part 1. Do not remove more than the industry-standard live-crown percentage in a single visit (species- and health-dependent, typically capped around 25%). Flag and decline any customer request for flush-cut topping.",
    typicalUseCase:
      "Tree with excessive end-weight, overextended limbs threatening a structure or utility line, or a tree needing size management for view/clearance reasons without full removal.",
    projectTypes: ["residential", "commercial"],
    constructionPhase: "maintenance",
    csiDivision: "31 13 16",
    requiredInputs: [
      { key: "treeHeightFt", label: "Approximate tree height", unit: "ft", description: "Sets aerial access method and rigging needs for larger cuts." },
      { key: "reductionGoal", label: "Reduction goal (clearance / storm-risk / view / structural)", description: "Clarifies which limbs/directions to prioritize for the cutting plan." },
      { key: "targetsNearCanopy", label: "Structures or utility lines within or adjacent to the canopy", description: "Determines whether cuts need to be rigged rather than free-dropped." },
    ],
    optionalInputs: [
      { key: "priorPruningHistory", label: "Known prior pruning or topping history", description: "Prior topping cuts often mean weakly attached regrowth that changes the cutting plan." },
      { key: "speciesIfKnown", label: "Tree species", description: "Species-specific tolerance affects the maximum safe live-crown removal percentage." },
    ],
    materialCategories: ["Bar and chain lubricant", "Pruning-saw and hand-tool consumables"],
    laborCategories: ["Certified climbing arborist", "Ground crew (rigging assist, brush handling, chipping)"],
    equipmentCategories: ["Climbing saw and hand pruning tools", "Aerial lift (alternative to climbing where accessible)", "Brush chipper", "Chip truck"],
    safetyRequirements: [
      "ANSI Z133 climbing protocols with redundant tie-in throughout the prune",
      "Rigging used for any cut section that cannot be safely free-dropped near a target",
      "Pre-work inspection for deadwood, cavities, or weak attachments before loading any limb with body weight",
    ],
    riskFactors: [
      "Removing more live crown than the tree can tolerate, stressing an already-compromised specimen",
      "Weakly attached regrowth from prior topping failing unexpectedly under the climber's weight",
      "Wasp/hornet activity discovered mid-canopy",
    ],
    permitAwareness: ["Some jurisdictions with tree-preservation ordinances restrict pruning percentage or require a permit for pruning protected/heritage trees, not just removal"],
    inspectionAwareness: ["Utility companies performing their own line-clearance pruning may require coordination if this reduction overlaps their service-drop clearance zone"],
    codeConsiderations: ["ANSI A300 (Part 1: Pruning) and ANSI Z133 (safety) are the governing industry standards this scope is written to; some municipalities incorporate ANSI A300 by reference into their own tree-care ordinances"],
    dependencies: ["tree-service.pruning.deadwooding-crown-cleaning", "tree-service.pruning.crown-raising"],
    wasteDisposal: ["Pruned brush and limb wood chipped on-site", "Larger removed limbs bucked for haul-off or firewood retention if requested"],
    proposalIntelligence: {
      scopeOfWork: [
        "Assess the crown and develop a reduction plan targeting the stated goal (clearance/storm-risk/view/structural)",
        "Make reduction cuts back to appropriately sized lateral branches per ANSI A300",
        "Rig and lower any sections that cannot be safely free-dropped near a target",
        "Chip brush and haul all resulting debris",
      ],
      assumptions: [
        "The tree's health supports the industry-standard live-crown removal percentage without excessive stress",
        "No pest/disease issue is present that would change the recommended approach (would instead route to a plant-health assembly)",
        "Access supports normal climbing or lift equipment",
      ],
      exclusions: [
        "Topping or flush cuts that don't conform to ANSI A300 — will not be performed even if requested",
        "Plant-health treatment for any pest/disease condition discovered during the prune",
        "Cabling or bracing for structural defects found during the prune, unless separately scoped",
      ],
      warranty:
        "Workmanship warranty covers ANSI A300-compliant execution of the agreed reduction plan; no warranty on tree health outcomes, which depend on factors beyond pruning technique (soil, pests, drought, etc.).",
    },
    productionNotes: [
      "Typical crew: 2-3 (climber + 1-2 ground crew)",
      "Average production: 1-3 hours per tree depending on height and reduction extent",
      "Reduction extent should be re-confirmed on-site against the customer's stated goal before the first cut — 'a little off the top' and 'storm-proof this tree' imply very different scopes",
    ],
    pricingHooks: [
      { kind: "laborRate", refSlug: "tree-service.certified-climber", description: "Certified climbing arborist hourly rate", estimatedUnitOfMeasure: "HR" },
      { kind: "laborRate", refSlug: "tree-service.ground-laborer", description: "Ground crew hourly rate", estimatedUnitOfMeasure: "HR" },
      { kind: "equipment", refSlug: "tree-service.brush-chipper", description: "Brush chipper ownership/operating cost", estimatedUnitOfMeasure: "HR" },
    ],
    aiNotes: [
      "If intake language suggests the customer wants 'topping' (e.g., 'cut it all flat', 'make it shorter across the top'), the AI should surface the ANSI A300 non-topping policy rather than silently mapping the request to this assembly",
      "Reduction goal should be captured as a distinct field from general notes — it materially changes which limbs get prioritized",
      "Prior topping history is a strong signal to add inspection time to the estimate, not just a note",
    ],
  },
  {
    id: "tree-service.pruning.deadwooding-crown-cleaning",
    slug: "deadwooding-crown-cleaning",
    version: 1,
    trade: "Tree Service",
    category: "Pruning",
    subcategory: "Deadwooding / Crown Cleaning",
    name: "Deadwooding — Crown Cleaning",
    unitOfMeasure: "EA",
    description:
      "Removal of dead, dying, diseased, or broken branches from a tree's crown (ANSI A300 'crown cleaning') to reduce limb-drop hazard and improve tree health and appearance, without altering the tree's overall size or shape.",
    customerDescription:
      "We'll remove the dead and damaged branches throughout the canopy so they can't fall on their own, without changing the overall shape or size of your tree.",
    contractorNotes:
      "This is the lowest-risk, highest-frequency pruning service in the trade and is often bundled with other work (pre-removal canopy safety pass, post-storm cleanup, routine maintenance). Focus on deadwood over a minimum diameter threshold (commonly 1-2 in.) rather than every twig, unless the customer specifically wants a finer clean for aesthetics.",
    typicalUseCase:
      "Mature tree with visible dead branches over a walkway, patio, driveway, or play area, or as a standard health-maintenance visit with no size-reduction goal.",
    projectTypes: ["residential", "commercial"],
    constructionPhase: "maintenance",
    csiDivision: "31 13 16",
    requiredInputs: [
      { key: "treeHeightFt", label: "Approximate tree height", unit: "ft", description: "Determines whether ground-based pole pruning suffices or a climb/lift is needed." },
      { key: "deadwoodSizeThresholdIn", label: "Minimum deadwood diameter to remove", unit: "in", description: "Sets scope precision; smaller thresholds increase time meaningfully." },
    ],
    optionalInputs: [
      { key: "targetsBelowCanopy", label: "High-use areas beneath the canopy (patio, play area, parking)", description: "Raises priority/urgency even for a routine deadwooding visit." },
    ],
    materialCategories: ["Bar and chain lubricant", "Pruning-saw and pole-saw consumables"],
    laborCategories: ["Climbing arborist or ground pruning technician", "Ground crew (brush handling, chipping)"],
    equipmentCategories: ["Pole saw / pole pruner", "Climbing saw (for canopy-height deadwood beyond pole reach)", "Aerial lift (alternative to climbing)", "Brush chipper", "Chip truck"],
    safetyRequirements: [
      "Deadwood is inherently unpredictable — treat every dead limb as potentially ready to fail under normal handling",
      "Ground crew stays clear of the drop zone directly beneath the climber/lift at all times",
      "Standard ANSI Z133 climbing protocols apply when the work requires aerial access",
    ],
    riskFactors: [
      "Dead limbs failing unexpectedly during handling, more so than live wood",
      "Hidden decay extending further into the limb or trunk than visually apparent",
      "Missed deadwood above the agreed size threshold if canopy density obscures full visibility from the ground",
    ],
    permitAwareness: ["Routine deadwooding rarely triggers permit requirements even under protected-tree ordinances, since it doesn't reduce canopy size, but verify locally if the tree is a designated heritage specimen"],
    inspectionAwareness: ["No routine inspection expected"],
    codeConsiderations: ["ANSI A300 'crown cleaning' standard governs scope and technique for this assembly"],
    dependencies: ["tree-service.pruning.crown-reduction-structural", "tree-service.emergency-response.storm-hanger-leaner-removal"],
    wasteDisposal: ["Removed deadwood chipped on-site; larger dead limbs bucked for haul-off"],
    proposalIntelligence: {
      scopeOfWork: [
        "Inspect the crown from the ground and, where needed, aloft for dead, dying, diseased, or broken branches above the agreed size threshold",
        "Remove identified deadwood using pole tools, a climb, or a lift as access requires",
        "Chip brush and haul all resulting debris",
      ],
      assumptions: [
        "Deadwood removal targets branches above the agreed minimum diameter, not every small twig",
        "No live-crown reduction is included in this scope",
        "Access supports pole work, a climb, or lift equipment as needed",
      ],
      exclusions: [
        "Live-crown reduction or shaping (see the crown-reduction assembly)",
        "Plant-health diagnosis or treatment for the underlying cause of dieback",
        "Cabling/bracing for any structural defects noted during the pass",
      ],
      warranty:
        "Workmanship warranty covers thorough removal of visible deadwood above the agreed threshold as scoped; no warranty against new deadwood developing after service or against hidden decay not visible during inspection.",
    },
    productionNotes: [
      "Typical crew: 1-2 for pole-tool-only jobs; 2-3 when a climb or lift is required",
      "Average production: 45 minutes to 2 hours per tree depending on height and deadwood volume",
      "Frequently bundled at a discount with a same-visit crown reduction or as a pre-removal safety pass",
    ],
    pricingHooks: [
      { kind: "laborRate", refSlug: "tree-service.pruning-technician", description: "Pruning technician / climber hourly rate", estimatedUnitOfMeasure: "HR" },
      { kind: "equipment", refSlug: "tree-service.pole-pruner", description: "Pole saw / pole pruner equipment allowance", estimatedUnitOfMeasure: "EA" },
      { kind: "equipment", refSlug: "tree-service.brush-chipper", description: "Brush chipper ownership/operating cost", estimatedUnitOfMeasure: "HR" },
    ],
    aiNotes: [
      "This is a good low-friction upsell/bundle suggestion whenever intake describes any other pruning or removal job on a mature tree with visible canopy",
      "Ask about high-use areas beneath the canopy to help triage scheduling priority even when the job itself is routine",
      "Do not conflate this assembly with crown-reduction in intake matching — 'the tree looks messy/full of dead branches' maps here, 'the tree is too big/heavy' maps to crown reduction",
    ],
  },
  {
    id: "tree-service.emergency-response.storm-hanger-leaner-removal",
    slug: "storm-hanger-leaner-removal",
    version: 1,
    trade: "Tree Service",
    category: "Emergency Response",
    subcategory: "Storm Damage — Hangers and Leaners",
    name: "Emergency Response — Storm-Damaged Hanger/Leaner Removal",
    unitOfMeasure: "HR",
    description:
      "Expedited, typically after-hours response to remove storm-broken hung-up limbs ('hangers'/'widowmakers') or a leaning/partially uprooted tree posing an immediate hazard, priced time-and-materials given unpredictable job scope.",
    customerDescription:
      "We'll respond as quickly as possible to safely remove the broken or leaning tree/limb threatening your property, billed by the hour given how unpredictable storm-damage jobs are to scope in advance.",
    contractorNotes:
      "Time-and-materials pricing is standard for this category — storm jobs cannot be reliably scoped sight-unseen. Prioritize triage: is anyone or anything in immediate danger right now versus can this safely wait for daylight/normal scheduling. Hung-up limbs ('hangers' or 'widowmakers') are one of the single highest-fatality hazards in arboriculture; never assume a hanger is stable.",
    typicalUseCase:
      "Post-storm call where a large limb is caught in the canopy above a structure/driveway/walkway, or a tree has partially uprooted and is leaning onto a structure, vehicle, or power line.",
    projectTypes: ["residential", "commercial", "emergency"],
    constructionPhase: "emergency-response",
    csiDivision: "31 13 13",
    requiredInputs: [
      { key: "immediateDangerAssessment", label: "Is there immediate danger to people, structures, or power lines", description: "Drives dispatch priority (immediate vs. next-available)." },
      { key: "hangerOrLeaner", label: "Hung-up limb vs. leaning/uprooted tree", description: "Determines the technical approach — very different hazard profiles." },
      { key: "powerLineInvolvement", label: "Power lines involved or contacted", unit: "yes/no", description: "If yes, requires utility company response before tree crew can safely engage." },
    ],
    optionalInputs: [
      { key: "accessBlockedByDebris", label: "Access to the site blocked by other storm debris", unit: "yes/no", description: "May require preliminary debris clearing before the crew can reach the hazard." },
      { key: "insuranceClaimInProgress", label: "Customer has an active insurance claim for this damage", unit: "yes/no", description: "May require photo documentation before/after work for claim purposes." },
    ],
    materialCategories: ["Bar and chain lubricant", "Heavy rigging rope, slings, and hardware (wear items)", "Barricades / hazard tape"],
    laborCategories: ["Emergency-response crew lead / certified climber", "Ground crew", "On-call dispatcher/coordinator"],
    equipmentCategories: ["Chainsaw", "Aerial lift (weather permitting)", "Rigging kit", "Portable floodlighting (after-dark response)", "Brush chipper", "Chip truck"],
    safetyRequirements: [
      "Treat every hung-up limb as unstable and load-bearing on nothing — never work beneath or climb a tree supporting a hanger without a specific removal plan for it first",
      "Confirm with the utility company (or wait for their crew) before engaging any tree in contact with a power line, energized or not",
      "Portable lighting and extra caution protocols for after-dark response",
      "Re-assess conditions continuously — storm sites change (additional limbs falling, continued wind) more than routine jobs",
    ],
    riskFactors: [
      "Hung-up limb releasing without warning during approach or cutting",
      "Leaning tree's root plate failing further mid-job",
      "Contact with a downed or sagging power line, energized or presumed de-energized incorrectly",
      "Reduced visibility and fatigue on after-hours/overnight calls",
    ],
    permitAwareness: ["Emergency hazard removals are typically permit-exempt or fast-tracked under a jurisdiction's emergency provisions, but standard permit rules resume for any non-emergency follow-up work at the same site"],
    inspectionAwareness: ["Utility company inspection/clearance is mandatory, not optional, whenever power lines are involved before tree crew engagement"],
    codeConsiderations: ["OSHA and utility-specific minimum approach distances to power lines apply regardless of emergency status"],
    dependencies: ["tree-service.hazard-removal.dead-standing-hazard-tree", "tree-service.pruning.deadwooding-crown-cleaning"],
    wasteDisposal: ["Debris typically staged on-site initially for safety triage; full chip/haul-off often follows as a separate next-day cleanup line item"],
    proposalIntelligence: {
      scopeOfWork: [
        "Respond and perform an immediate hazard triage on arrival",
        "Coordinate with the utility company first if any power-line involvement is present",
        "Remove or stabilize the specific hazard (hanger or leaner) to eliminate the immediate danger",
        "Stage resulting debris safely; full removal/chipping billed as follow-up work unless completed same visit",
      ],
      assumptions: [
        "Billing is time-and-materials given the inherently unscoped nature of emergency storm response",
        "Utility company response time for any power-line-involved call is outside the contractor's control",
        "Site conditions may change between dispatch and arrival due to ongoing weather",
      ],
      exclusions: [
        "Full property debris cleanup beyond the immediate hazard, unless scoped as a same-visit or follow-up line item",
        "Utility company repair or line restoration, which is solely the utility's responsibility",
        "Insurance claim filing or adjuster negotiation on the customer's behalf",
      ],
      warranty:
        "No standard workmanship warranty applies to emergency response scope given rapidly changing site conditions; any follow-up permanent removal/cleanup work quoted separately carries the applicable standard-assembly warranty.",
    },
    productionNotes: [
      "Typical crew: 2-3 dispatched for initial response; scale up if triage reveals a larger hazard than reported",
      "Billed hourly from arrival, often with an after-hours/emergency premium rate and a minimum call-out charge",
      "Dispatch priority should be triaged across simultaneous storm calls by immediate-danger severity, not first-call-first-served",
    ],
    pricingHooks: [
      { kind: "laborRate", refSlug: "tree-service.emergency-crew-lead", description: "Emergency-response crew lead / climber hourly rate (after-hours premium)", estimatedUnitOfMeasure: "HR" },
      { kind: "laborRate", refSlug: "tree-service.ground-laborer", description: "Ground crew hourly rate (after-hours premium)", estimatedUnitOfMeasure: "HR" },
      { kind: "equipment", refSlug: "tree-service.portable-lighting", description: "Portable floodlighting for after-dark response", estimatedUnitOfMeasure: "HR" },
      { kind: "childAssembly", refSlug: "tree-service.hauling.debris-haul-standard", description: "Follow-up full debris haul-off, if not completed same visit" },
    ],
    aiNotes: [
      "This assembly should always be flagged for human dispatcher triage, not auto-quoted end-to-end, given the immediate-danger and power-line-involvement variables",
      "Power-line involvement should hard-block any AI-suggested scheduling until utility coordination is confirmed",
      "Distinguish clearly from routine hazard-tree-removal in intake: this is active, urgent, already-failed/failing wood, not a standing assessment of future risk",
    ],
  },
];
