(() => {
  'use strict';
  const TITLE = 'FINDING AUDREY CHEN';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&*@?';
  const ascii = document.getElementById('ascii');
  const log = document.getElementById('log');
  const result = document.getElementById('result');
  const retry = document.getElementById('retry');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

  function message(text) {
    const p = document.createElement('p');
    p.textContent = text;
    log.appendChild(p);
  }

  function getDestinations() {
    const entries = Array.isArray(window.AUDREY_DESTINATIONS) ? window.AUDREY_DESTINATIONS : [];
    return entries.filter(entry => {
      if (!entry || typeof entry.name !== 'string' || !entry.name.trim() || typeof entry.url !== 'string' || entry.enabled === false) return false;
      try {
        const url = new URL(entry.url);
        return url.protocol === 'https:' && !url.hostname.endsWith('.example') && url.hostname !== 'example.com';
      } catch { return false; }
    });
  }

  function pickDifferent(entries) {
    let last = null;
    try { last = sessionStorage.getItem('lastAudreyUrl'); } catch { /* storage unavailable */ }
    const pool = entries.length > 1 ? entries.filter(e => e.url !== last) : entries;
    const candidates = pool.length ? pool : entries;
    const picked = candidates[Math.floor(Math.random() * candidates.length)];
    try { sessionStorage.setItem('lastAudreyUrl', picked.url); } catch { /* storage unavailable */ }
    return picked;
  }

  async function glitch() {
    if (reducedMotion) { ascii.textContent = TITLE; return; }
    const frames = 30;
    for (let frame = 0; frame <= frames; frame++) {
      const resolved = Math.floor((frame / frames) * TITLE.length);
      ascii.textContent = [...TITLE].map((char, index) =>
        char === ' ' ? ' ' : index < resolved ? char : chars[Math.floor(Math.random() * chars.length)]
      ).join('');
      await wait(65);
    }
    ascii.textContent = TITLE;
  }

  async function run() {
    retry.hidden = true;
    log.replaceChildren();
    result.replaceChildren();
    ascii.textContent = '';
    message('INITIALIZING SEARCH PROTOCOL...');
    await glitch();
    message('SCANNING KNOWN DESTINATIONS...');
    await wait(reducedMotion ? 0 : 500);
    const destinations = getDestinations();
    if (!destinations.length) {
      message('NO DESTINATIONS CONFIGURED.');
      result.textContent = 'Add real HTTPS destinations in destinations.js, then reload this page.';
      retry.hidden = false;
      return;
    }
    const selected = pickDifferent(destinations);
    message(`MATCH FOUND: ${selected.name.toUpperCase()}`);
    const line = document.createElement('p');
    const strong = document.createElement('strong');
    strong.textContent = selected.name;
    line.append('DESTINATION: ', strong);
    result.appendChild(line);
    const countdown = document.createElement('p');
    result.appendChild(countdown);
    countdown.textContent = 'REDIRECTING IN 2 SECONDS...';
    await wait(1000);
    countdown.textContent = 'REDIRECTING IN 1 SECOND...';
    await wait(1000);
    // replace() avoids a back-button redirect loop.
    window.location.replace(selected.url);
  }

  retry.addEventListener('click', run);
  run();
})();
