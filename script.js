let currentPage = 0;
let touchStartY = 0;
let isDragging = false;
let draggedItem = null;
let ghost = null;

const container = document.getElementById('container');
const totalPages = document.querySelectorAll('.page').length;
const dragList = document.getElementById("drag-list");
const orderResult = document.getElementById("order-result");

function goToPage(n) {
  if (n < 0) n = 0;
  if (n >= totalPages) n = totalPages - 1;
  currentPage = n;
  container.style.transform = `translateY(-${n * 100}vh)`;
}

// 滚轮滑动
window.addEventListener('wheel', e => {
  if (e.deltaY > 0) goToPage(currentPage + 1);
  else goToPage(currentPage - 1);
}, { passive: true });

// 触摸滑动（考虑 isDragging 状态）
window.addEventListener('touchstart', e => {
  if (!isDragging) {
    touchStartY = e.touches[0].clientY;
  }
});
window.addEventListener('touchend', e => {
  if (isDragging) return;
  const deltaY = e.changedTouches[0].clientY - touchStartY;
  if (deltaY < -30) goToPage(currentPage + 1);
  if (deltaY > 30) goToPage(currentPage - 1);
});

// 拖拽排序逻辑
dragList.addEventListener("touchstart", e => {
  if (e.target.tagName === "LI") {
    isDragging = true;
    draggedItem = e.target;
    ghost = draggedItem.cloneNode(true);
    ghost.classList.add("drag-ghost");
    ghost.style.position = "fixed";
    ghost.style.left = e.touches[0].clientX + "px";
    ghost.style.top = e.touches[0].clientY + "px";
    document.body.appendChild(ghost);
  }
});

dragList.addEventListener("touchmove", e => {
  if (ghost) {
    e.preventDefault(); // 阻止页面滑动
    ghost.style.left = e.touches[0].clientX + "px";
    ghost.style.top = e.touches[0].clientY + "px";
  }
}, { passive: false });

dragList.addEventListener("touchend", e => {
  if (ghost) {
    const touch = e.changedTouches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    if (target && target.tagName === "LI" && target !== draggedItem) {
      const allItems = Array.from(dragList.children);
      const draggedIndex = allItems.indexOf(draggedItem);
      const targetIndex = allItems.indexOf(target);
      if (draggedIndex < targetIndex) {
        dragList.insertBefore(draggedItem, target.nextSibling);
      } else {
        dragList.insertBefore(draggedItem, target);
      }
    }
    ghost.remove();
    ghost = null;
    draggedItem = null;
  }
  // 延迟恢复拖拽状态
  setTimeout(() => {
    isDragging = false;
  }, 50);
});

// 游戏逻辑
const dragOrder = [
  "接触病毒",
  "病毒感染上皮细胞",
  "感染持续存在",
  "细胞异常变化",
  "可能发展为癌前病变"
];

function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

function renderDragList() {
  dragList.innerHTML = "";
  shuffle([...dragOrder]).forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    dragList.appendChild(li);
  });
}

function checkOrder() {
  const current = Array.from(dragList.children).map(li => li.textContent);
  if (JSON.stringify(current) === JSON.stringify(dragOrder)) {
    orderResult.textContent = "🎉 顺序正确！";
    orderResult.style.color = "lime";
  } else {
    orderResult.textContent = "❌ 顺序不正确，请重试～";
    orderResult.style.color = "red";
  }
}

// 冷知识问答
const quizQuestions = [
  {
    question: "为什么男性也要接种HPV疫苗？",
    options: [
      { text: "因为男性感染后也可能患癌", correct: true },
      { text: "因为男性不需要接种", correct: false }
    ],
    explanation: "✔️ 男性感染后也可能导致癌症或生殖器疣。"
  },
  {
    question: "打疫苗前需要做什么准备？",
    options: [
      { text: "认真阅读说明，有疑问咨询医生", correct: true },
      { text: "随便打，不用了解太多", correct: false }
    ],
    explanation: "✔️ 务必了解疫苗内容，遇到疑问及时咨询医生。"
  },
  {
    question: "打了疫苗就不会感染了吗？",
    options: [
      { text: "仍需注意，预防率7-9成", correct: true },
      { text: "完全不会感染", correct: false }
    ],
    explanation: "✔️ 疫苗有效率高，但不是100%，还需注意防护。"
  },
  {
    question: "如果已经感染，打疫苗能治疗吗？",
    options: [
      { text: "不能治疗，只能预防", correct: true },
      { text: "可以治疗病毒感染", correct: false }
    ],
    explanation: "✔️ 疫苗为预防性，目前没有针对HPV的治疗药物。"
  },
  {
    question: "HPV疫苗是唯一预防子宫颈癌的方法吗？",
    options: [
      { text: "还应注意安全行为+定期筛查", correct: true },
      { text: "是唯一预防方式", correct: false }
    ],
    explanation: "✔️ 预防应结合安全性行为和定期筛查。"
  }
];
let currentQuizIndex = 0;

function showNextQuestion() {
  const container = document.getElementById("quiz-container");
  container.innerHTML = "";
  document.getElementById("next-question").style.display = "none";

  if (currentQuizIndex >= quizQuestions.length) {
    container.innerHTML = "<h1>🎉 全部完成！</h1>";
    return;
  }

  const q = quizQuestions[currentQuizIndex];

  const questionEl = document.createElement("h1");
  questionEl.textContent = q.question;
  container.appendChild(questionEl);

  q.options.forEach(opt => {
    const btn = document.createElement("button");
    btn.textContent = opt.text;
    btn.classList.add("quiz-option");
    btn.onclick = () => selectAnswer(btn, opt.correct, q.explanation);
    container.appendChild(btn);
  });
}

function selectAnswer(button, isCorrect, explanation) {
  const allButtons = button.parentElement.querySelectorAll("button");
  allButtons.forEach(b => b.disabled = true);

  if (isCorrect) {
    button.classList.add("correct");
  } else {
    button.classList.add("wrong");
  }

  const exp = document.createElement("p");
  exp.textContent = explanation;
  exp.classList.add("explanation");
  button.parentElement.appendChild(exp);

  document.getElementById("next-question").style.display = "block";
  currentQuizIndex++;
}

// 初始化
renderDragList();
showNextQuestion();
