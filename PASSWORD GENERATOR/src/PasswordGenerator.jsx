import { useState, useRef, useEffect, useCallback } from 'react';
import './PasswordGenerator.css';

export default function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [useUppercase, setUseUppercase] = useState(true);
  const [useLowercase, setUseLowercase] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSpecial, setUseSpecial] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [autoClearClipboard, setAutoClearClipboard] = useState(true);
  const [overHttp, setOverHttp] = useState(false);

  // Store password in a ref (not React state) to keep it out of DevTools / serialization
  const passwordRef = useRef('');
  const [pwVersion, setPwVersion] = useState(0);
  const destroyTimerRef = useRef(null);
  const clearClipTimerRef = useRef(null);

  const getPassword = useCallback(() => passwordRef.current, []);
  const setPassword = useCallback((val) => {
    passwordRef.current = val;
    setPwVersion((v) => v + 1);
  }, []);

  // Check if served over HTTP
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      setOverHttp(true);
    }
  }, []);

  // Auto-destroy password after 60s of inactivity
  useEffect(() => {
    if (!getPassword()) return;
    clearTimeout(destroyTimerRef.current);
    destroyTimerRef.current = setTimeout(() => {
      setPassword('');
      setCopied(false);
      setShowPassword(false);
    }, 60000);
    return () => clearTimeout(destroyTimerRef.current);
  }, [pwVersion, getPassword, setPassword]);

  // Clear resources on unmount
  useEffect(() => {
    return () => {
      clearTimeout(destroyTimerRef.current);
      clearTimeout(clearClipTimerRef.current);
      passwordRef.current = '';
    };
  }, []);

  const countEnabledOptions = (upper, lower, nums, spec) => {
    return [upper, lower, nums, spec].filter(Boolean).length;
  };

  const handleCheckboxChange = (type, newValue) => {
    if (!newValue && countEnabledOptions(
      type === 'upper' ? false : useUppercase,
      type === 'lower' ? false : useLowercase,
      type === 'nums' ? false : useNumbers,
      type === 'spec' ? false : useSpecial
    ) < 2) {
      return;
    }

    if (type === 'upper') setUseUppercase(newValue);
    if (type === 'lower') setUseLowercase(newValue);
    if (type === 'nums') setUseNumbers(newValue);
    if (type === 'spec') setUseSpecial(newValue);
  };

  const generatePassword = () => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    let chars = '';
    if (useUppercase) chars += uppercase;
    if (useLowercase) chars += lowercase;
    if (useNumbers) chars += numbers;
    if (useSpecial) chars += special;

    if (!chars) {
      setPassword('');
      setCopied(false);
      return;
    }

    // Use crypto.getRandomValues for cryptographically secure randomness
    const cryptoObj = (typeof window !== 'undefined' && (window.crypto || window.msCrypto)) || (typeof self !== 'undefined' && self.crypto);
    if (!cryptoObj || typeof cryptoObj.getRandomValues !== 'function') {
      console.warn('Crypto API unavailable — falling back to Math.random (not cryptographically secure)');
    }

    const getSecureByte = () => {
      const byte = new Uint8Array(1);
      if (cryptoObj && typeof cryptoObj.getRandomValues === 'function') {
        cryptoObj.getRandomValues(byte);
      } else {
        byte[0] = Math.floor(Math.random() * 256);
      }
      return byte[0];
    };

    // Rejection sampling: avoid modulo bias by rejecting bytes >= limit
    const limit = 256 - (256 % chars.length);
    let result = '';
    for (let i = 0; i < length; i++) {
      let byte;
      do {
        byte = getSecureByte();
      } while (byte >= limit);
      result += chars.charAt(byte % chars.length);
    }

    setPassword(result);
    setCopied(false);
  };

  const copyToClipboard = async () => {
    const pw = getPassword();
    if (!pw) return;
    try {
      await navigator.clipboard.writeText(pw);
      setCopied(true);

      clearTimeout(clearClipTimerRef.current);
      if (autoClearClipboard) {
        clearClipTimerRef.current = setTimeout(async () => {
          try {
            await navigator.clipboard.writeText('');
          } catch (e) {
            // ignore inability to clear clipboard
          }
          setCopied(false);
        }, 15000);
      } else {
        clearClipTimerRef.current = setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      // Don't log sensitive data; only log error object
      console.error('Clipboard write failed', err);
    }
  };

  return (
    <div className="password-generator">
      <div className="container">
        {overHttp && (
          <div className="https-warning" role="alert">
            Warning: This page is served over HTTP. Passwords may be intercepted by a network attacker. Use HTTPS in production.
          </div>
        )}

        <h1>Password Generator</h1>
        <p>Create strong, secure passwords in seconds</p>

        <div className="password-display">
          <div className="password-input-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              value={getPassword()}
              readOnly
              placeholder="Your password will appear here"
              className="password-input"
              autoComplete="off"
              inputMode="none"
            />
            <button
              className="toggle-btn"
              onClick={() => setShowPassword((prev) => !prev)}
              disabled={!getPassword()}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          <button
            className="copy-btn"
            onClick={copyToClipboard}
            disabled={!getPassword()}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        <div className="settings">
          <div className="length-setting">
            <label htmlFor="length">Password Length: {length}</label>
            <input
              id="length"
              type="range"
              min="8"
              max="64"
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              className="slider"
            />
          </div>

          <div className="checkboxes">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={useUppercase}
                onChange={(e) => handleCheckboxChange('upper', e.target.checked)}
                disabled={useUppercase && countEnabledOptions(useUppercase, useLowercase, useNumbers, useSpecial) === 2}
              />
              <span>Uppercase (A-Z)</span>
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={useLowercase}
                onChange={(e) => handleCheckboxChange('lower', e.target.checked)}
                disabled={useLowercase && countEnabledOptions(useUppercase, useLowercase, useNumbers, useSpecial) === 2}
              />
              <span>Lowercase (a-z)</span>
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={useNumbers}
                onChange={(e) => handleCheckboxChange('nums', e.target.checked)}
                disabled={useNumbers && countEnabledOptions(useUppercase, useLowercase, useNumbers, useSpecial) === 2}
              />
              <span>Numbers (0-9)</span>
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={useSpecial}
                onChange={(e) => handleCheckboxChange('spec', e.target.checked)}
                disabled={useSpecial && countEnabledOptions(useUppercase, useLowercase, useNumbers, useSpecial) === 2}
              />
              <span>Special (!@#$%^&*)</span>
            </label>
          </div>

          <div className="clipboard-settings">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={autoClearClipboard}
                onChange={(e) => setAutoClearClipboard(e.target.checked)}
              />
              <span>Clear clipboard after 15s (recommended)</span>
            </label>
            <p className="clipboard-warning">Warning: copying places the password into the system clipboard. Avoid pasting into untrusted sites or inputs.</p>
          </div>

          <button className="generate-btn" onClick={generatePassword}>
            Generate Password
          </button>
        </div>
      </div>
    </div>
  );
}
