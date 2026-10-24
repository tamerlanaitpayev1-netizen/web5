/**
 * ============================================================================
 * Task 1: Turn-Based Battle Game
 * Option B: Hero & Enemy Battle Engine
 * 
 * Course: Web Technologies (AITU) - Assignment #5
 * Student: Aitpayev Tamerlan | Group: IT-2510
 * ============================================================================
 */

// ----------------------------------------------------------------------------
// 1. GAME CONSTANTS (Stored at the top of the script)
// ----------------------------------------------------------------------------
const HERO_MAX_HP = 100;
const ENEMY_MAX_HP = 100;

const HERO_ATTACK_MIN = 8;
const HERO_ATTACK_MAX = 15;

const ENEMY_ATTACK_MIN = 5;
const ENEMY_ATTACK_MAX = 14;

const HERO_HEAL_AMOUNT = 20;
const HERO_MAX_HEALS = 3;

const CRITICAL_HIT_CHANCE = 0.10; // 10% probability
const CRITICAL_DAMAGE_MULTIPLIER = 2.0;
const DEFENSE_REDUCTION_FACTOR = 0.5; // Halves the incoming hit

const MAX_LOG_ENTRIES = 5;

// ----------------------------------------------------------------------------
// 2. GAME STATE
// ----------------------------------------------------------------------------
let currentHeroHp = HERO_MAX_HP;
let currentEnemyHp = ENEMY_MAX_HP;
let remainingHeals = HERO_MAX_HEALS;
let isDefending = false;
let isGameOver = false;
let isBusy = false;
let turnCount = 0;
let actionLogs = [];

// ----------------------------------------------------------------------------
// 3. DOM ELEMENT REFERENCES
// ----------------------------------------------------------------------------
const heroHpFillEl = document.getElementById('hero-hp-fill');
const enemyHpFillEl = document.getElementById('enemy-hp-fill');
const heroHpTextEl = document.getElementById('hero-hp-text');
const enemyHpTextEl = document.getElementById('enemy-hp-text');
const healCountBadgeEl = document.getElementById('heal-count-badge');
const heroDefenseBuffEl = document.getElementById('hero-defense-buff');
const turnCounterEl = document.getElementById('turn-counter');

const attackBtnEl = document.getElementById('btn-attack');
const defendBtnEl = document.getElementById('btn-defend');
const healBtnEl = document.getElementById('btn-heal');
const restartBtnEl = document.getElementById('btn-restart');

const alertBannerEl = document.getElementById('battle-alert');
const alertMessageEl = document.getElementById('battle-alert-message');
const outcomeBannerEl = document.getElementById('battle-outcome');
const outcomeTitleEl = document.getElementById('outcome-title');
const outcomeDescEl = document.getElementById('outcome-desc');
const logListEl = document.getElementById('action-log-list');

const heroCardEl = document.getElementById('hero-card');
const enemyCardEl = document.getElementById('enemy-card');

// ----------------------------------------------------------------------------
// 4. FAIR RANDOM NUMBER GENERATION
// ----------------------------------------------------------------------------
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function checkIsCriticalHit() {
  return Math.random() < CRITICAL_HIT_CHANCE;
}

// ----------------------------------------------------------------------------
// 5. ALERT / FEEDBACK BANNER
// ----------------------------------------------------------------------------
function showMessage(message, type = 'warning') {
  if (!alertBannerEl || !alertMessageEl) return;
  alertBannerEl.className = `alert alert-${type}`;
  alertMessageEl.textContent = message;
  alertBannerEl.style.display = 'flex';
}

function clearMessage() {
  if (!alertBannerEl) return;
  alertBannerEl.style.display = 'none';
}

// ----------------------------------------------------------------------------
// 6. ACTION LOGGING
// ----------------------------------------------------------------------------
function addLogEntry(text, type, timeString) {
  const newEntry = {
    id: Date.now() + Math.random(),
    text: text,
    type: type,
    timestamp: timeString || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  };

  actionLogs.unshift(newEntry);

  if (actionLogs.length > MAX_LOG_ENTRIES) {
    actionLogs.pop();
  }

  renderLogs();
}

