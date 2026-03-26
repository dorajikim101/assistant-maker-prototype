const tonePreviewMap = {
  warm: '네, 바로 정리해둘게요. 필요한 말만 짧고 또렷하게 가져올게요.',
  calm: '핵심부터 말씀드릴게요. 필요한 범위 안에서 조용하고 정확하게 정리합니다.',
  sharp: '결론부터 말합니다. 군더더기 없이 바로 실행 가능한 형태로 답합니다.',
};

const trainingCards = [
  {
    id: 'briefing',
    title: '보고 훈련',
    trainer: '리포트 교관',
    desc: '결론 먼저, 핵심만, 압축 보고',
    effect: { execution: 7, organization: 10, warmth: -2, depth: 1 },
    result: '답변이 짧고 또렷해졌습니다. 먼저 결론을 말하려는 습관이 붙었습니다.',
  },
  {
    id: 'research',
    title: '조사 훈련',
    trainer: '리서치 교관',
    desc: '출처 비교, 사실/판단 분리, 근거 정리',
    effect: { execution: 2, organization: 6, warmth: 0, depth: 11 },
    result: '무언가를 말할 때 근거를 먼저 찾고, 불확실성도 구분하려고 합니다.',
  },
  {
    id: 'planning',
    title: '기획 훈련',
    trainer: '기획 교관',
    desc: '아이디어 확장, 반론 제시, 구조화',
    effect: { execution: 5, organization: 5, warmth: 1, depth: 8 },
    result: '아이디어를 묶고 나누는 힘이 늘었습니다. 대안과 리스크를 함께 떠올립니다.',
  },
  {
    id: 'care',
    title: '관계 훈련',
    trainer: '관계 교관',
    desc: '거리감 조절, 말투 적응, 정서 온도 맞춤',
    effect: { execution: 0, organization: 1, warmth: 12, depth: 4 },
    result: '사용자와의 거리감을 더 자연스럽게 조절할 수 있게 되었습니다.',
  },
];

const state = {
  started: false,
  name: '도라지',
  role: 'fairy',
  tone: 'warm',
  books: '',
  week: 1,
  phase: '초기 적응기',
  stats: {
    execution: 50,
    organization: 50,
    warmth: 50,
    depth: 50,
  },
  selectedTraining: null,
  projectedEnding: '균형형 비서 엔딩',
  traits: ['아직 형성 중', '사용자 취향을 학습하는 단계'],
};

const refs = {
  startScreen: document.getElementById('startScreen'),
  gameScreen: document.getElementById('gameScreen'),
  nameInput: document.getElementById('nameInput'),
  roleSelect: document.getElementById('roleSelect'),
  bookInput: document.getElementById('bookInput'),
  introPreview: document.getElementById('introPreview'),
  startGameBtn: document.getElementById('startGameBtn'),
  resetBtn: document.getElementById('resetBtn'),
  toneOptions: [...document.querySelectorAll('#toneOptions .option')],
  weekLabel: document.getElementById('weekLabel'),
  phaseLabel: document.getElementById('phaseLabel'),
  endingChip: document.getElementById('endingChip'),
  fairyName: document.getElementById('fairyName'),
  formText: document.getElementById('formText'),
  fairyStage: document.getElementById('fairyStage'),
  executionValue: document.getElementById('executionValue'),
  organizationValue: document.getElementById('organizationValue'),
  warmthValue: document.getElementById('warmthValue'),
  depthValue: document.getElementById('depthValue'),
  executionMeter: document.getElementById('executionMeter'),
  organizationMeter: document.getElementById('organizationMeter'),
  warmthMeter: document.getElementById('warmthMeter'),
  depthMeter: document.getElementById('depthMeter'),
  eventTitle: document.getElementById('eventTitle'),
  eventBadge: document.getElementById('eventBadge'),
  eventBody: document.getElementById('eventBody'),
  eventChoices: document.getElementById('eventChoices'),
  trainingGrid: document.getElementById('trainingGrid'),
  resultText: document.getElementById('resultText'),
  traitList: document.getElementById('traitList'),
  bookInfluence: document.getElementById('bookInfluence'),
  endingTitle: document.getElementById('endingTitle'),
  endingSummary: document.getElementById('endingSummary'),
  advanceWeekBtn: document.getElementById('advanceWeekBtn'),
};

function clamp(v) {
  return Math.max(0, Math.min(100, Math.round(v)));
}

