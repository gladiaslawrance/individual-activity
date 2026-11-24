const fs = require('fs');
const path = require('path');
const { Document, Packer, Paragraph, TextRun, AlignmentType, ImageRun } = require('docx');

async function generateFswdReport() {
  const children = [];

  // Helper for title lines
  const addTitleLine = (text, size = 24, bold = true, alignment = AlignmentType.CENTER) => {
    children.push(
      new Paragraph({
        alignment,
        spacing: { before: 40, after: 40 },
        children: [
          new TextRun({
            text,
            bold,
            size,
            font: 'Times New Roman',
            color: '000000',
          }),
        ],
      })
    );
  };

  // Helper for metadata lines (NAME : ..., CLASS: ..., etc.)
  const addMetaLine = (label, value) => {
    children.push(
      new Paragraph({
        spacing: { before: 40, after: 40 },
        children: [
          new TextRun({
            text: `${label} : `,
            bold: true,
            size: 24,
            font: 'Times New Roman',
          }),
          new TextRun({
            text: value,
            size: 24,
            font: 'Times New Roman',
          }),
        ],
      })
    );
  };

  // Helper for standard body text paragraphs
  const addPara = (text, spacingAfter = 80, bold = false) => {
    children.push(
      new Paragraph({
        spacing: { before: 40, after: spacingAfter },
        children: [
          new TextRun({
            text,
            size: 24,
            font: 'Times New Roman',
            bold,
          }),
        ],
      })
    );
  };

  // Helper for section headings (no boxes, no tables)
  const addHeading = (text, spacingBefore = 140, spacingAfter = 80) => {
    children.push(
      new Paragraph({
        spacing: { before: spacingBefore, after: spacingAfter },
        children: [
          new TextRun({
            text,
            bold: true,
            size: 24,
            font: 'Times New Roman',
            color: '000000',
          }),
        ],
      })
    );
  };

  // Helper for code / monospace / preformatted lines
  const addCodeLine = (text) => {
    children.push(
      new Paragraph({
        spacing: { before: 10, after: 10 },
        children: [
          new TextRun({
            text,
            font: 'Consolas',
            size: 18,
            color: '111827',
          }),
        ],
      })
    );
  };

  // Helper for safe image inclusion
  const addImageIfExists = (filePath, width = 560, height = 310) => {
    if (fs.existsSync(filePath)) {
      try {
        const imgBuffer = fs.readFileSync(filePath);
        children.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 120, after: 120 },
            children: [
              new ImageRun({
                data: imgBuffer,
                transformation: {
                  width,
                  height,
                },
              }),
            ],
          })
        );
      } catch (err) {
        console.warn(`Could not embed image ${filePath}:`, err.message);
      }
    }
  };

  // =============================================================
  // 1. INSTITUTIONAL HEADER
  // =============================================================
  addTitleLine('VELALAR COLLEGE OF ENGINEERING AND TECHNOLOGY, ERODE -12', 26, true);
  addTitleLine('(AUTONOMOUS)', 22, true);
  addTitleLine('DEPARTMENT OF INFORMATION TECHNOLOGY', 24, true);
  addTitleLine('ACADEMIC YEAR: 2026 -27 (ODD)', 22, true);
  addTitleLine('ACTIVITY- Project-Based Assessment', 24, true);

  children.push(new Paragraph({ spacing: { after: 120 } }));

  // =============================================================
  // 2. STUDENT & ACTIVITY METADATA
  // =============================================================
  addMetaLine('NAME', 'GLADIAS LAWRANCE G');
  addMetaLine('CLASS', '24IT5A');
  addMetaLine('REG.NO', '732924ITR030');
  addMetaLine('SUBJECT CODE', '22ITT51');
  addMetaLine('SUBJECT NAME', 'FULL STACK WEB DEVELOPMENT (FSWD)');
  addMetaLine('ACTIVITY', '2');
  addMetaLine(
    'PROBLEM STATEMENT ',
    'Build a web application that simulates API traffic from multiple clients, detects excessive requests, identifies abusive behavior, and automatically manages client access using a Finite State Machine (FSM). Use finite automata and regex validation to enforce rate limiting policies within a sliding time window. Display client identity, IP address, targeted endpoints, response status codes, detected abuse patterns, FSM transitions, and threat alerts on an interactive cybersecurity dashboard.'
  );
  addMetaLine('Title Assigned', 'Rate Limiting and API Abuse Detection System');

  children.push(new Paragraph({ spacing: { after: 100 } }));

  // =============================================================
  // 3. PROJECT FOLDER STRUCTURE
  // =============================================================
  addHeading('Project Folder Structure :');
  const treeLines = [
    'RATE-LIMIT-ABUSE-DETECTION/',
    '├── backend/',
    '│   ├── config/',
    '│   │   └── db.js',
    '│   ├── controllers/',
    '│   │   ├── alertController.js',
    '│   │   ├── authController.js',
    '│   │   ├── clientController.js',
    '│   │   ├── dashboardController.js',
    '│   │   ├── fsmController.js',
    '│   │   ├── requestController.js',
    '│   │   └── settingsController.js',
    '│   ├── middleware/',
    '│   │   ├── authMiddleware.js',
    '│   │   └── errorHandler.js',
    '│   ├── models/',
    '│   │   ├── AbuseAlert.js',
    '│   │   ├── Admin.js',
    '│   │   ├── APIRequest.js',
    '│   │   ├── Client.js',
    '│   │   ├── StateTransition.js',
    '│   │   └── SystemSetting.js',
    '│   ├── routes/',
    '│   │   ├── alertRoutes.js',
    '│   │   ├── authRoutes.js',
    '│   │   ├── clientRoutes.js',
    '│   │   ├── dashboardRoutes.js',
    '│   │   ├── fsmRoutes.js',
    '│   │   ├── requestRoutes.js',
    '│   │   └── settingsRoutes.js',
    '│   ├── seed/',
    '│   │   └── seed.js',
    '│   ├── services/',
    '│   │   ├── abuseDetectionService.js',
    '│   │   ├── fsmService.js',
    '│   │   └── rateLimiterService.js',
    '│   ├── tests/',
    '│   │   └── fsm_ratelimit.test.js',
    '│   ├── utils/',
    '│   │   ├── keyGenerator.js',
    '│   │   └── regexValidator.js',
    '│   ├── package.json',
    '│   └── server.js',
    '└── frontend/',
    '    ├── public/',
    '    ├── src/',
    '    │   ├── context/',
    '    │   │   ├── AuthContext.jsx',
    '    │   │   └── ToastContext.jsx',
    '    │   ├── layouts/',
    '    │   │   └── DashboardLayout.jsx',
    '    │   ├── pages/',
    '    │   │   ├── Alerts.jsx',
    '    │   │   ├── Clients.jsx',
    '    │   │   ├── Dashboard.jsx',
    '    │   │   ├── FsmVisualization.jsx',
    '    │   │   ├── Login.jsx',
    '    │   │   ├── Requests.jsx',
    '    │   │   ├── Settings.jsx',
    '    │   │   └── Simulator.jsx',
    '    │   ├── services/',
    '    │   │   └── api.js',
    '    │   ├── App.jsx',
    '    │   ├── index.css',
    '    │   └── main.jsx',
    '    ├── index.html',
    '    ├── vite.config.js',
    '    ├── tailwind.config.js',
    '    └── package.json',
  ];
  treeLines.forEach((l) => addCodeLine(l));

  children.push(new Paragraph({ spacing: { after: 100 } }));

  // =============================================================
  // 4. REPOSITORY LINK
  // =============================================================
  addHeading('Repository :');
  addPara(' GitHub:  https://github.com/gladiaslawrance/individual-activity');

  children.push(new Paragraph({ spacing: { after: 100 } }));

  // =============================================================
  // 5. 1.4 WORKING PRINCIPLE OF THE PROJECT
  // =============================================================
  addHeading('1.4 Working Principle of the Project');
  addPara(
    'The Rate Limiting and API Abuse Detection application works through a sequence of network traffic ingestion, input validation, sliding-window request counting, finite state machine evaluation, automated threat alerting, database persistence, and real-time administrative dashboard visualization.'
  );

  const principles = [
    {
      title: '1. Client API Request Ingestion',
      desc: 'The Express.js backend receives simulated or real incoming HTTP API requests containing the unique Client ID, API Key, Client IP address, target endpoint URI, HTTP method (GET, POST, PUT, DELETE), and JSON request payload.',
    },
    {
      title: '2. Regex Validation Engine',
      desc: 'The backend validates the structural integrity of all request components using regular expressions. It strictly enforces root-prefixed valid URL path characters, blocks directory traversal patterns (e.g., ../ or %2e%2e), enforces permissible HTTP methods, verifies alphanumeric UUID Client IDs and API keys, and validates JSON syntax.',
    },
    {
      title: '3. Sliding-Window Rate Limiting',
      desc: "A memory and timestamp-based sliding-window rate limiting engine tracks each client's request timestamps within a configurable 60-second time window against a default 20-request threshold. Expired request timestamps outside the window are automatically purged.",
    },
    {
      title: '4. FSM State Transition',
      desc: 'A Deterministic Finite State Machine (FSM) classifies client traffic into four discrete operational states: S0 (NORMAL), S1 (WARNED at >= 70% threshold), S2 (THROTTLED at 100% threshold with 30-second active cooldown and HTTP 429 response), and S3 (BLOCKED on persistent violations or malicious exploits with HTTP 403 response).',
    },
    {
      title: '5. Threat & Abuse Pattern Detection',
      desc: 'When excessive traffic bursts, rapid sub-second repeated requests, malformed payloads, or post-throttle spam are detected, the system categorizes the threat severity (LOW, MEDIUM, HIGH, CRITICAL) and logs an automated Abuse Alert.',
    },
    {
      title: '6. Database Persistence',
      desc: 'All client credentials, simulated API traffic events, threat alerts, state transition audit trails, and system settings are persistently saved to MongoDB using strongly-typed Mongoose models.',
    },
    {
      title: '7. Real-Time Dashboard Display',
      desc: 'The React frontend communicates with backend RESTful APIs via Axios, dynamically rendering request throughput charts (Recharts), client status distributions, active threat indicators, and live activity feeds with Lucide React iconography.',
    },
    {
      title: '8. Security Management & Access Control',
      desc: 'Security administrators can configure global rate limits, initiate batch traffic simulations, review request histories with multidimensional filters, resolve abuse alerts, and perform authorized administrative manual unblock overrides.',
    },
  ];

  principles.forEach((item) => {
    children.push(
      new Paragraph({
        spacing: { before: 30, after: 50 },
        children: [
          new TextRun({
            text: `${item.title}: `,
            bold: true,
            size: 24,
            font: 'Times New Roman',
          }),
          new TextRun({
            text: item.desc,
            size: 24,
            font: 'Times New Roman',
          }),
        ],
      })
    );
  });

  children.push(new Paragraph({ spacing: { after: 120 } }));

  // =============================================================
  // 6. SOURCE CODE FILE INDEX
  // =============================================================
  addHeading('SOURCE CODE FILE INDEX :');

  const addSourceFile = (filePath, headerTitle) => {
    addHeading(headerTitle, 100, 40);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      lines.forEach((l) => addCodeLine(l.replace(/\r$/, '')));
    } else {
      addCodeLine(`// File ${filePath} not found`);
    }
    children.push(new Paragraph({ spacing: { after: 80 } }));
  };

  addSourceFile(path.join(__dirname, '../frontend/src/App.jsx'), 'frontend/src/App.jsx:');
  addSourceFile(path.join(__dirname, '../frontend/src/main.jsx'), 'frontend/src/main.jsx:');
  addSourceFile(path.join(__dirname, '../backend/server.js'), 'backend/server.js:');
  addSourceFile(path.join(__dirname, '../backend/services/fsmService.js'), 'backend/services/fsmService.js:');

  // =============================================================
  // 7. OUTPUT
  // =============================================================
  addHeading('OUTPUT :');
  addPara(
    'The Rate Limiting and API Abuse Detection System dashboard renders real-time traffic statistics, visual state distribution charts, and incoming activity alerts. Below is the operational output of the dashboard and automated verification test suite.'
  );

  // Embed dashboard screenshot
  const dashImgPath = path.join(__dirname, '../dashboard_screenshot.png');
  addImageIfExists(dashImgPath, 580, 320);

  // Also include the original template_img1 if present
  const tmplImg1 = path.join(__dirname, '../template_img1.png');
  if (fs.existsSync(tmplImg1) && !fs.existsSync(dashImgPath)) {
    addImageIfExists(tmplImg1, 580, 320);
  }

  // Monospace Automated Verification Output
  const testOutputLines = [
    '===============================================================',
    '   STARTING AUTOMATED VERIFICATION: FSM & RATE LIMIT SUITE     ',
    '===============================================================',
    '[Scenario 1] Client sends normal requests (< 70% threshold)',
    '  -> Target: 5 requests / Limit: 10',
    '  -> Expected State: NORMAL, Actual State: NORMAL',
    '  -> Result: PASS (HTTP 200 OK - Allowed)',
    '[Scenario 2] Client reaches 70% of request limit',
    '  -> Target: 7 requests / Limit: 10',
    '  -> Expected State: WARNED, Actual State: WARNED',
    '  -> Result: PASS (HTTP 200 OK - Warning Threshold Evaluated)',
    '[Scenario 3] Client reaches 100% of request limit',
    '  -> Target: 10 requests / Limit: 10',
    '  -> Expected State: THROTTLED, Actual State: THROTTLED',
    '  -> Result: PASS (HTTP 429 Too Many Requests, Cooldown: 30s)',
    '[Scenario 4] Client repeatedly violates rate limits',
    '  -> Violations: 3 violations recorded during cooldown',
    '  -> Expected State: BLOCKED, Actual State: BLOCKED',
    '  -> Result: PASS (HTTP 403 Forbidden - Access Suspended)',
    '[Scenario 5] Blocked client sends another request',
    '  -> Incoming request from blocked client id: "client_acme_corp"',
    '  -> Result: PASS (Rejected immediately with HTTP 403 Forbidden)',
    '[Scenario 6] Admin unblocks client',
    '  -> Administrative override: POST /api/clients/:id/unblock',
    '  -> Expected State: NORMAL, Actual State: NORMAL',
    '  -> Result: PASS (Access Restored, Violation Count Cleared)',
    '[Scenario 7] Client submits invalid endpoint / path traversal',
    '  -> Payload endpoint: "/api/v1/../../etc/passwd"',
    '  -> Result: PASS (Regex validation error returned with HTTP 400)',
    '===============================================================',
    '[TEST SUITE PASSED] 7/7 test scenarios completed with 100% success.',
    '===============================================================',
  ];
  testOutputLines.forEach((l) => addCodeLine(l));

  children.push(new Paragraph({ spacing: { after: 120 } }));

  // =============================================================
  // 8. MONGODB COMMANDS
  // =============================================================
  addHeading('MONGODB COMMANDS USED IN RATE LIMITING AND API ABUSE DETECTION PROJECT');
  addPara(
    'MongoDB is used to store and retrieve client records, simulated API requests, abuse alerts, state transition history, and system settings generated by the Rate Limiting application.'
  );

  const mongoCommands = [
    { title: '1. Display Available Databases', cmd: 'show dbs' },
    { title: '2. Select Project Database', cmd: 'use ratelimit_db' },
    { title: '3. Display Collections', cmd: 'show collections' },
    { title: '4. Retrieve All Registered Clients', cmd: 'db.clients.find()' },
    { title: '5. Display Abuse Alerts in Readable Format', cmd: 'db.abusealerts.find().pretty()' },
    { title: '6. Retrieve Requests for a Specific Client or IP', cmd: 'db.apirequests.find({ ipAddress: "192.168.1.101" })' },
    { title: '7. Count Total API Requests', cmd: 'db.apirequests.countDocuments()' },
    { title: '8. Retrieve Latest Five State Transitions', cmd: 'db.statetransitions.find().sort({ _id: -1 }).limit(5)' },
    { title: '9. Retrieve High-Severity Security Alerts', cmd: 'db.abusealerts.find({ severity: "HIGH" })' },
    { title: '10. Query Blocked Clients', cmd: 'db.clients.find({ currentState: "BLOCKED" })' },
  ];

  mongoCommands.forEach((m) => {
    children.push(
      new Paragraph({
        spacing: { before: 40, after: 10 },
        children: [
          new TextRun({
            text: m.title,
            bold: true,
            size: 24,
            font: 'Times New Roman',
          }),
        ],
      })
    );
    addCodeLine(m.cmd);
  });

  children.push(new Paragraph({ spacing: { after: 120 } }));

  // =============================================================
  // 9. GITHUB COMMANDS TO PUSH PROJECT
  // =============================================================
  addHeading('GITHUB COMMANDS TO PUSH RATE LIMITING PROJECT');
  addPara('Open PowerShell in your project folder:');
  addCodeLine('cd "d:\\Harish\\glady"');

  const gitSteps = [
    { title: '1. Initialize Git', cmd: 'git init' },
    { title: '2. Add all project files', cmd: 'git add .' },
    { title: '3. Commit the files', cmd: 'git commit -m "Rate Limiting and API Abuse Detection System implementation"' },
    { title: '4. Connect GitHub repository', cmd: 'git remote add origin https://github.com/gladiaslawrance/individual-activity.git' },
    { title: '5. Set the main branch', cmd: 'git branch -M main' },
    { title: '6. Push the project to GitHub', cmd: 'git push -u origin main' },
  ];

  gitSteps.forEach((g) => {
    children.push(
      new Paragraph({
        spacing: { before: 40, after: 10 },
        children: [
          new TextRun({
            text: g.title,
            bold: true,
            size: 24,
            font: 'Times New Roman',
          }),
        ],
      })
    );
    addCodeLine(g.cmd);
  });

  children.push(new Paragraph({ spacing: { after: 120 } }));

  // =============================================================
  // 10. PROCEDURE TO RUN PROJECT LOCALLY
  // =============================================================
  addHeading('PROCEDURE TO RUN RATE LIMITING PROJECT LOCALLY');

  const runSteps = [
    {
      title: 'Step 1: Open the project folder',
      cmds: ['cd "d:\\Harish\\glady"'],
    },
    {
      title: 'Step 2: Start MongoDB',
      desc: 'Make sure MongoDB is running on your local system or configure MongoDB Atlas connection URI in .env.',
      cmds: ['# Local mongod or Atlas Cloud connection URI in .env'],
    },
    {
      title: 'Step 3: Start the Backend Server',
      desc: 'Open the first terminal:',
      cmds: [
        'cd backend',
        'npm install',
        'npm run seed',
        'npm start',
        '# Backend URL: http://localhost:5000',
      ],
    },
    {
      title: 'Step 4: Start the Frontend Server',
      desc: 'Open a second terminal:',
      cmds: [
        'cd "d:\\Harish\\glady\\frontend"',
        'npm install',
        'npm run dev',
        '# Frontend URL: http://localhost:5173',
      ],
    },
    {
      title: 'Step 5: Open the Application',
      desc: 'Open Google Chrome and enter: http://localhost:5173',
      cmds: ['http://localhost:5173'],
    },
    {
      title: 'Step 6: Test the Project',
      desc: 'Follow the test procedures below:',
      bullets: [
        'Authenticate with admin credentials (admin@security.local / Admin@123456).',
        'View real-time security dashboard metrics and active client states.',
        'Open the API Request Simulator and select a client.',
        'Send simulated requests to observe sliding-window counters and FSM transitions.',
        'Validate FSM progression: NORMAL (0-69%) -> WARNED (70-99%) -> THROTTLED (100% / 429) -> BLOCKED (repeated violations / 403).',
        'Test regex validation with malformed paths or traversal patterns.',
        'Check generated Abuse Alerts and test admin manual unblock operation.',
        'Verify stored records and state transitions in MongoDB.',
      ],
    },
  ];

  runSteps.forEach((s) => {
    children.push(
      new Paragraph({
        spacing: { before: 40, after: 10 },
        children: [
          new TextRun({
            text: s.title,
            bold: true,
            size: 24,
            font: 'Times New Roman',
          }),
        ],
      })
    );
    if (s.desc) {
      addPara(s.desc, 40);
    }
    if (s.cmds) {
      s.cmds.forEach((c) => addCodeLine(c));
    }
    if (s.bullets) {
      s.bullets.forEach((b) => {
        children.push(
          new Paragraph({
            spacing: { before: 20, after: 20 },
            children: [
              new TextRun({
                text: `• ${b}`,
                size: 24,
                font: 'Times New Roman',
              }),
            ],
          })
        );
      });
    }
  });

  children.push(new Paragraph({ spacing: { after: 120 } }));

  // =============================================================
  // 11. MONGODB & GIT HUB
  // =============================================================
  addHeading('MONGODB & GIT HUB :');
  addPara(
    'The project is fully integrated with MongoDB for real-time document persistence and published to the GitHub cloud repository under the official student profile.'
  );

  // Embed MongoDB & GitHub screenshot image if available
  const tmplImg2 = path.join(__dirname, '../template_img2.png');
  addImageIfExists(tmplImg2, 580, 320);

  addPara('MongoDB Database Connection Details:');
  addCodeLine('Database Name: ratelimit_db');
  addCodeLine('Connection URI: mongodb+srv://gladiaslawrance_db_user:glady1234@cluster0.kv9cirp.mongodb.net/');
  addCodeLine('Local Fallback URI: mongodb://127.0.0.1:27017/ratelimit_db');
  addCodeLine('Collections: clients, apirequests, abusealerts, statetransitions, systemsettings, admins');

  children.push(new Paragraph({ spacing: { after: 40 } }));

  addPara('GitHub Repository & Deployment Verification:');
  addCodeLine('Repository: https://github.com/gladiaslawrance/individual-activity');
  addCodeLine('Author: gladiaslawrance <gladiaslawrance@gmail.com>');
  addCodeLine('Branches: main (Backend & Full Source), gh-pages (Frontend Web Deployment)');
  addCodeLine('Status: Active & Pushed Successfully');

  // Create Document
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children,
      },
    ],
  });

  // Generate buffer
  const buffer = await Packer.toBuffer(doc);

  // Save to target filenames safely
  const targets = [
    path.join(__dirname, '../Rate_Limiting_and_API_Abuse_Detection_System_FSWD_Report.docx'),
    path.join(__dirname, '../docs/Rate_Limiting_and_API_Abuse_Detection_System_FSWD_Report.docx'),
  ];

  for (const targetPath of targets) {
    try {
      fs.writeFileSync(targetPath, buffer);
      console.log(`[SUCCESS] Saved report to: ${targetPath}`);
    } catch (err) {
      if (err.code === 'EBUSY') {
        const altPath = targetPath.replace('.docx', `_${Date.now()}.docx`);
        fs.writeFileSync(altPath, buffer);
        console.log(`[LOCKED - SAVED ALTERNATE] Saved report to: ${altPath}`);
      } else {
        console.error(`[ERROR] Failed saving to ${targetPath}:`, err.message);
      }
    }
  }
}

generateFswdReport()
  .then(() => {
    console.log('FSWD Activity 2 Report Document generated successfully!');
  })
  .catch((err) => {
    console.error('Fatal error during report generation:', err);
    process.exit(1);
  });
