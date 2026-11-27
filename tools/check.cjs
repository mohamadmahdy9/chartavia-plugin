#!/usr/bin/env node
// Checks and test-runs a Via script with the same compiler and runtime Chartavia uses.
//   node tools/check.cjs my-script.via --run [--ar] [--json] [--bars data.csv]
require("../plugins/chartavia/skills/via/scripts/check.cjs");
