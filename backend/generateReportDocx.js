const fs = require('fs');
const path = require('path');
const { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel } = require('docx');

async function generateReportNoTables() {
  const children = [];

  // Helper for title lines
  const addHeaderLine = (text, size = 22, bold = true, color = '000000', alignment = AlignmentType.CENTER) => {
    children.push(
      new Paragraph({
        alignment,
        spacing: { before: 40, after: 40 },
        children: [
          new TextRun({
            text,
            bold,
            size,
            font: 'Calibri',
            color,
          }),
        ],
      })
    );
  };

  // Helper for metadata lines (NAME : ..., CLASS: ..., etc.)
  const addMetaLine = (label, value) => {
    children.push(
      new Paragraph({
        spacing: { before: 60, after: 60 },
        children: [
          new TextRun({
            text: label.padEnd(20, ' '),
            bold: true,
            size: 20,
            font: 'Calibri',
          }),
          new TextRun({
            text: `: ${value}`,
            size: 20,
            font: 'Calibri',
          }),
        ],
      })
    );
  };

  // Helper for body text paragraphs
  const addPara = (text, spacingAfter = 100, bold = false) => {
    children.push(
      new Paragraph({
        spacing: { before: 40, after: spacingAfter },
        children: [
          new TextRun({
            text,
            size: 20,
            font: 'Calibri',
            bold,
          }),
        ],
      })
    );
  };

  // Helper for headings
  const addHeading = (text, level = HeadingLevel.HEADING_1) => {
    children.push(
      new Paragraph({
        heading: level,
        spacing: { before: 180, after: 100 },
        children: [
          new TextRun({
            text,
            bold: true,
            size: level === HeadingLevel.HEADING_1 ? 24 : 22,
            font: 'Calibri',
            color: '000000',
          }),
        ],
      })
    );
  };

  // Helper for bullet items
  const addBullet = (bulletText, normalText) => {
    children.push(
      new Paragraph({
        spacing: { before: 40, after: 60 },
        children: [
          new TextRun({
            text: `• ${bulletText}: `,
            bold: true,
            size: 20,
            font: 'Calibri',
          }),
          new TextRun({
            text: normalText,
            size: 20,
            font: 'Calibri',
          }),
        ],
      })
    );
  };

  // Helper for code / monospace lines
  const addMonoLine = (text, color = '000000') => {
    children.push(
      new Paragraph({
        spacing: { before: 20, after: 20 },
        children: [
          new TextRun({
            text,
            font: 'Consolas',
            size: 16,
            color,
          }),
        ],
      })
    );
  };

  // -------------------------------------------------------------
  // Institutional Header
  // -------------------------------------------------------------
  addHeaderLine('VELALAR COLLEGE OF ENGINEERING AND TECHNOLOGY, ERODE -12', 24, true);
  addHeaderLine('(AUTONOMOUS)', 20, true, '333333');
  addHeaderLine('DEPARTMENT OF INFORMATION TECHNOLOGY', 22, true);
  addHeaderLine('ACADEMIC YEAR: 2026 -27 (ODD)', 20, true);
  addHeaderLine('ACTIVITY- Project-Based Assessment', 22, true);

  children.push(new Paragraph({ spacing: { after: 140 } }));

  // Student & Activity Metadata
  addMetaLine('NAME', 'LOGITHMANIKANDAN K / HARISH G / GLADIAS LAWRANCE');
  addMetaLine('CLASS', '24IT5A');
  addMetaLine('REG.NO', '732924ITR030');
  addMetaLine('SUBJECT CODE', '22ITT53');
  addMetaLine('SUBJECT NAME', 'FORMAL LANGUAGES AND AUTOMATA THEROY (FLAT)');
  addMetaLine(
    'PROBLEM STATEMENT',
    'Build a web application that analyzes simulated API traffic from multiple clients, detects excessive requests, identifies abusive behavior, and automatically manages client access using a Finite State Machine (FSM). Use finite automata to recognize rate-limiting thresholds and security policy breaches within a sliding time window. Display client identity, IP address, targeted endpoints, response status codes, detected abuse patterns, FSM transitions, and threat alerts on a web dashboard.'
  );
  addMetaLine('Title Assigned', 'Rate Limiting and API Abuse Detection System');

  children.push(new Paragraph({ spacing: { after: 160 } }));

  // -------------------------------------------------------------
  // 1. STATE DIAGRAM
  // -------------------------------------------------------------
  addHeading('1. STATE DIAGRAM');

  addHeading('1.1 Introduction', HeadingLevel.HEADING_2);
  addPara(
    'A Deterministic Finite Automaton (DFA) / Finite State Machine (FSM) is used in the Rate Limiting and API Abuse Detection System to identify excessive request volumes and potential API abuse activities. It monitors the number of incoming API requests dispatched by a particular client identity or source IP address within a sixty-second sliding time window (configured limit: 20 requests).'
  );
  addPara(
    'The automaton starts from the initial state S0 (NORMAL). Whenever traffic volume increases, the DFA moves to the next monitoring state. When request volume reaches 70% of the quota, it moves to state S1 (WARNED). When request volume reaches or exceeds 100% of the quota, it enters state S2 (THROTTLED), rejecting requests with HTTP 429 and triggering an active 30-second cooldown window. If a client commits persistent violations (3 or more violations) or security exploits such as path traversal, it reaches the final alert state S3 (BLOCKED), rejecting subsequent requests with HTTP 403 Forbidden.'
  );

  addHeading('1.2 States of the DFA', HeadingLevel.HEADING_2);
  addPara('State S0 : No quota threshold exceeded; normal baseline traffic (< 70% of limit; < 14 requests)');
  addPara('State S1 : Warning threshold reached; request volume between 70% and 99% of limit (14 to 19 requests)');
  addPara('State S2 : Rate limit reached or exceeded (>= 20 requests); active cooldown initiated; HTTP 429 Too Many Requests');
  addPara('State S3 : Final alert state; persistent violations (>= 3) or malicious exploit detected; HTTP 403 Forbidden alert generated');

  addHeading('1.3 State Diagram Representation :', HeadingLevel.HEADING_2);
  addPara('Rate Limiting & API Abuse Detection System – DFA-Based Traffic Access Control');
  addPara(
    'The DFA contains four primary states. It detects abuse activity and enforces access quotas by evaluating client request counts within a sliding time window.'
  );

  // Clean ASCII state diagram without any box
  addMonoLine('=============================================================================');
  addMonoLine('                           DFA STATE DIAGRAM                                ');
  addMonoLine('=============================================================================');
  addMonoLine('       [Requests < 70%]                                                      ');
  addMonoLine('           +-------+                                                         ');
  addMonoLine('           |       |                                                         ');
  addMonoLine('           v       |                                                         ');
  addMonoLine('  Start   +---------+    Req >= 70%     +---------+   Req >= 100%    +-----------+');
  addMonoLine(' ======>  |   S0    | ----------------> |   S1    | ---------------> |    S2     |');
  addMonoLine('          | NORMAL  | <---------------- | WARNED  |                  | THROTTLED |');
  addMonoLine('          +---------+    Traffic < 70%  +---------+                  +-----------+');
  addMonoLine('               ^                                                           |         ');
  addMonoLine('               |                  Cooldown Expires & < 70%                 |         ');
  addMonoLine('               +-----------------------------------------------------------+         ');
  addMonoLine('               |                                                           |         ');
  addMonoLine('               |       Admin Manual Unblock                 Violations >= 3|         ');
  addMonoLine('               +===================================================+         ');
  addMonoLine('               |                                                   |         ');
  addMonoLine('               |                                                   v         ');
  addMonoLine('               |                                            ((     S3    ))  ');
  addMonoLine('               +------------------------------------------- ((  BLOCKED  ))  ');
  addMonoLine('                                                            (( (Alert)   ))  ');
  addMonoLine('                                                                   |         ');
  addMonoLine('                                                                   +----+    ');
  addMonoLine('                                                            Any Req|    |    ');
  addMonoLine('                                                            (403)  +<---+    ');
  addMonoLine('=============================================================================');

  addPara('State Description:');
  addPara('S0 – Initial state; normal baseline API requests below 70% capacity (HTTP 200 OK).');
  addPara('S1 – Warning state; request count between 70% and 99% of configured limit (HTTP 200 OK with warning).');
  addPara('S2 – Throttled state; requests reach 100% quota; temporary rejection with HTTP 429 during active cooldown.');
  addPara('S3 – Final blocked state; three or more violations accumulated; access permanently suspended with HTTP 403.');

  addHeading('1.4 Formal Definition of DFA', HeadingLevel.HEADING_2);
  addPara('A DFA is represented by the five-tuple:');
  addHeaderLine('M = (Q, Σ, δ, q0, F)', 22, true, '000000', AlignmentType.CENTER);
  addPara('Where:');
  addPara('Q: Set of finite states = { S0, S1, S2, S3 }');
  addPara('Σ: Input alphabet = { Req_Normal (<70%), Req_Warn (70-99%), Req_Limit (>=100%), Cooldown_Expired, Cooldown_Active, Violation_Threshold_Reached, Path_Traversal_Detected, Admin_Unblock }');
  addPara('δ: Transition function that determines the next state based on incoming request conditions');
  addPara('q0: Initial state = S0 (NORMAL)');
  addPara('F: Final alert state = { S3 (BLOCKED) }');
  addPara(
    'The DFA enters the final accepting alert state (S3) when persistent rate-limit violations (>= 3) or malicious exploit attempts are detected within the sliding monitoring window.'
  );

  // -------------------------------------------------------------
  // 2. TRANSITION DIAGRAM
  // -------------------------------------------------------------
  addHeading('2. TRANSITION DIAGRAM');
  addPara(
    'The transition diagram represents the movement of the DFA from one state to another based on the incoming request event and sliding-window quota.'
  );

  addHeading('2.1 Transition Table :', HeadingLevel.HEADING_2);
  addPara('Rule R1: Current State: S0 (NORMAL) | Input Condition: Requests < 70% of limit | Next State: S0 | Action: HTTP 200 OK (Baseline access)');
  addPara('Rule R2: Current State: S0 (NORMAL) | Input Condition: 70% <= Requests < 100% of limit | Next State: S1 | Action: HTTP 200 OK (Warning telemetry attached)');
  addPara('Rule R3: Current State: S0 (NORMAL) | Input Condition: Requests >= 100% of limit | Next State: S2 | Action: HTTP 429 Too Many Requests (Cooldown active 30s)');
  addPara('Rule R4: Current State: S0 (NORMAL) | Input Condition: Path traversal attack or violations >= 3 | Next State: S3 | Action: HTTP 403 Forbidden (Lockout)');
  addPara('Rule R5: Current State: S1 (WARNED) | Input Condition: Requests < 70% (traffic subsides) | Next State: S0 | Action: HTTP 200 OK (Warning cleared)');
  addPara('Rule R6: Current State: S1 (WARNED) | Input Condition: 70% <= Requests < 100% of limit | Next State: S1 | Action: HTTP 200 OK (Maintain warning state)');
  addPara('Rule R7: Current State: S1 (WARNED) | Input Condition: Requests reach 100% of limit | Next State: S2 | Action: HTTP 429 Too Many Requests (Throttling initiated)');
  addPara('Rule R8: Current State: S1 (WARNED) | Input Condition: Accumulated violations >= 3 | Next State: S3 | Action: HTTP 403 Forbidden (Automated lockout)');
  addPara('Rule R9: Current State: S2 (THROTTLED) | Input Condition: Incoming request during cooldown | Next State: S2 | Action: HTTP 429; Remains throttled; Violations++');
  addPara('Rule R10: Current State: S2 (THROTTLED) | Input Condition: Cooldown expires & traffic < 70% | Next State: S0 | Action: HTTP 200 OK (Full recovery to NORMAL)');
  addPara('Rule R11: Current State: S2 (THROTTLED) | Input Condition: Cooldown expires & traffic 70%-99% | Next State: S1 | Action: HTTP 200 OK (Transition to WARNED)');
  addPara('Rule R12: Current State: S2 (THROTTLED) | Input Condition: Cooldown expires but violations >= 3 | Next State: S3 | Action: HTTP 403 Forbidden (Escalate to BLOCKED)');
  addPara('Rule R13: Current State: S3 (BLOCKED) | Input Condition: Any incoming request from client | Next State: S3 | Action: HTTP 403 Forbidden; Critical threat alert');
  addPara('Rule R14: Current State: S3 (BLOCKED) | Input Condition: Admin manually unblocks client | Next State: S0 | Action: HTTP 200 OK; Clears cooldown & resets violations');

  addPara('Special Conditions:');
  addPara('If requests remain below the 70% threshold, the DFA remains in state S0 (NORMAL).');
  addPara('If requests are received while in cooldown, the DFA rejects the call with HTTP 429 and increments the client violation counter.');
  addPara('If the cooldown expires and request volume subsides below 70%, the DFA resets back to S0 (NORMAL).');
  addPara('When state S3 (BLOCKED) is reached, the backend generates and stores a critical security alert in MongoDB and access is revoked until manual admin unblock.');

  addHeading('2.2 Example of State Transitions :', HeadingLevel.HEADING_2);
  addPara('Consider an active client (ID: client_beta_analytics, IP: 192.168.1.102) with a configured limit of 20 requests per 60-second sliding window.');
  addPara('Step Initial : Client: client_beta_analytics | Action: Registration | Sliding Count: 0 / 20 reqs | DFA State: S0 (NORMAL)');
  addPara('Step 1 : Client: client_beta_analytics | Action: GET /api/v1/orders (x 5) | Sliding Count: 5 / 20 reqs (25%) | DFA State: S0 (NORMAL)');
  addPara('Step 2 : Client: client_beta_analytics | Action: GET /api/v1/analytics (x 9) | Sliding Count: 14 / 20 reqs (70%) | DFA State: S1 (WARNED)');
  addPara('Step 3 : Client: client_beta_analytics | Action: GET /api/v1/analytics (x 6) | Sliding Count: 20 / 20 reqs (100%) | DFA State: S2 (THROTTLED)');
  addPara('Step 4 : Client: client_beta_analytics | Action: POST /api/v1/orders (During Cooldown) | Sliding Count: Cooldown Active | DFA State: S2 (429 Rejected)');
  addPara('Step 5 : Client: client_beta_analytics | Action: Repeated Spam (Violations=3) | Sliding Count: Quota Breached | DFA State: S3 (BLOCKED - 403)');
  addPara('Step 6 : Client: client_beta_analytics | Action: Admin POST /api/clients/:id/unblock | Sliding Count: Counters Reset | DFA State: S0 (NORMAL Restored)');
  addPara(
    'Result: After detecting excessive requests reaching 100% capacity and repeated cooldown violations, the DFA transitions from S0 to S1, S2, and enters final state S3, generating a security threat alert.'
  );

  // -------------------------------------------------------------
  // CODE SECTION
  // -------------------------------------------------------------
  addHeading('CODE:');
  addPara('File Name: automataEngine.js (backend/services/fsmService.js)');

  const codeSnippet = [
    'const { v4: uuidv4 } = require("uuid");',
    'const StateTransition = require("../models/StateTransition");',
    '',
    '// Store FSM state definitions',
    'const FSM_STATES = {',
    '  NORMAL: "NORMAL",',
    '  WARNED: "WARNED",',
    '  THROTTLED: "THROTTLED",',
    '  BLOCKED: "BLOCKED",',
    '};',
    '',
    '// Determine current DFA state transition',
    'function computeNextState({',
    '  client,',
    '  slidingWindowCount,',
    '  settings,',
    '  isManualUnblock = false,',
    '  overrideReason = null,',
    '}) {',
    '  const currentState = client.currentState || FSM_STATES.NORMAL;',
    '  const now = new Date();',
    '  const limit = client.requestLimit || settings.requestLimit || 20;',
    '  const warningCount = Math.floor((settings.warningThreshold / 100) * limit);',
    '  const autoBlockThreshold = settings.autoBlockThreshold || 3;',
    '  const currentViolations = client.violationCount || 0;',
    '',
    '  // Admin Manual Unblock Operation',
    '  if (isManualUnblock) {',
    '    return {',
    '      nextState: FSM_STATES.NORMAL,',
    '      stateChanged: currentState !== FSM_STATES.NORMAL,',
    '      reason: overrideReason || "Admin manually unblocked client and reset counters",',
    '      cooldownUntil: null,',
    '      resetViolations: true,',
    '    };',
    '  }',
    '',
    '  // Client is already BLOCKED (S3)',
    '  if (currentState === FSM_STATES.BLOCKED) {',
    '    return {',
    '      nextState: FSM_STATES.BLOCKED,',
    '      stateChanged: false,',
    '      reason: "Client remains BLOCKED until administrator manual unblock",',
    '      cooldownUntil: null,',
    '    };',
    '  }',
    '',
    '  // Automated escalation to BLOCKED on repeated violations',
    '  if (currentViolations >= autoBlockThreshold) {',
    '    return {',
    '      nextState: FSM_STATES.BLOCKED,',
    '      stateChanged: currentState !== FSM_STATES.BLOCKED,',
    '      reason: `Automated lockout: ${currentViolations} violations exceeded threshold`,',
    '      cooldownUntil: null,',
    '    };',
    '  }',
    '',
    '  // Client is currently THROTTLED (S2)',
    '  if (currentState === FSM_STATES.THROTTLED) {',
    '    const isUnderCooldown = client.cooldownUntil && new Date(client.cooldownUntil) > now;',
    '    if (isUnderCooldown) {',
    '      return {',
    '        nextState: FSM_STATES.THROTTLED,',
    '        stateChanged: false,',
    '        reason: `Client active in cooldown until ${new Date(client.cooldownUntil).toISOString()}`,',
    '        cooldownUntil: client.cooldownUntil,',
    '      };',
    '    }',
    '',
    '    // Cooldown expired: evaluate recovery based on sliding window count',
    '    if (slidingWindowCount < warningCount) {',
    '      return {',
    '        nextState: FSM_STATES.NORMAL,',
    '        stateChanged: true,',
    '        reason: `Cooldown expired and traffic recovered below threshold (${slidingWindowCount}/${limit})`,',
    '        cooldownUntil: null,',
    '      };',
    '    } else if (slidingWindowCount < limit) {',
    '      return {',
    '        nextState: FSM_STATES.WARNED,',
    '        stateChanged: true,',
    '        reason: `Cooldown expired; traffic elevated at warning level (${slidingWindowCount}/${limit})`,',
    '        cooldownUntil: null,',
    '      };',
    '    }',
    '  }',
    '',
    '  // Client is in NORMAL (S0) or WARNED (S1)',
    '  if (slidingWindowCount >= limit) {',
    '    const newCooldown = new Date(now.getTime() + settings.cooldownDuration * 1000);',
    '    return {',
    '      nextState: FSM_STATES.THROTTLED,',
    '      stateChanged: true,',
    '      reason: `Rate limit ceiling reached (${slidingWindowCount}/${limit}). Cooldown initiated.`,',
    '      cooldownUntil: newCooldown,',
    '      violationIncrement: 1,',
    '    };',
    '  }',
    '',
    '  if (slidingWindowCount >= warningCount) {',
    '    return {',
    '      nextState: FSM_STATES.WARNED,',
    '      stateChanged: currentState !== FSM_STATES.WARNED,',
    '      reason: `Request rate reached 70% threshold (${slidingWindowCount}/${limit})`,',
    '      cooldownUntil: null,',
    '    };',
    '  }',
    '',
    '  return {',
    '    nextState: FSM_STATES.NORMAL,',
    '    stateChanged: currentState !== FSM_STATES.NORMAL,',
    '    reason: `Traffic within safe baseline capacity (< 70% of ${limit} reqs)`,',
    '    cooldownUntil: null,',
    '  };',
    '}',
    '',
    'module.exports = {',
    '  FSM_STATES,',
    '  computeNextState,',
    '};',
  ];

  codeSnippet.forEach((line) => addMonoLine(line));

  // -------------------------------------------------------------
  // OUTPUT SECTION
  // -------------------------------------------------------------
  addHeading('Output:');
  addMonoLine('Client ID: client_beta_analytics');
  addMonoLine('Request Count: 5 / 20 reqs');
  addMonoLine('DFA State: S0 (NORMAL) -> HTTP 200 OK');
  addMonoLine('');
  addMonoLine('Client ID: client_beta_analytics');
  addMonoLine('Request Count: 14 / 20 reqs');
  addMonoLine('DFA State: S1 (WARNED) -> HTTP 200 OK (Warning attached)');
  addMonoLine('');
  addMonoLine('Client ID: client_beta_analytics');
  addMonoLine('Request Count: 20 / 20 reqs');
  addMonoLine('DFA State: S2 (THROTTLED) -> HTTP 429 Too Many Requests (Cooldown active 30s)');
  addMonoLine('');
  addMonoLine('Client ID: client_beta_analytics');
  addMonoLine('Request Attempt During Cooldown (Violations: 3)');
  addMonoLine('DFA State: S3 (BLOCKED) -> HTTP 403 Forbidden');
  addMonoLine('ALERT: Critical API Abuse & Persistent Rate Limit Violation Detected!');

  // -------------------------------------------------------------
  // PROCEDURE STEPS
  // -------------------------------------------------------------
  addHeading('PROCEDURE STEPS :');
  addPara('1. Start the MongoDB database service to make the database available for the application.');
  addPara('2. Open the Rate Limiting and API Abuse Detection System project folder in Visual Studio Code.');
  addPara('3. Open the backend folder in the terminal and configure the database connection in backend/.env.');
  addPara('4. Run the seed script (npm run seed) to populate default admin credentials and sample clients across all states.');
  addPara('5. Execute the automated test suite (npm test) to verify all 7 deterministic FSM transition scenarios.');
  addPara('6. Start the Express.js backend server using the appropriate npm command (npm run backend on Port 5000).');
  addPara('7. Open another terminal, navigate to the frontend folder, install dependencies, and start the React development server (npm run frontend on Port 5173).');
  addPara('8. Open the web application in a browser using the local URL (http://localhost:5173/login) and log in using default admin credentials (admin@security.local / Admin@123456).');
  addPara('9. View the available real-time statistics, active clients, and recent activity displayed on the main dashboard.');
  addPara('10. Enter or simulate API request events using the Request Simulator with different client IDs, endpoints, and HTTP methods.');
  addPara('11. Observe the DFA state transitions from S0 (NORMAL) to S1 (WARNED), S2 (THROTTLED), and finally S3 (BLOCKED).');
  addPara('12. Verify that a security alert is generated when rate limits are breached or when malicious path traversal patterns are intercepted.');
  addPara('13. Check the generated alert in the threat dashboard and verify that it is stored in MongoDB with severity classification.');
  addPara('14. Navigate to the FSM Visualization page to inspect the interactive State Transition Diagram and the 14-rule formal transition matrix.');
  addPara('15. Test the client management unblock feature to verify that a client in S3 (BLOCKED) is successfully restored to S0 (NORMAL).');

  // -------------------------------------------------------------
  // ADVANTAGES SECTION
  // -------------------------------------------------------------
  addHeading('ADVANTAGES OF USING FLAT CONCEPT IN RATE LIMITING & ABUSE DETECTION :');
  addBullet('Pattern Recognition', 'Identifies excessive request bursts, rapid micro-flooding, and suspicious endpoint traversal using DFA.');
  addBullet('Automatic Detection', 'Detects potential rate-limiting violations and security threats automatically based on sliding-window request volume.');
  addBullet('Fast Processing', 'Processes access control and rate-limit checks through O(1) mathematical state transitions with minimal overhead.');
  addBullet('Accurate Tracking', 'Tracks unique client request velocity and cooldown timers accurately within a rolling sixty-second time window.');
  addBullet('Alert Generation', 'Generates security threat alerts and triggers automated lockout policies when the DFA reaches the final alert state (S3 - BLOCKED).');

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
        children,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const outPath1 = path.join(__dirname, '../Rate_Limiting_and_API_Abuse_Detection_System_Report.docx');
  const outPath2 = path.join(__dirname, '../docs/Rate_Limiting_and_API_Abuse_Detection_System_Report.docx');

  const tryWrite = (filePath, fileBuffer) => {
    try {
      fs.writeFileSync(filePath, fileBuffer);
      console.log(`[Success] Written: ${filePath}`);
    } catch (err) {
      if (err.code === 'EBUSY') {
        const altPath = filePath.replace('.docx', '_Format.docx');
        fs.writeFileSync(altPath, fileBuffer);
        console.log(`[Notice] ${filePath} was open in Word. Saved alternate copy to: ${altPath}`);
      } else {
        throw err;
      }
    }
  };

  tryWrite(outPath1, buffer);
  tryWrite(outPath2, buffer);
}

generateReportNoTables().catch(console.error);
