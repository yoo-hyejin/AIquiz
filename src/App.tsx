import React, { useState, useEffect, useRef } from 'react';
import { 
  Brain, Cpu, Award, BookOpen, Sparkles, Timer, 
  CheckCircle2, XCircle, AlertTriangle, RotateCcw, 
  ArrowRight, ChevronRight, Info, Smile, Compass, 
  ShieldCheck, Volume2, VolumeX, BookOpenCheck, HelpCircle, 
  ListRestart, FileText, X
} from 'lucide-react';

// --- 웹 오디오 API 신시사이저 사운드 기능 ---
const playSynthSound = (type, isMuted) => {
  if (isMuted) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    if (type === 'correct') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5 (도)
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5 (미)
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5 (솔)
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.35);
    } else if (type === 'wrong') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(90, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(350, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.08);
    } else if (type === 'fanfare') {
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g);
        g.connect(ctx.destination);
        o.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
        g.gain.setValueAtTime(0.05, ctx.currentTime + idx * 0.08);
        g.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + idx * 0.08 + 0.25);
        o.start(ctx.currentTime + idx * 0.08);
        o.stop(ctx.currentTime + idx * 0.08 + 0.25);
      });
    }
  } catch (e) {
    console.warn("오디오 사용 설정이 필요하거나 브라우저가 제한했습니다.", e);
  }
};

// --- 교육용 인공지능 기본 개념 데이터 ---
const STUDY_MATERIALS = [
  {
    id: 1,
    title: "1. 인공지능(AI)이란?",
    subtitle: "기본 개념 이해하기",
    icon: <Cpu className="w-8 h-8 text-cyan-400" />,
    summary: "인간의 지능적인 행동(학습, 추론, 지각 등)을 컴퓨터 소프트웨어로 구현해내는 모든 기술을 의미해요.",
    bullets: [
      "약인공지능(Weak AI): 특정 분야(예: 번역, 바둑, 자율주행)에서만 성능을 발휘하는 현대의 인공지능이에요.",
      "강인공지능(Strong AI): 영화처럼 모든 상황에서 사람과 똑같이 사고하고 스스로 해결할 수 있는 미래형 인공지능이에요.",
      "인공지능은 1956년 다트머스 회의에서 '존 매카시' 교수로부터 처음 제안되었답니다."
    ],
    example: "📱 스마트폰 음성 비서(시리, 빅스비), 유튜브 추천 알고리즘은 대표적인 약인공지능입니다!"
  },
  {
    id: 2,
    title: "2. 인공지능, 머신러닝, 딥러닝",
    subtitle: "포함 관계 및 차이점",
    icon: <Brain className="w-8 h-8 text-indigo-400" />,
    summary: "인공지능이 가장 넓은 범위이며, 그 안에 머신러닝이 있고, 머신러닝 안에 딥러닝이 포함되어 있어요.",
    bullets: [
      "인공지능(AI): 인간의 지능을 컴퓨터로 모방하는 가장 크고 대표적인 개념입니다.",
      "머신러닝(기계학습): 규칙을 일일이 컴퓨터에 코딩해주지 않고, 엄청난 데이터를 기반으로 컴퓨터가 스스로 규칙과 경향을 학습하게 만드는 기술이에요.",
      "딥러닝(심층학습): 인간 뇌의 복잡한 신경망(뉴런) 구조를 흉내 낸 '인공신경망'을 수없이 쌓아 스스로 특징을 찾아내며 학습하는 고도화된 기술이에요."
    ],
    example: "🧠 개와 고양이 사진을 보여줄 때 특징을 사람이 직접 코딩하면 머신러닝, 복잡한 사진 구조 속에서 지가 알아서 픽셀 특징을 분석해내면 딥러닝입니다."
  },
  {
    id: 3,
    title: "3. 인공지능의 3대 학습 방법",
    subtitle: "머신러닝이 공부하는 비밀",
    icon: <Compass className="w-8 h-8 text-emerald-400" />,
    summary: "인공지능은 데이터를 입력받아 성장하는데, 그 방식에 따라 크게 세 가지로 분류됩니다.",
    bullets: [
      "지도학습(Supervised Learning): '문제'와 '정답(레이블)'을 동시에 주며 학습시키는 방법이에요. (예: 손글씨 5 숫자 이미지에 정답 '5'를 붙여서 학습시키기)",
      "비지도학습(Unsupervised Learning): 정답(레이블) 없이 오직 '데이터'만 던져주고, 기계가 특징을 찾아내어 비슷한 것끼리 분류하게 하는 기술이에요. (예: 뉴스 기사 자동 카테고리 분류)",
      "강화학습(Reinforcement Learning): 잘한 행동에는 '보상(+)', 못한 행동에는 '벌칙(-)'을 주어 최적의 해결 방안을 스스로 찾아내게 만드는 게임형 학습법이에요. (예: 알파고의 바둑 대국, 자율주행차 회피 훈련)"
    ],
    example: "🎮 마리오 게임 AI를 개발할 때, 죽지 않고 끝까지 갈수록 점수(보상)를 높게 주면 스스로 점프 타이밍을 배우는 것이 바로 '강화학습'입니다."
  },
  {
    id: 4,
    title: "4. 인공지능 윤리와 미래 역량",
    subtitle: "안전하고 공평한 세상을 위해",
    icon: <ShieldCheck className="w-8 h-8 text-rose-400" />,
    summary: "인공지능이 널리 쓰일수록, 올바르고 안전하게 사용하는 태도가 기술개발만큼 중요해지고 있어요.",
    bullets: [
      "데이터 편향성(Bias): 인공지능은 인간이 준 데이터를 토대로 배워요. 만약 특정 집단이나 편견이 가득한 데이터를 입력하면 인공지능 역시 불공평한 결과를 내놓는 오류를 일으켜요.",
      "할루시네이션(환각): 초거대 언어 모델이 전혀 사실이 아닌 허위 정보를 마치 진짜 정답인 것처럼 그럴듯하고 유창하게 지어내어 답변하는 현상이에요.",
      "저작권 및 프라이버시: 인터넷상의 수많은 창작물을 학습하는 과정에서 저작권 침해나 개인정보 유출을 방지할 규칙이 꼭 필요해요."
    ],
    example: "⚖️ 인공지능 채용 프로그램이 남성 중심의 데이터만 학습한 결과 여성을 무조건 불합격시키는 차별을 만들었던 사건이 바로 '인공지능 편향성'의 비극적인 예시입니다."
  }
];

