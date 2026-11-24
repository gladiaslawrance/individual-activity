# Finite State Machine (FSM) State Transition Table

The following formal State Transition Table defines the deterministic behavior of the backend rate limiting and abuse prevention engine implemented in `backend/services/fsmService.js`.

---

## State Transition Table

| Rule ID | Current State | Input / Condition | Next State | System Action & Response |
|:---|:---|:---|:---|:---|
| **R1** | **NORMAL (S0)** | Requests $< 70\%$ of limit in sliding window ($W$) | **NORMAL (S0)** | Accept request with `HTTP 200 OK`. Increments client request counter. Baseline log recorded. |
| **R2** | **NORMAL (S0)** | $70\% \le \text{Requests} < 100\%$ of limit in window | **WARNED (S1)** | Accept request with `HTTP 200 OK`. Attach warning headers. Emits StateTransition record. |
| **R3** | **NORMAL (S0)** | Requests reach $\ge 100\%$ of limit in window | **THROTTLED (S2)** | Reject request with `HTTP 429 Too Many Requests`. Activates cooldown timer (30s). Increments violation counter. |
| **R4** | **NORMAL (S0)** | Violations $\ge$ auto-block threshold ($\Theta \ge 3$) or severe exploit | **BLOCKED (S3)** | Reject request with `HTTP 403 Forbidden`. Revokes client access token. Critical security alert emitted. |
| **R5** | **WARNED (S1)** | Requests $< 70\%$ in sliding window (traffic subsides) | **NORMAL (S0)** | Accept request with `HTTP 200 OK`. Restores normal client badge. Clears warning telemetry flag. |
| **R6** | **WARNED (S1)** | $70\% \le \text{Requests} < 100\%$ of limit | **WARNED (S1)** | Accept request with `HTTP 200 OK`. Maintains elevated monitoring state. |
| **R7** | **WARNED (S1)** | Requests reach $100\%$ of limit | **THROTTLED (S2)** | Reject request with `HTTP 429 Too Many Requests`. Initiates cooldown period. Increments violations. |
| **R8** | **WARNED (S1)** | Repeated excessive requests ($\ge 3$ violations) | **BLOCKED (S3)** | Reject with `HTTP 403 Forbidden`. Enters automated lockdown. |
| **R9** | **THROTTLED (S2)** | Incoming request arrives during active cooldown window ($t < \text{CooldownUntil}$) | **THROTTLED (S2)** | Reject request with `HTTP 429 Too Many Requests`. Increments violation counter for bypassing delay. Logs high-severity alert. |
| **R10** | **THROTTLED (S2)** | Cooldown expires AND requests in sliding window $< 70\%$ | **NORMAL (S0)** | Accept request with `HTTP 200 OK`. Full recovery to standard operation. Cooldown reset to null. |
| **R11** | **THROTTLED (S2)** | Cooldown expires BUT request rate remains between $70\%$ and $99\%$ | **WARNED (S1)** | Accept request with `HTTP 200 OK`. Client transitions to warned state. |
| **R12** | **THROTTLED (S2)** | Cooldown expires BUT requests still $\ge 100\%$ OR violations $\ge 3$ | **BLOCKED (S3)** | Reject request with `HTTP 403 Forbidden`. Escalates client to BLOCKED state for persistent abuse. |
| **R13** | **BLOCKED (S3)** | Any incoming request from client | **BLOCKED (S3)** | Reject immediately with `HTTP 403 Forbidden`. Emits `CRITICAL` severity Abuse Alert in MongoDB. |
| **R14** | **BLOCKED (S3)** | Administrator manually invokes unblock operation | **NORMAL (S0)** | Restores client to NORMAL state. Resets violation counters and clears active cooldowns. |

---

## State Transition Metrics & Parameters

- **$L$ (Request Limit)**: Default is `20` requests per window.
- **$W$ (Sliding Window Duration)**: Default is `60` seconds.
- **$\text{WarnThreshold}$**: Default is `70%` (e.g. 14 calls for a limit of 20).
- **$T_{\text{cooldown}}$**: Default cooldown is `30` seconds.
- **$\Theta_{\text{autoblock}}$**: Default auto-block threshold is `3` violations.
