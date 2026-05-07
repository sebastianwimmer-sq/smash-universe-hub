/**
 * 🧭 PEAKING Coach — Pattern-Detection + Smart-Insights-Engine
 *
 * Reine Lese-Logik auf bestehenden User-Daten in localStorage.
 * Kein Backend, kein npm. Sebi-Voice: ehrlich, kurz, motivierend, kein Hype.
 *
 * API:
 *   Coach.getDailyCard()         → höchste Priorität: 1 Card
 *   Coach.getSetupChecklist()    → 6-Step-Onboarding
 *   Coach.getPillarHealth()      → Säulen-Balance + Drift-Warnings
 *   Coach.getPostingPatterns()   → Beste Zeit, ER-Trend, Top-Pattern, Format-Diversity
 *   Coach.getMastermindToday()   → Rotierender Mastermind-Reminder
 *   Coach.getNext3Steps()        → Persistent Action-Queue (gespeichert, checkable)
 *   Coach.completeStep(id)       → Step abhaken
 */

const Coach = (function() {

  // ============ HELPERS ============
  function _reels()  { return SmashApp.getData('reels', []) || []; }
  function _ideas()  { return SmashApp.getData('ideas', []) || []; }
  function _pillars(){ return SmashApp.getPillarInfo() || {}; }
  function _plan()   { return SmashApp.getPostingPlan() || {}; }
  function _account(){ return SmashApp.getCurrentAccount(); }

  function _daysAgo(iso) {
    if (!iso) return Infinity;
    return Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 3600 * 24));
  }
  function _today() {
    const days = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
    return days[new Date().getDay()];
  }
  function _er(r) {
    const reach = Number(r.reach) || Number(r.plays) || Number(r.views) || 0;
    if (!reach) return 0;
    const eng = (Number(r.likes)||0) + (Number(r.comments)||0) + (Number(r.saves)||0) + (Number(r.shares)||0);
    return (eng / reach) * 100;
  }

  // ============ DAILY COACH-CARD ============
  // Returns ONE highest-priority insight for today.
  function getDailyCard() {
    const reels = _reels();
    const today = _today();
    const plan = _plan();
    const acc = _account();
    const accInfo = SmashApp.getAccount();

    // P0: kein Reel seit 7+ Tagen → momentum-risk
    if (reels.length === 0) {
      return {
        emoji: '🚀',
        priority: 'high',
        title: 'Erstes Reel fehlt noch',
        body: `Auf @${acc} ist noch kein einziger Reel getrackt. Setup-Checklist unten zeigt dir den Weg.`,
        cta: { text: '→ Setup-Checklist', href: '#setup' }
      };
    }

    const lastReel = reels.slice().sort((a, b) => new Date(b.date||0) - new Date(a.date||0))[0];
    const daysSinceLast = _daysAgo(lastReel?.date);

    if (daysSinceLast >= 7) {
      return {
        emoji: '⚠️',
        priority: 'high',
        title: `${daysSinceLast} Tage kein Reel — Momentum-Risk`,
        body: `Algo straft Drift härter als Pause. Heute 1 Quick-Reel reicht — nimm einen Top-Performer aus dem Tracker und mach Re-Cut.`,
        cta: { text: '→ Tracker', href: 'tracker.html' }
      };
    }

    // P1: heute ist Posting-Tag laut Plan
    if (plan[today]) {
      const slot = plan[today];
      const pillarInfo = _pillars()[slot.pillar];
      return {
        emoji: '🌅',
        priority: 'high',
        title: `Heute ${today} · ${slot.emoji||''} ${slot.name||'Reel-Tag'}`,
        body: pillarInfo
          ? `Posting-Plan sagt: ${pillarInfo.emoji} ${pillarInfo.name}-Reel. Generier eine neue Idee oder zieh eine aus dem Backlog.`
          : 'Posting-Plan sagt: heute Reel-Tag. Generier eine neue Idee oder zieh eine aus dem Backlog.',
        cta: { text: '→ Ideas', href: 'ideas.html' }
      };
    }

    // P2: Loss-Hook-Underuse insight
    const usage = SmashApp.getData('hookUsage', {}) || {};
    const totalUses = Object.values(usage).reduce((s, u) => s + (u.count||0), 0);
    if (totalUses >= 3) {
      const lossUses = Object.entries(usage).reduce((s, [id, u]) => {
        const idNum = Number(id);
        return (idNum >= 4000 && idNum < 4100) ? s + (u.count||0) : s;
      }, 0);
      const lossRatio = lossUses / totalUses;
      if (lossRatio < 0.2) {
        return {
          emoji: '⚡',
          priority: 'medium',
          title: 'Loss-Hooks underused',
          body: `Du nutzt Loss-Hooks nur in ${(lossRatio*100).toFixed(0)}% deiner Picks. Greg Isenberg: Loss-Format performt 2-3× besser. Eine Loss-Idee diese Woche reicht.`,
          cta: { text: '→ Hooks', href: 'hooks.html' }
        };
      }
    }

    // P3: Pillar-Drift
    const drift = _detectPillarDrift(reels);
    if (drift) {
      return {
        emoji: '⚖️',
        priority: 'medium',
        title: `Pillar-Drift: ${drift.pillar}`,
        body: `${drift.actual}% statt ${drift.target}%-Target. ${drift.actual > drift.target ? 'Andere Pillar pushen' : 'Mehr in dieser Pillar pushen'}.`,
        cta: { text: '→ Idea Bank', href: 'ideas.html' }
      };
    }

    // P4: ER-Trend positive → encouragement
    const trend = _erTrend(reels);
    if (trend && trend.delta > 0.5) {
      return {
        emoji: '📈',
        priority: 'low',
        title: `ER trending up: +${trend.delta.toFixed(1)}%`,
        body: `Letzte 7 Tage avg ER ${trend.recent.toFixed(2)}% vs vorher ${trend.previous.toFixed(2)}%. Was du tust funktioniert — mehr davon.`,
        cta: { text: '→ Analytics', href: 'analytics.html' }
      };
    }

    // Default: motivational steady-state
    return _toneAdapt({
      emoji: '⛰️',
      priority: 'low',
      title: 'Steady climb.',
      body: `Du bist on track. ${reels.length} Reels getrackt. Always peaking — heute 1 Schritt weiter.`,
      cta: { text: '→ Today', href: '../dashboard.html' }
    });
  }

  // ============ SETUP-CHECKLIST ============
  function getSetupChecklist() {
    const acc = _account();
    const reels = _reels();
    const ideas = _ideas();
    const customPillars = SmashApp.getData('customPillars', null);
    const customPlan = SmashApp.getData('customPostingPlan', null);

    // Persistent overrides — Sebi can manually mark a step done even if data-detect missed it
    const manualDone = SmashApp.getData('coachSetupManualDone', {}) || {};

    const steps = [
      {
        id: 's1_pillars',
        title: 'Pillars definieren',
        why: 'Pillars sind dein Content-Fundament. Ohne Pillars kein Pattern — Algo + Audience verstehen dich nicht.',
        done: !!customPillars || manualDone.s1_pillars,
        cta: { text: '→ Settings · Pillar-Editor', href: 'settings.html' }
      },
      {
        id: 's2_plan',
        title: 'Posting-Plan setzen',
        why: '4× pro Woche minimum (Mo/Mi/Fr/Sa). Routine schlägt Inspiration. Ohne Plan postest du sporadisch.',
        done: !!customPlan || manualDone.s2_plan,
        cta: { text: '→ Settings · Posting-Plan', href: 'settings.html' }
      },
      {
        id: 's3_bio',
        title: 'Insta-Bio + Profilbild ready',
        why: 'Erste 3 Sek nach Reel-View entscheiden ob jemand folgt. Bio muss in 2 Sek klar machen WAS du bist + WARUM folgen.',
        done: manualDone.s3_bio || false,
        cta: { text: '→ Growth Center', href: 'growth.html' }
      },
      {
        id: 's4_hook',
        title: 'Erste Hook ausgewählt',
        why: 'Hook = 80% des Reach-Erfolgs. Ohne Hook-Library bist du beim Brainstormen jedes Mal verloren.',
        done: ideas.length >= 1 || manualDone.s4_hook,
        cta: { text: '→ Hook-Library', href: 'hooks.html' }
      },
      {
        id: 's5_reel',
        title: 'Erstes Reel getrackt',
        why: 'Ohne Tracking kein Lernen. Erstes Reel im Tracker bringt dir 14 Tage später Win-Rate-Insights.',
        done: reels.length >= 1 || manualDone.s5_reel,
        cta: { text: '→ Tracker', href: 'tracker.html' }
      },
      {
        id: 's6_crosspost',
        title: 'Cross-Post-Plan klar',
        why: 'Wenn du 2 Accounts hast: Cross-Post 48-72h später für 2× Reach pro Idee. Sonst skip.',
        done: (SmashApp.getData('crossPostLog', []) || []).length >= 1 || manualDone.s6_crosspost,
        cta: { text: '→ Cross-Post', href: 'cross-post.html' }
      }
    ];

    const completed = steps.filter(s => s.done).length;
    return {
      steps,
      completed,
      total: steps.length,
      pct: Math.round((completed / steps.length) * 100)
    };
  }

  function completeStep(id) {
    const manual = SmashApp.getData('coachSetupManualDone', {}) || {};
    manual[id] = true;
    SmashApp.setData('coachSetupManualDone', manual);
  }

  // ============ PILLAR-HEALTH ============
  function _detectPillarDrift(reels) {
    if (reels.length < 5) return null;
    const pillars = _pillars();
    const counts = {};
    reels.forEach(r => { if (r.pillar) counts[r.pillar] = (counts[r.pillar]||0) + 1; });
    const total = Object.values(counts).reduce((a,b) => a+b, 0);
    if (total === 0) return null;

    let worst = null;
    Object.entries(pillars).forEach(([key, p]) => {
      const actual = ((counts[key]||0) / total) * 100;
      const diff = Math.abs(actual - (p.target||0));
      if (diff >= 15 && (!worst || diff > worst.diff)) {
        worst = { pillar: p.name, actual: Math.round(actual), target: p.target, diff };
      }
    });
    return worst;
  }

  function getPillarHealth() {
    const reels = _reels();
    const pillars = _pillars();
    if (reels.length < 3) {
      return { ready: false, msg: 'Brauche mind. 3 getrackte Reels für Health-Check.' };
    }
    const counts = {};
    reels.forEach(r => { if (r.pillar) counts[r.pillar] = (counts[r.pillar]||0) + 1; });
    const total = Object.values(counts).reduce((a,b) => a+b, 0) || 1;

    const breakdown = Object.entries(pillars).map(([key, p]) => {
      const actual = ((counts[key]||0) / total) * 100;
      const target = p.target || 0;
      const status = Math.abs(actual - target) < 10 ? 'ok' :
                     actual < target ? 'under' : 'over';
      return { key, name: p.name, emoji: p.emoji, color: p.color, actual: Math.round(actual), target, status };
    });

    const drifts = breakdown.filter(b => b.status !== 'ok');
    const score = Math.max(0, 100 - drifts.reduce((s, b) => s + Math.abs(b.actual - b.target), 0));

    return { ready: true, breakdown, drifts, score: Math.round(score) };
  }

  // ============ POSTING-PATTERNS ============
  function _erTrend(reels) {
    if (reels.length < 6) return null;
    const sorted = reels.slice().sort((a, b) => new Date(b.date||0) - new Date(a.date||0));
    const recent = sorted.slice(0, 7);
    const previous = sorted.slice(7, 14);
    if (previous.length < 3) return null;
    const recentER = recent.map(_er).reduce((a,b)=>a+b, 0) / recent.length;
    const prevER = previous.map(_er).reduce((a,b)=>a+b, 0) / previous.length;
    return { recent: recentER, previous: prevER, delta: recentER - prevER };
  }

  function _bestPostingTime(reels) {
    if (reels.length < 5) return null;
    const buckets = {}; // hour → [ER values]
    reels.forEach(r => {
      const t = r.date || r.postedAt;
      if (!t) return;
      const h = new Date(t).getHours();
      if (!buckets[h]) buckets[h] = [];
      buckets[h].push(_er(r));
    });
    let best = null;
    Object.entries(buckets).forEach(([h, ers]) => {
      if (ers.length < 2) return;
      const avg = ers.reduce((a,b)=>a+b, 0) / ers.length;
      if (!best || avg > best.avg) best = { hour: Number(h), avg, count: ers.length };
    });
    return best;
  }

  function _topPerformerPattern(reels) {
    if (reels.length < 5) return null;
    const sorted = reels.slice().sort((a, b) => (Number(b.plays)||0) - (Number(a.plays)||0));
    const top3 = sorted.slice(0, 3);
    const formats = {}; const pillars = {};
    top3.forEach(r => {
      if (r.format) formats[r.format] = (formats[r.format]||0) + 1;
      if (r.pillar) pillars[r.pillar] = (pillars[r.pillar]||0) + 1;
    });
    const topFormat = Object.entries(formats).sort((a,b) => b[1]-a[1])[0];
    const topPillar = Object.entries(pillars).sort((a,b) => b[1]-a[1])[0];
    return {
      topPlays: top3[0]?.plays || 0,
      topHook: top3[0]?.hook || top3[0]?.title || '',
      formatDominance: topFormat ? { fmt: topFormat[0], count: topFormat[1] } : null,
      pillarDominance: topPillar ? { pillar: topPillar[0], count: topPillar[1] } : null
    };
  }

  function _formatDiversity(reels) {
    if (reels.length < 3) return null;
    const formats = {};
    reels.forEach(r => { if (r.format) formats[r.format] = (formats[r.format]||0) + 1; });
    const distinctCount = Object.keys(formats).length;
    const total = reels.length;
    // Shannon-Index simplified: more distinct formats = higher diversity
    let entropy = 0;
    Object.values(formats).forEach(c => {
      const p = c / total;
      if (p > 0) entropy -= p * Math.log2(p);
    });
    const maxEntropy = distinctCount > 1 ? Math.log2(distinctCount) : 1;
    const score = Math.round((entropy / maxEntropy) * 100);
    return { distinctCount, score };
  }

  function getPostingPatterns() {
    const reels = _reels();
    return {
      ready: reels.length >= 5,
      total: reels.length,
      bestTime: _bestPostingTime(reels),
      erTrend: _erTrend(reels),
      topPattern: _topPerformerPattern(reels),
      diversity: _formatDiversity(reels)
    };
  }

  // ============ MASTERMIND-REMINDERS ============
  const MASTERMIND_TRUTHS = [
    { emoji: '🪝', topic: 'Hook',     text: 'Hook = 80% des Reach-Erfolgs. Die ersten 2 Sekunden entscheiden alles.' },
    { emoji: '⚡', topic: 'Loss',     text: 'Loss-Hooks performen 2-3× besser als Win-Hooks (Greg Isenberg, 2026).' },
    { emoji: '📤', topic: 'Sends',    text: 'Sends-per-Reach >1% ist die King-Metric 2026 — schlägt Likes und Saves.' },
    { emoji: '⏱️', topic: '2s-Hold',  text: '2s-Hold-Rate >60% = Algo-Empfehlung. Unter 50% bricht der Reel ab.' },
    { emoji: '🔁', topic: 'Routine',  text: 'Routine schlägt Inspiration. 4×/Woche posten ist Mindest-Frequenz.' },
    { emoji: '🎯', topic: 'Pillars',  text: 'Klare Pillars = klares Profile-Branding. Ohne Pillars verstehst der Algo dich nicht.' },
    { emoji: '🔄', topic: 'Recycle',  text: 'Top-3 Performer alle 60-90 Tage recyclen. Neue Audience hat sie nie gesehen.' },
    { emoji: '🧠', topic: 'Identity', text: '„Ich bin Creator" funktioniert besser als „Ich will posten". Identity > Action.' },
    { emoji: '📊', topic: 'Track',    text: 'Was du nicht trackst, kannst du nicht verbessern. Tracker ist Pflicht, nicht optional.' },
    { emoji: '🤝', topic: 'Engage',   text: 'Erste 30 Min nach Posting: aktiv Comments beantworten. Algo belohnt Real-Time-Engagement.' },
    { emoji: '🌅', topic: 'Authority',text: 'Authority-Hook (Stat/Mistake/BIP) > Curiosity-Hook für Long-Term-Followers.' },
    { emoji: '⛰️', topic: 'Climb',    text: 'The climb is the peak. Always peaking heißt: heute 1 Schritt weiter, nicht alles auf einmal.' }
  ];

  function getMastermindToday() {
    // Respect Settings → Coach-Verhalten → mastermindRotate pref (default: rotate)
    const rotate = SmashApp.getPref ? SmashApp.getPref('mastermindRotate', true) : true;
    if (!rotate) return MASTERMIND_TRUTHS[0]; // fixe Wahrheit (Hook = 80%)
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    return MASTERMIND_TRUTHS[dayOfYear % MASTERMIND_TRUTHS.length];
  }

  // Coach-Tone-aware Card-Body-Wrapper (motivating/analytical/balanced)
  function _toneAdapt(card) {
    const tone = SmashApp.getPref ? SmashApp.getPref('coachTone', 'balanced') : 'balanced';
    if (tone === 'motivating' && card.priority !== 'high') {
      // Sanftere, motivierende Sprache
      return { ...card, body: card.body.replace(/⚠️|Risk|underused|Drift/g, '').trim() + ' Du machst das gut.' };
    }
    if (tone === 'analytical' && card.body.length < 200) {
      // Append data-source hint
      return { ...card, body: card.body + ' (Quelle: deine Tracker-Daten + 2026-Algo-Studien)' };
    }
    return card;
  }

  function getAllMastermindTruths() {
    return MASTERMIND_TRUTHS;
  }

  // ============ NEXT-3-STEPS ============
  // Persistent action-queue. Re-generates when items are completed.
  function getNext3Steps() {
    const stored = SmashApp.getData('coachNext3', null);
    if (stored && stored.items && stored.generatedAt) {
      const ageDays = _daysAgo(stored.generatedAt);
      if (ageDays < 1 && stored.items.some(s => !s.done)) return stored.items;
    }
    const fresh = _generateNext3();
    SmashApp.setData('coachNext3', { items: fresh, generatedAt: new Date().toISOString() });
    return fresh;
  }

  function _generateNext3() {
    const reels = _reels();
    const ideas = _ideas();
    const setup = getSetupChecklist();
    const dailyCard = getDailyCard();
    const drift = _detectPillarDrift(reels);
    const items = [];

    // 1. Daily-Card-CTA always first
    if (dailyCard.cta) {
      items.push({
        id: 'n_daily_' + Date.now(),
        text: dailyCard.title + ' — ' + dailyCard.cta.text.replace('→ ', ''),
        href: dailyCard.cta.href,
        done: false
      });
    }

    // 2. First open setup-step
    const openStep = setup.steps.find(s => !s.done);
    if (openStep) {
      items.push({
        id: 'n_setup_' + openStep.id,
        text: 'Setup: ' + openStep.title,
        href: openStep.cta.href,
        done: false
      });
    }

    // 3. Drift-Action OR Idea-Backlog-Push
    if (drift) {
      items.push({
        id: 'n_drift_' + Date.now(),
        text: `Pillar-Balance fixen: ${drift.pillar} bei ${drift.actual}%`,
        href: 'ideas.html',
        done: false
      });
    } else if (ideas.filter(i => i.status === 'idea').length === 0 && reels.length > 0) {
      items.push({
        id: 'n_ideas_' + Date.now(),
        text: 'Idea-Backlog leer — 3 neue Ideen brainstormen',
        href: 'ideas.html',
        done: false
      });
    } else {
      // Default: weekly recap
      items.push({
        id: 'n_recap_' + Date.now(),
        text: 'Diese Woche: 1 BIP-Update auf @peakingworld posten',
        href: 'story-pack.html',
        done: false
      });
    }

    return items.slice(0, 3);
  }

  function completeNextStep(id) {
    const stored = SmashApp.getData('coachNext3', null) || { items: [] };
    const item = stored.items.find(i => i.id === id);
    if (item) item.done = true;
    SmashApp.setData('coachNext3', stored);
  }

  function regenerateNext3() {
    const fresh = _generateNext3();
    SmashApp.setData('coachNext3', { items: fresh, generatedAt: new Date().toISOString() });
    return fresh;
  }

  // ============ EXPORT ============
  return {
    getDailyCard,
    getSetupChecklist,
    completeStep,
    getPillarHealth,
    getPostingPatterns,
    getMastermindToday,
    getAllMastermindTruths,
    getNext3Steps,
    completeNextStep,
    regenerateNext3
  };
})();
