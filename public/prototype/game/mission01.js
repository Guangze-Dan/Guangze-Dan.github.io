/* CAES: THE LAST SEAL — Mission 01 configuration.
   Everything the mission layer needs to run without touching the measurement
   core: props, documents, stages, objectives, SOP steps, hints, combine rules.
   Fault class and thresholds come from the existing physics model, not from
   here — this file never overrides a threshold. ?fault= picks the variant. */

export const MISSION01 = {
  id: 'mission_01_the_leak',
  title: 'MISSION 01 — THE LEAK',
  subtitle: 'An immersive seal-failure investigation · simulated training',

  /* the defect the physics model will run. ?fault= overrides, 'random' draws */
  fault: 'crown',
  startDamage: 0.12,

  brief: [
    'You are on duty at test bay CAES-04. A lined-cavern pressure test is in progress.',
    'Cycle 480 is running and the shift log flags something on the lining.',
    'Walk the bay. Read the log, find the area, sample it, read the channels, and decide.',
    'If the situation escalates you will run SOP-07 — the controlled vent-down.',
    'This is a simulated training exercise. It is not an operating procedure for real plant.'
  ],

  /* four physically distinct defect variants. The shift log and the suspicious
     area change with the fault; the physics model already produces different
     channel signatures for each (kF and the LVDT / seepage terms differ). */
  faults: {
    crown: {
      area: [-0.68, 1.90, 1.75],
      log: [
        'SHIFT LOG — CAES-04 · CYCLE 480',
        '',
        '04:10  Cycle 478 complete. All channels nominal.',
        '06:35  Cycle 479: AE count up 12% vs previous cycle.',
        '        FBG index 1.08 — within band, no action.',
        '09:02  Cycle 480 in progress. Faint marking observed',
        '        along the CROWN SEAM, section B2 (top of the',
        '        front wall). No drip. Humidity 76%.',
        '09:20  AE rate 17 / cycle and climbing. Index 1.42.',
        '',
        'FLAG   Repeat next cycle. ESCALATE if index > 1.60',
        '        or AE > 15 / cycle.',
        '',
        'Section B2 = second panel from the north end.'
      ],
      evidence: {
        id: 'ev_log',
        title: 'Shift log: marking on the crown seam, AE climbing across cycles 478-480',
        note: 'Points at a location and gives the escalation thresholds.'
      }
    },
    crack: {
      area: [-1.10, 1.30, 1.75],
      log: [
        'SHIFT LOG — CAES-04 · CYCLE 480',
        '',
        '05:40  Cycle 478 complete. All channels nominal.',
        '07:15  Cycle 479: AE shows short bursts, 6 / cycle.',
        '        FBG index 1.12 — within band.',
        '09:02  Cycle 480 in progress. A HAIRLINE CRACK is visible',
        '        on the liner face, section B2, about one metre',
        '        above the plinth. Edges sharp, no branching.',
        '09:20  AE bursts now 14 / cycle. Index 1.38.',
        '',
        'FLAG   ESCALATE if index > 1.60 or AE > 15 / cycle.',
        '',
        'Section B2 = second panel from the north end.'
      ],
      evidence: {
        id: 'ev_log',
        title: 'Shift log: hairline crack on the liner face, AE arriving in bursts',
        note: 'Points at a location and gives the escalation thresholds.'
      }
    },
    seam: {
      area: [-2.05, 1.10, 1.75],
      log: [
        'SHIFT LOG — CAES-04 · CYCLE 480',
        '',
        '04:10  Cycle 478 complete. All channels nominal.',
        '06:35  Cycle 479: trace of moisture at the north end.',
        '        FBG index 1.04 — within band. LVDT 0.31 mm.',
        '09:02  Cycle 480 in progress. SEEPAGE along the VERTICAL',
        '        SEAM, section B2 north end. 0.3 L/min, steady.',
        '        Pore pressure 180 kPa and rising.',
        '09:20  Seepage 0.5 L/min. Index 1.21. LVDT 0.36 mm.',
        '',
        'FLAG   ESCALATE if seepage > 0.8 L/min or index > 1.60.',
        '',
        'Section B2 = second panel from the north end.'
      ],
      evidence: {
        id: 'ev_log',
        title: 'Shift log: seepage along the vertical seam at the north end, pore pressure rising',
        note: 'Points at a location; seepage is the headline reading here.'
      }
    },
    support: {
      area: [-2.10, 0.50, 1.74],
      log: [
        'SHIFT LOG — CAES-04 · CYCLE 480',
        '',
        '03:20  Cycle 478 complete. LVDT 0.34 mm — a little high.',
        '06:35  Cycle 479: LVDT 0.44 mm. Strain normal (1.06).',
        '        The two channels do not agree. Cross-check.',
        '09:02  Cycle 480 in progress. The NORTH SUPPORT looks',
        '        settled: liner lifted clear at the bearing,',
        '        gap visible. Deformation mostly radial.',
        '09:20  LVDT 0.58 mm and climbing. Index still 1.24.',
        '',
        'FLAG   Large drift + modest strain = support problem.',
        '        ESCALATE if LVDT > 0.50 mm.',
        '',
        'Section B2 = second panel from the north end.'
      ],
      evidence: {
        id: 'ev_log',
        title: 'Shift log: north support settled — LVDT drift with modest strain, channels disagree',
        note: 'The classic cross-reading case: deformation without strain.'
      }
    }
  },

  /* documents and props. positions are on / beside the workbench, human scale.
     Bench approach points are chosen so the intended prop is always the
     nearest interactable (the walk ray passes above bench-level items). */
  items: [
    {
      id: 'asset_tag',
      name: 'Asset plate · CAES-04',
      kind: 'inspect',
      pos: [0.62, 1.21, 1.745], size: [0.30, 0.17],
      pages: [[
        'ASSET PLATE — CAES-04',
        '',
        'Lined cavern test rig · 3.0 × 1.6 × 1.8 m',
        'Q345B · 15 mm plate · M10 mortar liner',
        'Max working pressure 8.0 MPa',
        'Liner + seal · section B2',
        'Inspection interval: monthly',
        '',
        'This rig is under a pressure test. Do not open the seal below 0.0 MPa.'
      ]],
      evidence: {
        id: 'ev_asset',
        title: 'Asset CAES-04 — liner + seal, section B2, monthly inspection',
        note: 'Confirms which section the shift log is talking about.'
      }
    },
    {
      id: 'clipboard',
      name: 'Inspection Clipboard',
      kind: 'read',
      pos: [-2.80, 0.925, 3.72], rot: 0.30, size: [0.30, 0.42],
      pages: 'LOG',                       /* resolved from faults[fault].log */
      evidence: 'LOG'
    },
    {
      id: 'sensor_map',
      name: 'Sensor Map',
      kind: 'read',
      pos: [-2.51, 0.925, 4.06], rot: -0.20, size: [0.34, 0.26],
      pages: [[
        'SENSOR LAYOUT — CAES-04 (section B2)',
        '',
        'FBG-01..08   strain, micro-eps   bonded to the liner, inner face',
        'AE-01..04    events / cycle      coupling pads: crown + seams',
        'LVDT-01..02  mm                  radial deformation, N / S',
        'PT-01        MPa                 cavity pressure, gas side',
        '',
        'CROSS-READING RULE',
        'One channel alone never identifies a defect.',
        'Strain + AE rise together for an opening defect.',
        'Large LVDT drift with modest strain suggests lost',
        'back-support rather than a new crack.',
        'Seepage at a seam points to joint weakness.'
      ]],
      evidence: {
        id: 'ev_map',
        title: 'Sensor map: FBG strain, AE events, LVDT drift, PT pressure — and the cross-reading rule',
        note: 'Tells you which channel means what, and that no single channel decides.'
      }
    },
    {
      id: 'manual',
      name: 'Equipment Manual',
      kind: 'read',
      pos: [-2.22, 0.925, 3.90], rot: 0.12, size: [0.28, 0.36],
      pages: [[
        'READING THE CHANNELS',
        '',
        'FBG (micro-eps)',
        '  Circumferential strain at the liner wall. Rises with',
        '  internal pressure; a defect makes it rise FASTER.',
        '',
        'AE (events / cycle)',
        '  Elastic waves released by damage. Background 2-4.',
        '  Sustained growth = active damage.',
        '',
        'LVDT (mm)',
        '  Radial deformation. Large drift with modest strain',
        '  suggests loss of back-support, not a new crack.',
        '',
        'PT (MPa)',
        '  Cavity pressure. Everything is read against it.',
        '',
        'ACT-NOW THRESHOLDS',
        '  index 1.60   ·   AE 15 / cycle   ·   LVDT 0.50 mm'
      ]],
      evidence: {
        id: 'ev_manual',
        title: 'Manual: what each channel means and the act-now thresholds',
        note: 'The reading key for the diagnosis.'
      }
    },
    {
      id: 'sop_card',
      name: 'SOP-07 Card',
      kind: 'read',
      pos: [-1.93, 0.925, 3.74], rot: -0.28, size: [0.22, 0.30],
      pages: [[
        'SOP-07 — CONTROLLED VENT-DOWN',
        '',
        '1  Isolate the loading pump        pump isolation switch',
        '2  Open the vent valve - slow      handwheel, hold to turn',
        '3  Verify the pressure fall        gauge',
        '4  Lock-out / tag-out              LOTO station',
        '5  Confirm 0.0 MPa & log           gauge + log',
        '',
        'Never open the seal below 0.0 MPa.',
        'Simulated training exercise - not an operating procedure.'
      ]],
      evidence: {
        id: 'ev_sop',
        title: 'SOP-07 card: five steps of the controlled vent-down, in order',
        note: 'The procedure you will be asked to perform.'
      }
    },

    /* --- tools (GDD appendix A: P1 / P2) --- */
    {
      /* y values sit each item exactly on its shelf top (0.4375 / 0.9675 /
         1.4975) — the old numbers sank the torch into the shelf and left the
         helmet hanging 2.5 cm in the air */
      id: 'flashlight', name: 'Flashlight', kind: 'tool',
      pos: [-3.48, 0.471, 2.36], rot: 1.5708, size: [0.26, 0.07], tier: 0,
      prompt: 'press E to take the flashlight · E again to switch it',
      evidence: null
    },
    {
      id: 'helmet', name: 'Safety Helmet', kind: 'tool',
      pos: [-3.48, 0.4375, 2.72], rot: -0.4, size: [0.24, 0.14], tier: 0,
      prompt: 'press E to put the helmet on',
      evidence: null
    },
    {
      id: 'data_module', name: 'Data Module', kind: 'tool',
      pos: [-3.48, 0.978, 2.36], rot: 0.2, size: [0.14, 0.09], tier: 1,
      prompt: 'press E to take the data module',
      evidence: null
    },
    {
      id: 'ut_scanner', name: 'UT Flaw Scanner', kind: 'tool',
      pos: [-3.48, 1.554, 2.36], rot: -0.5, size: [0.30, 0.12], tier: 2,
      prompt: 'press E to take the UT scanner',
      evidence: null
    }
  ],

  /* fixed fixtures the player must walk to (reachable, outside the AABBs) */
  fixtures: [
    {
      id: 'pump_switch', name: 'Pump Isolation Switch', kind: 'use',
      pos: [-4.30, 0.00, 2.30],
      prompt: 'press E to isolate the loading pump'
    },
    {
      id: 'loto_station', name: 'Lock-out / Tag-out Station', kind: 'use',
      pos: [-4.30, 0.00, 3.90],
      prompt: 'press E to apply lock-out / tag-out'
    },
    {
      id: 'terminal', name: 'Monitoring Terminal', kind: 'use',
      pos: [-4.30, 0.00, 3.10],
      prompt: 'press E to open the monitoring terminal'
    }
  ],

  /* where the shift log points, per fault. The ring only appears once the log
     has been read — reading gives you the location, not the diagnosis. */
  suspicious: { within: 2.0 },

  stages: [
    {
      id: 'briefing', title: 'Briefing',
      objectives: [{ id: 'start', type: 'confirm', label: 'Read the briefing and confirm' }]
    },
    {
      id: 'entry', title: 'The Entry',
      objectives: [
        { id: 'read_asset_info', type: 'inspect', target: 'asset_tag', label: 'Check the asset plate on the chamber' },
        { id: 'read_inspection_log', type: 'read', target: 'clipboard', label: 'Read the inspection clipboard' }
      ]
    },
    {
      id: 'investigation', title: 'The Investigation',
      objectives: [
        { id: 'read_sensor_map', type: 'read', target: 'sensor_map', label: 'Open the sensor map' },
        { id: 'take_flashlight', type: 'pickup', target: 'flashlight', label: 'Take the flashlight from the bench' },
        { id: 'locate_area', type: 'locate', label: 'Find the area the shift log points at' }
      ]
    },
    {
      id: 'evidence', title: 'The Evidence',
      objectives: [
        { id: 'collect_probe', type: 'pickup', target: 'probe', label: 'Pick up the handheld probe' },
        { id: 'sample_target', type: 'sample', label: 'Sample the chamber with the probe' },
        { id: 'review_channels', type: 'read', target: 'manual', label: 'Read what the four channels mean' },
        { id: 'open_terminal', type: 'terminal', label: 'Log the readings on the monitoring terminal' },
        { id: 'scan_liner', type: 'scan', label: 'Scan the liner with the UT flaw scanner' }
      ]
    },
    {
      id: 'diagnosis', title: 'The Diagnosis',
      objectives: [{ id: 'submit_diagnosis', type: 'diagnose', label: 'Commit a defect hypothesis, an action and your confidence' }]
    },
    {
      id: 'response', title: 'The Last Decision',
      objectives: [{ id: 'perform_response', type: 'sop', label: 'Run SOP-07 — the controlled vent-down' }]
    },
    {
      id: 'debrief', title: 'Debriefing',
      objectives: [{ id: 'complete_debriefing', type: 'confirm', label: 'Review the debrief and rate your workload' }]
    }
  ],

  hypotheses: ['crown', 'crack', 'seam', 'support'],
  hypothesisLabels: {
    crown: 'Crown voiding — top of the liner',
    crack: 'Crack opening — liner face',
    seam: 'Seam weakness — bonded joint',
    support: 'Loss of back-support'
  },
  actions: ['Log & monitor', 'Increase sweep', 'Emergency vent'],

  sop: [
    { id: 'isolate', label: 'Isolate the loading pump', target: 'pump_switch' },
    { id: 'vent', label: 'Open the vent valve — slow', target: 'valve', hold: 1.4 },
    { id: 'verify', label: 'Verify the pressure fall', target: 'gauge' },
    { id: 'loto', label: 'Lock-out / tag-out', target: 'loto_station' },
    { id: 'confirm', label: 'Confirm 0.0 MPa & log', target: 'gauge' }
  ],

  /* item combinations, checked every frame between held / collected / focus */
  combines: [
    {
      id: 'map_probe', a: 'sensor_map', b: 'probe',
      once: 'map_probe_done',
      message: 'Sensor map cross-referenced — the sample target is marked on the wall.'
    },
    {
      id: 'module_terminal', a: 'data_module', b: 'terminal',
      once: 'module_terminal_done',
      message: 'Data module seated — monitoring terminal unlocked.'
    }
  ],

  tlx: [
    ['Mental demand', 'How hard did you have to think?'],
    ['Physical demand', 'How much walking and handling did it take?'],
    ['Temporal demand', 'How hurried did you feel?'],
    ['Performance', 'How successful do you think you were?'],
    ['Effort', 'How hard did you have to work?'],
    ['Frustration', 'How insecure or annoyed did you feel?']
  ],

  hints: {
    briefing: [
      'Open the briefing panel and confirm to begin.',
      'The briefing lists what the shift expects from you tonight.',
      'The bay is yours to walk. Nothing happens until you confirm.'
    ],
    entry: [
      'Everything you need tonight is written down somewhere.',
      'Start with the asset plate on the chamber, then the clipboard on the bench.',
      'The asset plate tells you what CAES-04 is; the clipboard tells you what is wrong.'
    ],
    investigation: [
      'The log names a place. The sensor map tells you what is measured there.',
      'Take the flashlight too — the far corner of the bay is poorly lit.',
      'Walk to the marked ring on the front wall; the map explains the channels.'
    ],
    evidence: [
      'The probe on the bench is yours. Take it to the marked area.',
      'Aim at the wall, press E, and read what comes back.',
      'The UT scanner opens the liner to view — sweep it slowly.',
      'The manual explains each channel; the thresholds are at the bottom.'
    ],
    diagnosis: [
      'Compare the channels against each other before you commit.',
      'Strain and AE together point at an opening defect; drift alone points at support.',
      'Commit the defect, the action and how sure you are — all three are logged.'
    ],
    response: [
      'SOP-07 has five steps. The card in your kit lists them in order.',
      'Isolate first: nothing moves until the pump is out of the circuit.',
      'Follow the card. The gauge will confirm each step for you.'
    ],
    debrief: [
      'The debrief shows what you did and what it means.',
      'Look at which evidence you used, and which you skipped.',
      'Confidence that outruns evidence is the thing to fix next time.'
    ]
  }
};
