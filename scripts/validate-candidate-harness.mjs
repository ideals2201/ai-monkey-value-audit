import fs from 'node:fs';

const path = new URL('../downloads/candidate-intake-reliability-harness.n8n.json', import.meta.url);
const workflow = JSON.parse(fs.readFileSync(path, 'utf8'));
const fixturesNode = workflow.nodes.find((node) => node.name === 'Synthetic fixtures');
const assertionsNode = workflow.nodes.find((node) => node.name === 'Normalize and assert contracts');
if (!fixturesNode || !assertionsNode) throw new Error('Required Code nodes are missing');

const run = (code, input = []) => Function('$input', code)({ all: () => input });
const fixtures = run(fixturesNode.parameters.jsCode);
const report = run(assertionsNode.parameters.jsCode, fixtures);

if (workflow.active !== false) throw new Error('Download must be inactive on import');
if (workflow.nodes.some((node) => node.credentials)) throw new Error('Download must not contain credentials');
if (report.length !== 1 || report[0].json.passed !== 6 || report[0].json.failed !== 0) {
  throw new Error(`Unexpected report: ${JSON.stringify(report)}`);
}

console.log(JSON.stringify({ nodes: workflow.nodes.length, fixtures: fixtures.length, ...report[0].json }, null, 2));
