/**
 * ============================================================================
 * Task 2: Page Built from Data (Arrays, Loops, Functions, DOM)
 * Option A: Agile Kanban Board with WIP Limits & Event Delegation
 * 
 * Course: Web Technologies (AITU) - Assignment #5
 * Student: Aitpayev Tamerlan | Group: IT-2510
 * ============================================================================
 */

// ----------------------------------------------------------------------------
// 1. CONSTANTS & SYSTEM CONFIGURATION
// ----------------------------------------------------------------------------
const WIP_LIMIT = 3; // Rule: Middle column ("In progress") holds at most 3 cards

const PRIORITY_WEIGHTS = {
  high: 3,
  medium: 2,
  low: 1
};

// ----------------------------------------------------------------------------
// 2. DATA SOURCE: Array of 12 objects with unique IDs and 4+ property types
// ----------------------------------------------------------------------------
const INITIAL_TASKS = [
  {
    id: 101,
    title: 'Implement OAuth 2.0 PKCE authentication flow',
    priority: 'high',
    tag: 'Security',
    storyPoints: 5,
    isBlocked: false,
    column: 'todo',
    assignee: 'Tamerlan'
  },
  {
    id: 102,
    title: 'Design accessible color palette and dark mode tokens',
    priority: 'medium',
    tag: 'Frontend',
    storyPoints: 3,
    isBlocked: false,
    column: 'todo',
    assignee: 'Sarah'
  },
  {
    id: 103,
    title: 'Optimize PostgreSQL query execution for transaction logs',
    priority: 'high',
    tag: 'Database',
    storyPoints: 8,
    isBlocked: false,
    column: 'todo',
    assignee: 'Arman'
  },
  {
    id: 104,
    title: 'Setup automated Docker build in GitHub Actions',
    priority: 'medium',
    tag: 'DevOps',
    storyPoints: 5,
    isBlocked: false,
    column: 'todo',
    assignee: 'Elena'
  },
  {
    id: 105,
    title: 'Build reusable form validation utility with ARIA feedback',
    priority: 'high',
    tag: 'Frontend',
    storyPoints: 5,
    isBlocked: false,
    column: 'in_progress',
    assignee: 'Tamerlan'
  },
  {
    id: 106,
    title: 'Configure rate limiting middleware with Redis cluster',
    priority: 'high',
    tag: 'Backend',
    storyPoints: 8,
    isBlocked: false,
    column: 'in_progress',
    assignee: 'Arman'
  },
  {
    id: 107,
    title: 'Audit client-side bundle size and tree-shaking targets',
    priority: 'low',
    tag: 'Frontend',
    storyPoints: 2,
    isBlocked: false,
    column: 'in_progress',
    assignee: 'Sarah'
  },
  {
    id: 108,
    title: 'Setup ESLint and Prettier configs across micro-services',
    priority: 'low',
    tag: 'DevOps',
    storyPoints: 2,
    isBlocked: false,
    column: 'done',
    assignee: 'Elena'
  },
  {
    id: 109,
    title: 'Create database migration scripts for user profiles schema',
    priority: 'medium',
    tag: 'Database',
    storyPoints: 3,
    isBlocked: false,
    column: 'done',
    assignee: 'Arman'
  },
  {
    id: 110,
    title: 'Implement CSRF token generation and validation middleware',
    priority: 'high',
    tag: 'Security',
    storyPoints: 5,
    isBlocked: false,
    column: 'done',
    assignee: 'Tamerlan'
  },
  {
    id: 111,
    title: 'Write automated unit tests for payment calculation module',
    priority: 'medium',
    tag: 'Backend',
    storyPoints: 5,
    isBlocked: false,
    column: 'done',
    assignee: 'Sarah'
  },
  {
    id: 112,
    title: 'Setup Sentry error tracking and telemetry alerts',
    priority: 'low',
    tag: 'DevOps',
    storyPoints: 2,
    isBlocked: false,
    column: 'done',
    assignee: 'Elena'
  }
];