// --- 퀴즈 문제 은행 (10문항, 완벽하게 교육 설계됨) ---
const QUIZ_QUESTIONS = [
  {
    questionNumber: 1,
    question: "다음 인공지능, 머신러닝, 딥러닝 간의 포함 관계를 올바르게 설명한 것은 무엇일까요?",
    answerOptions: [
      { text: "인공지능이 가장 포괄적인 개념이며, 그 하위에 머신러닝이 있고, 머신러닝의 하위에 딥러닝이 존재한다.", isCorrect: true, rationale: "인공지능이라는 큰 테두리 안에 데이터를 이용한 통계적 학습 기법인 머신러닝이 속하며, 뇌 인공신경망 구조를 고도화한 딥러닝이 머신러닝에 완전히 포함됩니다." },
      { text: "딥러닝이 가장 큰 개념이며 머신러닝과 인공지능은 별개의 영역이다.", isCorrect: false, rationale: "딥러닝은 머신러닝의 수많은 알고리즘 방법 중 하나에 불과합니다." },
      { text: "머신러닝이 최상위 개념이며 인공지능은 딥러닝의 특수한 형태이다.", isCorrect: false, rationale: "인공지능은 컴퓨터 과학의 전체적인 대전제이며, 머신러닝은 인공지능을 실현하기 위한 구체적인 방법입니다." },
      { text: "세 가지 기술은 개념이나 동작 원리면에서 전혀 겹치지 않는 독립적인 기술이다.", isCorrect: false, rationale: "셋은 부모-자식-손자 관계처럼 긴밀히 중첩되어 있는 종속적 관계입니다." }
    ],
    hint: "동심원을 생각해보세요! 가장 거대하고 오래된 뿌리 기술이 바깥쪽 원에 위치합니다."
  },
  {
    questionNumber: 2,
    question: "컴퓨터에 강아지와 고양이 사진을 수천 장 보여줄 때 각각 '강아지', '고양이'라는 정답(레이블)을 미리 함께 표시하여 정답을 맞출 수 있도록 공부시키는 머신러닝 학습 방식은 무엇일까요?",
    answerOptions: [
      { text: "지도학습 (Supervised Learning)", isCorrect: true, rationale: "정답(레이블)을 주입해줌으로써 기계가 자신의 예측값과 실제 정답을 비교 분석하며 학습 오차를 줄여나가는 기법입니다." },
      { text: "비지도학습 (Unsupervised Learning)", isCorrect: false, rationale: "비지도학습은 '강아지', '고양이'라는 주관적 레이블 정보 없이 스스로 데이터의 군집 구조만 탐색하게 만듭니다." },
      { text: "강화학습 (Reinforcement Learning)", isCorrect: false, rationale: "강화학습은 정답 레이블 대신 주어지는 환경과의 상호작용 및 누적 보상을 기반으로 행동 양식을 학습시킵니다." },
      { text: "예외학습 (Exception Learning)", isCorrect: false, rationale: "이것은 머신러닝의 기본 3대 학습 방식명에 포함되지 않는 가상의 개념입니다." }
    ],
    hint: "지도교수님이나 선생님처럼 데이터마다 명확한 정답 패키지('지도')를 첨부하여 가르친다는 의미가 있습니다."
  },
  {
    questionNumber: 3,
    question: "인공지능이 인터넷의 수많은 문장과 데이터를 기반으로 그럴듯하게 답변을 생성하지만, 전혀 사실이 아닌 가짜 정보를 진짜처럼 아주 당당하게 지어내는 정보 오류 현상을 뜻하는 인공지능 용어는 무엇일까요?",
    answerOptions: [
      { text: "할루시네이션 (Hallucination)", isCorrect: true, rationale: "초거대 언어모델(LLM)이 문맥상 자연스러운 단어 배열만을 확률적으로 추론하다 보니 생기는 '인공지능 환각 현상'입니다." },
      { text: "오버피팅 (Overfitting)", isCorrect: false, rationale: "오버피팅(과적합)은 기계가 학습 데이터에 지나치게 집착해 새로운 실전 데이터의 정답률이 확 떨어지는 기술 현상입니다." },
      { text: "바이어스 렉 (Bias Lag)", isCorrect: false, rationale: "데이터 지연이나 시간 지연을 일컫는 학술 용어로 사용될 수는 있으나 거짓 답변 현상과는 무관합니다." },
      { text: "프롬프트 재밍 (Prompt Jamming)", isCorrect: false, rationale: "프롬프트를 해킹하거나 악성 명령어를 가로막는 행위에 쓰이는 기술적 은어일 뿐 환각 증상과는 다릅니다." }
    ],
    hint: "사람이 몸이 몹시 아프거나 헛것을 보고 기이한 착각을 호소할 때 영어로 이 단어(환각)를 사용합니다."
  },
  {
    questionNumber: 4,
    question: "특정 집단에 치우친 편향된 데이터만 기계가 집중 학습하면, 인공지능도 편향되고 공정하지 못한 결과를 산출하게 됩니다. 이처럼 인공지능을 가르칠 때 인간 사회의 선입견이나 불균형한 정보가 인공지능의 규칙에 깊게 주입되는 문제를 가리키는 용어는 무엇일까요?",
    answerOptions: [
      { text: "인공지능의 편향성 (AI Bias)", isCorrect: true, rationale: "학습 데이터가 지닌 편견과 치우침이 알고리즘에 고스란히 복제되어 왜곡된 결과를 도출하는 인공지능 윤리 문제입니다." },
      { text: "인공지능 자율성 (AI Autonomy)", isCorrect: false, rationale: "자율성은 인공지능이 인간 통제 밖에서 독립적으로 임무를 판단하고 결정할 수 있는 능력을 말합니다." },
      { text: "알고리즘 분산성 (Algorithm Variance)", isCorrect: false, rationale: "알고리즘 분산성은 수치 처리에서 나타나는 데이터 분포상의 특성 수치를 뜻합니다." },
      { text: "클라우드 종속성 (Cloud Dependency)", isCorrect: false, rationale: "인프라 자원을 클라우드 서버 성능에 전적으로 기대야만 구동되는 성질을 말합니다." }
    ],
    hint: "데이터가 한쪽 방향으로 쏠려(기울어져) 공정성을 무너뜨렸다는 의미를 담고 있습니다."
  },
  {
    questionNumber: 5,
    question: "인공지능에게 정답이 없는 수천만 건의 쇼핑 고객 소비 정보만 던져주어 컴퓨터 스스로 유사한 관심사를 가진 회원 그룹끼리 묶어 분류하게 하거나 숨겨진 규칙적인 연관성을 파악해내도록 고안한 머신러닝 기법은 무엇일까요?",
    answerOptions: [
      { text: "비지도학습 (Unsupervised Learning)", isCorrect: true, rationale: "사전에 명시적인 정답(레이블) 정보를 제공받지 않고, 순수 인풋 데이터 고유의 내재적 특성을 파악하여 군집화(Clustering)하는 방법입니다." },
      { text: "지도학습 (Supervised Learning)", isCorrect: false, rationale: "지도학습은 반드시 데이터와 함께 '이 데이터는 패션 카테고리다'라는 명확한 정답 코드가 함께 주어져야 합니다." },
      { text: "강화학습 (Reinforcement Learning)", isCorrect: false, rationale: "강화학습은 행동에 상응하는 수치화된 보상 환경(보상 설계 체계)이 필요한 전혀 다른 메커니즘입니다." },
      { text: "인공지도학습 (Artificial Guided)", isCorrect: false, rationale: "지도학습에 포함되거나 기계학습 범주에 명확하게 존재하지 않는 임의 명칭입니다." }
    ],
    hint: "선생님이 미리 가르쳐주는 수동적 지도를 전혀 받지 않고도('비') 기계 혼자 규칙을 유추한다는 이름의 학습 방식입니다."
  },
  {
    questionNumber: 6,
    question: "바둑 대국의 승패, 자율주행 차량의 안전 주행 성공 여부처럼 인공지능의 선택이나 특정한 행동에 대해 '보상(Reward)' 또는 '감점(Penalty)'을 수여하며 시행착오 끝에 최고의 전략을 도출하게 훈련하는 학습 체계는 무엇일까요?",
    answerOptions: [
      { text: "강화학습 (Reinforcement Learning)", isCorrect: true, rationale: "환경과 에이전트가 끊임없이 보상을 기반으로 교류하며 누적 기대 보상이 최대가 되게끔 행동 최적화를 거듭하는 기술 모델입니다." },
      { text: "지도학습 (Supervised Learning)", isCorrect: false, rationale: "지도학습에는 정답을 맞혔을 때의 실시간 보상을 순차적으로 설계하지 않고 단지 정답과의 일관된 거리를 좁힐 뿐입니다." },
      { text: "전이학습 (Transfer Learning)", isCorrect: false, rationale: "전이학습은 이미 한 분야에서 성공적으로 트레이닝 완료된 모델 정보를 응용하여 다른 연관 분야 모델 학습 속도를 올리는 기법입니다." },
      { text: "메타학습 (Meta Learning)", isCorrect: false, rationale: "메타학습은 '배우는 방식을 또 다른 인공지능에게 지능적으로 훈련시킨다'는 뜻으로 보상과 일련의 행동 시행착오 방식과는 직결되지 않습니다." }
    ],
    hint: "점점 힘과 습관을 더 튼튼하게 만들어 나간다는 의미의 한자 단어 '강할 강, 화할 화'의 이름을 품고 있습니다."
  },
  {
    questionNumber: 7,
    question: "인간 뇌에 존재하는 수많은 신경망 단위 세포인 '뉴런'의 상호 연결 구조를 모방하여 인공적으로 설계한 인공지능의 다층 구조 기술 이름은 무엇일까요?",
    answerOptions: [
      { text: "인공신경망 (Artificial Neural Network)", isCorrect: true, rationale: "뇌 속 시냅스의 화학 전기적 연결 작용을 모방하여 가중치와 노드 조합으로 패턴을 추론해내는 딥러닝의 핵심 뼈대 알고리즘입니다." },
      { text: "네트워크 그리드 (Network Grid)", isCorrect: false, rationale: "지리적 영역 내에서 대량의 데이터를 수송하거나 송전할 때 사용하는 망형 분배 기술입니다." },
      { text: "트랜잭션 노드 (Transaction Node)", isCorrect: false, rationale: "금융 블록체인 거래 단위 등에서 각 데이터 정보의 흐름을 확인하는 마이크로 노드 지점 명칭입니다." },
      { text: "바이오 셀 (Bio-Cell Matrix)", isCorrect: false, rationale: "생명공학 등에서 세포 배양을 관찰할 때 언급될 뿐, 뇌 뉴런에서 이름 딴 인공지능 구조의 이름이 아닙니다." }
    ],
    hint: "영어 약어로는 ANN이라 불리며, 사람 뇌세포의 지각 전달 통로(신경)를 인공적으로 구현했다는 의미입니다."
  },
  {
    questionNumber: 8,
    question: "1950년대 영국의 천재 수학자 앨런 튜링이 고안한 방식으로, 보이지 않는 곳에 있는 기계와 사람이 텍스트 대화를 나누었을 때 그 답변이 사람의 것인지 기계의 것인지 인간 심사위원이 완벽하게 구별하지 못한다면 인공지능으로 인정해야 한다는 유명한 최초의 인공지능 판별 시험은 무엇일까요?",
    answerOptions: [
      { text: "튜링 테스트 (Turing Test)", isCorrect: true, rationale: "인공지능 개발 역사에서 '기계가 생각할 수 있는가?'라는 질문을 제기하고 인공지능의 가능성을 실질적인 대화 판별 방식으로 정의한 위대한 최초의 시험입니다." },
      { text: "아미테이지 테스트 (Amitage Test)", isCorrect: false, rationale: "영화나 애니메이션 등에 단편적으로 쓰이는 SF 설정 용어에 불과합니다." },
      { text: "이미테이션 아카이브 (Imitation Archive)", isCorrect: false, rationale: "데이터 보존소의 가짜 복사본을 일컫는 정보 보안 쪽 가상 용어입니다." },
      { text: "로봇 3원칙 (The Three Laws of Robotics)", isCorrect: false, rationale: "로봇 3원칙은 소설가 아이작 아시모프가 창제한 공상과학 속 로봇 윤리 행동 원리 규범입니다." }
    ],
    hint: "그의 성인 '튜링(Turing)'이라는 고유 명사를 그대로 따온 위대한 기초 컴퓨터 과학 시험 방식입니다."
  },
  {
    questionNumber: 9,
    question: "바둑 기사 이세돌 9단과의 역사적인 바둑 대결을 펼쳐 세상을 놀라게 했던 구글 딥마인드의 바둑 최적화 인공지능 기계 이름은 무엇일까요?",
    answerOptions: [
      { text: "알파고 (AlphaGo)", isCorrect: true, rationale: "딥러닝과 강화학습, 몬테카를로 트리 탐색 기법을 획기적으로 조화시켜 2016년 바둑의 영역에서 인간 한계를 정복했던 인공지능입니다." },
      { text: "딥블루 (Deep Blue)", isCorrect: false, rationale: "IBM이 개발한 딥블루는 1997년에 체스 세계 챔피언을 사상 최초로 물리쳤던 당시의 고성능 컴퓨터입니다." },
      { text: "왓슨 (Watson)", isCorrect: false, rationale: "왓슨은 자연어 처리를 기반으로 미국 유명 퀴즈쇼 제퍼디에서 우승하며 실생활 지식을 방대하게 선보였던 IBM의 인공지능 이름입니다." },
      { text: "제미나이 (Gemini)", isCorrect: false, rationale: "제미나이는 구글이 개발한 텍스트, 코드, 이미지, 음성 등 멀티모달 능력을 전방위로 보유한 최신 생성형 대형 언어모델(LLM) 제품군 명칭입니다." }
    ],
    hint: "최고를 뜻하는 '알파(Alpha)'에 바둑의 영어명 '고(Go)'를 합성하여 세상에 명명되었습니다."
  },
  {
    questionNumber: 10,
    question: "우리가 살아가고 있는 현대 사회의 수많은 일상 속 인공지능 기술의 이점을 잘 활용하는 동시에, 가짜 뉴스 확산 방지, 혐오 발언 방지, 개인 정보 보호 규칙 등을 성실하게 정립해나가는 필수 역량을 종합적으로 이르는 명칭은 무엇일까요?",
    answerOptions: [
      { text: "인공지능 윤리적 태도 및 디지털 리터러시", isCorrect: true, rationale: "인공지능 시대의 디지털 시민으로서 갖추어야 할 지적·규범적·사회 윤리적 사용 자질과 이해력을 정직하게 상징합니다." },
      { text: "디지털 기계 의존성", isCorrect: false, rationale: "스마트 기기에 완전히 사로잡혀서 인간 본질과 주체적 논리력을 완전히 잃은 다소 부정적인 기계 중독 상태를 뜻합니다." },
      { text: "알고리즘 우선주의", isCorrect: false, rationale: "인간 고유의 도덕과 정서보다 단순히 기계 알고리즘적 연산 데이터와 이율 효율성을 신봉하며 앞세우는 사상입니다." },
      { text: "컴퓨터 부품 친화적 태도", isCorrect: false, rationale: "단지 컴퓨터 하드웨어를 다루고 제작하는 친숙한 행위를 묘사한 일차원적 단어 조합에 불과합니다." }
    ],
    hint: "기술 그 자체의 고성능적인 개발보다 우리가 상호 도덕적으로 공존하고 이해하는 능력을 아우릅니다."
  }
];

