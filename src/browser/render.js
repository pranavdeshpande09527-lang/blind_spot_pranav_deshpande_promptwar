// Existing newspaper renderers, retained from index.html.
export function esc(s) { const d = document.createElement('div'); d.textContent = String(s ?? ''); return d.innerHTML; }
function grounding(g) { return '<div class="grounding"><strong>' + esc(g.kind.replaceAll('_',' ')) + '</strong>' + g.inputQuotes.map(q => '<blockquote>' + esc(q.field) + ': “' + esc(q.quote) + '”</blockquote>').join('') + (g.sourceIds.length ? '<span>Sources: ' + g.sourceIds.map(id => '<a href="#source-' + esc(id) + '">' + esc(id.slice(0,8)) + '</a>').join(', ') + '</span>' : '') + '</div>'; }
export function renderSummary(s) {
    const cells = [
      { label: 'Decision', val: s.decision },
      { label: 'Options', val: s.options },
      { label: 'Stated Goals', val: s.statedGoals },
      { label: 'Key Reasons', val: s.keyReasons },
      { label: 'Constraints', val: s.explicitConstraints },
      { label: 'People & Areas Affected', val: s.affected }
    ];
    const g = document.getElementById('summaryGrid');
    g.innerHTML = cells.map((c, i) => `
      <div class="summary-cell${i >= 4 ? ' wide' : ''}">
        <div class="summary-cell-label">${esc(c.label)}</div>
        <div class="summary-cell-val">${esc(c.val)}</div>
      </div>
    `).join('');
    // fix layout: make last 2 cells full-width only if they really are
    // Actually keep them normal — adjust grid: first 4 in 2-col, last 2 full
    g.innerHTML = `
      <div class="summary-cell"><div class="summary-cell-label">Decision</div><div class="summary-cell-val">${esc(s.decision)}</div></div>
      <div class="summary-cell"><div class="summary-cell-label">Options</div><div class="summary-cell-val">${esc(s.options)}</div></div>
      <div class="summary-cell"><div class="summary-cell-label">Stated Goals</div><div class="summary-cell-val">${esc(s.statedGoals)}</div></div>
      <div class="summary-cell"><div class="summary-cell-label">Key Reasons</div><div class="summary-cell-val">${esc(s.keyReasons)}</div></div>
      <div class="summary-cell"><div class="summary-cell-label">Constraints</div><div class="summary-cell-val">${esc(s.explicitConstraints)}</div></div>
      <div class="summary-cell wide" style="border-bottom:none"><div class="summary-cell-label">People & Areas Affected</div><div class="summary-cell-val">${esc(s.affected)}</div></div>
    `;
  }

export function renderAssumptions(assumptions) {
    const el = document.getElementById('assumptionList');
    el.innerHTML = assumptions.map(a => `
      <div class="assumption-item">
        <div>
          <span class="assumption-tag${a.warn ? ' warn' : ''}">${esc(a.category)}</span>
        </div>
        <div class="assumption-body">
          <div class="assumption-text">${esc(a.text)}</div>
          <div class="assumption-explanation">${esc(a.explanation)}</div>
          <div class="assumption-q">${esc(a.question)}</div>${grounding(a.grounding)}
        </div>
      </div>
    `).join('');
  }

  const SECTION_ORDER = [
    'WHAT MAY BE MISSING',
    'WHO ELSE IS AFFECTED',
    'LONG-TERM IMPACT',
    'PRACTICAL RISKS',
    'EMOTIONAL FACTORS',
    'ALTERNATIVE PERSPECTIVES',
    'TRADE-OFFS NOT YET CONSIDERED'
  ];

