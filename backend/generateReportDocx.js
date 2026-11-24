const fs = require('fs');
const path = require('path');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  HeadingLevel,
  ShadingType,
} = require('docx');

const createCell = (text, isHeader = false, widthPercent = 25, isBold = false) => {
  return new TableCell({
    width: { size: widthPercent, type: WidthType.PERCENTAGE },
    shading: isHeader
      ? { fill: '1E293B', type: ShadingType.CLEAR }
      : { fill: 'F8FAFC', type: ShadingType.CLEAR },
    margins: { top: 120, bottom: 120, left: 140, right: 140 },
    children: [
      new Paragraph({
        alignment: isHeader ? AlignmentType.CENTER : AlignmentType.LEFT,
        children: [
          new TextRun({
            text,
            bold: isHeader || isBold,
            color: isHeader ? 'FFFFFF' : '0F172A',
            size: isHeader ? 20 : 19,
            font: 'Calibri',
          }),
        ],
      }),
    ],
  });
};

const createCodeBlock = (codeString) => {
  const lines = codeString.trim().split('\n');
  return lines.map(
    (line) =>
      new Paragraph({
        spacing: { before: 20, after: 20 },
        children: [
          new TextRun({
            text: line,
            font: 'Consolas',
            size: 16,
            color: '0F172A',
          }),
        ],
      })
  );
};