// --- 로봇 아바타 UI (상태 표현 SVG 컴포넌트) ---
const RobotAvatar = ({ expression = 'thinking', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };
  
  return (
    <div className="relative flex justify-center items-center">
      <svg className={`${sizeClasses[size]} drop-shadow-lg transition-transform duration-500 hover:scale-105`} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Antenna */}
        <rect x="47" y="10" width="6" height="15" rx="3" fill="#06b6d4" className="transition-all duration-300" />
        <circle cx="50" cy="8" r="5" fill="#38bdf8" className={expression === 'happy' ? 'animate-ping' : 'animate-pulse'} />
        
        {/* Outer Head with dynamic border color based on status */}
        <rect 
          x="18" 
          y="22" 
          width="64" 
          height="52" 
          rx="16" 
          fill="#1e293b" 
          stroke={expression === 'happy' ? '#22c55e' : expression === 'sad' ? '#ef4444' : '#06b6d4'} 
          strokeWidth="4"
          className="transition-all duration-500"
        />
        
        {/* Left/Right Ears */}
        <rect x="10" y="38" width="8" height="20" rx="4" fill="#334155" />
        <rect x="82" y="38" width="8" height="20" rx="4" fill="#334155" />
        
        {/* Screen/Face */}
        <rect x="26" y="29" width="48" height="38" rx="10" fill="#0f172a" stroke="#1e293b" strokeWidth="2" />
        
        {/* Eyes according to expression state */}
        {expression === 'happy' && (
          <>
            {/* Curved Smile Eyes */}
            <path d="M34 47C35 44 38 43 40 45C41 47 40 50 38 50C36 50 34 49 34 47Z" stroke="#22c55e" strokeWidth="4.5" strokeLinecap="round" fill="none" />
            <path d="M66 47C65 44 62 43 60 45C59 47 60 50 62 50C64 50 66 49 66 47Z" stroke="#22c55e" strokeWidth="4.5" strokeLinecap="round" fill="none" />
          </>
        )}
        
        {expression === 'sad' && (
          <>
            {/* Sad Drooping Eyes */}
            <path d="M33 48C35 45 41 45 43 48" stroke="#ef4444" strokeWidth="4.5" strokeLinecap="round" fill="none" />
            <path d="M57 48C59 45 65 45 67 48" stroke="#ef4444" strokeWidth="4.5" strokeLinecap="round" fill="none" />
          </>
        )}
        
        {expression === 'thinking' && (
          <>
            {/* Animated blinking dots */}
            <circle cx="38" cy="46" r="3.5" fill="#38bdf8" className="animate-pulse" />
            <circle cx="62" cy="46" r="3.5" fill="#38bdf8" className="animate-pulse" />
          </>
        )}
        
        {expression === 'default' && (
          <>
            {/* Standard circular glowing cyan eyes */}
            <circle cx="38" cy="46" r="4.5" fill="#06b6d4" />
            <circle cx="62" cy="46" r="4.5" fill="#06b6d4" />
          </>
        )}
        
        {/* Mouth shapes */}
        {expression === 'happy' ? (
          <path d="M42 56C42 56 45 61 50 61C55 61 58 56 58 56" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" fill="none" />
        ) : expression === 'sad' ? (
          <path d="M44 59C47 57 53 57 56 59" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" fill="none" />
        ) : (
          <line x1="44" y1="56" x2="56" y2="56" stroke="#06b6d4" strokeWidth="3.5" strokeLinecap="round" />
        )}
        
        {/* Cute blush cheeks */}
        <circle cx="31" cy="55" r="2.5" fill="#f43f5e" opacity="0.6" />
        <circle cx="69" cy="55" r="2.5" fill="#f43f5e" opacity="0.6" />
      </svg>
      {/* Dynamic small status label over the head */}
      <span className={`absolute -top-3 px-2 py-0.5 text-[10px] font-bold rounded-full tracking-wider border transition-all ${
        expression === 'happy' ? 'bg-green-950/80 text-green-400 border-green-500 animate-bounce' :
        expression === 'sad' ? 'bg-red-950/80 text-red-400 border-red-500' :
        'bg-slate-900/90 text-cyan-400 border-cyan-500'
      }`}>
        {expression === 'happy' ? '최고예요!' : expression === 'sad' ? '아쉬워요!' : '에이미'}
      </span>
    </div>
  );
};

