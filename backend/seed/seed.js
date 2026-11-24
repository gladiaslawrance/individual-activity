const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');
const Admin = require('../models/Admin');
const Client = require('../models/Client');
const APIRequest = require('../models/APIRequest');
const AbuseAlert = require('../models/AbuseAlert');
const StateTransition = require('../models/StateTransition');
const SystemSetting = require('../models/SystemSetting');
const connectDB = require('../config/db');

dotenv.config();

const seedDatabase = async () => {
  try {
    console.log('[Seed] Initiating database connection...');
    await connectDB();

    console.log('[Seed] Clearing existing collections...');
    await Admin.deleteMany({});
    await Client.deleteMany({});
    await APIRequest.deleteMany({});
    await AbuseAlert.deleteMany({});
    await StateTransition.deleteMany({});
    await SystemSetting.deleteMany({});

    // 1. Seed Default Admin Account
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@security.local';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
    const adminUsername = process.env.ADMIN_USERNAME || 'SecOps_Admin';

    const admin = new Admin({
      username: adminUsername,
      email: adminEmail,
      password: adminPassword, // pre-save hook will hash this via bcrypt
      role: 'superadmin',
      lastLogin: new Date(),
    });
    await admin.save();
    console.log(`[Seed] Admin created: ${adminEmail} / ${adminPassword}`);

    // 2. Seed System Settings
    const systemSettings = await SystemSetting.create({
      key: 'global_rate_limit_config',
      requestLimit: 20,
      timeWindow: 60,
      warningThreshold: 70,
      throttlingThreshold: 100,
      cooldownDuration: 30,
      autoBlockThreshold: 3,
      simulationInterval: 500,
      updatedBy: 'seed-engine',
    });
    console.log('[Seed] Default system settings created');

    // 3. Seed 6 Sample Clients with distinct states
    const now = new Date();
    const cooldownFuture = new Date(now.getTime() + 30 * 1000);

    const clientsData = [
      {
        clientId: 'client_alpha_finance',
        name: 'Alpha Financial Core',
        email: 'api-team@alphafinance.com',
        apiKey: 'sec_9f82bc7104d538e12470a93108c42b10',
        ipAddress: '192.168.1.101',
        requestCount: 8,
        requestLimit: 20,
        currentState: 'NORMAL',
        cooldownUntil: null,
        violationCount: 0,
        lastRequestTime: new Date(now.getTime() - 25000),
        status: 'active',
      },
      {
        clientId: 'client_beta_analytics',
        name: 'Beta Cloud Analytics',
        email: 'dev@betaanalytics.io',
        apiKey: 'sec_1a4c8e72390f11bc45829910d984ef21',
        ipAddress: '192.168.1.102',
        requestCount: 15,
        requestLimit: 20,
        currentState: 'WARNED',
        cooldownUntil: null,
        violationCount: 0,
        lastRequestTime: new Date(now.getTime() - 10000),
        status: 'active',
      },
      {
        clientId: 'client_gamma_crawler',
        name: 'Gamma Scraper Service',
        email: 'ops@gammascrape.net',
        apiKey: 'sec_77b319aa50efd4c829013840bf910022',
        ipAddress: '10.0.4.55',
        requestCount: 22,
        requestLimit: 20,
        currentState: 'THROTTLED',
        cooldownUntil: cooldownFuture,
        violationCount: 1,
        lastRequestTime: new Date(now.getTime() - 5000),
        status: 'active',
      },
      {
        clientId: 'client_delta_badbot',
        name: 'Delta Malicious Botnet',
        email: 'attacker@darknet-node.org',
        apiKey: 'sec_99ff44aa110288ee554477aa22339900',
        ipAddress: '45.33.32.156',
        requestCount: 58,
        requestLimit: 20,
        currentState: 'BLOCKED',
        cooldownUntil: null,
        violationCount: 4,
        lastRequestTime: new Date(now.getTime() - 2000),
        status: 'suspended',
      },
      {
        clientId: 'client_epsilon_payment',
        name: 'Epsilon Payment Gateway',
        email: 'integrations@epsilonpay.com',
        apiKey: 'sec_3300aa4411bb55cc22dd66ee33ff77aa',
        ipAddress: '172.16.0.42',
        requestCount: 12,
        requestLimit: 50,
        currentState: 'NORMAL',
        cooldownUntil: null,
        violationCount: 0,
        lastRequestTime: new Date(now.getTime() - 45000),
        status: 'active',
      },
      {
        clientId: 'client_zeta_mobile_app',
        name: 'Zeta Mobile API Gateway',
        email: 'mobile@zetaapp.dev',
        apiKey: 'sec_5566778899aabbccddeeff0011223344',
        ipAddress: '192.168.1.108',
        requestCount: 6,
        requestLimit: 25,
        currentState: 'NORMAL',
        cooldownUntil: null,
        violationCount: 0,
        lastRequestTime: new Date(now.getTime() - 60000),
        status: 'active',
      },
    ];

    const seededClients = await Client.insertMany(clientsData);
    console.log(`[Seed] Seeded ${seededClients.length} clients`);

    // 4. Seed Historical Requests
    const sampleEndpoints = ['/api/v1/orders', '/api/v1/users', '/api/v1/analytics', '/api/v1/auth/token', '/api/v1/payment'];
    const sampleRequests = [];

    // Normal client requests
    for (let i = 0; i < 8; i++) {
      sampleRequests.push({
        requestId: `req_norm_${i + 1}`,
        clientId: 'client_alpha_finance',
        ipAddress: '192.168.1.101',
        endpoint: sampleEndpoints[i % sampleEndpoints.length],
        method: i % 2 === 0 ? 'GET' : 'POST',
        payload: { accountId: 'acc_8899', amount: 1500 },
        responseStatus: 200,
        processingResult: 'SUCCESS',
        fsmState: 'NORMAL',
        responseTimeMs: 35 + (i * 4),
        createdAt: new Date(now.getTime() - (8 - i) * 6000),
      });
    }

    // Warned client requests
    for (let i = 0; i < 15; i++) {
      sampleRequests.push({
        requestId: `req_warn_${i + 1}`,
        clientId: 'client_beta_analytics',
        ipAddress: '192.168.1.102',
        endpoint: '/api/v1/analytics',
        method: 'GET',
        payload: null,
        responseStatus: 200,
        processingResult: 'SUCCESS',
        fsmState: i < 14 ? 'NORMAL' : 'WARNED',
        responseTimeMs: 40 + (i * 3),
        createdAt: new Date(now.getTime() - (15 - i) * 3500),
      });
    }

    // Throttled client requests
    for (let i = 0; i < 22; i++) {
      sampleRequests.push({
        requestId: `req_throt_${i + 1}`,
        clientId: 'client_gamma_crawler',
        ipAddress: '10.0.4.55',
        endpoint: '/api/v1/products/scrape',
        method: 'GET',
        payload: null,
        responseStatus: i < 20 ? 200 : 429,
        processingResult: i < 20 ? 'SUCCESS' : 'RATE_LIMITED',
        fsmState: i < 14 ? 'NORMAL' : i < 20 ? 'WARNED' : 'THROTTLED',
        responseTimeMs: 45,
        createdAt: new Date(now.getTime() - (22 - i) * 2000),
      });
    }

    // Blocked client requests
    for (let i = 0; i < 10; i++) {
      sampleRequests.push({
        requestId: `req_block_${i + 1}`,
        clientId: 'client_delta_badbot',
        ipAddress: '45.33.32.156',
        endpoint: '/api/v1/auth/bruteforce',
        method: 'POST',
        payload: { user: 'admin', attempt: i },
        responseStatus: 403,
        processingResult: 'BLOCKED_CLIENT',
        fsmState: 'BLOCKED',
        responseTimeMs: 12,
        createdAt: new Date(now.getTime() - (10 - i) * 1000),
      });
    }

    // Malformed Endpoint Request
    sampleRequests.push({
      requestId: 'req_malformed_path',
      clientId: 'client_delta_badbot',
      ipAddress: '45.33.32.156',
      endpoint: '/api/v1/users/../../etc/passwd',
      method: 'GET',
      payload: null,
      responseStatus: 400,
      processingResult: 'MALFORMED_ENDPOINT',
      fsmState: 'BLOCKED',
      responseTimeMs: 8,
      createdAt: new Date(now.getTime() - 8000),
    });

    await APIRequest.insertMany(sampleRequests);
    console.log(`[Seed] Seeded ${sampleRequests.length} API request logs`);

    // 5. Seed Abuse Alerts
    const sampleAlerts = [
      {
        alertId: 'alert_c8109a1',
        clientId: 'client_delta_badbot',
        clientName: 'Delta Malicious Botnet',
        ipAddress: '45.33.32.156',
        abuseType: 'BLOCKED_CLIENT_ATTEMPT',
        severity: 'CRITICAL',
        description: 'Blocked client client_delta_badbot attempted unauthorized invocation on POST /api/v1/auth/bruteforce',
        resolutionStatus: 'UNRESOLVED',
        createdAt: new Date(now.getTime() - 2000),
      },
      {
        alertId: 'alert_b429188',
        clientId: 'client_delta_badbot',
        clientName: 'Delta Malicious Botnet',
        ipAddress: '45.33.32.156',
        abuseType: 'PATH_TRAVERSAL_ATTEMPT',
        severity: 'CRITICAL',
        description: 'Security alert: Path traversal sequence (../, %2e%2e, system files) detected in endpoint: "/api/v1/users/../../etc/passwd"',
        resolutionStatus: 'UNRESOLVED',
        createdAt: new Date(now.getTime() - 8000),
      },
      {
        alertId: 'alert_t330149',
        clientId: 'client_gamma_crawler',
        clientName: 'Gamma Scraper Service',
        ipAddress: '10.0.4.55',
        abuseType: 'POST_THROTTLE_VIOLATION',
        severity: 'HIGH',
        description: 'Client client_gamma_crawler bypassed delay and spammed API during active cooldown window',
        resolutionStatus: 'UNRESOLVED',
        createdAt: new Date(now.getTime() - 4000),
      },
      {
        alertId: 'alert_e190342',
        clientId: 'client_gamma_crawler',
        clientName: 'Gamma Scraper Service',
        ipAddress: '10.0.4.55',
        abuseType: 'EXCESSIVE_REQUESTS',
        severity: 'MEDIUM',
        description: 'Client exceeded max configured sliding window rate limit (21/20 requests)',
        resolutionStatus: 'ACKNOWLEDGED',
        resolvedBy: 'SecOps_Admin',
        resolvedAt: new Date(now.getTime() - 3000),
        createdAt: new Date(now.getTime() - 5000),
      },
      {
        alertId: 'alert_r881920',
        clientId: 'client_beta_analytics',
        clientName: 'Beta Cloud Analytics',
        ipAddress: '192.168.1.102',
        abuseType: 'RAPID_BURST_FLOODING',
        severity: 'MEDIUM',
        description: 'High-frequency micro-burst detected: client issued sequential requests in <120ms',
        resolutionStatus: 'RESOLVED',
        resolvedBy: 'SecOps_Admin',
        resolvedAt: new Date(now.getTime() - 9000),
        createdAt: new Date(now.getTime() - 10000),
      },
    ];

    await AbuseAlert.insertMany(sampleAlerts);
    console.log(`[Seed] Seeded ${sampleAlerts.length} abuse alerts`);

    // 6. Seed State Transitions
    const sampleTransitions = [
      {
        transitionId: 'trans_init_01',
        clientId: 'client_beta_analytics',
        clientName: 'Beta Cloud Analytics',
        fromState: 'NORMAL',
        toState: 'WARNED',
        reason: 'Request volume reached 70% threshold (14/20 reqs)',
        triggeredBy: 'SYSTEM',
        metrics: { requestCount: 14, limit: 20, windowSeconds: 60, violationCount: 0 },
        timestamp: new Date(now.getTime() - 12000),
      },
      {
        transitionId: 'trans_init_02',
        clientId: 'client_gamma_crawler',
        clientName: 'Gamma Scraper Service',
        fromState: 'NORMAL',
        toState: 'WARNED',
        reason: 'Request volume reached 70% threshold (14/20 reqs)',
        triggeredBy: 'SYSTEM',
        metrics: { requestCount: 14, limit: 20, windowSeconds: 60, violationCount: 0 },
        timestamp: new Date(now.getTime() - 18000),
      },
      {
        transitionId: 'trans_init_03',
        clientId: 'client_gamma_crawler',
        clientName: 'Gamma Scraper Service',
        fromState: 'WARNED',
        toState: 'THROTTLED',
        reason: 'Client reached rate limit (20/20 reqs). Throttling initiated for 30s.',
        triggeredBy: 'SYSTEM',
        metrics: { requestCount: 20, limit: 20, windowSeconds: 60, violationCount: 1 },
        timestamp: new Date(now.getTime() - 6000),
      },
      {
        transitionId: 'trans_init_04',
        clientId: 'client_delta_badbot',
        clientName: 'Delta Malicious Botnet',
        fromState: 'THROTTLED',
        toState: 'BLOCKED',
        reason: 'Automated security block: Client accumulated 4 violations (threshold: 3)',
        triggeredBy: 'SYSTEM',
        metrics: { requestCount: 25, limit: 20, windowSeconds: 60, violationCount: 4 },
        timestamp: new Date(now.getTime() - 15000),
      },
    ];

    await StateTransition.insertMany(sampleTransitions);
    console.log(`[Seed] Seeded ${sampleTransitions.length} FSM state transitions`);

    console.log('=======================================================');
    console.log('  Database seeding successfully finalized!            ');
    console.log('=======================================================');
    process.exit(0);
  } catch (error) {
    console.error(`[Seed Error] ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();