function renderLogs() {
  if (!logListEl) return;
  
  while (logListEl.firstChild) {
    logListEl.removeChild(logListEl.firstChild);
  }

  for (const log of actionLogs) {
    const li = document.createElement('li');
    li.classList.add('log-item', `log-${log.type}`);

    const spanText = document.createElement('span');
    spanText.textContent = log.text;

    const spanMeta = document.createElement('span');
    spanMeta.classList.add('log-meta');
    spanMeta.textContent = log.timestamp;

    li.appendChild(spanText);
    li.appendChild(spanMeta);
    logListEl.appendChild(li);
  }
}

// ----------------------------------------------------------------------------
// 7. UI RENDER FUNCTION
// ----------------------------------------------------------------------------
function updateGameStateUI() {
  const heroPercentage = Math.max(0, Math.min(100, Math.round((currentHeroHp / HERO_MAX_HP) * 100)));
  heroHpFillEl.style.width = `${heroPercentage}%`;
  heroHpTextEl.textContent = `${currentHeroHp} / ${HERO_MAX_HP} HP`;

  heroHpFillEl.classList.remove('hp-mid', 'hp-low');
  if (heroPercentage <= 25) {
    heroHpFillEl.classList.add('hp-low');
  } else if (heroPercentage <= 50) {
    heroHpFillEl.classList.add('hp-mid');
  }

  const enemyPercentage = Math.max(0, Math.min(100, Math.round((currentEnemyHp / ENEMY_MAX_HP) * 100)));
  enemyHpFillEl.style.width = `${enemyPercentage}%`;
  enemyHpTextEl.textContent = `${currentEnemyHp} / ${ENEMY_MAX_HP} HP`;

  enemyHpFillEl.classList.remove('hp-mid', 'hp-low');
  if (enemyPercentage <= 25) {
    enemyHpFillEl.classList.add('hp-low');
  } else if (enemyPercentage <= 50) {
    enemyHpFillEl.classList.add('hp-mid');
  }

  healCountBadgeEl.textContent = `${remainingHeals} / ${HERO_MAX_HEALS} Left`;

  if (isDefending) {
    heroDefenseBuffEl.style.display = 'inline-flex';
  } else {
    heroDefenseBuffEl.style.display = 'none';
  }

  if (turnCounterEl) {
    turnCounterEl.textContent = `Turn ${turnCount}`;
  }

  const disableControls = isGameOver || isBusy;
  attackBtnEl.disabled = disableControls;
  defendBtnEl.disabled = disableControls;
  healBtnEl.disabled = disableControls || remainingHeals === 0;
}

// ----------------------------------------------------------------------------
// 8. OUTCOME EVALUATION
// ----------------------------------------------------------------------------
function checkBattleOutcome() {
  // Requirement: at least three outcomes decided by conditions with &&, || and ===
  if (currentHeroHp <= 0 && currentEnemyHp <= 0) {
    endGame('draw', 'Mutual Defeat', 'Both combatants fell in simultaneous combat. The match concludes in a draw.');
    return true;
  } else if (currentEnemyHp <= 0 && currentHeroHp > 0) {
    endGame('win', 'Heroic Victory', `The Shadow Overlord was vanquished in ${turnCount} turns.`);
    return true;
  } else if (currentHeroHp <= 0 || (currentEnemyHp > 0 && currentHeroHp === 0)) {
    endGame('loss', 'Defeat', 'The Valiant Hero was defeated. Reset the match to attempt another trial.');
    return true;
  }

  return false;
}

function endGame(outcome, title, description) {
  isGameOver = true;
  updateGameStateUI();

  outcomeBannerEl.className = `battle-outcome is-visible outcome-${outcome}`;
  outcomeTitleEl.textContent = title;
  outcomeDescEl.textContent = description;

  addLogEntry(`Match Concluded: ${title}`, 'crit');
}

// ----------------------------------------------------------------------------
// 9. COMBAT ACTIONS
// ----------------------------------------------------------------------------
function handleHeroAttack() {
  if (isGameOver === true || isBusy === true) {
    showMessage('Cannot perform move: The battle is over or a turn is currently in progress.', 'warning');
    return;
  }

  clearMessage();
  isBusy = true;
  turnCount++;

  const isCrit = checkIsCriticalHit();
  let baseDamage = getRandomInt(HERO_ATTACK_MIN, HERO_ATTACK_MAX);
  let finalDamage = isCrit ? Math.round(baseDamage * CRITICAL_DAMAGE_MULTIPLIER) : baseDamage;

  currentEnemyHp = Math.max(0, currentEnemyHp - finalDamage);

  enemyCardEl.classList.add('is-damaged');
  setTimeout(() => enemyCardEl.classList.remove('is-damaged'), 300);

  const critLabel = isCrit ? ' (Critical Hit)' : '';
  addLogEntry(`Hero strikes Enemy for ${finalDamage} damage${critLabel}.`, isCrit ? 'crit' : 'attack');

  updateGameStateUI();

  if (checkBattleOutcome()) {
    isBusy = false;
    return;
  }

  setTimeout(() => {
    executeEnemyTurn();
  }, 400);
}

