let isRunning = false;
let isPaused = false;
let wakeLock = null;

const speak = (text) => {
  const msg = new SpeechSynthesisUtterance(text);
  msg.lang = "ja-JP";
  speechSynthesis.cancel();
  speechSynthesis.speak(msg);
};

const vibrate = () => navigator.vibrate?.(500);
const wait = (sec) => new Promise((res) => setTimeout(res, sec * 1000));

const updateCountdown = (sec) => {
  document.getElementById("countdown").textContent = `残り：${sec} 秒`;
};

const waitWithCountdown = async (sec) => {
  for (let i = sec; i >= 0; i--) {
    if (!isRunning || isPaused) return;
    updateCountdown(i);
    if (i === 5) speak("残り5秒です");
    await wait(1);
  }
};

function addStep(name = "", duration = 60) {
  const stepsContainer = document.getElementById("steps");

  const row = document.createElement("div");
  row.className = "step-row";

  const nameInput = document.createElement("input");
  nameInput.placeholder = "ステップ名";
  nameInput.value = name;

  const minInput = document.createElement("input");
  minInput.type = "number";
  minInput.value = Math.floor(duration / 60);

  const secInput = document.createElement("input");
  secInput.type = "number";
  secInput.value = duration % 60;

  const upBtn = document.createElement("button");
  upBtn.textContent = "↑";
  upBtn.onclick = () => {
    const prev = row.previousElementSibling;
    if (prev) stepsContainer.insertBefore(row, prev);
  };

  const downBtn = document.createElement("button");
  downBtn.textContent = "↓";
  downBtn.onclick = () => {
    const next = row.nextElementSibling;
    if (next) stepsContainer.insertBefore(next, row);
  };

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "削除";
  deleteBtn.onclick = () => stepsContainer.removeChild(row);

  row.append(nameInput, minInput, document.createTextNode("分"), secInput, document.createTextNode("秒"), upBtn, downBtn, deleteBtn);
  stepsContainer.appendChild(row);
}

function getStepsFromUI() {
  const rows = document.querySelectorAll("#steps .step-row");
  return Array.from(rows).map((row) => {
    const inputs = row.querySelectorAll("input");
    const name = inputs[0].value || "ステップ";
    const min = Number(inputs[1].value);
    const sec = Number(inputs[2].value);
    return { name, duration: min * 60 + sec };
  });
}

async function startTimer() {
  if (isRunning) return;
  isRunning = true;
  isPaused = false;

  const status = document.getElementById("status");
  const rounds = Number(document.getElementById("rounds").value);
  const stepList = getStepsFromUI();

  for (let round = 1; round <= rounds && isRunning; round++) {
    for (let i = 0; i < stepList.length && isRunning; i++) {
      while (isPaused) await wait(1);
      const step = stepList[i];
      status.textContent = `ラウンド${round}：${step.name}`;
      document.body.style.backgroundColor = i === stepList.length - 1 ? "#d4ffd4" : "#dbeeff";
      speak(`${step.name} 開始`);
      vibrate();
      await waitWithCountdown(step.duration);
    }
  }

  if (isRunning) {
    speak("すべて終了しました。お疲れ様！");
    document.getElementById("status").textContent = "終了！";
    updateCountdown(0);
    document.body.style.backgroundColor = "white";
    vibrate();
  }

  isRunning = false;
}

function pauseTimer() {
  if (!isRunning) return;
  isPaused = !isPaused;
  document.getElementById("status").textContent = isPaused ? "⏸ 一時停止中" : "▶ 再開中";
}

function stopTimer() {
  isRunning = false;
  isPaused = false;
  document.getElementById("status").textContent = "⏹ 終了しました";
  updateCountdown("-");
  document.body.style.backgroundColor = "white";
  speechSynthesis.cancel();
}

async function enableWakeLock() {
  try {
    if ('wakeLock' in navigator) {
      wakeLock = await navigator.wakeLock.request("screen");
      document.getElementById("wakelock-status").textContent = "（スリープ防止ON）";
    } else {
      alert("このブラウザはスリープ防止に対応していません");
    }
  } catch (e) {
    console.error(e);
    alert("スリープ防止に失敗しました");
  }
}

// 初期ステップ
addStep("1つ目", 45);
addStep("休憩", 60);