let tasks = [...INITIAL_TASKS];
let searchQuery = '';
let selectedTagFilter = 'all';
let selectedSortOrder = 'default';

// ----------------------------------------------------------------------------
// 3. DOM ELEMENTS
// ----------------------------------------------------------------------------
const boardContainerEl = document.getElementById('kanban-board-container');
const todoCardsContainerEl = document.getElementById('todo-cards-container');
const progressCardsContainerEl = document.getElementById('progress-cards-container');
const doneCardsContainerEl = document.getElementById('done-cards-container');

const todoCountEl = document.getElementById('todo-count');
const progressCountEl = document.getElementById('progress-count');
const doneCountEl = document.getElementById('done-count');
const wipBadgeEl = document.getElementById('wip-limit-badge');

const searchInputEl = document.getElementById('search-input');
const filterTagSelectEl = document.getElementById('filter-tag');
const sortOrderSelectEl = document.getElementById('sort-order');
const resetBtnEl = document.getElementById('btn-reset-data');

const progressBarFillEl = document.getElementById('progress-bar-fill');
const progressStatsTextEl = document.getElementById('progress-stats-text');
const pointsStatsTextEl = document.getElementById('points-stats-text');

const alertBannerEl = document.getElementById('kanban-alert');
const alertMessageEl = document.getElementById('kanban-alert-message');

const openModalBtnEl = document.getElementById('btn-open-add-modal');
const closeModalBtnEl = document.getElementById('btn-close-modal');
const cancelModalBtnEl = document.getElementById('btn-cancel-modal');
const modalBackdropEl = document.getElementById('add-task-modal');
const addTaskFormEl = document.getElementById('add-task-form');

// ----------------------------------------------------------------------------
// 4. FEEDBACK / ALERT BANNER
// ----------------------------------------------------------------------------
function showBoardAlert(message, type = 'warning') {
  if (!alertBannerEl || !alertMessageEl) return;
  alertBannerEl.className = `alert alert-${type}`;
  alertMessageEl.textContent = message;
  alertBannerEl.style.display = 'flex';

  clearTimeout(alertBannerEl._timeoutId);
  alertBannerEl._timeoutId = setTimeout(() => {
    alertBannerEl.style.display = 'none';
  }, 5000);
}

function clearBoardAlert() {
  if (!alertBannerEl) return;
  alertBannerEl.style.display = 'none';
}

// ----------------------------------------------------------------------------
// 5. CALCULATION USING EXPLICIT FOR...OF LOOP
// ----------------------------------------------------------------------------
function calculateBoardMetrics(taskList) {
  let totalCards = 0;
  let doneCount = 0;
  let inProgressCount = 0;
  let todoCount = 0;
  let totalPoints = 0;
  let completedPoints = 0;

  for (const item of taskList) {
    totalCards++;
    totalPoints += item.storyPoints;

    if (item.column === 'done') {
      doneCount++;
      completedPoints += item.storyPoints;
    } else if (item.column === 'in_progress') {
      inProgressCount++;
    } else if (item.column === 'todo') {
      todoCount++;
    }
  }

  const completionPercentage = totalCards > 0 ? Math.round((doneCount / totalCards) * 100) : 0;

  return {
    totalCards,
    todoCount,
    inProgressCount,
    doneCount,
    totalPoints,
    completedPoints,
    completionPercentage
  };
}