// --- 메인 애플리케이션 컴포넌트 ---
export default function App() {
  const [screen, setScreen] = useState('welcome'); // welcome | study | quiz | result
  const [activeTab, setActiveTab] = useState(0); // For study materials index
  const [studyReadStates, setStudyReadStates] = useState([false, false, false, false]); // Read markers
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answersHistory, setAnswersHistory] = useState([]); // Array of { index, isCorrect, chosenIdx }
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [highStreak, setHighStreak] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [quizMode, setQuizMode] = useState('normal'); // normal | challenge
  const [timeRemaining, setTimeRemaining] = useState(15);
  const [tutorExpression, setTutorExpression] = useState('default');
  const [showTutorTip, setShowTutorTip] = useState(true);
  const [showLessonPlanModal, setShowLessonPlanModal] = useState(false); // For Graduate Researcher Yu's custom edutech panel
  
  const timerRef = useRef(null);

  // Sound effect helper
  const triggerSound = (type) => {
    playSynthSound(type, isMuted);
  };

  // --- 챌린지 모드 전용 타이머 훅 ---
  useEffect(() => {
    if (screen === 'quiz' && quizMode === 'challenge' && selectedOption === null) {
      setTimeRemaining(15);
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            // Time out acts as a wrong answer
            handleTimeOut();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [screen, currentQuestionIndex, quizMode, selectedOption]);

  const handleTimeOut = () => {
    triggerSound('wrong');
    setTutorExpression('sad');
    setSelectedOption(-1); // Specifying timeout with index -1
    setStreak(0);
    setAnswersHistory((prev) => [
      ...prev,
      { questionIndex: currentQuestionIndex, isCorrect: false, chosenIdx: -1 }
    ]);
  };

  // Mark a card as read in Study Mode
  const markAsRead = (idx) => {
    const updated = [...studyReadStates];
    updated[idx] = true;
    setStudyReadStates(updated);
    triggerSound('click');
  };

  const getReadPercentage = () => {
    const count = studyReadStates.filter(Boolean).length;
    return Math.round((count / STUDY_MATERIALS.length) * 100);
  };

  const startQuiz = (mode) => {
    triggerSound('click');
    setQuizMode(mode);
    setScreen('quiz');
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setAnswersHistory([]);
    setScore(0);
    setStreak(0);
    setTutorExpression('thinking');
    setTimeRemaining(15);
  };

  const handleAnswerSelection = (optionIndex) => {
    if (selectedOption !== null) return; // Prevent double answer submittals
    
    setSelectedOption(optionIndex);
    if (timerRef.current) clearInterval(timerRef.current);

    const question = QUIZ_QUESTIONS[currentQuestionIndex];
    const isCorrect = question.answerOptions[optionIndex].isCorrect;

    if (isCorrect) {
      triggerSound('correct');
      setTutorExpression('happy');
      setScore((prev) => prev + 10);
      setStreak((prev) => {
        const next = prev + 1;
        if (next > highStreak) setHighStreak(next);
        return next;
      });
    } else {
      triggerSound('wrong');
      setTutorExpression('sad');
      setStreak(0);
    }

    setAnswersHistory((prev) => [
      ...prev,
      { questionIndex: currentQuestionIndex, isCorrect, chosenIdx: optionIndex }
    ]);
  };

  const handleNextQuestion = () => {
    triggerSound('click');
    setTutorExpression('default');
    
    if (currentQuestionIndex < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
    } else {
      // Finished all quiz items
      setTimeout(() => {
        triggerSound('fanfare');
      }, 100);
      setScreen('result');
    }
  };

  const resetAll = () => {
    triggerSound('click');
    setScreen('welcome');
    setStudyReadStates([false, false, false, false]);
    setAnswersHistory([]);
    setScore(0);
    setStreak(0);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setTutorExpression('default');
  };

  // Retrieve user ranking word
  const getPerformanceRating = () => {
    const correctCount = answersHistory.filter(a => a.isCorrect).length;
    if (correctCount === 10) return { title: "🤖 초능력 인공지능 마스터", desc: "이 구역의 인공지능 1타 강사! 완벽에 가까운 수준의 개념을 탑재하셨습니다!" };
    if (correctCount >= 8) return { title: "🚀 스마트한 딥러닝 개척자", desc: "인공지능 핵심의 거의 모든 것을 완벽히 숙지하고 있습니다. 훌륭한 수준이에요!" };
    if (correctCount >= 5) return { title: "🌱 쑥쑥 크는 머신러닝 탐험가", desc: "인공지능과 머신러닝의 중요한 뼈대를 잡아가고 있어요. 틀린 오답 노트로 한 단계 더 성장해 볼까요?" };
    return { title: "📱 호기심 충만한 미래 데이터 꿈나무", desc: "인공지능은 이제 첫걸음부터 시작입니다. 공부방(개념 자료)을 천천히 복습하면 금세 점수가 쑥쑥 오를 거예요!" };
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      
      {/* 탑 네비게이션 글로벌 바 */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 px-4 py-3.5 transition-all">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={resetAll}>
            <div className="bg-gradient-to-tr from-cyan-500 to-indigo-600 p-2 rounded-xl shadow-lg shadow-cyan-500/10">
              <Brain className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <h1 className="font-black text-lg tracking-tight bg-gradient-to-r from-white via-cyan-200 to-cyan-400 bg-clip-text text-transparent">
                AI Edu-Quiz
              </h1>
              <p className="text-[10px] text-cyan-400/80 tracking-widest font-mono uppercase">Interactive Edutech</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* 에듀테크 수업 지도안 다운로드 단추 (유혜진 연구원님 맞춤형 에듀테크 패널) */}
            <button
              onClick={() => { triggerSound('click'); setShowLessonPlanModal(true); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/40 text-indigo-200 transition-all font-medium"
              title="에듀테크 수업지도안 확인"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">수업지도안 보기</span>
            </button>

            {/* 음소거 컨트롤 */}
            <button 
              onClick={() => setIsMuted(!isMuted)} 
              className={`p-2 rounded-lg border transition-all ${
                isMuted 
                  ? 'border-slate-800 bg-slate-900 text-slate-500' 
                  : 'border-cyan-800/40 bg-cyan-950/30 text-cyan-400 hover:bg-cyan-950/60'
              }`}
              title={isMuted ? "소리 켜기" : "소리 끄기"}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {screen === 'quiz' && (
              <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-300 font-mono">
                <Timer className="w-3.5 h-3.5 text-cyan-400" />
                <span>문항: {currentQuestionIndex + 1}/{QUIZ_QUESTIONS.length}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 메인 본문 콘텐츠 */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6 flex flex-col justify-center">
        
        {/* WELCOME (웰컴 메인 화면) */}
        {screen === 'welcome' && (
          <div className="grid md:grid-cols-12 gap-8 items-center py-6">
            
            {/* 좌측 안내 */}
            <div className="md:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold rounded-full">
                <Sparkles className="w-3.5 h-3.5" />
                <span>에듀테크 SW·AI 최적화 코딩 교실</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                인공지능의 세계로 <br />
                떠나는 <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400">스마트 탐험 퀴즈</span>
              </h2>
              <p className="text-slate-400 text-base leading-relaxed">
                인공지능, 머신러닝, 딥러닝의 명확한 차이점을 알고 계신가요? 
                어려운 AI 개념을 귀여운 <strong className="text-cyan-300">인공지능 튜터 '에이미'</strong>와 함께 정복해 보세요! 
                학습 후 도전하면 정답률이 쑥쑥 오릅니다.
              </p>

              {/* 기능 하이라이트 박스 */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-all">
                  <BookOpen className="w-5 h-5 text-indigo-400 mb-2" />
                  <h3 className="font-bold text-sm text-slate-200">1단계: 에듀 공부방</h3>
                  <p className="text-xs text-slate-400 mt-1">인공지능 핵심 이론 4대 테마 기초 다지기</p>
                </div>
                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-all">
                  <Award className="w-5 h-5 text-cyan-400 mb-2" />
                  <h3 className="font-bold text-sm text-slate-200">2단계: 개념 자가진단</h3>
                  <p className="text-xs text-slate-400 mt-1">10문항으로 재미있는 자가평가 도전</p>
                </div>
              </div>

              {/* 핵심 전환 버튼 군 */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  onClick={() => { triggerSound('click'); setScreen('study'); }}
                  className="flex-1 flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl font-bold bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white transition-all shadow-md transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <BookOpenCheck className="w-5 h-5 text-indigo-400" />
                  <span>💡 에이미 AI 공부방 먼저 가기</span>
                </button>
                <button
                  onClick={() => startQuiz('normal')}
                  className="flex-1 flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl font-bold bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white transition-all shadow-lg shadow-cyan-500/20 transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Brain className="w-5 h-5 text-white" />
                  <span>🚀 퀴즈 바로 시작하기</span>
                </button>
              </div>

              {/* 챌린지 모드 버튼 */}
              <div className="pt-1 flex items-center justify-center sm:justify-start">
                <button
                  onClick={() => startQuiz('challenge')}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors bg-rose-500/10 hover:bg-rose-500/20 px-3 py-1.5 rounded-lg border border-rose-500/20"
                >
                  <Timer className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                  <span>⏱️ 15초 제한 시간 타임어택 도전하기! (상급자 코스)</span>
                </button>
              </div>
            </div>

            {/* 우측 에이미 로봇 인터랙티브 쇼케이스 */}
            <div className="md:col-span-5 flex flex-col items-center justify-center bg-gradient-to-b from-slate-900/80 to-slate-950/40 p-8 rounded-3xl border border-slate-800/80 shadow-2xl relative">
              <div className="absolute top-4 right-4 bg-slate-800/90 text-slate-300 text-[10px] px-2 py-1 rounded-md border border-slate-700 font-mono">
                최고 연속정답: {highStreak}
              </div>
              <RobotAvatar expression="thinking" size="lg" />
              <div className="mt-6 text-center space-y-2 max-w-xs">
                <h4 className="font-bold text-slate-200">"안녕하세요! 저는 AI 튜터 에이미예요"</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  "인공지능 공부가 낯설어도 걱정 마세요. 제가 곁에서 친절한 단서(힌트)와 원리를 콕 짚어 드릴게요!"
                </p>
              </div>
            </div>

          </div>
        )}

        {/* STUDY ROOM (개념 학습방 화면) */}
        {screen === 'study' && (
          <div className="space-y-6 max-w-4xl mx-auto py-2">
            {/* 상단 탭 헤더 */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
              <div>
                <h2 className="text-2xl font-extrabold flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-indigo-400" />
                  <span>에이미의 AI 핵심 공부방</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">아래 4가지 핵심 카드를 터치하여 공부하고 다 읽음 표시를 남겨주세요.</p>
              </div>
              <div className="w-full sm:w-auto">
                <div className="flex justify-between text-xs text-slate-400 mb-1 font-mono">
                  <span>공부 달성률:</span>
                  <span className="text-cyan-400 font-bold">{getReadPercentage()}%</span>
                </div>
                <div className="w-full sm:w-48 bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-cyan-400 to-indigo-500 h-full transition-all duration-500"
                    style={{ width: `${getReadPercentage()}%` }}
                  />
                </div>
              </div>
            </div>

            {/* 메인 공부방 2단 레이아웃 (왼쪽 사이드바, 오른쪽 카드 상세) */}
            <div className="grid md:grid-cols-12 gap-6 items-start">
              
              {/* 왼쪽 퀵 탭 */}
              <div className="md:col-span-4 flex md:flex-col gap-2 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
                {STUDY_MATERIALS.map((material, idx) => (
                  <button
                    key={material.id}
                    onClick={() => { triggerSound('click'); setActiveTab(idx); }}
                    className={`flex-1 min-w-[140px] md:w-full text-left p-3.5 rounded-xl border transition-all flex items-center gap-3 ${
                      activeTab === idx
                        ? 'bg-slate-800 border-cyan-500/50 shadow-md shadow-cyan-500/5'
                        : 'bg-slate-900/50 border-slate-800 hover:bg-slate-900/80 hover:border-slate-700'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg ${activeTab === idx ? 'bg-slate-900' : 'bg-slate-800'}`}>
                      {material.icon}
                    </div>
                    <div className="truncate">
                      <h4 className="font-bold text-xs text-slate-200">{material.title}</h4>
                      <span className="text-[10px] text-slate-400">{material.subtitle}</span>
                    </div>
                    {studyReadStates[idx] && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 ml-auto flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>

              {/* 오른쪽 상세 뷰어 */}
              <div className="md:col-span-8 bg-gradient-to-b from-slate-900 to-slate-950 p-6 rounded-2xl border border-slate-800 space-y-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-xs text-indigo-400 font-mono tracking-widest uppercase font-bold">Concept Module</span>
                    <h3 className="text-xl font-black text-slate-100">{STUDY_MATERIALS[activeTab].title}</h3>
                  </div>
                  <div className="bg-slate-800/80 p-2 rounded-xl">
                    {STUDY_MATERIALS[activeTab].icon}
                  </div>
                </div>

                <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80 text-sm leading-relaxed text-slate-300">
                  <strong className="text-cyan-400 block mb-1">한 줄 요약:</strong>
                  {STUDY_MATERIALS[activeTab].summary}
                </div>

                {/* 불릿 포인트 핵심 요약 */}
                <div className="space-y-3">
                  <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider">💡 상세 내용 다지기</h4>
                  <ul className="space-y-2.5">
                    {STUDY_MATERIALS[activeTab].bullets.map((bullet, index) => (
                      <li key={index} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
                        <span className="mt-1 w-1.5 h-1.5 bg-indigo-500 rounded-full flex-shrink-0" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 생생한 활용사례 */}
                <div className="bg-cyan-950/20 p-4 rounded-xl border border-cyan-800/20 text-xs">
                  <p className="leading-relaxed text-slate-300">
                    <strong className="text-cyan-400 block mb-1">실생활 적용 예시:</strong>
                    {STUDY_MATERIALS[activeTab].example}
                  </p>
                </div>

                {/* 읽음 완료 제어 및 하단 이동 단추 */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
                  <button
                    onClick={() => markAsRead(activeTab)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                      studyReadStates[activeTab]
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 cursor-default'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{studyReadStates[activeTab] ? "학습 완료!" : "이 카드 학습 완료하기"}</span>
                  </button>

                  <div className="flex gap-2">
                    {activeTab > 0 && (
                      <button
                        onClick={() => { triggerSound('click'); setActiveTab(prev => prev - 1); }}
                        className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 font-medium"
                      >
                        이전 카드
                      </button>
                    )}
                    {activeTab < STUDY_MATERIALS.length - 1 ? (
                      <button
                        onClick={() => { triggerSound('click'); setActiveTab(prev => prev + 1); }}
                        className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 font-medium"
                      >
                        다음 카드
                      </button>
                    ) : (
                      <button
                        onClick={() => startQuiz('normal')}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold shadow-lg shadow-cyan-600/15"
                      >
                        <span>퀴즈 풀기!</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* 홈으로 돌아가기 단추 */}
            <div className="pt-2 flex justify-start">
              <button 
                onClick={() => { triggerSound('click'); setScreen('welcome'); }}
                className="text-xs text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
                <span>메인 화면으로 나가기</span>
              </button>
            </div>
          </div>
        )}

        {/* QUIZ ARENA (실전 퀴즈 풀이 화면) */}
        {screen === 'quiz' && (
          <div className="max-w-4xl mx-auto grid md:grid-cols-12 gap-6 items-start py-2">
            
            {/* 좌측 (7/12): 문제 및 보기 선택 영역 */}
            <div className="md:col-span-8 space-y-5">
              
              {/* 상단 문항 정보 및 챌린지 타이머 프로그래스바 */}
              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md">
                      문항 {currentQuestionIndex + 1} / {QUIZ_QUESTIONS.length}
                    </span>
                    {quizMode === 'challenge' && (
                      <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-bold px-2 py-0.5 rounded-md animate-pulse">
                        챌린지 타임어택!
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400">현재 점수: </span>
                    <span className="text-xs font-mono font-black text-cyan-400">{score}점</span>
                  </div>
                </div>

                {/* 퀴즈 전체 진행률 막대 */}
                <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-cyan-400 to-indigo-500 h-full transition-all duration-300"
                    style={{ width: `${((currentQuestionIndex) / QUIZ_QUESTIONS.length) * 100}%` }}
                  />
                </div>

                {/* 챌린지 모드인 경우 표시되는 실시간 카운트다운 타이머 바 */}
                {quizMode === 'challenge' && selectedOption === null && (
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-rose-400 font-semibold flex items-center gap-1">
                        <Timer className="w-3 h-3 text-rose-400 animate-spin" />
                        남은 시간
                      </span>
                      <span className="font-mono text-rose-400 font-bold">{timeRemaining}초</span>
                    </div>
                    <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ${timeRemaining <= 5 ? 'bg-rose-500' : 'bg-cyan-500'}`}
                        style={{ width: `${(timeRemaining / 15) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 문제 텍스트 */}
              <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
                <h3 className="text-lg md:text-xl font-bold text-slate-100 leading-relaxed">
                  {QUIZ_QUESTIONS[currentQuestionIndex].question}
                </h3>
              </div>

              {/* 보기 리스트 */}
              <div className="space-y-3">
                {QUIZ_QUESTIONS[currentQuestionIndex].answerOptions.map((option, index) => {
                  const isSelected = selectedOption === index;
                  const isCorrectAnswer = option.isCorrect;
                  const hasAnswered = selectedOption !== null;
                  
                  let buttonClass = "bg-slate-900/40 border-slate-800/80 text-slate-300 hover:bg-slate-900 hover:border-slate-700";
                  let iconElement = <span className="w-5 h-5 rounded-full border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-500 font-mono group-hover:border-cyan-500 group-hover:text-cyan-400 transition-colors">{index + 1}</span>;

                  if (hasAnswered) {
                    if (isCorrectAnswer) {
                      // Correct option style (always highlit in green once answered)
                      buttonClass = "bg-green-950/40 border-green-500/80 text-green-200 ring-2 ring-green-500/20";
                      iconElement = <CheckCircle2 className="w-5 h-5 text-green-400" />;
                    } else if (isSelected) {
                      // Chosen wrong option style
                      buttonClass = "bg-red-950/40 border-red-500/80 text-red-200 ring-2 ring-red-500/20";
                      iconElement = <XCircle className="w-5 h-5 text-red-400" />;
                    } else {
                      // Non-selected wrong option style
                      buttonClass = "bg-slate-900/20 border-slate-950 text-slate-500 opacity-60 pointer-events-none";
                    }
                  }

                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelection(index)}
                      disabled={hasAnswered}
                      className={`group w-full text-left p-4 rounded-xl border flex items-start gap-4 transition-all duration-200 text-sm leading-relaxed ${buttonClass}`}
                    >
                      <div className="mt-0.5 flex-shrink-0">
                        {iconElement}
                      </div>
                      <span className="flex-1 font-medium">{option.text}</span>
                    </button>
                  );
                })}

                {/* 타임아웃 메시지 */}
                {selectedOption === -1 && (
                  <div className="p-4 bg-red-950/30 border border-red-500/30 text-red-400 rounded-xl flex items-center gap-2.5 text-xs">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span>시간이 초과되었습니다! 다음 문제로 이동해 주세요.</span>
                  </div>
                )}
              </div>

              {/* 하단 탐색 제어 영역 */}
              {selectedOption !== null && (
                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleNextQuestion}
                    className="flex items-center gap-1.5 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/10 transition-transform active:scale-95"
                  >
                    <span>
                      {currentQuestionIndex < QUIZ_QUESTIONS.length - 1 ? "다음 문제 풀기" : "최종 결과 확인하기"}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

            </div>

            {/* 우측 (4/12): 에이미 튜터 인터랙티브 팁 & 힌트 */}
            <div className="md:col-span-4 bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="text-xs font-black tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
                  <span>AI 메이트 에이미</span>
                </h4>
                <button 
                  onClick={() => setShowTutorTip(!showTutorTip)}
                  className="text-[10px] text-cyan-500 hover:underline font-mono"
                >
                  {showTutorTip ? "[말풍선 닫기]" : "[말풍선 열기]"}
                </button>
              </div>

              <div className="flex flex-col items-center">
                <RobotAvatar expression={tutorExpression} size="md" />
                
                {showTutorTip && (
                  <div className="mt-4 bg-slate-950 p-4 rounded-xl border border-slate-800 w-full relative">
                    {/* Speech bubble tail effect */}
                    <div className="absolute left-1/2 -top-2 -translate-x-1/2 w-4 h-4 bg-slate-950 border-t border-l border-slate-800 rotate-45" />
                    
                    {selectedOption === null ? (
                      /* 보기 고르기 전 */
                      <div className="space-y-2 text-xs leading-relaxed text-slate-300 relative z-10">
                        <p className="text-cyan-400 font-bold flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>에이미의 힌트 카드</span>
                        </p>
                        <p className="italic text-slate-400">
                          "{QUIZ_QUESTIONS[currentQuestionIndex].hint}"
                        </p>
                      </div>
                    ) : (
                      /* 정답 확인 후 해설 띄우기 */
                      <div className="space-y-2.5 text-xs leading-relaxed text-slate-300 relative z-10">
                        {selectedOption === -1 ? (
                          <div className="text-rose-400 font-bold flex items-center gap-1.5">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>아쉽네요, 제한 시간 초과!</span>
                          </div>
                        ) : QUIZ_QUESTIONS[currentQuestionIndex].answerOptions[selectedOption].isCorrect ? (
                          <div className="text-green-400 font-bold flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>딩동댕! 아주 훌륭한 추론이에요!</span>
                          </div>
                        ) : (
                          <div className="text-rose-400 font-bold flex items-center gap-1.5">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>아차, 다른 개념과 헷갈렸네요!</span>
                          </div>
                        )}
                        
                        <p className="text-slate-300">
                          {selectedOption === -1 
                            ? "시간이 모두 지났어요. 다음 문항으로 이동하여 조금 더 속도를 내 볼까요? 포기하지 마세요!"
                            : QUIZ_QUESTIONS[currentQuestionIndex].answerOptions[selectedOption].rationale
                          }
                        </p>
                        
                        {/* 정답의 실제 완벽한 근거 요약 추가 */}
                        {!QUIZ_QUESTIONS[currentQuestionIndex].answerOptions[selectedOption].isCorrect && selectedOption !== -1 && (
                          <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-[11px] text-slate-400 mt-1">
                            <strong className="text-green-400 block mb-0.5">정답의 올바른 개념 원리:</strong>
                            {QUIZ_QUESTIONS[currentQuestionIndex].answerOptions.find(o => o.isCorrect).rationale}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 연속 정답 콤보 배지 */}
              {streak >= 2 && (
                <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-orange-500/20 p-3 rounded-xl flex items-center justify-between text-xs animate-pulse">
                  <span className="text-orange-400 font-bold">🔥 {streak}문항 연속 정답 행진 중!</span>
                  <span className="text-[10px] font-mono text-slate-400 bg-orange-950/60 px-1.5 py-0.5 rounded border border-orange-800/40">Combo</span>
                </div>
              )}
            </div>

          </div>
        )}

        {/* RESULTS PAGE (최종 리포트 카드 화면) */}
        {screen === 'result' && (
          <div className="max-w-4xl mx-auto space-y-6 py-2">
            
            {/* 상단 결과 축하 요약 배너 */}
            <div className="bg-gradient-to-b from-slate-900 to-slate-950 p-6 md:p-8 rounded-3xl border border-slate-800 text-center space-y-5 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500" />
              
              <div className="flex justify-center">
                <div className="bg-cyan-500/10 p-4 rounded-full border border-cyan-500/20 animate-bounce-slow">
                  <Award className="w-10 h-10 text-cyan-400" />
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs text-indigo-400 font-mono tracking-widest font-bold uppercase">QUIZ SUMMARY REPORT</span>
                <h2 className="text-2xl md:text-3xl font-black text-white leading-tight">
                  {getPerformanceRating().title}
                </h2>
                <p className="text-sm text-slate-400 max-w-lg mx-auto">
                  {getPerformanceRating().desc}
                </p>
              </div>

              {/* 통계 스코어보드 */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto pt-4">
                <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
                  <span className="block text-[10px] text-slate-400 uppercase tracking-wider">최종 점수</span>
                  <strong className="text-2xl font-mono text-cyan-400">{score}점</strong>
                </div>
                <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
                  <span className="block text-[10px] text-slate-400 uppercase tracking-wider">맞춘 문제</span>
                  <strong className="text-2xl font-mono text-emerald-400">
                    {answersHistory.filter(a => a.isCorrect).length} / {QUIZ_QUESTIONS.length}
                  </strong>
                </div>
                <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
                  <span className="block text-[10px] text-slate-400 uppercase tracking-wider">최대 콤보</span>
                  <strong className="text-2xl font-mono text-amber-400">{highStreak} Combo</strong>
                </div>
                <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
                  <span className="block text-[10px] text-slate-400 uppercase tracking-wider">참여 모드</span>
                  <strong className="text-sm font-bold text-slate-200 block mt-1.5">
                    {quizMode === 'challenge' ? '⏱️ 타임어택 챌린지' : '🚀 일반 학습모드'}
                  </strong>
                </div>
              </div>

              {/* 액션 제어 */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                <button
                  onClick={resetAll}
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-sm font-bold transition-all"
                >
                  <ListRestart className="w-4 h-4 text-slate-400" />
                  <span>처음 단계로 이동</span>
                </button>
                <button
                  onClick={() => startQuiz(quizMode)}
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-sm font-bold shadow-lg shadow-cyan-500/10 transition-all"
                >
                  <RotateCcw className="w-4 h-4 text-white" />
                  <span>같은 모드로 퀴즈 재도전</span>
                </button>
              </div>
            </div>

            {/* 오답 정리 아코디언 오답노트 (Hyejin 연구원님이 에듀테크 설계에서 강조하는 필수 피드백 영역) */}
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-extrabold flex items-center gap-2">
                  <BookOpenCheck className="w-5 h-5 text-indigo-400" />
                  <span>정확한 피드백을 위한 문항별 자가 복습 노트</span>
                </h3>
                <span className="text-xs text-slate-400">초등·중등 수준 최적화</span>
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {QUIZ_QUESTIONS.map((q, idx) => {
                  const history = answersHistory.find(h => h.questionIndex === idx);
                  const isCorrect = history?.isCorrect;
                  const chosenIdx = history?.chosenIdx;

                  return (
                    <div 
                      key={idx} 
                      className={`p-4 rounded-xl border text-xs space-y-2.5 transition-all ${
                        isCorrect 
                          ? 'bg-emerald-950/10 border-emerald-900/30 text-slate-300' 
                          : 'bg-red-950/10 border-red-900/30 text-slate-300'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-slate-100 leading-relaxed pr-2 flex-1">
                          Q{q.questionNumber}. {q.question}
                        </h4>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold flex-shrink-0 ${
                          isCorrect ? 'bg-green-950 text-green-400 border border-green-900/40' : 'bg-red-950 text-red-400 border border-red-900/40'
                        }`}>
                          {isCorrect ? '정답 완료' : '오답 발생'}
                        </span>
                      </div>

                      {/* 학생이 선택한 오답과 실제 정답 대비 */}
                      <div className="grid sm:grid-cols-2 gap-2 text-[11px] pt-1">
                        {!isCorrect && chosenIdx !== undefined && chosenIdx !== -1 && (
                          <div className="bg-red-950/30 p-2.5 rounded border border-red-900/20 text-red-300">
                            <span className="font-bold block mb-0.5">내가 선택한 오답:</span>
                            {q.answerOptions[chosenIdx]?.text}
                          </div>
                        )}
                        {chosenIdx === -1 && (
                          <div className="bg-red-950/30 p-2.5 rounded border border-red-900/20 text-red-300">
                            <span className="font-bold block mb-0.5">답변 상태:</span>
                            시간 초과로 인해 답변을 제출하지 못함
                          </div>
                        )}
                        <div className={`p-2.5 rounded border ${isCorrect ? 'bg-emerald-950/25 border-emerald-900/20 text-emerald-300 sm:col-span-2' : 'bg-emerald-950/25 border-emerald-900/20 text-emerald-300'}`}>
                          <span className="font-bold block mb-0.5">정답 문항:</span>
                          {q.answerOptions.find(o => o.isCorrect).text}
                        </div>
                      </div>

                      {/* 핵심 개념 피드백 */}
                      <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800/80 text-slate-400 leading-relaxed text-[11px]">
                        <strong className="text-cyan-400 block mb-0.5">💡 에이미의 핵심 보충 설명:</strong>
                        {q.answerOptions.find(o => o.isCorrect).rationale}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

      </main>

      {/* 푸터 영역 */}
      <footer className="border-t border-slate-900 bg-slate-950 text-slate-500 py-6 text-center text-xs">
        <div className="max-w-6xl mx-auto px-4 space-y-1">
          <p>© 2026 AI Edu-Quiz Hub. Designed for Perfect Edutech Instruction.</p>
          <p className="text-slate-600">본 도구는 유혜진 교육 연구원님의 수업 설계 목적을 지원하기 위해 정교하게 구성되었습니다.</p>
        </div>
      </footer>

      {/* --- 에듀테크 수업 지도안 모달 창 --- */}
      {showLessonPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            
            {/* 모달 헤더 */}
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/90">
              <div className="flex items-center gap-2">
                <BookOpenCheck className="w-5 h-5 text-indigo-400" />
                <h3 className="font-black text-lg text-slate-200">초·중학생을 위한 AI 개념 교육 수업지도안</h3>
              </div>
              <button 
                onClick={() => { triggerSound('click'); setShowLessonPlanModal(false); }}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 모달 본문 (스크롤) */}
            <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300 leading-relaxed">
              
              <div className="bg-indigo-950/20 border border-indigo-500/20 p-4 rounded-xl text-xs space-y-1">
                <p>💡 <strong>수업 설계 의도:</strong> 이 지도안은 에듀테크 강사 및 교육 연구원이신 선생님의 실제 현장 수업에 완벽히 호환되도록 구성되었습니다. 본 퀴즈 앱의 공부방 기능과 타임어택 챌린지 모드를 혼합 활용하는 40분 정규 수업 설계안입니다.</p>
              </div>

              {/* 개요 정보 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-500 block">단원명</span>
                  <span className="text-slate-200 font-bold">인공지능의 첫걸음</span>
                </div>
                <div>
                  <span className="text-slate-500 block">대상 수준</span>
                  <span className="text-slate-200 font-bold">초등 5~6학년 및 중학생</span>
                </div>
                <div>
                  <span className="text-slate-500 block">차시 시간</span>
                  <span className="text-slate-200 font-bold">40분 (1차시)</span>
                </div>
                <div>
                  <span className="text-slate-500 block">에듀테크 도구</span>
                  <span className="text-cyan-400 font-bold">본 교육용 퀴즈 웹 앱</span>
                </div>
              </div>

              {/* 마크다운 형태의 표 구조로 정확히 작성된 지도안 */}
              <div className="overflow-x-auto border border-slate-800 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold font-mono">
                      <th className="p-3 w-16">단계</th>
                      <th className="p-3 w-20">요소 (시간)</th>
                      <th className="p-3">교수-학습 활동 내용 및 에듀테크 활용 팁</th>
                      <th className="p-3 w-28">지도상 유의점</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    <tr>
                      <td className="p-3 font-bold text-cyan-400 bg-slate-950/10">도입</td>
                      <td className="p-3 text-slate-300 font-semibold">동기 유발<br />(5분)</td>
                      <td className="p-3 text-slate-400 space-y-1">
                        <p className="text-slate-300">① 일상 속 인공지능 탐색:</p>
                        <p>유튜브나 틱톡의 추천 알고리즘, 스마트폰 음성 비서 등 익숙한 인공지능 기능 질문하기.</p>
                        <p className="text-slate-300 mt-1">② 학습 목표 제시:</p>
                        <p>컴퓨터가 생각하고 학습하는 세 가지 기본 원리와 이에 관한 규범적 윤리 개념을 정립함을 알림.</p>
                      </td>
                      <td className="p-3 text-slate-400">
                        단순 기술 흥미를 넘어 컴퓨터의 '스스로 학습' 개념에 흥미를 갖도록 유도
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-indigo-400 bg-slate-950/10" rowSpan="2">전개</td>
                      <td className="p-3 text-slate-300 font-semibold">활동 1: <br />AI 공부방<br />(15분)</td>
                      <td className="p-3 text-slate-400 space-y-1">
                        <p className="text-slate-300">① 에이미 AI 공부방 접속:</p>
                        <p>모둠별 혹은 개별 태블릿으로 본 웹 앱의 <strong>'💡 에이미 AI 공부방'</strong>으로 접속함.</p>
                        <p className="text-slate-300 mt-1">② 4대 테마 카드 학습 및 활동지 기록:</p>
                        <p>화면에 표시되는 1~4번 테마(개념, 비교군, 학습 유형, 인공지능 윤리)를 순차적으로 읽고, 중요 키워드(지도학습, 할루시네이션, 편향성 등)를 기록지에 요약.</p>
                        <p className="text-slate-300 mt-1">③ 달성률 확인:</p>
                        <p>카드를 다 읽은 뒤 '학습 완료' 버튼을 클릭하여 달성률 100% 게이지 채우기를 확인.</p>
                      </td>
                      <td className="p-3 text-slate-400">
                        글을 꼼꼼히 정독하고 예시문을 분석하도록 지도 (글을 건너뛰지 않도록 확인)
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 text-slate-300 font-semibold">활동 2: <br />자가진단 퀴즈<br />(15분)</td>
                      <td className="p-3 text-slate-400 space-y-1.5">
                        <p className="text-slate-300">① 개별 퀴즈 시작 (일반 모드):</p>
                        <p>학습을 마친 후 각자 <strong>'🚀 퀴즈 바로 시작하기'</strong>에 들어가 10문항 개별 진단을 진행함.</p>
                        <p className="text-slate-300 mt-1">② 모둠별 챌린지 타임어택 서바이벌:</p>
                        <p>학습 수준이 높은 학생 및 모둠 대항을 위해 15초 제한 시간의 <strong>'⏱️ 타임어택 챌린지 모드'</strong>를 기습 오픈하여 흥미 극대화.</p>
                        <p className="text-slate-300 mt-1">③ 오답노트 보충 및 분석:</p>
                        <p>제출을 완료한 뒤 튜터 에이미의 해설 말풍선을 정독하고, 자신의 오답 원인을 직접 찾아 정답지랑 1:1 대비 진행.</p>
                      </td>
                      <td className="p-3 text-slate-400">
                        단순히 등수나 점수에만 집중하지 않고 오답노트를 끝까지 정독하는 피드백 분위기 형성
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-emerald-400 bg-slate-950/10">정리</td>
                      <td className="p-3 text-slate-300 font-semibold">피드백 및<br />소감 발표<br />(5분)</td>
                      <td className="p-3 text-slate-400 space-y-1">
                        <p className="text-slate-300">① 오답노트 기반 개념 최종 요약:</p>
                        <p>가장 오답률이 높았던 '할루시네이션', '지도학습 vs 비지도학습' 구별 포인트를 교사가 칠판에 재정리.</p>
                        <p className="text-slate-300 mt-1">② 인공지능 윤리적 사용을 위한 다짐:</p>
                        <p>편향된 데이터의 무서움을 논의하고 공정한 디지털 시민으로 거듭나기 위한 일지 공유.</p>
                      </td>
                      <td className="p-3 text-slate-400">
                        자율성 향상을 돕기 위해 에이미 캐릭터의 피드백을 교실 전체에 보여주며 대화식 정리
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

            </div>

            {/* 모달 푸터 */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex justify-end">
              <button
                onClick={() => { triggerSound('click'); setShowLessonPlanModal(false); }}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md"
              >
                지도안 닫고 수업 진행하기
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
