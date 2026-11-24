const fs = require('fs');
const path = require('path');
const { Document, Packer, Paragraph, TextRun, AlignmentType } = require('docx');

async function generateNetworkReport() {
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

  // Helper for major section headings
  const addHeading1 = (text, spacingBefore = 160, spacingAfter = 80) => {
    children.push(
      new Paragraph({
        spacing: { before: spacingBefore, after: spacingAfter },
        children: [
          new TextRun({
            text,
            bold: true,
            size: 26,
            font: 'Times New Roman',
            color: '000000',
          }),
        ],
      })
    );
  };

  // Helper for sub headings (1.1, 1.2, etc.)
  const addHeading2 = (text, spacingBefore = 120, spacingAfter = 60) => {
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

  // Helper for bullet items
  const addBullet = (bulletTitle, bulletDesc) => {
    children.push(
      new Paragraph({
        spacing: { before: 20, after: 40 },
        children: [
          new TextRun({
            text: `• ${bulletTitle}: `,
            bold: true,
            size: 24,
            font: 'Times New Roman',
          }),
          new TextRun({
            text: bulletDesc,
            size: 24,
            font: 'Times New Roman',
          }),
        ],
      })
    );
  };

  // Helper for numbered items
  const addNumberedItem = (num, title, desc) => {
    children.push(
      new Paragraph({
        spacing: { before: 20, after: 40 },
        children: [
          new TextRun({
            text: `${num}. ${title ? title + ': ' : ''}`,
            bold: true,
            size: 24,
            font: 'Times New Roman',
          }),
          new TextRun({
            text: desc,
            size: 24,
            font: 'Times New Roman',
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

  // =============================================================
  // INSTITUTIONAL HEADER
  // =============================================================
  addTitleLine('VELALAR COLLEGE OF ENGINEERING AND TECHNOLOGY, ERODE -12', 26, true);
  addTitleLine('(AUTONOMOUS)', 22, true);
  addTitleLine('DEPARTMENT OF INFORMATION TECHNOLOGY', 24, true);
  addTitleLine('ACADEMIC YEAR: 2026 -27 (ODD)', 22, true);
  addTitleLine('ACTIVITY- Project-Based Assessment', 24, true);

  children.push(new Paragraph({ spacing: { after: 100 } }));

  // STUDENT METADATA
  addMetaLine('NAME', 'GLADIAS LAWRANCE G');
  addMetaLine('CLASS', '24IT5A');
  addMetaLine('REG.NO', '732924ITR030');
  addMetaLine('SUBJECT CODE', '22ITT51');
  addMetaLine('SUBJECT NAME', 'FULL STACK WEB DEVELOPMENT / COMPUTER NETWORKS');
  addMetaLine('ACTIVITY', '2');
  addMetaLine('Title Assigned', 'IoT Device Status Monitoring System');

  children.push(new Paragraph({ spacing: { after: 120 } }));

  // =============================================================
  // 1. NETWORK TOPOLOGY & DEVICE INTERCONNECTION
  // =============================================================
  addHeading1('1. NETWORK TOPOLOGY & DEVICE INTERCONNECTION');

  addHeading2('1.1 Network Architecture & Topology Classification');
  addPara(
    'The IoT Device Status Monitoring System implements a Hybrid Client-Server Star Topology deployed over a Wide Area Network (WAN / Public Internet). The system interconnects three distinct tiers: the Edge Client Tier (IoT Simulated Sensors & Browser Dashboard), the Application Server Tier (Render Cloud Web Service), and the Cloud Database Tier (MongoDB Atlas Replica Set).'
  );

  addHeading2('1.2 Network Interconnection & Hardware Device Roles');
  addPara(
    'In this network architecture, several physical and logical network devices work together to guarantee reliable and secure telemetry transmission:'
  );
  addBullet(
    'Network Interface Card (NIC)',
    'Operates at Physical & Data Link layers (OSI Layers 1 & 2) on the client machine to encode and transmit digital frames over Wi-Fi (IEEE 802.11) or Ethernet (IEEE 802.3).'
  );
  addBullet(
    'Network Switch (Layer 2)',
    'Maintains a MAC Address Table to forward Ethernet frames within the local subnet without collisions.'
  );
  addBullet(
    'Local Gateway Router (Layer 3)',
    'Acts as the default gateway (192.168.1.1), provides DHCP dynamic IP configuration, executes Network Address Translation (NAT) to map private IPs to public WAN IPs, and routes packets to the Internet Service Provider (ISP).'
  );
  addBullet(
    'ISP Edge Routers & Autonomous Systems (AS)',
    'Route packets across the Internet backbone using Border Gateway Protocol (BGP).'
  );
  addBullet(
    'Cloud Reverse Proxy & Load Balancer (Render Cloud Edge)',
    'Receives incoming HTTPS traffic on Port 443, handles TLS termination, performs DDoS protection, and distributes HTTP requests to backend container instances on Port 5000.'
  );
  addBullet(
    'MongoDB Atlas Replica Set Router (Mongos)',
    'Routes database write queries across multi-region replica nodes to ensure zero data loss.'
  );

  addHeading2('1.3 Topology Interconnection Diagram');
  const topologyLines = [
    '[IoT Sensor Simulation / Browser Dashboard]',
    '    │ (LAN: 192.168.1.15 : Ephemeral Port 52140)',
    '    ▼',
    '[Local Gateway / NAT Router] (LAN: 192.168.1.1 ──> Public IP: 103.212.x.x)',
    '    │',
    '    ▼ (WAN / ISP Optical Fiber / BGP Internet Routing)',
    '[GitHub Pages Anycast CDN] (185.199.108.153 : Port 443 ──> Serves React SPA)',
    '    │',
    '    ▼ (HTTPS REST Ingestion: /api/readings)',
    '[Render Cloud Load Balancer & Reverse Proxy] (216.24.57.1 : Port 443)',
    '    │ (Internal Container Binding: 0.0.0.0 : Port 5000)',
    '    ▼',
    '[Node.js + Express Backend Server] (Evaluates FSM Automata: Registered -> Active -> Disconnected)',
    '    │',
    '    ▼ (Secure TLS TCP Socket : Port 27017)',
    '[MongoDB Atlas Cloud Database Cluster] (Host: cluster0.pimkevk.mongodb.net)',
    '    ├── Primary Database Node (Active Read/Write)',
    '    └── Secondary Replica Nodes (Automatic Failover & Redundancy)',
  ];
  topologyLines.forEach((l) => addCodeLine(l));

  // =============================================================
  // 2. IP ADDRESSING SCHEME & COMMUNICATION ANALYSIS
  // =============================================================
  addHeading1('2. IP ADDRESSING SCHEME & COMMUNICATION ANALYSIS');
  addPara(
    'IP addressing provides logical identification and routing for every node across the Internet. Below is the comprehensive addressing specification identifying each entity in our IoT monitoring system, its assigned IP address, category, and functional role:'
  );

  const ipEntities = [
    {
      entity: 'Client Workstation',
      ip: '192.168.1.15',
      type: 'Private IPv4 (Class C, /24)',
      role: 'Originates simulated IoT HTTP requests & loads UI',
    },
    {
      entity: 'Local Gateway Router',
      ip: '192.168.1.1',
      type: 'Private Gateway IPv4',
      role: 'Performs DHCP allocation and stateful NAT translation',
    },
    {
      entity: 'Client Public IP',
      ip: '103.212.x.x (Dynamic)',
      type: 'Public Routable IPv4',
      role: 'Identifies the client LAN across the public Internet',
    },
    {
      entity: 'GitHub Pages CDN',
      ip: '185.199.108.153',
      type: 'Public Anycast IPv4',
      role: 'Delivers React static bundle via edge caching',
    },
    {
      entity: 'Render Backend API',
      ip: '216.24.57.1',
      type: 'Public Cloud Anycast IPv4',
      role: 'Receives REST telemetry & executes FSM logic',
    },
    {
      entity: 'MongoDB Atlas',
      ip: 'cluster0.pimkevk.mongodb.net',
      type: 'Cloud Distributed Domain',
      role: 'Hosts persistent sensor readings & alert collections',
    },
  ];

  ipEntities.forEach((item) => {
    addBullet(
      item.entity,
      `Assigned IP/Domain: ${item.ip} | Type: ${item.type} | Role: ${item.role}`
    );
  });

  addHeading2('2.1 Network Address Translation (NAT) & Private-to-Public Mapping');
  addPara(
    'Under RFC 1918, private IP addresses (such as 192.168.1.15) cannot be routed across the Internet. When an IoT device sends a reading, the local gateway router executes Network Address Port Translation (NAPT). The router replaces the private source IP (192.168.1.15:52140) with its own public IP (103.212.x.x:61025) and registers this translation in its stateful NAT table. When Render replies with HTTP 200 OK, the router references the NAT table to route the response back to the private client workstation.'
  );

  addHeading2('2.2 Domain Name System (DNS) Resolution Process');
  addPara(
    "Before sending telemetry data, the client must resolve the backend domain 'iot-monitoring-backend-p9h0.onrender.com' into an IP address through the following sequential resolution flow:"
  );

  addNumberedItem('1', 'Local Cache Inspection', 'Client OS checks local DNS cache and hosts file.');
  addNumberedItem(
    '2',
    'Recursive Query Dispatch',
    'Recursive DNS query is dispatched over UDP Port 53 to Google DNS (8.8.8.8) or Cloudflare DNS (1.1.1.1).'
  );
  addNumberedItem(
    '3',
    'Hierarchy Traversal',
    'The resolver navigates the DNS hierarchy: Root Servers (.) ──> TLD Servers (.com) ──> Render Authoritative Name Servers.'
  );
  addNumberedItem(
    '4',
    'Authoritative Response',
    "The Authoritative Server returns an 'A' Record pointing to Anycast IP 216.24.57.1."
  );
  addNumberedItem(
    '5',
    'Connection Initialization',
    'The client caches the IP and begins the TCP 3-way handshake.'
  );

  // =============================================================
  // 3. PROTOCOLS USED & WORKING PRINCIPLES
  // =============================================================
  addHeading1('3. PROTOCOLS USED & WORKING PRINCIPLES');
  addPara(
    'The IoT monitoring system utilizes a comprehensive protocol stack conforming to both the OSI 7-Layer Reference Model and the TCP/IP 4-Layer Architecture:'
  );

  const osiLayers = [
    {
      layer: 'Layer 7: Application Layer',
      protocols: 'HTTP/1.1, HTTPS, REST, DNS',
      role: 'Transmits serialized JSON telemetry payloads; handles REST endpoints (/api/readings, /api/devices, /api/health).',
    },
    {
      layer: 'Layer 6: Presentation Layer',
      protocols: 'TLS 1.3, SSL, JSON Encoding',
      role: 'Handles asymmetric/symmetric cryptographic encryption, data formatting, and JSON object serialization.',
    },
    {
      layer: 'Layer 4: Transport Layer',
      protocols: 'TCP (Transmission Control Protocol)',
      role: 'Guarantees reliable, in-order, error-checked telemetry delivery via 3-way handshake, Seq/Ack numbers, and flow control.',
    },
    {
      layer: 'Layer 3: Network Layer',
      protocols: 'IPv4, ICMP, ARP, BGP',
      role: 'Handles logical end-to-end routing of IP datagrams across Autonomous Systems and Internet backbones.',
    },
    {
      layer: 'Layers 1 & 2: Link / Physical Layer',
      protocols: 'Ethernet 802.3, Wi-Fi 802.11, Cat6',
      role: 'Governs framing, MAC addressing, hardware collision avoidance, and bit-level transmission across physical media.',
    },
  ];

  osiLayers.forEach((item) => {
    addBullet(
      item.layer,
      `Protocols: ${item.protocols} | Functional Role: ${item.role}`
    );
  });

  addHeading2('3.1 Application Layer: HTTP/1.1 & REST Architecture');
  addPara(
    'Communication between the IoT simulation client and the backend server follows the RESTful (Representational State Transfer) architectural pattern:'
  );
  addBullet(
    'POST /api/readings',
    'Ingests sensor data (deviceId, temperature, humidity, battery). Triggers FSM evaluation and MongoDB persistence.'
  );
  addBullet(
    'GET /api/devices',
    'Queries device profiles, metadata, and current finite automaton state (Registered, Active, Disconnected).'
  );
  addBullet(
    'GET /api/alerts',
    'Queries active validation exceptions and network anomaly logs.'
  );
  addBullet(
    'GET /api/health',
    'Provides live system diagnostic data including database connection state.'
  );

  addHeading2('3.2 Transport Layer: Transmission Control Protocol (TCP)');
  addPara(
    'TCP is chosen over UDP for device status monitoring because telemetry records and state transitions require 100% reliable, zero-loss transmission:'
  );
  addNumberedItem(
    '1',
    'TCP 3-Way Handshake',
    'Client sends SYN ──> Server replies with SYN-ACK ──> Client sends ACK. A reliable full-duplex session is established.'
  );
  addNumberedItem(
    '2',
    'Sequence & Acknowledgment Numbers',
    'Every segment carries a unique Sequence Number; the receiver acknowledges received bytes, allowing the sender to detect missing segments.'
  );
  addNumberedItem(
    '3',
    'Flow & Congestion Control',
    'Advertised window sizes prevent receiver buffer overflow, while Congestion Avoidance algorithms prevent router queue collapse.'
  );
  addNumberedItem(
    '4',
    'Connection Teardown',
    'Uses a 4-way FIN/ACK handshake to cleanly release operating system socket buffers.'
  );

  addHeading2('3.3 Security Layer: TLS 1.3 Cryptographic Handshake');
  addPara(
    "All communications are encrypted using Transport Layer Security (TLS 1.3). During connection establishment, the client verifies Render's X.509 digital certificate signed by a trusted Certificate Authority (Let's Encrypt). An Elliptic Curve Diffie-Hellman Ephemeral (ECDHE) exchange establishes symmetric AES-256-GCM session keys, ensuring confidentiality, integrity, and non-repudiation."
  );

  // =============================================================
  // 4. PORT NUMBERS & JUSTIFICATION
  // =============================================================
  addHeading1('4. PORT NUMBERS & JUSTIFICATION');
  addPara(
    'Port numbers are 16-bit unsigned integers (0 to 65535) defined at the Transport Layer to identify specific application processes on a host. Below is the technical justification for every port utilized across the IoT ecosystem:'
  );

  const portEntries = [
    {
      port: 'Port 443 (TCP)',
      service: 'HTTPS (Secure Web)',
      justification: 'Standard IANA port for encrypted web traffic between client and cloud. Prevents eavesdropping on public networks.',
    },
    {
      port: 'Port 80 (TCP)',
      service: 'HTTP (Standard Web)',
      justification: 'Standard unencrypted web port. Automatically issues HTTP 301/308 redirects to Port 443 to enforce HTTPS.',
    },
    {
      port: 'Port 5000 (TCP)',
      service: 'Express Server (Internal)',
      justification: 'Backend application listener port (process.env.PORT || 5000) bound to 0.0.0.0 inside the Render container.',
    },
    {
      port: 'Port 5173 (TCP)',
      service: 'Vite Dev Server',
      justification: 'Development port for React frontend, providing fast Hot Module Replacement (HMR) during local engineering.',
    },
    {
      port: 'Port 27017 (TCP)',
      service: 'MongoDB Atlas Daemon',
      justification: 'Standard IANA port for MongoDB Wire Protocol socket connections over TLS to the cloud database cluster.',
    },
    {
      port: 'Ports 49152–65535 (TCP)',
      service: 'Ephemeral Client Ports',
      justification: 'Dynamically allocated by client operating system to uniquely separate concurrent TCP sessions on the client.',
    },
  ];

  portEntries.forEach((p) => {
    addBullet(p.port, `Associated Service: ${p.service} | Technical Justification: ${p.justification}`);
  });

  addHeading2('4.1 Socket Pair Analysis');
  addPara(
    'At the transport layer, every active communication channel is uniquely identified by a 4-tuple Socket Pair:'
  );
  addCodeLine('Socket Pair = (Source IP, Source Port, Destination IP, Destination Port)');
  addPara('Example Telemetry Transmission:');
  addCodeLine('(192.168.1.15 : 52140, 216.24.57.1 : 443)');
  addBullet(
    'Destination Port 443',
    "Directs the packet to Render's HTTPS reverse proxy."
  );
  addBullet(
    'Source Port 52140',
    'Ensures that when the HTTP 200 response returns, the client OS routes it directly to the exact browser tab that initiated the request.'
  );

  // =============================================================
  // 5. END-TO-END PACKET FLOW & LIFECYCLE
  // =============================================================
  addHeading1('5. END-TO-END PACKET FLOW & LIFECYCLE');
  addPara(
    'The diagram and steps below trace the complete lifecycle of an IoT telemetry message from initial simulation dispatch to database persistence and return response:'
  );

  const packetDiagramLines = [
    '[Client Workstation]       [Local Router]        [Render Edge]         [Express 5000]       [MongoDB Atlas]',
    '       │                        │                     │                     │                     │',
    '1. DNS Query (UDP Port 53) ───> │                     │                     │                     │',
    '<── DNS IP: 216.24.57.1 ─────── │                     │                     │                     │',
    '       │                        │                     │                     │                     │',
    '2. TCP SYN (Port 52140->443) ─> │ ─> [NAT 61025] ───> │                     │                     │',
    '<── TCP SYN-ACK ─────────────── │ <────────────────── │                     │                     │',
    '3. TCP ACK ───────────────────> │ ──────────────────> │                     │                     │',
    '       │                        │                     │                     │                     │',
    '4. TLS 1.3 Key Exchange ──────> │ ──────────────────> │ (TLS Termination)   │                     │',
    '       │                        │                     │                     │                     │',
    '5. Encrypted HTTPS POST ──────> │ ──────────────────> │ ── Proxy Forward ─> │                     │',
    '   Payload: {deviceId, temp}    │                     │    (Port 5000)      │ 6. Schema Check     │',
    '       │                        │                     │                     │ 7. FSM: -> Active   │',
    '       │                        │                     │                     │ 8. DB Write ──────> │',
    '       │                        │                     │                     │ <── DB Write ACK ── │',
    '       │                        │                     │ <── HTTP 200 OK ─── │                     │',
    '9. Return HTTP 200 OK <──────── │ <── NAT Demux ───── │                     │                     │',
    '10. Browser UI Glows Green      │                     │                     │                     │',
  ];
  packetDiagramLines.forEach((l) => addCodeLine(l));

  addHeading2('5.1 Detailed 10-Step Packet Traversal');
  const traversalSteps = [
    {
      num: '1',
      title: 'Application Serialization',
      desc: 'User clicks "Send Valid Message". The browser packages JSON payload: {"deviceId":"IOT001","temperature":28.5,"humidity":65,"battery":92}.',
    },
    {
      num: '2',
      title: 'DNS Resolution',
      desc: 'Browser queries local DNS over UDP Port 53 to resolve "iot-monitoring-backend-p9h0.onrender.com" to Anycast IP 216.24.57.1.',
    },
    {
      num: '3',
      title: 'TCP Handshake',
      desc: 'Client operating system dispatches TCP SYN segment with an ephemeral port (e.g., 52140). Render responds with SYN-ACK, client replies with ACK.',
    },
    {
      num: '4',
      title: 'TLS 1.3 Negotiation',
      desc: 'Digital certificate verification and ECDHE key exchange establish symmetric AES-256 session keys.',
    },
    {
      num: '5',
      title: 'Protocol Encapsulation',
      desc: 'The payload is encapsulated through the stack: JSON Data ──> HTTP POST ──> TLS Record ──> TCP Segment ──> IP Datagram ──> Ethernet Frame.',
    },
    {
      num: '6',
      title: 'Local NAT & WAN Routing',
      desc: 'Client NIC transmits frame to local router ──> Router performs NAT (translates private IP to public IP) ──> Packet traverses ISP BGP backbones to Render.',
    },
    {
      num: '7',
      title: 'Reverse Proxy Decapsulation',
      desc: 'Render edge load balancer terminates TLS and passes unencrypted HTTP request internally to Node.js on Port 5000.',
    },
    {
      num: '8',
      title: 'Express Middleware & FSM Processing',
      desc: 'Express runs validateMessage middleware. Valid temperature (-40°C to 85°C) passes to FSM engine, which transitions device to "Active".',
    },
    {
      num: '9',
      title: 'MongoDB Cloud Socket Write',
      desc: 'Server initiates a TLS TCP socket write on Port 27017 to MongoDB Atlas cluster. MongoDB commits the document and returns write acknowledgment.',
    },
    {
      num: '10',
      title: 'Return Response & UI Update',
      desc: 'Backend constructs HTTP 200 OK response with JSON: {"success":true,"state":"Active"}. The packet traverses back to the router, NAT routes it to the client workstation, and the React UI updates in real time.',
    },
  ];

  traversalSteps.forEach((s) => {
    addNumberedItem(s.num, s.title, s.desc);
  });

  // =============================================================
  // 6. NETWORK SIMULATION SCENARIOS IN THE PROJECT
  // =============================================================
  addHeading1('6. NETWORK SIMULATION SCENARIOS IN THE PROJECT');
  addPara(
    'The project includes interactive simulation controls to demonstrate network protocol behavior under both normal and fault conditions:'
  );

  const simScenarios = [
    {
      action: 'Send Valid Message',
      condition: 'Healthy packet transmission',
      protocol: 'HTTP 200 OK over TLS stream',
      response: 'FSM transitions to Active. Telemetry persisted in MongoDB.',
    },
    {
      action: 'Invalid Temperature (200°C)',
      condition: 'Corrupt / out-of-bounds telemetry',
      protocol: 'Application layer schema rejection (HTTP 400 Bad Request)',
      response: 'FSM preserves current state. Validation error alert logged.',
    },
    {
      action: 'Simulate Comm Failure',
      condition: 'Packet drop, broken link, or socket reset',
      protocol: 'TCP connection reset / timeout event',
      response: 'FSM transitions to Disconnected. Failure alert logged.',
    },
    {
      action: 'Simulate Timeout',
      condition: 'Heartbeat keep-alive expiration (>45s)',
      protocol: 'Session timeout / inactivity expiry',
      response: 'FSM transitions to Disconnected. Timeout alert logged.',
    },
    {
      action: 'Reconnect Device',
      condition: 'Link restoration & re-handshake',
      protocol: 'New TCP handshake & valid telemetry message',
      response: 'FSM restored to Active. Reconnection alert logged.',
    },
  ];

  simScenarios.forEach((sim) => {
    addBullet(
      sim.action,
      `Condition: ${sim.condition} | Protocol Layer: ${sim.protocol} | FSM/Database: ${sim.response}`
    );
  });

  // =============================================================
  // 7. GITHUB REPOSITORY
  // =============================================================
  addHeading1('7. GITHUB REPOSITORY');
  addBullet(
    'Project Source Code Repository',
    'https://github.com/Dhanusheyap755/IoT-Device-Status-Monitoring-System'
  );
  addBullet(
    'Student Implementation Repository',
    'https://github.com/gladiaslawrance/individual-activity'
  );

  // Create Document
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440,
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

  const buffer = await Packer.toBuffer(doc);

  const targets = [
    path.join(__dirname, '../IoT_Device_Status_Monitoring_System_Network_Report.docx'),
    path.join(__dirname, '../docs/IoT_Device_Status_Monitoring_System_Network_Report.docx'),
  ];

  for (const targetPath of targets) {
    try {
      fs.writeFileSync(targetPath, buffer);
      console.log(`[SUCCESS] Saved report to: ${targetPath}`);
    } catch (err) {
      if (err.code === 'EBUSY') {
        const altPath = targetPath.replace('.docx', `_${Date.now()}.docx`);
        fs.writeFileSync(altPath, buffer);
        console.log(`[LOCKED - SAVED ALTERNATE] Saved to: ${altPath}`);
      } else {
        console.error(`[ERROR] Failed saving to ${targetPath}:`, err.message);
      }
    }
  }
}

generateNetworkReport()
  .then(() => {
    console.log('Network Report generated successfully with 0 tables and 0 boxes!');
  })
  .catch((err) => {
    console.error('Error generating network report:', err);
    process.exit(1);
  });