// ----------------------------------------------------------------------------
// 6. SINGLE RENDER FUNCTION (ZERO innerHTML for data)
// ----------------------------------------------------------------------------
function renderKanbanBoard() {
  const metrics = calculateBoardMetrics(tasks);

  progressBarFillEl.style.width = `${metrics.completionPercentage}%`;
  progressBarFillEl.setAttribute('aria-valuenow', metrics.completionPercentage);
  progressStatsTextEl.textContent = `${metrics.doneCount} of ${metrics.totalCards} Completed (${metrics.completionPercentage}%)`;
  pointsStatsTextEl.textContent = `${metrics.completedPoints} / ${metrics.totalPoints} Story Points`;

  todoCountEl.textContent = metrics.todoCount;
  progressCountEl.textContent = `${metrics.inProgressCount} / ${WIP_LIMIT}`;
  doneCountEl.textContent = metrics.doneCount;

  if (metrics.inProgressCount >= WIP_LIMIT) {
    wipBadgeEl.textContent = `WIP ${metrics.inProgressCount}/${WIP_LIMIT} (Full)`;
    wipBadgeEl.className = 'wip-badge wip-full';
  } else {
    wipBadgeEl.textContent = `WIP ${metrics.inProgressCount}/${WIP_LIMIT}`;
    wipBadgeEl.className = 'wip-badge wip-ok';
  }

  let filteredTasks = tasks.filter(task => {
    if (selectedTagFilter !== 'all' && task.tag.toLowerCase() !== selectedTagFilter.toLowerCase()) {
      return false;
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchAssignee = task.assignee.toLowerCase().includes(q);
      const matchTag = task.tag.toLowerCase().includes(q);
      if (!matchTitle && !matchAssignee && !matchTag) {
        return false;
      }
    }

    return true;
  });

  if (selectedSortOrder === 'priority-desc') {
    filteredTasks.sort((a, b) => PRIORITY_WEIGHTS[b.priority] - PRIORITY_WEIGHTS[a.priority]);
  } else if (selectedSortOrder === 'priority-asc') {
    filteredTasks.sort((a, b) => PRIORITY_WEIGHTS[a.priority] - PRIORITY_WEIGHTS[b.priority]);
  } else if (selectedSortOrder === 'points-desc') {
    filteredTasks.sort((a, b) => b.storyPoints - a.storyPoints);
  }

  cleanContainer(todoCardsContainerEl);
  cleanContainer(progressCardsContainerEl);
  cleanContainer(doneCardsContainerEl);

  const todoItems = [];
  const progressItems = [];
  const doneItems = [];

  for (const task of filteredTasks) {
    if (task.column === 'todo') todoItems.push(task);
    else if (task.column === 'in_progress') progressItems.push(task);
    else if (task.column === 'done') doneItems.push(task);
  }

  renderColumnCards(todoCardsContainerEl, todoItems, 'todo');
  renderColumnCards(progressCardsContainerEl, progressItems, 'in_progress');
  renderColumnCards(doneCardsContainerEl, doneItems, 'done');
}

function cleanContainer(container) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
}

function renderColumnCards(container, cardList, columnType) {
  if (cardList.length === 0) {
    const emptyDiv = document.createElement('div');
    emptyDiv.classList.add('empty-state');

    const p = document.createElement('p');
    p.textContent = (searchQuery || selectedTagFilter !== 'all') 
      ? 'No tasks match current filter' 
      : 'No tasks in this column';

    emptyDiv.appendChild(p);
    container.appendChild(emptyDiv);
    return;
  }

  for (const cardData of cardList) {
    const cardEl = createCardDOMNode(cardData);
    container.appendChild(cardEl);
  }
}

