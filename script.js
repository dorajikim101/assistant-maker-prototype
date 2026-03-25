const state = {
  name: '도라지',
  role: 'fairy',
  tone: 'warm',
  track: 'briefing',
  likedBooks: '',
  wantedBooks: '',
  stats: {
    execution: 54,
    organization: 62,
    warmth: 48,
    depth: 57,
  },
};

const toneMap = {
  warm: {
    preview: '네, 바로 정리해둘게요. 필요한 말만 짧고 또렷하게 가져올게요.',
    warmth: 8,
    depth: 2,
  },
  calm: {
    preview: '핵심부터 말씀드릴게요. 필요한 범위 안에서 조용하고 정확하게 정리합니다.',
    warmth: 2,
    organization: 6,
  },
  sharp: {
    preview: '결론부터 말합니다. 군더더기 없이 바로 실행 가능한 형태로 답합니다.',
    execution: 8,
    organization: 3,
  },
};

const trackMap = {
  briefing: {
    ending: '정리형 보좌관 엔딩',
    chip: '정리형 보좌관',
    summary: '짧고 실용적인 보고를 중심으로, 필요할 때만 확장하는 작업형 비서.',
    traits: ['결론 먼저', '짧은 압축 보고', '중요한 것만 재강조'],
    advanced: ['장문 구조화', '우선순위 표시', '한 줄 리마인드'],
    custom: ['내 스타일 일일보고', '회의 요약 카드'],
    workStyle: ['답변 첫 줄에 결론 배치', '길어질 경우 항목으로 쪼개기', '선택지 비교 시 차이점을 먼저 제시'],
    statDelta: { organization: 10, execution: 4 },
  },
  research: {
    ending: '조사형 분석관 엔딩',
    chip: '조사형 분석관',
    summary: '출처와 비교를 챙기며, 사실·판단·추론을 나눠 정리하는 리서치형 비서.',
    traits: ['출처 중시', '비교형 정리', '판단 근거 명시'],
    advanced: ['자료 대조', '신뢰도 표기', '반론 포인트'],
    custom: ['링크 브리핑', '주제별 리서치팩'],
    workStyle: ['주장과 근거를 분리', '가능하면 출처 첨부', '불확실성은 추론으로 표시'],
    statDelta: { depth: 12, organization: 5 },
  },
  planning: {
    ending: '기획형 설계자 엔딩',
    chip: '기획형 설계자',
    summary: '아이디어를 넓히고 묶고 반론까지 붙여 문서화 가능한 형태로 바꾸는 기획 파트너.',
    traits: ['키워드 확장', '구조화', '반론 제시'],
    advanced: ['문서 뼈대화', '대안 비교', '핵심 리스크 정리'],
    custom: ['아이디어 평가 시트', '초안 생성 템플릿'],
    workStyle: ['아이디어를 묶음으로 제시', '반대 관점도 함께 제공', '바로 문서화 가능한 소제목 사용'],
    statDelta: { depth: 8, execution: 5, organization: 4 },
  },
  care: {
    ending: '친화형 동반자 엔딩',
    chip: '친화형 동반자',
    summary: '거리감과 리듬을 맞추며, 부담 없이 오래 함께 쓰기 좋은 관계형 비서.',
    traits: ['부드러운 거리감', '맥락 기억', '자연스러운 반응'],
    advanced: ['상황별 온도 조절', '말투 적응', '과잉반응 억제'],
    custom: ['일상 대화 모드', '기분 체크인 스킬'],
    workStyle: ['과한 감정 표현은 줄이기', '사용자 리듬에 맞춘 응답 길이', '필요할 때만 친밀도를 올리기'],
    statDelta: { warmth: 14, depth: 3 },
  },
};

const screens = document.querySelectorAll('.screen');
const tabs = document.querySelectorAll('.tab');
const navButtons = document.querySelectorAll('[data-screen]');
const toneButtons = document.querySelectorAll('.choice');
const trainingCards = document.querySelectorAll('.training-card');

const nameInput = document.getElementById('nameInput');
const roleSelect = document.getElementById('roleSelect');
const likedBooks = document.getElementById('likedBooks');
const wantedBooks = document.getElementById('wantedBooks');
const tonePreview = document.getElementById('tonePreview');
const bookInference = document.getElementById('bookInference');

const profileName = document.getElementById('profileName');
const endingType = document.getElementById('endingType');
const traitList = document.getElementById('traitList');
const advancedSkills = document.getElementById('advancedSkills');
const customSkills = document.getElementById('customSkills');
const endingTitle = document.getElementById('endingTitle');
const endingSummary = document.getElementById('endingSummary');
const workStyleList = document.getElementById('workStyleList');
const jsonPreview = document.getElementById('jsonPreview');