function handleHeroDefend() {
  if (isGameOver === true || isBusy === true) {
    showMessage('Cannot perform move: The battle is over or a turn is currently in progress.', 'warning');
    return;
  }

  clearMessage();
  isBusy = true;
  turnCount++;

  isDefending = true;
  addLogEntry('Hero raised shield: Next incoming blow damage halved.', 'defend');

  updateGameStateUI();

  setTimeout(() => {
    executeEnemyTurn();
  }, 400);
}

function handleHeroHeal() {
  if (isGameOver === true) {
    showMessage('Battle has ended. Click "Restart Match" to start a new match.', 'warning');
    return;
  }

  if (isBusy === true) {
    showMessage('Please wait for the current turn animation to complete.', 'warning');
    return;
  }

  if (remainingHeals === 0 || remainingHeals < 1) {
    showMessage('Action rejected: All 3 healing charges have already been consumed.', 'danger');
    return;
  }

  if (currentHeroHp === HERO_MAX_HP) {
    showMessage('Action rejected: Hero is already at maximum health (100 HP).', 'warning');
    return;
  }

  clearMessage();
  isBusy = true;
  turnCount++;

  remainingHeals--;
  const prevHp = currentHeroHp;
  currentHeroHp = Math.min(HERO_MAX_HP, currentHeroHp + HERO_HEAL_AMOUNT);
  const actualHealed = currentHeroHp - prevHp;

  heroCardEl.classList.add('is-healed');
  setTimeout(() => heroCardEl.classList.remove('is-healed'), 350);

  addLogEntry(`Hero consumed healing potion (+${actualHealed} HP). ${remainingHeals} charges remaining.`, 'heal');

  updateGameStateUI();

  setTimeout(() => {
    executeEnemyTurn();
  }, 400);
}

function executeEnemyTurn() {
  if (isGameOver) {
    isBusy = false;
    return;
  }

  const isEnemyCrit = checkIsCriticalHit();
  let baseDamage = getRandomInt(ENEMY_ATTACK_MIN, ENEMY_ATTACK_MAX);
  
  if (isDefending === true) {
    baseDamage = Math.max(1, Math.round(baseDamage * DEFENSE_REDUCTION_FACTOR));
  }

  const finalDamage = isEnemyCrit ? Math.round(baseDamage * CRITICAL_DAMAGE_MULTIPLIER) : baseDamage;
  currentHeroHp = Math.max(0, currentHeroHp - finalDamage);

  heroCardEl.classList.add('is-damaged');
  setTimeout(() => heroCardEl.classList.remove('is-damaged'), 300);

  const defLabel = isDefending ? ' (absorbed 50%)' : '';
  const critLabel = isEnemyCrit ? ' (Enemy Critical Hit)' : '';
  addLogEntry(`Enemy strikes Hero for ${finalDamage} damage${defLabel}${critLabel}.`, 'enemy');

  isDefending = false;

  updateGameStateUI();
  checkBattleOutcome();

  isBusy = false;
}

function restartBattle() {
  currentHeroHp = HERO_MAX_HP;
  currentEnemyHp = ENEMY_MAX_HP;
  remainingHeals = HERO_MAX_HEALS;
  isDefending = false;
  isGameOver = false;
  isBusy = false;
  turnCount = 0;
  actionLogs = [];

  clearMessage();

  outcomeBannerEl.className = 'battle-outcome';
  outcomeTitleEl.textContent = '';
  outcomeDescEl.textContent = '';

  addLogEntry('Fresh battle initialized. Choose your action.', 'heal');

  updateGameStateUI();
}

// ----------------------------------------------------------------------------
// 10. EVENT LISTENERS INITIALIZATION
// ----------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  attackBtnEl.addEventListener('click', handleHeroAttack);
  defendBtnEl.addEventListener('click', handleHeroDefend);
  healBtnEl.addEventListener('click', handleHeroHeal);
  restartBtnEl.addEventListener('click', restartBattle);

  restartBattle();
});