function createCardDOMNode(task) {
  const article = document.createElement('article');
  article.classList.add('kanban-card');
  article.dataset.cardId = String(task.id);

  const topDiv = document.createElement('div');
  topDiv.classList.add('card-top');

  const tagSpan = document.createElement('span');
  tagSpan.classList.add('card-tag');
  tagSpan.textContent = task.tag;

  const prioritySpan = document.createElement('span');
  prioritySpan.classList.add('card-priority', `priority-${task.priority}`);
  prioritySpan.textContent = task.priority;

  topDiv.appendChild(tagSpan);
  topDiv.appendChild(prioritySpan);

  const titleH3 = document.createElement('h3');
  titleH3.classList.add('card-title-text');
  titleH3.textContent = task.title;

  const metaDiv = document.createElement('div');
  metaDiv.classList.add('card-meta');

  const assigneeSpan = document.createElement('span');
  assigneeSpan.classList.add('card-assignee');
  assigneeSpan.textContent = task.assignee;

  const pointsSpan = document.createElement('span');
  pointsSpan.classList.add('badge', 'badge-neutral');
  pointsSpan.textContent = `${task.storyPoints} SP`;

  metaDiv.appendChild(assigneeSpan);
  metaDiv.appendChild(pointsSpan);

  const actionsDiv = document.createElement('div');
  actionsDiv.classList.add('card-actions');

  if (task.column !== 'todo') {
    const prevBtn = document.createElement('button');
    prevBtn.type = 'button';
    prevBtn.classList.add('btn', 'btn-secondary', 'btn-sm');
    prevBtn.dataset.action = 'move-backward';
    prevBtn.dataset.cardId = String(task.id);
    prevBtn.textContent = '← Back';
    prevBtn.setAttribute('aria-label', `Move ${task.title} to previous column`);
    actionsDiv.appendChild(prevBtn);
  }

  if (task.column !== 'done') {
    const nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.classList.add('btn', 'btn-primary', 'btn-sm');
    nextBtn.dataset.action = 'move-forward';
    nextBtn.dataset.cardId = String(task.id);
    nextBtn.textContent = task.column === 'todo' ? 'Start →' : 'Done →';
    nextBtn.setAttribute('aria-label', `Advance ${task.title}`);
    actionsDiv.appendChild(nextBtn);
  }

  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.classList.add('btn', 'btn-outline', 'btn-sm');
  deleteBtn.dataset.action = 'delete-card';
  deleteBtn.dataset.cardId = String(task.id);
  deleteBtn.textContent = '✕';
  deleteBtn.setAttribute('aria-label', `Delete task ${task.title}`);
  actionsDiv.appendChild(deleteBtn);

  article.appendChild(topDiv);
  article.appendChild(titleH3);
  article.appendChild(metaDiv);
  article.appendChild(actionsDiv);

  return article;
}

// ----------------------------------------------------------------------------
// 7. RULE ENFORCEMENT & HANDLERS
// ----------------------------------------------------------------------------
function handleMoveForward(cardId) {
  const targetTask = tasks.find(t => t.id === cardId);
  if (!targetTask) return;

  if (targetTask.column === 'todo') {
    const currentProgressCount = tasks.filter(t => t.column === 'in_progress').length;

    // WIP Limit rule
    if (currentProgressCount >= WIP_LIMIT) {
      showBoardAlert(
        `Action Blocked: Work In Progress (WIP) limit reached. 'In progress' column currently holds ${WIP_LIMIT} cards. Complete an active card before starting a new one.`,
        'warning'
      );
      return;
    }

    clearBoardAlert();
    targetTask.column = 'in_progress';
  } else if (targetTask.column === 'in_progress') {
    clearBoardAlert();
    targetTask.column = 'done';
  }

  renderKanbanBoard();
}

function handleMoveBackward(cardId) {
  const targetTask = tasks.find(t => t.id === cardId);
  if (!targetTask) return;

  if (targetTask.column === 'done') {
    const currentProgressCount = tasks.filter(t => t.column === 'in_progress').length;
    if (currentProgressCount >= WIP_LIMIT) {
      showBoardAlert(
        `Action Blocked: Cannot revert to 'In progress'. WIP limit (${WIP_LIMIT} cards) is saturated.`,
        'warning'
      );
      return;
    }

    clearBoardAlert();
    targetTask.column = 'in_progress';
  } else if (targetTask.column === 'in_progress') {
    clearBoardAlert();
    targetTask.column = 'todo';
  }

  renderKanbanBoard();
}

function handleDeleteCard(cardId) {
  tasks = tasks.filter(t => t.id !== cardId);
  clearBoardAlert();
  renderKanbanBoard();
}

