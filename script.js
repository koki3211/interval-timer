let isRunning = false;

const speak = (text) => {
  const msg = new SpeechSynthesisUtterance(text);
  msg.lang = "ja-JP";

  const voices = speechSynthesis.getVoices();
  const femaleVoice = voices.find(v =>
    v.lang === 'ja-JP' && v.name.includes('Google') && v.name.includes('Female')
  );
  
  if (femaleVoice) {
    msg.voice = femaleVoice;
  }

  speechSynthesis.cancel(); // 重複防止
  speechSynthesis.speak(msg);
};


const vibrate = () => navigator.vibrate?.(500);

const wait = (sec) =>
  new Promise((res) => setTimeout(res, sec * 1000));

const updateCountdown = (sec) => {
  document.getElementById("countdown").textContent = `残り：${sec} 秒`;
};

const waitWithCountdown = async (sec) => {
  for (let i = sec; i >= 0; i--) {
    if (!isRunning) return;

    updateCountdown(i);

    if (i === 5) {
      speak("残り5秒です");
    }

    await wait(1);
  }
};


function addStep(name = "", duration = 60) {
  const stepsContainer = document.getElementById("steps");

  const row = document.createElement("div");
  row.className = "step-row";

  const nameInput = document.createElement("input");
  nameInput.placeholder = "ステップ名（例：1つ目）";
  nameInput.value = name;

  const minInput = document.createElement("input");
  minInput.type = "number";
  minInput.min = 0;
  minInput.placeholder = "分";
  minInput.value = Math.floor(duration / 60);

  const secInput = document.createElement("input");
  secInput.type = "number";
  secInput.min = 0;
  secInput.max = 59;
  secInput.placeholder = "秒";
  secInput.value = duration % 60;

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "削除";
  deleteBtn.onclick = () => stepsContainer.removeChild(row);

  row.appendChild(nameInput);
  row.appendChild(minInput);
  row.appendChild(document.createTextNode("分"));
  row.appendChild(secInput);
  row.appendChild(document.createTextNode("秒"));
  row.appendChild(deleteBtn);

  stepsContainer.appendChild(row);
}

function getStepsFromUI() {
  const rows = document.querySelectorAll("#steps .step-row");
  return Array.from(rows).map((row) => {
    const inputs = row.querySelectorAll("input");
    const name = inputs[0].value || "ステップ";
    const minutes = Number(inputs[1].value);
    const seconds = Number(inputs[2].value);
    return {
      name: name,
      duration: minutes * 60 + seconds,
    };
  });
}

async function startTimer() {
  if (isRunning) return;
  isRunning = true;

  const status = document.getElementById("status");
  const rounds = Number(document.getElementById("rounds").value);
  const stepList = getStepsFromUI();

  for (let round = 1; round <= rounds && isRunning; round++) {
    for (let i = 0; i < stepList.length && isRunning; i++) {
      const step = stepList[i];
      status.textContent = `ラウンド${round}：${step.name}`;
      document.body.style.backgroundColor =
        i === stepList.length - 1 ? "#d4ffd4" : "#dbeeff";

      speak(`${step.name} 開始`);
      vibrate();
      await waitWithCountdown(step.duration);
    }
  }

  if (isRunning) {
    speak("すべて終了しました。お疲れ様！");
    status.textContent = "終了！";
    updateCountdown(0);
    document.body.style.backgroundColor = "white";
    vibrate();
  }
  isRunning = false;
}

function stopTimer() {
  isRunning = false;
  document.getElementById("status").textContent = "ストップしました";
  updateCountdown("-");
  document.body.style.backgroundColor = "white";
  speechSynthesis.cancel();
}

// 初期表示用：デフォルトステップ追加
addStep("1つ目", 45);
addStep("休憩", 60);