async function generateReport() {
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1000,
              right: 1000,
              bottom: 1000,
              left: 1000,
            },
          },
        },
        children: [
          // College Header
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 60 },
            children: [
              new TextRun({
                text: 'VELALAR COLLEGE OF ENGINEERING AND TECHNOLOGY, ERODE -12',
                bold: true,
                size: 26,
                font: 'Calibri',
                color: '1E3A8A',
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 60 },
            children: [
              new TextRun({
                text: '(AUTONOMOUS)',
                bold: true,
                size: 20,
                font: 'Calibri',
                color: '475569',
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 80 },
            children: [
              new TextRun({
                text: 'DEPARTMENT OF INFORMATION TECHNOLOGY',
                bold: true,
                size: 22,
                font: 'Calibri',
                color: '1E3A8A',
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 140 },
            children: [
              new TextRun({
                text: 'ACADEMIC YEAR: 2026 - 27 (ODD)',
                bold: true,
                size: 20,
                font: 'Calibri',
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: 'ACTIVITY - Project-Based Assessment',
                bold: true,
                size: 22,
                font: 'Calibri',
                underline: {},
                color: '0F172A',
              }),
            ],
          }),

          // Student Details Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createCell('NAME', true, 25),
                  createCell('HARISH G / GLADIAS LAWRANCE', false, 75, true),
                ],
              }),
              new TableRow({
                children: [
                  createCell('CLASS', true, 25),
                  createCell('24IT5A', false, 75),
                ],
              }),
              new TableRow({
                children: [
                  createCell('REG. NO', true, 25),
                  createCell('732924ITR030', false, 75, true),
                ],
              }),
              new TableRow({
                children: [
                  createCell('SUBJECT CODE', true, 25),
                  createCell('22ITT53', false, 75),
                ],
              }),
              new TableRow({
                children: [
                  createCell('SUBJECT NAME', true, 25),
                  createCell('FORMAL LANGUAGES AND AUTOMATA THEORY (FLAT)', false, 75, true),
                ],
              }),
              new TableRow({
                children: [
                  createCell('PROBLEM STATEMENT', true, 25),
                  createCell(
                    'Build a web application that simulates API traffic from multiple clients, detects excessive requests, identifies abusive behavior, and automatically manages client access using a Finite State Machine (FSM). Use finite automata to recognize rate-limiting thresholds and security policy breaches within a sliding time window. Display client identity, IP address, targeted endpoints, response status codes, detected abuse patterns, FSM transitions, and threat alerts on a web dashboard.',
                    false,
                    75
                  ),
                ],
              }),
              new TableRow({
                children: [
                  createCell('TITLE ASSIGNED', true, 25),
                  createCell(
                    'Rate Limiting and API Abuse Detection System (Aegis Gate)',
                    false,
                    75,
                    true
                  ),
                ],
              }),
            ],
          }),

          new Paragraph({ spacing: { before: 240 } }),

          // Section 1
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 100 },
            children: [
              new TextRun({
                text: '1. STATE DIAGRAM',
                bold: true,
                size: 24,
                font: 'Calibri',
                color: '1E3A8A',
              }),
            ],
          }),

          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 100, after: 80 },
            children: [
              new TextRun({
                text: '1.1 Introduction',
                bold: true,
                size: 22,
                font: 'Calibri',
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 120 },
            children: [
              new TextRun({
                text: 'A Deterministic Finite Automaton (DFA) / Finite State Machine (FSM) is used in the Rate Limiting and API Abuse Detection System to govern, classify, and regulate API client access postures in real time. It monitors the number of incoming API requests dispatched by each registered client identity or source IP address within a configurable sixty-second sliding time window (default quota: 20 requests).',
                font: 'Calibri',
                size: 20,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 140 },
            children: [
              new TextRun({
                text: 'The automaton starts from the initial baseline state S0 (NORMAL). Whenever request volumes reach or exceed 70% of capacity (14 requests), the DFA transitions to state S1 (WARNED). When request volumes reach or exceed 100% of capacity (20 requests), the DFA transitions to state S2 (THROTTLED), rejecting requests with HTTP 429 and triggering an active 30-second cooldown window. If a client commits persistent violations (3 or more rate limit breaches or security exploits such as path traversal), the DFA transitions to the final accepting alert state S3 (BLOCKED), rejecting all subsequent requests with HTTP 403 Forbidden until an administrator manually resets and unblocks the client.',
                font: 'Calibri',
                size: 20,
              }),
            ],
          }),

          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 100, after: 80 },
            children: [
              new TextRun({
                text: '1.2 States of the DFA',
                bold: true,
                size: 22,
                font: 'Calibri',
              }),
            ],
          }),

          // Table of States
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createCell('State Code', true, 20),
                  createCell('State Name', true, 25),
                  createCell('Operational Description', true, 35),
                  createCell('HTTP Action Policy', true, 20),
                ],
              }),
              new TableRow({
                children: [
                  createCell('S0', false, 20, true),
                  createCell('NORMAL (Initial)', false, 25),
                  createCell('Requests are below 70% of sliding quota (< 14 reqs)', false, 35),
                  createCell('HTTP 200 OK (Allowed)', false, 20),
                ],
              }),
              new TableRow({
                children: [
                  createCell('S1', false, 20, true),
                  createCell('WARNED', false, 25),
                  createCell('Requests between 70% and 99% of sliding quota (14 - 19 reqs)', false, 35),
                  createCell('HTTP 200 OK (Warning Telemetry)', false, 20),
                ],
              }),
              new TableRow({
                children: [
                  createCell('S2', false, 20, true),
                  createCell('THROTTLED', false, 25),
                  createCell('Requests reach 100% quota (>= 20 reqs); Cooldown active (30s)', false, 35),
                  createCell('HTTP 429 Too Many Requests', false, 20),
                ],
              }),
              new TableRow({
                children: [
                  createCell('S3', false, 20, true),
                  createCell('BLOCKED (Alert/Final)', false, 25),
                  createCell('Persistent violations (>= 3) or malicious path traversal attack', false, 35),
                  createCell('HTTP 403 Forbidden (Lockout)', false, 20),
                ],
              }),
            ],
          }),

          new Paragraph({ spacing: { before: 180 } }),

          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 100, after: 80 },
            children: [
              new TextRun({
                text: '1.3 State Diagram Representation',
                bold: true,
                size: 22,
                font: 'Calibri',
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 100 },
            children: [
              new TextRun({
                text: 'The DFA contains four operational states and monitors client request volumes and security rule compliance over sliding time windows.',
                font: 'Calibri',
                size: 20,
              }),
            ],
          }),

          // ASCII / Visual Diagram representation in docx
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    shading: { fill: '0B132B', type: ShadingType.CLEAR },
                    margins: { top: 160, bottom: 160, left: 180, right: 180 },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({
                            text: 'DETERMINISTIC FINITE AUTOMATON (DFA) STATE DIAGRAM',
                            bold: true,
                            font: 'Consolas',
                            size: 18,
                            color: '00F0FF',
                          }),
                        ],
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: '                                                                             \n' +
                                  '       [Requests < 70%]                                                      \n' +
                                  '           +-------+                                                         \n' +
                                  '           |       |                                                         \n' +
                                  '           v       |                                                         \n' +
                                  '   Start  +---------+    Req >= 70%     +---------+   Req >= 100%    +-----------+   \n' +
                                  '  ======> |   S0    | ----------------> |   S1    | ---------------> |    S2     |   \n' +
                                  '          | NORMAL  | <---------------- | WARNED  |                  | THROTTLED |   \n' +
                                  '          +---------+    Traffic < 70%  +---------+                  +-----------+   \n' +
                                  '               ^                                                           |         \n' +
                                  '               |                  Cooldown Expires & < 70%                 |         \n' +
                                  '               +-----------------------------------------------------------+         \n' +
                                  '               |                                                           |         \n' +
                                  '               |       Admin Manual Unblock                 Violations >= 3|         \n' +
                                  '               +===================================================+         \n' +
                                  '               |                                                   |         \n' +
                                  '               |                                                   v         \n' +
                                  '               |                                            ((     S3    ))  \n' +
                                  '               +------------------------------------------- ((  BLOCKED  ))  \n' +
                                  '                                                            (( (Alert)   ))  \n' +
                                  '                                                                   |         \n' +
                                  '                                                                   +----+    \n' +
                                  '                                                            Any Req|    |    \n' +
                                  '                                                            (403)  +<---+    ',
                            font: 'Consolas',
                            size: 15,
                            color: 'E2E8F0',
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({ spacing: { before: 180 } }),

          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 100, after: 80 },
            children: [
              new TextRun({
                text: '1.4 Formal Definition of DFA',
                bold: true,
                size: 22,
                font: 'Calibri',
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 100 },
            children: [
              new TextRun({
                text: 'A Deterministic Finite Automaton (DFA) is formally defined by the 5-tuple:',
                font: 'Calibri',
                size: 20,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 },
            children: [
              new TextRun({
                text: 'M = (Q, Σ, δ, q0, F)',
                bold: true,
                size: 22,
                font: 'Consolas',
                color: '1E3A8A',
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({
                text: 'Where:',
                bold: true,
                font: 'Calibri',
                size: 20,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 40 },
            children: [
              new TextRun({
                text: '• Q = Set of finite states = { S0, S1, S2, S3 }',
                bold: true,
                font: 'Calibri',
                size: 20,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 40 },
            children: [
              new TextRun({
                text: '• Σ = Input alphabet = { Req_Normal (<70%), Req_Warning (70-99%), Req_Limit (>=100%), Cooldown_Expired, Cooldown_Active, Violation_Threshold_Reached, Path_Traversal_Detected, Admin_Unblock }',
                font: 'Calibri',
                size: 20,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 40 },
            children: [
              new TextRun({
                text: '• δ : Q × Σ → Q = State transition function that maps a current state and incoming traffic condition to the next state.',
                font: 'Calibri',
                size: 20,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 40 },
            children: [
              new TextRun({
                text: '• q0 = S0 (NORMAL) = Initial start state.',
                font: 'Calibri',
                size: 20,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 140 },
            children: [
              new TextRun({
                text: '• F = { S3 (BLOCKED) } = Final accepting alert state where security lockouts and threat alerts are generated.',
                font: 'Calibri',
                size: 20,
              }),
            ],
          }),

          // Section 2
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 100 },
            children: [
              new TextRun({
                text: '2. TRANSITION DIAGRAM & TRANSITION TABLE',
                bold: true,
                size: 24,
                font: 'Calibri',
                color: '1E3A8A',
              }),
            ],
          }),

          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 100, after: 80 },
            children: [
              new TextRun({
                text: '2.1 Transition Table',
                bold: true,
                size: 22,
                font: 'Calibri',
              }),
            ],
          }),

          // Transition Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createCell('Rule', true, 10),
                  createCell('Current State', true, 20),
                  createCell('Input Condition', true, 30),
                  createCell('Next State', true, 15),
                  createCell('System Action & Response', true, 25),
                ],
              }),
              new TableRow({
                children: [
                  createCell('R1', false, 10, true),
                  createCell('S0 (NORMAL)', false, 20),
                  createCell('Requests < 70% in sliding window', false, 30),
                  createCell('S0', false, 15),
                  createCell('HTTP 200 OK; Baseline usage', false, 25),
                ],
              }),
              new TableRow({
                children: [
                  createCell('R2', false, 10, true),
                  createCell('S0 (NORMAL)', false, 20),
                  createCell('70% <= Requests < 100% of limit', false, 30),
                  createCell('S1', false, 15),
                  createCell('HTTP 200 OK; Warning telemetry', false, 25),
                ],
              }),
              new TableRow({
                children: [
                  createCell('R3', false, 10, true),
                  createCell('S0 (NORMAL)', false, 20),
                  createCell('Requests reach >= 100% quota', false, 30),
                  createCell('S2', false, 15),
                  createCell('HTTP 429 Too Many Requests; Cooldown 30s', false, 25),
                ],
              }),
              new TableRow({
                children: [
                  createCell('R4', false, 10, true),
                  createCell('S0 (NORMAL)', false, 20),
                  createCell('Path traversal attack or violations >= 3', false, 30),
                  createCell('S3', false, 15),
                  createCell('HTTP 403 Forbidden; Access revoked', false, 25),
                ],
              }),
              new TableRow({
                children: [
                  createCell('R5', false, 10, true),
                  createCell('S1 (WARNED)', false, 20),
                  createCell('Requests subside (< 70% in window)', false, 30),
                  createCell('S0', false, 15),
                  createCell('HTTP 200 OK; Clears warning state', false, 25),
                ],
              }),
              new TableRow({
                children: [
                  createCell('R6', false, 10, true),
                  createCell('S1 (WARNED)', false, 20),
                  createCell('70% <= Requests < 100%', false, 30),
                  createCell('S1', false, 15),
                  createCell('HTTP 200 OK; Maintained in WARNED', false, 25),
                ],
              }),
              new TableRow({
                children: [
                  createCell('R7', false, 10, true),
                  createCell('S1 (WARNED)', false, 20),
                  createCell('Requests reach >= 100%', false, 30),
                  createCell('S2', false, 15),
                  createCell('HTTP 429; Throttling initiated', false, 25),
                ],
              }),
              new TableRow({
                children: [
                  createCell('R8', false, 10, true),
                  createCell('S1 (WARNED)', false, 20),
                  createCell('Accumulated violations >= 3', false, 30),
                  createCell('S3', false, 15),
                  createCell('HTTP 403; Automated lockout', false, 25),
                ],
              }),
              new TableRow({
                children: [
                  createCell('R9', false, 10, true),
                  createCell('S2 (THROTTLED)', false, 20),
                  createCell('Request during active cooldown window', false, 30),
                  createCell('S2', false, 15),
                  createCell('HTTP 429; Remains throttled; Violations++', false, 25),
                ],
              }),
              new TableRow({
                children: [
                  createCell('R10', false, 10, true),
                  createCell('S2 (THROTTLED)', false, 20),
                  createCell('Cooldown expires & traffic < 70%', false, 30),
                  createCell('S0', false, 15),
                  createCell('HTTP 200 OK; Recovery to NORMAL', false, 25),
                ],
              }),
              new TableRow({
                children: [
                  createCell('R11', false, 10, true),
                  createCell('S2 (THROTTLED)', false, 20),
                  createCell('Cooldown expires & traffic 70%-99%', false, 30),
                  createCell('S1', false, 15),
                  createCell('HTTP 200 OK; Transitions to WARNED', false, 25),
                ],
              }),
              new TableRow({
                children: [
                  createCell('R12', false, 10, true),
                  createCell('S2 (THROTTLED)', false, 20),
                  createCell('Violations reach threshold (>= 3)', false, 30),
                  createCell('S3', false, 15),
                  createCell('HTTP 403 Forbidden; Escalates to BLOCKED', false, 25),
                ],
              }),
              new TableRow({
                children: [
                  createCell('R13', false, 10, true),
                  createCell('S3 (BLOCKED)', false, 20),
                  createCell('Any incoming request from client', false, 30),
                  createCell('S3', false, 15),
                  createCell('HTTP 403 Forbidden; Critical threat alert', false, 25),
                ],
              }),
              new TableRow({
                children: [
                  createCell('R14', false, 10, true),
                  createCell('S3 (BLOCKED)', false, 20),
                  createCell('Admin manually executes unblock', false, 30),
                  createCell('S0', false, 15),
                  createCell('HTTP 200 OK; Clears cooldown & violations', false, 25),
                ],
              }),
            ],
          }),

          new Paragraph({ spacing: { before: 180 } }),

          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 100, after: 80 },
            children: [
              new TextRun({
                text: '2.2 Example of State Transitions',
                bold: true,
                size: 22,
                font: 'Calibri',
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 120 },
            children: [
              new TextRun({
                text: 'Consider an active client (ID: client_beta_analytics, IP: 192.168.1.102) with a configured quota limit of 20 requests per 60-second sliding window:',
                font: 'Calibri',
                size: 20,
              }),
            ],
          }),

          // Step-by-Step Transition Example Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createCell('Step', true, 10),
                  createCell('Client ID', true, 22),
                  createCell('Endpoint / Action', true, 28),
                  createCell('Sliding Count', true, 18),
                  createCell('DFA State', true, 22),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Initial', false, 10, true),
                  createCell('client_beta_analytics', false, 22),
                  createCell('Client Registered', false, 28),
                  createCell('0 / 20 reqs', false, 18),
                  createCell('S0 (NORMAL)', false, 22, true),
                ],
              }),
              new TableRow({
                children: [
                  createCell('1', false, 10),
                  createCell('client_beta_analytics', false, 22),
                  createCell('GET /api/v1/orders (x 5)', false, 28),
                  createCell('5 / 20 reqs (25%)', false, 18),
                  createCell('S0 (NORMAL)', false, 22),
                ],
              }),
              new TableRow({
                children: [
                  createCell('2', false, 10),
                  createCell('client_beta_analytics', false, 22),
                  createCell('GET /api/v1/analytics (x 9)', false, 28),
                  createCell('14 / 20 reqs (70%)', false, 18),
                  createCell('S1 (WARNED)', false, 22, true),
                ],
              }),
              new TableRow({
                children: [
                  createCell('3', false, 10),
                  createCell('client_beta_analytics', false, 22),
                  createCell('GET /api/v1/analytics (x 6)', false, 28),
                  createCell('20 / 20 reqs (100%)', false, 18),
                  createCell('S2 (THROTTLED)', false, 22, true),
                ],
              }),
              new TableRow({
                children: [
                  createCell('4', false, 10),
                  createCell('client_beta_analytics', false, 22),
                  createCell('POST /api/v1/orders (Cooldown)', false, 28),
                  createCell('Cooldown Active', false, 18),
                  createCell('S2 (429 Rejected)', false, 22),
                ],
              }),
              new TableRow({
                children: [
                  createCell('5', false, 10),
                  createCell('client_beta_analytics', false, 22),
                  createCell('Repeated Spam (Violations=3)', false, 28),
                  createCell('Quota Breached', false, 18),
                  createCell('S3 (BLOCKED - 403)', false, 22, true),
                ],
              }),
              new TableRow({
                children: [
                  createCell('6', false, 10),
                  createCell('client_beta_analytics', false, 22),
                  createCell('Admin POST /api/clients/:id/unblock', false, 28),
                  createCell('Counters Reset', false, 18),
                  createCell('S0 (NORMAL Restored)', false, 22, true),
                ],
              }),
            ],
          }),

          new Paragraph({ spacing: { before: 180 } }),

          // Section 3
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 100 },
            children: [
              new TextRun({
                text: '3. CODE IMPLEMENTATION',
                bold: true,
                size: 24,
                font: 'Calibri',
                color: '1E3A8A',
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 100 },
            children: [
              new TextRun({
                text: 'File Name: backend/services/fsmService.js',
                bold: true,
                font: 'Consolas',
                size: 20,
                color: '0369A1',
              }),
            ],
          }),

          // Code Box
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    shading: { fill: 'F1F5F9', type: ShadingType.CLEAR },
                    margins: { top: 120, bottom: 120, left: 140, right: 140 },
                    children: createCodeBlock(
                      'const { v4: uuidv4 } = require("uuid");\n' +
                      'const StateTransition = require("../models/StateTransition");\n\n' +
                      'const FSM_STATES = {\n' +
                      '  NORMAL: "NORMAL",\n' +
                      '  WARNED: "WARNED",\n' +
                      '  THROTTLED: "THROTTLED",\n' +
                      '  BLOCKED: "BLOCKED",\n' +
                      '};\n\n' +
                      '// Deterministic DFA Transition Function\n' +
                      'const computeNextState = ({\n' +
                      '  client,\n' +
                      '  slidingWindowCount,\n' +
                      '  settings,\n' +
                      '  isManualUnblock = false,\n' +
                      '  overrideReason = null,\n' +
                      '}) => {\n' +
                      '  const currentState = client.currentState || FSM_STATES.NORMAL;\n' +
                      '  const now = new Date();\n' +
                      '  const limit = client.requestLimit || settings.requestLimit || 20;\n' +
                      '  const warningCount = Math.floor((settings.warningThreshold / 100) * limit);\n' +
                      '  const autoBlockThreshold = settings.autoBlockThreshold || 3;\n' +
                      '  const currentViolations = client.violationCount || 0;\n\n' +
                      '  // Case 0: Admin Manual Unblock Operation\n' +
                      '  if (isManualUnblock) {\n' +
                      '    return {\n' +
                      '      nextState: FSM_STATES.NORMAL,\n' +
                      '      stateChanged: currentState !== FSM_STATES.NORMAL,\n' +
                      '      reason: overrideReason || "Admin manually unblocked client and reset counters",\n' +
                      '      cooldownUntil: null,\n' +
                      '      resetViolations: true,\n' +
                      '    };\n' +
                      '  }\n\n' +
                      '  // Case 1: Client is already BLOCKED (S3)\n' +
                      '  if (currentState === FSM_STATES.BLOCKED) {\n' +
                      '    return {\n' +
                      '      nextState: FSM_STATES.BLOCKED,\n' +
                      '      stateChanged: false,\n' +
                      '      reason: "Client remains BLOCKED until administrator manual unblock",\n' +
                      '      cooldownUntil: null,\n' +
                      '    };\n' +
                      '  }\n\n' +
                      '  // Automated escalation to BLOCKED\n' +
                      '  if (currentViolations >= autoBlockThreshold) {\n' +
                      '    return {\n' +
                      '      nextState: FSM_STATES.BLOCKED,\n' +
                      '      stateChanged: currentState !== FSM_STATES.BLOCKED,\n' +
                      '      reason: `Automated lockout: ${currentViolations} violations exceeded threshold`,\n' +
                      '      cooldownUntil: null,\n' +
                      '    };\n' +
                      '  }\n\n' +
                      '  // Case 2: Client is currently THROTTLED (S2)\n' +
                      '  if (currentState === FSM_STATES.THROTTLED) {\n' +
                      '    const isUnderCooldown = client.cooldownUntil && new Date(client.cooldownUntil) > now;\n' +
                      '    if (isUnderCooldown) {\n' +
                      '      return {\n' +
                      '        nextState: FSM_STATES.THROTTLED,\n' +
                      '        stateChanged: false,\n' +
                      '        reason: `Client active in cooldown until ${new Date(client.cooldownUntil).toISOString()}`,\n' +
                      '        cooldownUntil: client.cooldownUntil,\n' +
                      '      };\n' +
                      '    }\n\n' +
                      '    // Cooldown expired: check recovery\n' +
                      '    if (slidingWindowCount < warningCount) {\n' +
                      '      return {\n' +
                      '        nextState: FSM_STATES.NORMAL,\n' +
                      '        stateChanged: true,\n' +
                      '        reason: `Cooldown expired and traffic recovered below threshold (${slidingWindowCount}/${limit})`,\n' +
                      '        cooldownUntil: null,\n' +
                      '      };\n' +
                      '    } else if (slidingWindowCount < limit) {\n' +
                      '      return {\n' +
                      '        nextState: FSM_STATES.WARNED,\n' +
                      '        stateChanged: true,\n' +
                      '        reason: `Cooldown expired; traffic elevated at warning level (${slidingWindowCount}/${limit})`,\n' +
                      '        cooldownUntil: null,\n' +
                      '      };\n' +
                      '    }\n' +
                      '  }\n\n' +
                      '  // Case 3: NORMAL or WARNED\n' +
                      '  if (slidingWindowCount >= limit) {\n' +
                      '    const newCooldown = new Date(now.getTime() + settings.cooldownDuration * 1000);\n' +
                      '    return {\n' +
                      '      nextState: FSM_STATES.THROTTLED,\n' +
                      '      stateChanged: true,\n' +
                      '      reason: `Rate limit ceiling reached (${slidingWindowCount}/${limit}). Cooldown initiated.`,\n' +
                      '      cooldownUntil: newCooldown,\n' +
                      '      violationIncrement: 1,\n' +
                      '    };\n' +
                      '  }\n\n' +
                      '  if (slidingWindowCount >= warningCount) {\n' +
                      '    return {\n' +
                      '      nextState: FSM_STATES.WARNED,\n' +
                      '      stateChanged: currentState !== FSM_STATES.WARNED,\n' +
                      '      reason: `Request rate reached 70% threshold (${slidingWindowCount}/${limit})`,\n' +
                      '      cooldownUntil: null,\n' +
                      '    };\n' +
                      '  }\n\n' +
                      '  return {\n' +
                      '    nextState: FSM_STATES.NORMAL,\n' +
                      '    stateChanged: currentState !== FSM_STATES.NORMAL,\n' +
                      '    reason: `Traffic within safe baseline capacity (< 70% of ${limit} reqs)`,\n' +
                      '    cooldownUntil: null,\n' +
                      '  };\n' +
                      '};\n\n' +
                      'module.exports = { FSM_STATES, computeNextState };'
                    ),
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({ spacing: { before: 180 } }),

          // Section 4
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 100 },
            children: [
              new TextRun({
                text: '4. OUTPUT RESULTS',
                bold: true,
                size: 24,
                font: 'Calibri',
                color: '1E3A8A',
              }),
            ],
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    shading: { fill: '0B132B', type: ShadingType.CLEAR },
                    margins: { top: 120, bottom: 120, left: 140, right: 140 },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text:
                              '===============================================================\n' +
                              '   STARTING AUTOMATED VERIFICATION: FSM & RATE LIMIT SUITE     \n' +
                              '===============================================================\n' +
                              '[MongoDB Connected] Host: 127.0.0.1, DB: ratelimit_db\n\n' +
                              '[TEST 1] Scenario 1: Normal requests (< 70% limit)\n' +
                              '  PASS: Client remains in NORMAL state (4/10 requests) -> HTTP 200 OK\n\n' +
                              '[TEST 2] Scenario 2: Client reaches 70% threshold (WARNED)\n' +
                              '  PASS: Transitioned to WARNED state at 70% capacity (7/10) -> HTTP 200 OK\n\n' +
                              '[TEST 3] Scenario 3: Client reaches request limit (THROTTLED)\n' +
                              '  PASS: Transitioned to THROTTLED state with active cooldown -> HTTP 429\n\n' +
                              '[TEST 4] Scenario 4: Repeated violations exceed threshold (BLOCKED)\n' +
                              '  PASS: Client escalated to BLOCKED due to repeated violations -> HTTP 403\n\n' +
                              '[TEST 5] Scenario 5: Blocked client sends request (HTTP 403 rejection)\n' +
                              '  PASS: Blocked client request rejected with HTTP 403 Forbidden\n' +
                              '  ALERT: CRITICAL - Blocked client attempted unauthorized API invocation!\n\n' +
                              '[TEST 6] Scenario 6: Admin manual unblock operation\n' +
                              '  PASS: Client unblocked and safely restored to NORMAL state\n\n' +
                              '[TEST 7] Scenario 7: Regex endpoint & traversal validation\n' +
                              '  PASS: Regex validation properly permitted clean URL and rejected path traversal & malformed inputs\n' +
                              '  ALERT: CRITICAL - Path traversal exploit sequence "../" intercepted!\n\n' +
                              '===============================================================\n' +
                              '   TEST RESULTS: 7/7 SCENARIOS PASSED (100% SUCCESS RATE)      \n' +
                              '===============================================================',
                            font: 'Consolas',
                            size: 16,
                            color: '00F0FF',
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({ spacing: { before: 180 } }),

          // Section 5
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 100 },
            children: [
              new TextRun({
                text: '5. PROCEDURE STEPS',
                bold: true,
                size: 24,
                font: 'Calibri',
                color: '1E3A8A',
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({
                text: '1. Start the MongoDB database service to establish database persistence for users, clients, requests, threat alerts, and FSM transition logs.',
                font: 'Calibri',
                size: 20,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({
                text: '2. Open the project folder in Visual Studio Code or terminal and configure the environment settings in backend/.env (PORT=5000, MONGODB_URI, JWT_SECRET, ADMIN_EMAIL).',
                font: 'Calibri',
                size: 20,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({
                text: '3. Run database seed script (npm run seed) to create the default SecOps administrator, initial sample clients across all 4 FSM states, baseline system settings, and historical threat alerts.',
                font: 'Calibri',
                size: 20,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({
                text: '4. Execute automated verification test suite (npm test) to validate all 7 deterministic state transitions, regex validations, and abuse detection rules.',
                font: 'Calibri',
                size: 20,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({
                text: '5. Start the Express.js backend server (npm run backend on Port 5000) and the React.js Vite frontend server (npm run frontend on Port 5173).',
                font: 'Calibri',
                size: 20,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({
                text: '6. Open web browser and access http://localhost:5173/login. Authenticate using default admin credentials (admin@security.local / Admin@123456).',
                font: 'Calibri',
                size: 20,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({
                text: '7. View real-time security dashboard featuring Total API Calls, Active Clients, Blocked Clients, Throttled Clients, Abuse Alerts, and live Recharts.',
                font: 'Calibri',
                size: 20,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({
                text: '8. Navigate to the API Request Simulator. Select a client, configure endpoint, HTTP method, and dispatch requests (Single, 5, 10, 50, or Continuous Traffic Stream).',
                font: 'Calibri',
                size: 20,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({
                text: '9. Observe deterministic state transitions from S0 (NORMAL) to S1 (WARNED), S2 (THROTTLED), and S3 (BLOCKED) with real-time response telemetry.',
                font: 'Calibri',
                size: 20,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({
                text: '10. Navigate to FSM Visualization page to inspect the interactive State Transition Topology diagram, active client distribution badges, and the formal 14-rule Transition Matrix.',
                font: 'Calibri',
                size: 20,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({
                text: '11. Navigate to Abuse Alerts page to review logged security threats and execute administrative status resolution (Unresolved, Acknowledged, Resolved).',
                font: 'Calibri',
                size: 20,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 140 },
            children: [
              new TextRun({
                text: '12. Navigate to Client Management page to test administrative unblock operations and verify client restoration back to S0 (NORMAL) state.',
                font: 'Calibri',
                size: 20,
              }),
            ],
          }),

          // Section 6
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 100 },
            children: [
              new TextRun({
                text: '6. ADVANTAGES OF USING FLAT CONCEPT IN RATE LIMITING & ABUSE DETECTION',
                bold: true,
                size: 24,
                font: 'Calibri',
                color: '1E3A8A',
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({
                text: '• Pattern Recognition: ',
                bold: true,
                font: 'Calibri',
                size: 20,
              }),
              new TextRun({
                text: 'Recognizes sequential high-frequency bursts, abnormal request velocity, and unauthorized endpoint probing via deterministic state machines.',
                font: 'Calibri',
                size: 20,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({
                text: '• Deterministic Control: ',
                bold: true,
                font: 'Calibri',
                size: 20,
              }),
              new TextRun({
                text: 'Eliminates race conditions and unpredictable policy enforcement by strictly binding client access permissions to formal automaton state definitions.',
                font: 'Calibri',
                size: 20,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({
                text: '• Fast Processing: ',
                bold: true,
                font: 'Calibri',
                size: 20,
              }),
              new TextRun({
                text: 'Evaluates client state in O(1) computational complexity during request lifecycle using indexed sliding-window query bounds.',
                font: 'Calibri',
                size: 20,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({
                text: '• Accurate Sliding-Window Tracking: ',
                bold: true,
                font: 'Calibri',
                size: 20,
              }),
              new TextRun({
                text: 'Calculates true temporal request rates over 60-second rolling horizons, preventing perimeter boundary exploitation common in fixed-window algorithms.',
                font: 'Calibri',
                size: 20,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 120 },
            children: [
              new TextRun({
                text: '• Automated Escalation & Recovery: ',
                bold: true,
                font: 'Calibri',
                size: 20,
              }),
              new TextRun({
                text: 'Enforces graduated penalties (Warning -> Throttling -> Permanent Block) while allowing automatic baseline recovery when client traffic slows down.',
                font: 'Calibri',
                size: 20,
              }),
            ],
          }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const outPath1 = path.join(__dirname, '../Rate_Limiting_and_API_Abuse_Detection_System_Report.docx');
  const outPath2 = path.join(__dirname, '../docs/Rate_Limiting_and_API_Abuse_Detection_System_Report.docx');

  fs.writeFileSync(outPath1, buffer);
  fs.writeFileSync(outPath2, buffer);

  console.log(`[Success] Word document generated successfully at:`);
  console.log(`  -> ${outPath1}`);
  console.log(`  -> ${outPath2}`);
}

generateReport().catch(console.error);