// ----------------------------------------------------------------------------
// 8. EVENT DELEGATION
// ----------------------------------------------------------------------------
function setupEventDelegation() {
  if (!boardContainerEl) return;

  boardContainerEl.addEventListener('click', (event) => {
    const actionButton = event.target.closest('[data-action]');
    if (!actionButton) return;

    const action = actionButton.dataset.action;
    const cardId = Number(actionButton.dataset.cardId);

    if (action === 'move-forward') {
      handleMoveForward(cardId);
    } else if (action === 'move-backward') {
      handleMoveBackward(cardId);
    } else if (action === 'delete-card') {
      handleDeleteCard(cardId);
    }
  });
}

// ----------------------------------------------------------------------------
// 9. DYNAMIC TASK CREATION
// ----------------------------------------------------------------------------
function setupTaskModal() {
  if (!openModalBtnEl || !modalBackdropEl) return;

  openModalBtnEl.addEventListener('click', () => {
    modalBackdropEl.classList.add('is-open');
    document.getElementById('new-task-title').focus();
  });

  const closeModal = () => {
    modalBackdropEl.classList.remove('is-open');
    addTaskFormEl.reset();
  };

  if (closeModalBtnEl) closeModalBtnEl.addEventListener('click', closeModal);
  if (cancelModalBtnEl) cancelModalBtnEl.addEventListener('click', closeModal);

  modalBackdropEl.addEventListener('click', (e) => {
    if (e.target === modalBackdropEl) closeModal();
  });

  addTaskFormEl.addEventListener('submit', (e) => {
    e.preventDefault();

    const titleInput = document.getElementById('new-task-title');
    const tagInput = document.getElementById('new-task-tag');
    const priorityInput = document.getElementById('new-task-priority');
    const pointsInput = document.getElementById('new-task-points');
    const assigneeInput = document.getElementById('new-task-assignee');

    const newTask = {
      id: Date.now(),
      title: titleInput.value.trim(),
      priority: priorityInput.value,
      tag: tagInput.value,
      storyPoints: Number(pointsInput.value) || 1,
      isBlocked: false,
      column: 'todo',
      assignee: assigneeInput.value.trim() || 'Aitpayev'
    };

    tasks.unshift(newTask);
    closeModal();
    showBoardAlert(`Task "${newTask.title}" added to backlog.`, 'success');
    renderKanbanBoard();
  });
}

// ----------------------------------------------------------------------------
// 10. TOOLBAR FILTERS & SEARCH
// ----------------------------------------------------------------------------
function setupToolbarListeners() {
  if (searchInputEl) {
    searchInputEl.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderKanbanBoard();
    });
  }

  if (filterTagSelectEl) {
    filterTagSelectEl.addEventListener('change', (e) => {
      selectedTagFilter = e.target.value;
      renderKanbanBoard();
    });
  }

  if (sortOrderSelectEl) {
    sortOrderSelectEl.addEventListener('change', (e) => {
      selectedSortOrder = e.target.value;
      renderKanbanBoard();
    });
  }

  if (resetBtnEl) {
    resetBtnEl.addEventListener('click', () => {
      tasks = INITIAL_TASKS.map(item => ({ ...item }));
      searchQuery = '';
      selectedTagFilter = 'all';
      selectedSortOrder = 'default';
      if (searchInputEl) searchInputEl.value = '';
      if (filterTagSelectEl) filterTagSelectEl.value = 'all';
      if (sortOrderSelectEl) sortOrderSelectEl.value = 'default';
      clearBoardAlert();
      renderKanbanBoard();
      showBoardAlert('Sample tasks restored to default state.', 'info');
    });
  }
}

// ----------------------------------------------------------------------------
// 11. INITIALIZATION
// ----------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  setupEventDelegation();
  setupToolbarListeners();
  setupTaskModal();
  renderKanbanBoard();
});
