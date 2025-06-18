let currentPage = 0;
const totalPages = document.querySelectorAll('.page').length;
const container = document.getElementById('container');

function goToPage(n) {
  if (n < 0) n = 0;
  if (n >= totalPages) n = totalPages - 1;
  currentPage = n;
  container.style.transform = `translateY(-${n * 100}vh)`;
}

window.addEventListener('wheel', e => {
  if (e.deltaY > 0) goToPage(currentPage + 1);
  else goToPage(currentPage - 1);
}, {passive:true});

let touchStartY = 0;
let isDragging = false;

window.addEventListener('touchstart', e => {
  if (e.target.closest('#drag-list')) {
    isDragging = true; // 如果触摸在拖拽区，禁止翻页
  } else {
    isDragging = false;
    touchStartY = e.touches[0].clientY;
  }
});

window.addEventListener('touchend', e => {
  if (isDragging) return; // 如果是拖拽操作，不执行翻页
  let deltaY = e.changedTouches[0].clientY - touchStartY;
  if (deltaY < -30) goToPage(currentPage + 1);
  if (deltaY > 30) goToPage(currentPage - 1);
});



function checkAnswer(button, isCorrect) {
  if (button.classList.contains('correct') || button.classList.contains('wrong')) return;
  if (isCorrect) {
    button.classList.add('correct');
    button.textContent = "🎉 回答正确！";
  } else {
    button.classList.add('wrong');
    button.textContent = "❌ 错误，男生也应接种！";
  }
}

const dragOrder = [
  "接触病毒",
  "病毒感染上皮细胞",
  "感染持续存在",
  "细胞异常变化",
  "可能发展为癌前病变"
];

const dragList = document.getElementById("drag-list");
const orderResult = document.getElementById("order-result");

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

let draggedItem = null;
let ghost = null;

dragList.addEventListener("touchstart", e => {
  if (e.target.tagName === "LI") {
    draggedItem = e.target;

    // 创建“跟随手指”的 ghost 卡片
    ghost = draggedItem.cloneNode(true);
ghost.classList.add("drag-ghost");
ghost.style.left = e.touches[0].clientX + "px";
ghost.style.top = e.touches[0].clientY + "px";
document.body.appendChild(ghost);

  }
});

dragList.addEventListener("touchmove", e => {
  if (ghost) {
    e.preventDefault();
    ghost.style.left = e.touches[0].clientX + "px";
    ghost.style.top = e.touches[0].clientY + "px";
  }
});

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
});

function checkOrder() {
  const current = Array.from(dragList.children).map(li => li.textContent);
  if (JSON.stringify(current) === JSON.stringify(dragOrder)) {
    orderResult.textContent = "🎉 恭喜，顺序完全正确！";
    orderResult.style.color = "green";
  } else {
    orderResult.textContent = "❌ 顺序不正确，请再试一次～";
    orderResult.style.color = "red";
  }
}

renderDragList();