function analyzeBooks() {
  const text = state.books.toLowerCase();
  const tags = [];
  if (!text.trim()) {
    return {
      tags: ['책 취향 입력 전. 기본 균형형으로 진행됩니다.'],
      bonus: { execution: 0, organization: 0, warmth: 0, depth: 0 },
      formHint: 'fairy',
    };
  }

  const bonus = { execution: 0, organization: 0, warmth: 0, depth: 0 };
  let formHint = 'fairy';

  if (/철학|인문|역사|정의|전기|문명/.test(text)) {
    bonus.depth += 6;
    tags.push('맥락과 해석을 중시하는 성향');
    formHint = 'librarian';
  }
  if (/에세이|소설|시|문학|어린 왕자|데미안/.test(text)) {
    bonus.warmth += 6;
    tags.push('문체와 정서 밀도를 좋아함');
  }
  if (/자기계발|업무|생산성|기획|정리|습관/.test(text)) {
    bonus.organization += 7;
    bonus.execution += 4;
    tags.push('실용적이고 구조적인 설명 선호');
    formHint = 'office';
  }
  if (/sf|과학|기술|개발|코딩|시스템/.test(text)) {
    bonus.depth += 4;
    bonus.organization += 3;
    tags.push('구조와 시스템 중심 사고 선호');
    formHint = 'mechanic';
  }
  if (/가재|새우|갑각|심해|해양/.test(text)) {
    tags.push('기묘한 커스텀 변이 선호');
    formHint = 'crab';
  }

  if (!tags.length) tags.push('입력된 책을 바탕으로 온화한 균형형 설명을 제안');
  return { tags, bonus, formHint };
}

function getPhase(week) {
  if (week <= 2) return '초기 적응기';
  if (week <= 4) return '기초 성장기';
  if (week <= 6) return '전문화 단계';
  return '실전 투입 직전';
}

function getEnding() {
  const s = state.stats;
  if (s.organization >= 72 && s.execution >= 65) {
    return ['정리형 보좌관 엔딩', '짧고 실용적인 보고를 중심으로, 바로 일에 투입하기 좋은 실무형 비서입니다.', '정리형'];
  }
  if (s.depth >= 74) {
    return ['조사형 분석관 엔딩', '출처와 맥락을 챙기며 사실·판단·추론을 구분하는 리서치형 비서입니다.', '조사형'];
  }
  if (s.warmth >= 74) {
    return ['친화형 동반자 엔딩', '거리감을 안정적으로 맞추며 오래 함께 쓰기 좋은 관계형 비서입니다.', '친화형'];
  }
  if (s.execution >= 72 && s.depth >= 65) {
    return ['기획형 설계자 엔딩', '아이디어를 확장하고 구조화하여 문서화 가능한 형태로 정리하는 비서입니다.', '기획형'];
  }
  return ['균형형 운영 비서 엔딩', '정리, 응답, 판단을 평균 이상으로 수행하는 범용형 비서입니다.', '균형형'];
}

function resolveForm() {
  const { formHint } = analyzeBooks();
  refs.fairyStage.className = 'fairy-stage';

  if (formHint === 'crab') {
    refs.fairyStage.classList.add('crab');
    return '갑각 커스텀 요정';
  }
  if (state.role === 'mechanic' || state.stats.execution + state.stats.organization > 150) {
    refs.fairyStage.classList.add('mechanic');
    return '메카닉 운영요정';
  }
  if (state.role === 'office' || state.stats.organization >= 68) {
    refs.fairyStage.classList.add('office');
    return '안경 낀 사무요정';
  }
  if (state.role === 'librarian' || formHint === 'librarian' || state.stats.depth >= 68) {
    refs.fairyStage.classList.add('librarian');
    return '기록 사서요정';
  }
  return '새싹 서재요정';
}

function renderTrainingGrid() {
  refs.trainingGrid.innerHTML = trainingCards
    .map(
      (card) => `
        <button class="training-card" data-id="${card.id}">
          <strong>${card.title}</strong>
          <small>${card.trainer} · ${card.desc}</small>
        </button>`,
    )
    .join('');

  [...refs.trainingGrid.querySelectorAll('.training-card')].forEach((button) => {
    button.addEventListener('click', () => applyTraining(button.dataset.id));
  });
}

function renderEventChoices() {
  const choices = [
    {
      title: '설명은 짧게, 결론 먼저',
      text: '실용성과 정리력을 빠르게 올립니다.',
      onClick: () => applyChoice('brief'),
    },
    {
      title: '조금 더 다정하고 자연스럽게',
      text: '친밀도와 장기 사용감을 높입니다.',
      onClick: () => applyChoice('warm'),
    },
    {
      title: '근거를 챙기고 신중하게',
      text: '사유성과 조사 습관을 강화합니다.',
      onClick: () => applyChoice('depth'),
    },
    {
      title: '먼저 해보고 정리해오기',
      text: '실행형 비서 쪽으로 기울게 만듭니다.',
      onClick: () => applyChoice('action'),
    },
  ];

  refs.eventChoices.innerHTML = choices
    .map(
      (choice, index) => `
        <button class="choice-card" data-index="${index}">
          <strong>${choice.title}</strong>
          <small>${choice.text}</small>
        </button>`,
    )
    .join('');

  [...refs.eventChoices.querySelectorAll('.choice-card')].forEach((button) => {
    const item = choices[Number(button.dataset.index)];
    button.addEventListener('click', item.onClick);
  });
}