const statRefs = {
  execution: ['execValue', 'execMeter'],
  organization: ['organizeValue', 'organizeMeter'],
  warmth: ['warmthValue', 'warmthMeter'],
  depth: ['depthValue', 'depthMeter'],
};

function setScreen(screenId) {
  screens.forEach((screen) => {
    screen.classList.toggle('active', screen.id === `screen-${screenId}`);
  });
  tabs.forEach((tab) => tab.classList.toggle('active', tab.dataset.screen === screenId));
}

function clamp(num) {
  return Math.max(0, Math.min(100, Math.round(num)));
}

function analyzeBooks() {
  const text = `${state.likedBooks} ${state.wantedBooks}`.toLowerCase();
  const tags = [];
  let execution = 0;
  let organization = 0;
  let warmth = 0;
  let depth = 0;

  if (/철학|인문|정의|사유|역사|전기|문명/.test(text)) {
    depth += 10;
    tags.push('맥락과 해석을 중시하는 설명 선호');
  }
  if (/에세이|소설|시|문학|어린 왕자|데미안/.test(text)) {
    warmth += 8;
    tags.push('문체와 정서 밀도가 있는 전달 선호');
  }
  if (/자기계발|업무|생산성|습관|정리|기획/.test(text)) {
    organization += 10;
    execution += 5;
    tags.push('실용적이고 구조적인 답변 선호');
  }
  if (/sf|추리|과학|기술|개발|코딩/.test(text)) {
    depth += 6;
    organization += 4;
    tags.push('구조와 가설 중심의 전개 선호');
  }

  if (!tags.length) {
    tags.push('입력된 책을 바탕으로 부드럽고 균형형 설명 스타일을 제안');
  }

  state.stats.execution = clamp(54 + execution + (trackMap[state.track].statDelta.execution || 0));
  state.stats.organization = clamp(52 + organization + (trackMap[state.track].statDelta.organization || 0));
  state.stats.warmth = clamp(46 + warmth + (trackMap[state.track].statDelta.warmth || 0));
  state.stats.depth = clamp(50 + depth + (trackMap[state.track].statDelta.depth || 0));

  return tags;
}

function renderList(el, items) {
  el.innerHTML = items.map((item) => `<li>${item}</li>`).join('');
}

function render() {
  profileName.textContent = state.name || '이름 없음';

  const toneInfo = toneMap[state.tone];
  tonePreview.textContent = toneInfo.preview;

  const trackInfo = trackMap[state.track];
  endingType.textContent = trackInfo.chip;
  endingTitle.textContent = trackInfo.ending;
  endingSummary.textContent = trackInfo.summary;

  const bookTags = analyzeBooks();
  bookInference.textContent = bookTags.join(' · ');

  renderList(traitList, trackInfo.traits);
  renderList(advancedSkills, trackInfo.advanced);
  renderList(customSkills, trackInfo.custom);
  renderList(workStyleList, trackInfo.workStyle);

  Object.entries(statRefs).forEach(([key, [valueId, meterId]]) => {
    const val = state.stats[key];
    document.getElementById(valueId).textContent = val;
    document.getElementById(meterId).style.width = `${val}%`;
  });

  jsonPreview.textContent = JSON.stringify(
    {
      assistantName: state.name,
      role: state.role,
      tone: state.tone,
      trainingTrack: state.track,
      inferredFromBooks: bookTags,
      ending: trackInfo.ending,
      workStyle: trackInfo.workStyle,
      stats: state.stats,
    },
    null,
    2,
  );
}

nameInput.addEventListener('input', (e) => {
  state.name = e.target.value;
  render();
});

roleSelect.addEventListener('change', (e) => {
  state.role = e.target.value;
  render();
});

likedBooks.addEventListener('input', (e) => {
  state.likedBooks = e.target.value;
  render();
});

wantedBooks.addEventListener('input', (e) => {
  state.wantedBooks = e.target.value;
  render();
});

toneButtons.forEach((button) => {
  button.addEventListener('click', () => {
    toneButtons.forEach((btn) => btn.classList.remove('selected'));
    button.classList.add('selected');
    state.tone = button.dataset.tone;
    render();
  });
});

trainingCards.forEach((card) => {
  card.addEventListener('click', () => {
    trainingCards.forEach((item) => item.classList.remove('selected'));
    card.classList.add('selected');
    state.track = card.dataset.track;
    render();
  });
});

navButtons.forEach((button) => {
  button.addEventListener('click', () => setScreen(button.dataset.screen));
});

render();