export function renderBlindspots(blindspots) {
    // Group by section
    const grouped = {};
    for (const s of SECTION_ORDER) grouped[s] = [];
    for (const b of blindspots) {
      const key = b.section?.toUpperCase() || 'WHAT MAY BE MISSING';
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(b);
    }

    // Split into 3 columns roughly
    const cols = [[], [], []];
    let ci = 0;
    for (const s of SECTION_ORDER) {
      if (grouped[s].length === 0) continue;
      cols[ci % 3].push({ section: s, items: grouped[s] });
      ci++;
    }

    const grid = document.getElementById('blindspotGrid');
    grid.innerHTML = cols.map(col => `
      <div class="blindspot-col">
        ${col.map(g => `
          <div class="blindspot-col-label">${esc(g.section)}</div>
          ${g.items.map(b => `
            <div class="blindspot-item">
              <span class="blindspot-priority priority-${['low','medium','high'].includes(b.priority) ? b.priority : 'medium'}">${esc(b.priority?.toUpperCase() || 'MEDIUM')}</span>
              <div class="blindspot-factor">${esc(b.factor)}</div>
              <div class="blindspot-why">${esc(b.why)}</div>
              <div class="blindspot-relates">↳ ${esc(b.relatesTo)}</div>
              <div class="blindspot-q">${esc(b.question)}</div>${grounding(b.grounding)}
            </div>
          `).join('')}
        `).join('')}
      </div>
    `).join('');
  }

export function renderConflicts(conflicts) {
    const el = document.getElementById('conflictList');
    el.innerHTML = conflicts.map((c, i) => `
      <div class="conflict-item">
        <div class="conflict-num">${String(i + 1).padStart(2, '0')}</div>
        <div class="conflict-body">
          <div class="conflict-headline">${esc(c.headline)}</div>
          <div class="conflict-desc">${esc(c.description)}</div>${grounding(c.grounding)}
        </div>
      </div>
    `).join('');
  }

export function renderPerspectives(perspectives) {
    const el = document.getElementById('perspectiveGrid');
    el.innerHTML = perspectives.map(p => `
      <div class="perspective-cell">
        <div class="perspective-label">
          <span class="perspective-marker"></span>
          ${esc(p.label)}
        </div>
        <div class="perspective-questions">
          ${(p.questions || []).map(q => `<div class="perspective-q">${esc(q)}</div>`).join('')}
        </div>
      </div>
    `).join('');
  }

export function renderReflection(r) {
    const el = document.getElementById('reflectionWrap');

    const matrixRows = (r.assumptionMatrix || []).map(m => `
      <tr>
        <td>${esc(m.assumption)}</td>
        <td>${esc(m.ifTrue)}</td>
        <td>${esc(m.ifFalse)}</td>
      </tr>
    `).join('');

    el.innerHTML = `
      <div class="reflection-block">
        <div class="reflection-block-label red">Key Blind Spots</div>
        <ul class="reflection-list">
          ${(r.topBlindspots || []).map(b => `<li>${esc(b)}</li>`).join('')}
        </ul>
      </div>
      <div class="reflection-block">
        <div class="reflection-block-label">Strongest Assumptions Behind Current Preference</div>
        <ul class="reflection-list">
          ${(r.strongestAssumptions || []).map(a => `<li>${esc(a)}</li>`).join('')}
        </ul>
      </div>
      <div class="reflection-block">
        <div class="reflection-block-label">Most Important Unanswered Questions</div>
        <ul class="reflection-list">
          ${(r.unansweredQuestions || []).map(q => `<li>${esc(q)}</li>`).join('')}
        </ul>
      </div>
      <div class="reflection-block">
        <div class="reflection-block-label">Information or Evidence to Gather</div>
        <ul class="reflection-list">
          ${(r.infoToGather || []).map(i => `<li>${esc(i)}</li>`).join('')}
        </ul>
      </div>
      <div class="reflection-block">
        <div class="reflection-block-label">Assumption Impact Matrix — If True vs. If False</div>
        <table class="assumption-matrix">
          <thead>
            <tr>
              <th>Assumption</th>
              <th>If True</th>
              <th>If False</th>
            </tr>
          </thead>
          <tbody>${matrixRows}</tbody>
        </table>
      </div>
      <div class="reflection-block">
        <div class="reflection-block-label red">Think Before You Decide — Checklist</div>
        <ul class="checklist">
          ${(r.checklist || []).map(c => `
            <li><label><input type="checkbox" /> ${esc(c)}</label></li>
          `).join('')}
        </ul>
      </div>
    `;
  }