function applyChoice(type) {
  if (type === 'brief') {
    state.stats.organization += 4;
    state.stats.execution += 3;
    refs.resultText.textContent = '요정이 답변 첫 줄에 결론을 놓는 습관을 익혔습니다.';
  }
  if (type === 'warm') {
    state.stats.warmth += 5;
    refs.resultText.textContent = '요정이 말투의 온도를 더 자연스럽게 맞추기 시작했습니다.';
  }
  if (type === 'depth') {
    state.stats.depth += 5;
    refs.resultText.textContent = '요정이 바로 답하기보다 맥락과 근거를 먼저 보는 경향이 생겼습니다.';
  }
  if (type === 'action') {
    state.stats.execution += 5;
    refs.resultText.textContent = '요정이 먼저 해보고 정리해서 가져오는 쪽으로 성장했습니다.';
  }
  normalizeStats();
  render();
}

function applyTraining(id) {
  const training = trainingCards.find((card) => card.id === id);
  state.selectedTraining = id;
  Object.entries(training.effect).forEach(([key, value]) => {
    state.stats[key] += value;
  });
  refs.resultText.textContent = `${training.trainer} 수업 완료. ${training.result}`;
  normalizeStats();
  render();
}

function normalizeStats() {
  const bonus = analyzeBooks().bonus;
  state.stats.execution = clamp(state.stats.execution + 0);
  state.stats.organization = clamp(state.stats.organization + 0);
  state.stats.warmth = clamp(state.stats.warmth + 0);
  state.stats.depth = clamp(state.stats.depth + 0);
  // lightweight book influence, applied as display hint not cumulative loop
  state.bookBonus = bonus;
}

function advanceWeek() {
  state.week += 1;
  state.phase = getPhase(state.week);
  refs.eventTitle.textContent = `${state.week}주차 성장 이벤트`;
  refs.eventBadge.textContent = state.phase;
  refs.eventBody.textContent = '이번 주의 훈련 결과가 누적되었습니다. 다음 선택으로 외형과 엔딩 방향이 더 또렷해집니다.';
  refs.resultText.textContent = `${state.week}주차로 넘어갔습니다. 외형과 직능이 조금 더 굳어집니다.`;
  render();
}

function render() {
  const bookData = analyzeBooks();
  const ending = getEnding();
  state.projectedEnding = ending[0];
  refs.weekLabel.textContent = `${state.week}주차`;
  refs.phaseLabel.textContent = state.phase;
  refs.endingChip.textContent = ending[2];
  refs.fairyName.textContent = state.name;
  refs.formText.textContent = resolveForm();
  refs.executionValue.textContent = clamp(state.stats.execution + (state.bookBonus?.execution || 0));
  refs.organizationValue.textContent = clamp(state.stats.organization + (state.bookBonus?.organization || 0));
  refs.warmthValue.textContent = clamp(state.stats.warmth + (state.bookBonus?.warmth || 0));
  refs.depthValue.textContent = clamp(state.stats.depth + (state.bookBonus?.depth || 0));
  refs.executionMeter.style.width = `${refs.executionValue.textContent}%`;
  refs.organizationMeter.style.width = `${refs.organizationValue.textContent}%`;
  refs.warmthMeter.style.width = `${refs.warmthValue.textContent}%`;
  refs.depthMeter.style.width = `${refs.depthValue.textContent}%`;
  refs.bookInfluence.textContent = bookData.tags.join(' · ');
  refs.endingTitle.textContent = ending[0];
  refs.endingSummary.textContent = ending[1];

  const traits = [];
  if (Number(refs.organizationValue.textContent) >= 65) traits.push('결론 먼저');
  if (Number(refs.executionValue.textContent) >= 65) traits.push('먼저 정리해서 가져오기');
  if (Number(refs.depthValue.textContent) >= 65) traits.push('근거와 맥락 중시');
  if (Number(refs.warmthValue.textContent) >= 65) traits.push('거리감 조절 우수');
  if (!traits.length) traits.push('아직 형성 중', '사용자 취향을 학습하는 단계');
  refs.traitList.innerHTML = traits.map((t) => `<li>${t}</li>`).join('');
}

function startGame() {
  state.started = true;
  state.name = refs.nameInput.value.trim() || '도라지';
  state.role = refs.roleSelect.value;
  state.books = refs.bookInput.value.trim();
  state.phase = getPhase(state.week);
  refs.startScreen.style.display = 'none';
  refs.gameScreen.classList.add('active');
  normalizeStats();
  renderTrainingGrid();
  renderEventChoices();
  render();
}

refs.toneOptions.forEach((button) => {
  button.addEventListener('click', () => {
    refs.toneOptions.forEach((btn) => btn.classList.remove('selected'));
    button.classList.add('selected');
    state.tone = button.dataset.tone;
    refs.introPreview.textContent = tonePreviewMap[state.tone];
  });
});

refs.startGameBtn.addEventListener('click', startGame);
refs.advanceWeekBtn.addEventListener('click', advanceWeek);
refs.resetBtn.addEventListener('click', () => window.location.reload());

refs.introPreview.textContent = tonePreviewMap[state.tone];