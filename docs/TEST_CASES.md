# Test Scenarios and Automated Verification Report

This document records the test cases, expected behaviors, and actual test results executed against the **Rate Limiting and API Abuse Detection System**.

---

## Automated Test Harness Execution
The test suite can be run at any time via:
```bash
npm run test
# Or directly:
cd backend && node tests/fsm_ratelimit.test.js
```

### Automated Verification Summary
- **Total Test Cases**: 7
- **Passed**: 7
- **Failed**: 0
- **Success Rate**: 100%

---

## Scenario 1: Normal Request Baseline
- **Input**: Client sends requests under $70\%$ of the configured sliding window limit ($4 / 10$ requests).
- **Execution**: Evaluated against `computeNextState` and sliding window count.
- **Expected State**: `NORMAL` (S0)
- **Expected Response**: `HTTP 200 OK`, `processingResult: SUCCESS`
- **Result**: **PASS**

---

## Scenario 2: Warning Threshold Reached
- **Input**: Client request rate reaches or exceeds $70\%$ of limit ($7 / 10$ requests).
- **Execution**: Sliding window evaluates threshold $\ge 70\% \land < 100\%$.
- **Expected State**: `WARNED` (S1)
- **Expected Response**: `HTTP 200 OK`, Warning state indicator attached in response and logged in MongoDB.
- **Result**: **PASS**

---

## Scenario 3: Request Limit Exceeded (Throttling)
- **Input**: Client reaches $100\%$ of limit ($10 / 10$ requests).
- **Execution**: Sliding window triggers ceiling policy.
- **Expected State**: `THROTTLED` (S2)
- **Expected Response**: `HTTP 429 Too Many Requests`. Active cooldown timer (30s) initiated.
- **Result**: **PASS**

---

## Scenario 4: Persistent Violation Escalation (Lockout)
- **Input**: Client repeatedly violates rate limits or sends requests during active cooldown, accumulating $\ge 3$ violations.
- **Execution**: Auto-block policy evaluated ($V_{\text{client}} \ge \Theta_{\text{autoblock}}$).
- **Expected State**: `BLOCKED` (S3)
- **Expected Response**: `HTTP 403 Forbidden`. Client access suspended. Critical threat alert generated.
- **Result**: **PASS**

---

## Scenario 5: Blocked Client Request Rejection
- **Input**: A client in `BLOCKED` state sends another API call.
- **Execution**: Pre-flight state check in `evaluateRateLimit`.
- **Expected Result**: Immediate rejection with `HTTP 403 Forbidden`, `processingResult: BLOCKED_CLIENT`.
- **Result**: **PASS**

---

## Scenario 6: Administrator Manual Unblock
- **Input**: Administrator executes `POST /api/clients/:id/unblock`.
- **Execution**: `transitionClientState` invoked with `isManualUnblock: true`.
- **Expected State**: `NORMAL` (S0). Cooldown reset to `null` and violation count reset to `0`.
- **Expected Response**: `HTTP 200 OK` with confirmation message.
- **Result**: **PASS**

---

## Scenario 7: Regex Path Traversal & Malformed Inputs
- **Input**:
  - Endpoint: `/api/v1/users/../../etc/passwd`
  - Endpoint: `api/v1/missing_slash`
  - Endpoint: `/api/v1/user<script>`
- **Execution**: Pre-processing validation in `backend/utils/regexValidator.js`.
- **Expected Result**: Rejection with `HTTP 400 Bad Request`, `processingResult: MALFORMED_ENDPOINT`, and `CRITICAL` severity Abuse Alert logged for path traversal attempts. Clean paths (`/api/v1/orders/123`) permitted.
- **Result**: **PASS**
