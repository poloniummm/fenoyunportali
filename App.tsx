import React, { useEffect, useMemo, useState } from 'react';

// --- SPECIAL GAME CODES ---

const SUN_SYSTEM_SIMULATION_HTML = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Güneş Sistemi ve Tutulmalar Simülasyonu</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { margin: 0; overflow: hidden; background-color: #050505; color: white; font-family: Arial, sans-serif; }
    canvas { display: block; }
    .ui-overlay { position: absolute; top: 20px; left: 20px; z-index: 10; pointer-events: none; }
    .controls { position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); z-index: 10; display: flex; gap: 10px; background: rgba(0, 0, 0, 0.7); padding: 15px; border-radius: 50px; border: 1px solid #444; backdrop-filter: blur(5px); }
    .btn { pointer-events: auto; padding: 10px 20px; border-radius: 25px; cursor: pointer; transition: all 0.3s; font-weight: bold; border: none; text-transform: uppercase; font-size: 0.8rem; }
    .btn-blue { background: #3b82f6; color: white; }
    .btn-orange { background: #f59e0b; color: white; }
    .btn-purple { background: #8b5cf6; color: white; }
    .info-panel { position: absolute; top: 20px; right: 20px; width: 250px; background: rgba(0, 0, 0, 0.8); border: 1px solid #333; padding: 20px; border-radius: 15px; display: none; pointer-events: auto; }
    .active-mode { box-shadow: 0 0 15px white; }
  </style>
</head>
<body>
  <div class="ui-overlay">
    <h1 class="text-2xl font-bold text-yellow-400 mb-1">Güneş Sistemi Lab</h1>
    <p class="text-sm text-gray-300">6. Sınıf Fen Bilimleri Simülasyonu</p>
  </div>

  <div class="info-panel" id="infoPanel">
    <h2 id="planetName" class="text-xl font-bold text-blue-400 mb-2">Gezegen Adı</h2>
    <p id="planetDesc" class="text-sm leading-relaxed mb-4">Gezegen hakkında bilgiler burada yer alacak.</p>
    <div class="text-xs space-y-1">
      <p><strong>Tür:</strong> <span id="planetType">-</span></p>
      <p><strong>Uydu Sayısı:</strong> <span id="planetMoons">-</span></p>
      <p><strong>Sıralama:</strong> <span id="planetOrder">-</span></p>
    </div>
    <button onclick="closeInfo()" class="mt-4 text-xs text-gray-400 underline">Kapat</button>
  </div>

  <div class="controls">
    <button onclick="setMode('explore')" id="mode-explore" class="btn btn-blue active-mode">Keşif Modu</button>
    <button onclick="setMode('solar')" id="mode-solar" class="btn btn-orange">Güneş Tutulması</button>
    <button onclick="setMode('lunar')" id="mode-lunar" class="btn btn-purple">Ay Tutulması</button>
  </div>

  <canvas id="spaceCanvas"></canvas>

  <script>
    const canvas = document.getElementById('spaceCanvas');
    const ctx = canvas.getContext('2d');
    const infoPanel = document.getElementById('infoPanel');

    let width, height, mode = 'explore', time = 0, stars = [];

    const planets = [
      { name: "Merkür", color: "#A5A5A5", dist: 60, size: 4, speed: 0.04, desc: "Güneş'e en yakın gezegendir. Uydusu ve halkası yoktur.", type: "İç Gezegen", moons: "0", order: "1" },
      { name: "Venüs", color: "#E3BB76", dist: 90, size: 7, speed: 0.015, desc: "Sistemin en sıcak gezegenidir. Çoban Yıldızı olarak bilinir.", type: "İç Gezegen", moons: "0", order: "2" },
      { name: "Dünya", color: "#2271B3", dist: 130, size: 8, speed: 0.01, desc: "Üzerinde yaşam olduğu bilinen tek gezegendir. Tek uydusu Ay'dır.", type: "İç Gezegen", moons: "1", order: "3" },
      { name: "Mars", color: "#E27B58", dist: 170, size: 6, speed: 0.008, desc: "Kızıl Gezegen olarak bilinir. İnce bir atmosferi vardır.", type: "İç Gezegen", moons: "2", order: "4" },
      { name: "Jüpiter", color: "#D39C7E", dist: 230, size: 18, speed: 0.004, desc: "En büyük gezegendir. Gaz devidir.", type: "Dış Gezegen", moons: "95+", order: "5" },
      { name: "Satürn", color: "#C5AB6E", dist: 290, size: 15, speed: 0.002, desc: "Belirgin halkalarıyla tanınır. Gaz devidir.", type: "Dış Gezegen", moons: "145+", order: "6" },
      { name: "Uranüs", color: "#BBE1E4", dist: 340, size: 12, speed: 0.001, desc: "Buz devidir. Ekseni çok eğiktir.", type: "Dış Gezegen", moons: "27", order: "7" },
      { name: "Neptün", color: "#6081FF", dist: 390, size: 11, speed: 0.0008, desc: "Güneş'e en uzak gezegendir. Çok soğuk bir buz devidir.", type: "Dış Gezegen", moons: "14", order: "8" }
    ];

    function init() { resize(); createStars(); animate(); }
    function resize() { width = window.innerWidth; height = window.innerHeight; canvas.width = width; canvas.height = height; }
    function createStars() {
      stars = [];
      for(let i=0; i<400; i++) {
        stars.push({ x: Math.random()*width, y: Math.random()*height, size: Math.random()*1.5, opacity: Math.random() });
      }
    }
    function setMode(m) {
      mode = m;
      document.querySelectorAll('.btn').forEach(b => b.classList.remove('active-mode'));
      document.getElementById('mode-' + m).classList.add('active-mode');
      if(m !== 'explore') closeInfo();
    }
    function showInfo(p) {
      if(mode !== 'explore') return;
      document.getElementById('planetName').innerText = p.name;
      document.getElementById('planetDesc').innerText = p.desc;
      document.getElementById('planetType').innerText = p.type;
      document.getElementById('planetMoons').innerText = p.moons;
      document.getElementById('planetOrder').innerText = p.order;
      infoPanel.style.display = 'block';
    }
    function closeInfo() { infoPanel.style.display = 'none'; }

    function animate() {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = 'white';
      stars.forEach(s => {
        ctx.globalAlpha = s.opacity;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI*2);
        ctx.fill();
      });

      ctx.globalAlpha = 1.0;
      const cx = width/2, cy = height/2;

      if (mode === 'explore') {
        const g = ctx.createRadialGradient(cx, cy, 10, cx, cy, 50);
        g.addColorStop(0, '#FFF5CC');
        g.addColorStop(0.5, '#FF8C00');
        g.addColorStop(1, 'transparent');

        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, 50, 0, Math.PI*2);
        ctx.fill();

        planets.forEach(p => {
          const a = time * p.speed;
          const px = cx + Math.cos(a)*p.dist;
          const py = cy + Math.sin(a)*p.dist;

          ctx.strokeStyle = 'rgba(255,255,255,0.1)';
          ctx.beginPath();
          ctx.arc(cx, cy, p.dist, 0, Math.PI*2);
          ctx.stroke();

          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(px, py, p.size, 0, Math.PI*2);
          ctx.fill();

          ctx.fillStyle = 'rgba(255,255,255,0.5)';
          ctx.font = '10px Arial';
          ctx.fillText(p.name, px + p.size + 2, py);
        });
      } else {
        const sX = cx - 250, sY = cy, eX = cx + 150, eY = cy;
        const sG = ctx.createRadialGradient(sX, sY, 5, sX, sY, 80);
        sG.addColorStop(0, '#FFD700');
        sG.addColorStop(1, 'transparent');

        ctx.fillStyle = sG;
        ctx.beginPath();
        ctx.arc(sX, sY, 80, 0, Math.PI*2);
        ctx.fill();

        ctx.fillStyle = '#2271B3';
        ctx.beginPath();
        ctx.arc(eX, eY, 40, 0, Math.PI*2);
        ctx.fill();

        let mX, mY, ang = time * 0.5;
        if (mode === 'solar') {
          mX = sX + (eX - sX) * (0.6 + Math.sin(ang) * 0.2);
          mY = cy + Math.cos(ang) * 20;
          if (Math.abs(mY - cy) < 10 && mX < eX) {
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.beginPath();
            ctx.arc(eX, eY, 40, 0, Math.PI*2);
            ctx.fill();
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.fillText("GÜNEŞ TUTULMASI", cx, cy - 130);
          }
        } else {
          mX = eX + 100 * Math.cos(ang);
          mY = eY + 100 * Math.sin(ang);
          if (mX > eX && Math.abs(mY - eY) < 30) {
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.fillText("AY TUTULMASI", cx, cy - 130);
          } else {
            ctx.fillStyle = '#DDD';
          }
        }

        ctx.beginPath();
        ctx.arc(mX, mY, 10, 0, Math.PI*2);
        ctx.fill();
      }

      time += 0.5;
      requestAnimationFrame(animate);
    }

    canvas.addEventListener('mousedown', (e) => {
      if(mode !== 'explore') return;
      const r = canvas.getBoundingClientRect();
      const mx = e.clientX - r.left;
      const my = e.clientY - r.top;
      const cx = width/2;
      const cy = height/2;

      planets.forEach(p => {
        const a = time * p.speed;
        const px = cx + Math.cos(a)*p.dist;
        const py = cy + Math.sin(a)*p.dist;
        if(Math.sqrt((mx-px)**2 + (my-py)**2) < p.size + 10) showInfo(p);
      });
    });

    window.addEventListener('resize', () => { resize(); createStars(); });
    init();
  </script>
</body>
</html>`;

const SUN_SYSTEM_GAME_HTML = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Güneş Sistemi ve Tutulmalar - İnteraktif Oyun</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { margin: 0; background: #0b0d17; color: #fff; font-family: Arial, sans-serif; overflow-x: hidden; }
    #game-container { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; background: radial-gradient(circle at center, #1b2735 0%, #090a0f 100%); position: relative; }
    .card { background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 20px; padding: 2rem; max-width: 800px; width: 90%; }
    .planet { width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: grab; margin: 10px; font-size: 10px; font-weight: bold; text-align: center; color: white; }
    .drop-zone { min-height: 150px; border: 2px dashed rgba(255, 255, 255, 0.2); border-radius: 15px; display: flex; flex-wrap: wrap; justify-content: center; align-items: center; padding: 10px; margin-top: 10px; background: rgba(255, 255, 255, 0.02); }
    .btn { background: linear-gradient(135deg, #4f46e5, #9333ea); padding: 12px 30px; border-radius: 50px; cursor: pointer; border: none; color: white; font-weight: 600; }
    .merkur { background: #888; }
    .venus { background: #c49d52; }
    .dunya { background: #2b82c9; }
    .mars { background: #c45b34; }
    .jupiter { background: #a97961; }
    .saturn { background: #b69a5e; }
    .uranus { background: #82c6c6; }
    .neptun { background: #4a6cf7; }
  </style>
</head>
<body>
<div id="game-container">
  <div id="intro-screen" class="card" style="text-align:center;">
    <h1 style="font-size:42px;color:#facc15;">UZAY KAŞİFİ</h1>
    <p style="font-size:20px;">Kaptan, Güneş sistemini keşfetmeye hazır mısın?</p>
    <button onclick="startGame()" class="btn">GÖREVE BAŞLA</button>
  </div>

  <div id="game-screen" class="card" style="display:none;">
    <div id="level-content"></div>
    <div id="feedback" style="margin-top:20px;text-align:center;font-weight:bold;height:28px;"></div>
    <div style="display:flex;justify-content:space-between;margin-top:25px;">
      <div id="score-display">Puan: 0</div>
      <button id="next-btn" onclick="nextAction()" class="btn" style="display:none;">Sıradaki Adım</button>
    </div>
  </div>

  <div id="final-screen" class="card" style="display:none;text-align:center;">
    <h2 style="font-size:34px;color:#4ade80;">GÖREV TAMAMLANDI!</h2>
    <p id="final-score" style="font-size:24px;font-weight:bold;"></p>
    <button onclick="location.reload()" class="btn">YENİDEN OYNA</button>
  </div>
</div>

<script>
  const levels = [
    {
      type: 'drag-drop',
      title: '1. Görev: Gezegen Sınıflandırma',
      planets: [
        { id: 'merkur', name: 'Merkür', type: 'ic' },
        { id: 'venus', name: 'Venüs', type: 'ic' },
        { id: 'dunya', name: 'Dünya', type: 'ic' },
        { id: 'mars', name: 'Mars', type: 'ic' },
        { id: 'jupiter', name: 'Jüpiter', type: 'dis' },
        { id: 'saturn', name: 'Satürn', type: 'dis' },
        { id: 'uranus', name: 'Uranüs', type: 'dis' },
        { id: 'neptun', name: 'Neptün', type: 'dis' }
      ]
    },
    {
      type: 'quiz',
      title: '2. Görev: Gezegenlerin Gizemi',
      question: "Halkaları en belirgin gezegen hangisidir?",
      options: ["Mars", "Satürn", "Merkür", "Venüs"],
      correct: 1
    }
  ];

  let currentLevel = 0;
  let score = 0;

  function startGame() {
    document.getElementById('intro-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'block';
    loadLevel();
  }

  function loadLevel() {
    const level = levels[currentLevel];
    const container = document.getElementById('level-content');
    document.getElementById('feedback').innerText = '';
    document.getElementById('next-btn').style.display = 'none';

    if (level.type === 'drag-drop') {
      container.innerHTML =
        '<h3 style="font-size:24px;margin-bottom:18px;">' + level.title + '</h3>' +
        '<div id="drag-source" style="display:flex;flex-wrap:wrap;justify-content:center;margin-bottom:20px;">' +
        level.planets.map(p => '<div id="' + p.id + '" class="planet ' + p.id + '" draggable="true" ondragstart="drag(event)">' + p.name + '</div>').join('') +
        '</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">' +
        '<div id="ic-zone" class="drop-zone" ondrop="drop(event)" ondragover="allowDrop(event)">İÇ</div>' +
        '<div id="dis-zone" class="drop-zone" ondrop="drop(event)" ondragover="allowDrop(event)">DIŞ</div>' +
        '</div>' +
        '<div style="text-align:center;margin-top:20px;"><button onclick="checkDragDrop()" class="btn">Kontrol Et</button></div>';
    } else {
      container.innerHTML =
        '<h3 style="font-size:24px;margin-bottom:18px;">' + level.title + '</h3>' +
        '<p style="margin-bottom:16px;">' + level.question + '</p>' +
        level.options.map((o, i) => '<button onclick="checkQuiz(' + i + ')" class="btn" style="display:block;width:100%;margin-bottom:12px;">' + o + '</button>').join('');
    }
  }

  function allowDrop(ev) { ev.preventDefault(); }
  function drag(ev) { ev.dataTransfer.setData("text", ev.target.id); }
  function drop(ev) {
    ev.preventDefault();
    const data = ev.dataTransfer.getData("text");
    ev.target.appendChild(document.getElementById(data));
  }

  function checkDragDrop() {
    score += 20;
    document.getElementById('score-display').innerText = 'Puan: ' + score;
    document.getElementById('feedback').innerText = 'Harika!';
    document.getElementById('next-btn').style.display = 'inline-block';
  }

  function checkQuiz(i) {
    if (i === levels[currentLevel].correct) {
      score += 20;
      document.getElementById('feedback').innerText = 'Doğru cevap!';
    } else {
      document.getElementById('feedback').innerText = 'Yanlış cevap.';
    }
    document.getElementById('score-display').innerText = 'Puan: ' + score;
    document.getElementById('next-btn').style.display = 'inline-block';
  }

  function nextAction() {
    currentLevel++;
    if (currentLevel < levels.length) {
      loadLevel();
    } else {
      document.getElementById('game-screen').style.display = 'none';
      document.getElementById('final-screen').style.display = 'block';
      document.getElementById('final-score').innerText = 'Puan: ' + score;
    }
  }
</script>
</body>
</html>`;

const SUN_SYSTEM_WORD_SEARCH_HTML = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kelime Avı</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background:#0f172a; color:#fff; font-family:Arial, sans-serif; user-select:none; }
    .grid-container { display:grid; grid-template-columns:repeat(12,1fr); gap:4px; max-width:500px; margin:0 auto; background:rgba(255,255,255,0.05); padding:10px; border-radius:12px; }
    .cell { aspect-ratio:1; display:flex; align-items:center; justify-content:center; font-weight:bold; cursor:pointer; border-radius:4px; background:#1e293b; }
    .cell.selected { background:#6366f1; }
    .cell.found { background:#22c55e; }
    .word-item { padding:4px 12px; border-radius:20px; background:rgba(255,255,255,0.1); font-size:14px; }
    .word-item.found { text-decoration:line-through; background:#22c55e; opacity:.7; }
  </style>
</head>
<body class="p-4">
  <div class="max-w-4xl mx-auto">
    <div class="text-center mb-8">
      <h1 class="text-4xl font-bold text-cyan-400 mb-2">KELİME AVI</h1>
      <p>Güneş Sistemi ve Tutulmalar</p>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <div class="bg-white/5 p-6 rounded-2xl">
        <h2 class="text-xl font-bold mb-4">Bulunacak Kelimeler</h2>
        <div id="word-list" class="flex flex-wrap gap-2"></div>
      </div>
      <div class="lg:col-span-2">
        <div id="game-grid" class="grid-container"></div>
        <div class="mt-6 flex justify-center gap-8 text-lg font-bold">
          <div class="text-cyan-400">Puan: <span id="score">0</span></div>
        </div>
      </div>
    </div>
  </div>

  <script>
    const words = ["MERKÜR","VENÜS","DÜNYA","MARS","JÜPİTER","SATÜRN","URANÜS","NEPTÜN","TUTULMA","AY","GÜNEŞ"];
    const gridSize = 12;
    let grid = [];
    let selectedCells = [];
    let foundWords = [];
    let score = 0;
    let isSelecting = false;

    function initGame() {
      createEmptyGrid();
      placeWords();
      fillRandomLetters();
      renderGrid();
      renderWordList();
    }

    function createEmptyGrid() {
      for (let i = 0; i < gridSize; i++) {
        grid[i] = [];
        for (let j = 0; j < gridSize; j++) grid[i][j] = '';
      }
    }

    function placeWords() {
      words.forEach(word => {
        let placed = false;
        while (!placed) {
          const direction = Math.floor(Math.random() * 8);
          const row = Math.floor(Math.random() * gridSize);
          const col = Math.floor(Math.random() * gridSize);
          if (canPlaceWord(word, row, col, direction)) {
            placeWord(word, row, col, direction);
            placed = true;
          }
        }
      });
    }

    function canPlaceWord(word, row, col, dir) {
      const dr = [-1,-1,-1,0,0,1,1,1][dir];
      const dc = [-1,0,1,-1,1,-1,0,1][dir];
      if (row + dr * (word.length - 1) < 0 || row + dr * (word.length - 1) >= gridSize || col + dc * (word.length - 1) < 0 || col + dc * (word.length - 1) >= gridSize) return false;
      for (let i = 0; i < word.length; i++) {
        if (grid[row + dr * i][col + dc * i] !== '' && grid[row + dr * i][col + dc * i] !== word[i]) return false;
      }
      return true;
    }

    function placeWord(word, row, col, dir) {
      const dr = [-1,-1,-1,0,0,1,1,1][dir];
      const dc = [-1,0,1,-1,1,-1,0,1][dir];
      for (let i = 0; i < word.length; i++) grid[row + dr * i][col + dc * i] = word[i];
    }

    function fillRandomLetters() {
      const letters = "ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ";
      for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
          if (grid[i][j] === '') grid[i][j] = letters[Math.floor(Math.random() * letters.length)];
        }
      }
    }

    function renderGrid() {
      const container = document.getElementById('game-grid');
      container.innerHTML = '';
      for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
          const cell = document.createElement('div');
          cell.className = 'cell';
          cell.innerText = grid[i][j];
          cell.dataset.row = i;
          cell.dataset.col = j;
          cell.onmousedown = () => startSelection(i, j);
          cell.onmouseover = () => updateSelection(i, j);
          cell.onmouseup = endSelection;
          container.appendChild(cell);
        }
      }
      window.onmouseup = endSelection;
    }

    function renderWordList() {
      document.getElementById('word-list').innerHTML = words.map(w => '<span id="word-' + w + '" class="word-item">' + w + '</span>').join('');
    }

    function startSelection(r, c) {
      isSelecting = true;
      selectedCells = [{ r, c }];
      highlightCells();
    }

    function updateSelection(r, c) {
      if (!isSelecting) return;
      const first = selectedCells[0];
      const dr = Math.abs(r - first.r);
      const dc = Math.abs(c - first.c);

      if (dr === 0 || dc === 0 || dr === dc) {
        const stepR = r === first.r ? 0 : (r > first.r ? 1 : -1);
        const stepC = c === first.c ? 0 : (c > first.c ? 1 : -1);
        let curR = first.r, curC = first.c;
        const newSel = [];
        while (true) {
          newSel.push({ r: curR, c: curC });
          if (curR === r && curC === c) break;
          curR += stepR;
          curC += stepC;
        }
        selectedCells = newSel;
        highlightCells();
      }
    }

    function highlightCells() {
      document.querySelectorAll('.cell').forEach(c => c.classList.remove('selected'));
      selectedCells.forEach(s => {
        const el = document.querySelector('.cell[data-row="' + s.r + '"][data-col="' + s.c + '"]');
        if (el) el.classList.add('selected');
      });
    }

    function endSelection() {
      if (!isSelecting) return;
      isSelecting = false;
      const selWord = selectedCells.map(s => grid[s.r][s.c]).join('');
      const revWord = selWord.split('').reverse().join('');
      let found = '';
      if (words.includes(selWord) && !foundWords.includes(selWord)) found = selWord;
      else if (words.includes(revWord) && !foundWords.includes(revWord)) found = revWord;

      if (found) {
        foundWords.push(found);
        score += found.length * 10;
        document.getElementById('score').innerText = String(score);
        document.getElementById('word-' + found).classList.add('found');
        selectedCells.forEach(s => {
          const el = document.querySelector('.cell[data-row="' + s.r + '"][data-col="' + s.c + '"]');
          if (el) el.classList.add('found');
        });
      }

      selectedCells = [];
      highlightCells();
    }

    initGame();
  </script>
</body>
</html>`;

// --- DATA ---

const CLASSES = [
  { id: '3-sinif', grade: 3, title: '3. Sınıf', description: 'Fen bilimleri dünyasına ilk adım!' },
  { id: '4-sinif', grade: 4, title: '4. Sınıf', description: 'Doğayı ve maddeyi keşfediyoruz.' },
  { id: '5-sinif', grade: 5, title: '5. Sınıf', description: 'Uzayı ve canlıları yakından tanıyalım.' },
  { id: '6-sinif', grade: 6, title: '6. Sınıf', description: 'Sistemler ve güneş sistemi yolculuğu.' },
  { id: '7-sinif', grade: 7, title: '7. Sınıf', description: 'Uzay çağı ve hücrenin gizemi.' },
  { id: '8-sinif', grade: 8, title: '8. Sınıf', description: 'LGS hazırlık ve bilimin zirvesi.' },
];

const UNITS: Record<string, string[]> = {
  '3-sinif': [
    'Bilimsel Keşif Yolculuğu',
    'Canlılar Dünyasına Yolculuk',
    'Yer Bilimciler İş Başında'
  ],
  '4-sinif': [
    'Bilime Yolculuk',
    'Sağlıklı Besleniyorum',
    'Dünyamızı Keşfedelim'
  ],
  '5-sinif': [
    'Gökyüzündeki Komşularımız ve Biz',
    'Kuvveti Tanıyalım',
    'Canlıların Yapısına Yolculuk'
  ],
  '6-sinif': [
    'Güneş Sistemi ve Tutulmalar',
    'Kuvvetin Etkisinde Hareket',
    'Canlılarda Sistemler'
  ],
  '7-sinif': [
    'Uzay Çağı',
    'Kuvvet ve Enerjiyi Keşfedelim',
    'Vücudumuzdaki Sistemler'
  ],
  '8-sinif': [
    'Mevsimler ve İklim',
    'Yaşamı Kolaylaştıran Kuvvet',
    'Yaşamın Gizemi'
  ],
};

const generateGames = (classId: string) => {
  const units = UNITS[classId] || [];
  const games: Array<{
    id: string;
    unit: string;
    title: string;
    type: string;
    description: string;
    embedCode?: string;
  }> = [];

  units.forEach((unit, idx) => {
    if (classId === '6-sinif' && idx === 0) {
      games.push({
        id: 'simulation-6-1',
        unit,
        title: 'Güneş Sistemi Lab: Simülasyon',
        type: 'Simülasyon',
        description: 'Güneş sistemini keşfet ve tutulmaları incele.',
        embedCode: SUN_SYSTEM_SIMULATION_HTML
      });

      games.push({
        id: 'word-search-6-1',
        unit,
        title: 'Kelime Avı: Güneş Sistemi',
        type: 'Bulmaca',
        description: 'Kavramları bularak tekrar et.',
        embedCode: SUN_SYSTEM_WORD_SEARCH_HTML
      });

      games.push({
        id: 'space-game-6-1',
        unit,
        title: 'Uzay Kaşifi: Görev Başında',
        type: 'İnteraktif Oyun',
        description: 'Gezegenleri sınıflandır ve bilgini test et.',
        embedCode: SUN_SYSTEM_GAME_HTML
      });
    } else {
      games.push({
        id: `${classId}-${idx}-1`,
        unit,
        title: `${unit} - Quiz`,
        type: 'Quiz',
        description: `${unit} konusuna ait örnek etkinlik.`
      });
      games.push({
        id: `${classId}-${idx}-2`,
        unit,
        title: `${unit} - Eşleştirme`,
        type: 'Eşleştirme',
        description: `${unit} konusuna ait örnek etkinlik.`
      });
    }
  });

  return games;
};

// --- ADSENSE ---

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

function AdsenseBanner() {
  useEffect(() => {
    try {
      if (window.adsbygoogle) {
        window.adsbygoogle.push({});
      } else {
        window.adsbygoogle = [];
        window.adsbygoogle.push({});
      }
    } catch {
      // no-op
    }
  }, []);

  return (
    <div style={{ margin: '24px 0', display: 'flex', justifyContent: 'center' }}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', maxWidth: '728px', minHeight: '90px' }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXX"
        data-ad-slot="1234567890"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}

function AdFallback() {
  return (
    <div
      style={{
        margin: '24px 0',
        border: '1px dashed #334155',
        borderRadius: 16,
        padding: 24,
        textAlign: 'center',
        color: '#94a3b8',
        background: '#0f172a'
      }}
    >
      Reklam alanı
    </div>
  );
}

// --- UI ---

function Navbar({ onNavigate }: { onNavigate: (page: string) => void }) {
  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(2,6,23,0.9)',
        borderBottom: '1px solid #1e293b',
        backdropFilter: 'blur(10px)'
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16
        }}
      >
        <div style={{ fontWeight: 800, fontSize: 20, cursor: 'pointer' }} onClick={() => onNavigate('home')}>
          🚀 Fen Bilimleri Oyun Portalı
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button onClick={() => onNavigate('home')} style={navBtnStyle}>
            Ana Sayfa
          </button>
          <button onClick={() => onNavigate('guide')} style={navBtnPrimaryStyle}>
            Öğretmen Rehberi
          </button>
        </div>
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer
      style={{
        marginTop: 50,
        borderTop: '1px solid #1e293b',
        color: '#94a3b8',
        textAlign: 'center',
        padding: '28px 16px'
      }}
    >
      © 2026 Fen Bilimleri Oyun Portalı
    </footer>
  );
}

function HomePage({
  onSelectClass,
  adsEnabled
}: {
  onSelectClass: (cls: typeof CLASSES[number]) => void;
  adsEnabled: boolean;
}) {
  return (
    <div>
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 20px 30px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 52, lineHeight: 1.1, marginBottom: 20 }}>
          Fen Bilimleri
          <br />
          Oyun Portalı
        </h1>
        <p style={{ color: '#94a3b8', fontSize: 20, maxWidth: 800, margin: '0 auto 20px' }}>
          Müfredata uygun interaktif oyunlarla bilimi keşfedin.
        </p>

        {adsEnabled ? <AdsenseBanner /> : <AdFallback />}
      </section>

      <section
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          padding: '10px 20px 40px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 20
        }}
      >
        {CLASSES.map((cls) => (
          <div
            key={cls.id}
            onClick={() => onSelectClass(cls)}
            style={{
              background: '#0f172a',
              border: '1px solid #1e293b',
              borderRadius: 24,
              padding: 24,
              cursor: 'pointer'
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                background: '#1d4ed8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: 22,
                marginBottom: 16
              }}
            >
              {cls.grade}
            </div>

            <h3 style={{ margin: '0 0 10px', fontSize: 24 }}>{cls.title}</h3>
            <p style={{ color: '#94a3b8', marginBottom: 16 }}>{cls.description}</p>

            <button style={cardBtnStyle}>İncele</button>
          </div>
        ))}
      </section>
    </div>
  );
}

function GuidePage({ adsEnabled }: { adsEnabled: boolean }) {
  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 20px' }}>
      <h2 style={{ fontSize: 40, marginBottom: 16 }}>Öğretmen Rehberi</h2>
      <p style={{ color: '#94a3b8', marginBottom: 24 }}>
        Bu portal, fen bilimleri konularını oyunlaştırılmış etkinliklerle desteklemek için hazırlandı.
      </p>

      {adsEnabled ? <AdsenseBanner /> : <AdFallback />}

      <div style={contentCardStyle}>
        <h3>Nasıl Kullanılır?</h3>
        <p>
          Sınıf seviyesini seçin, ilgili üniteye gidin ve öğrencilerinize uygun etkinlikleri açın.
        </p>
      </div>

      <div style={contentCardStyle}>
        <h3>Ders İçinde Kullanım</h3>
        <p>
          Oyunları konu anlatımından sonra tekrar amaçlı, pekiştirme amaçlı veya ödev desteği olarak kullanabilirsiniz.
        </p>
      </div>

      <div style={contentCardStyle}>
        <h3>Yasal Sayfalar</h3>
        <p>
          AdSense başvurusu yapmadan önce gizlilik politikası, iletişim ve kullanım şartları sayfalarını mutlaka ekleyin.
        </p>
      </div>
    </div>
  );
}

function GradeDetailPage({
  selectedClass,
  onBack,
  onPlayGame,
  adsEnabled
}: {
  selectedClass: typeof CLASSES[number];
  onBack: () => void;
  onPlayGame: (html: string) => void;
  adsEnabled: boolean;
}) {
  const allGames = useMemo(() => generateGames(selectedClass.id), [selectedClass.id]);
  const units = UNITS[selectedClass.id] || [];

  return (
    <div>
      <div style={{ background: '#1d4ed8', padding: '40px 20px 80px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <button onClick={onBack} style={backBtnStyle}>
            ⬅️ Geri Dön
          </button>
          <h2 style={{ fontSize: 46, margin: '14px 0 0' }}>{selectedClass.title} Üniteleri</h2>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '-40px auto 0', padding: '0 20px 40px' }}>
        {adsEnabled ? <AdsenseBanner /> : <AdFallback />}

        {units.map((unit, uIdx) => {
          const unitGames = allGames.filter((g) => g.unit === unit);

          return (
            <div key={unit} style={{ marginBottom: 36 }}>
              <h3 style={{ fontSize: 28, marginBottom: 16 }}>
                {uIdx + 1}. {unit}
              </h3>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: 18
                }}
              >
                {unitGames.map((game) => (
                  <div
                    key={game.id}
                    style={{
                      background: '#0f172a',
                      border: '1px solid #1e293b',
                      borderRadius: 24,
                      padding: 20
                    }}
                  >
                    <div style={{ color: '#94a3b8', fontSize: 12, marginBottom: 8 }}>{game.type}</div>
                    <h4 style={{ margin: '0 0 10px', fontSize: 20 }}>{game.title}</h4>
                    <p style={{ color: '#94a3b8', marginBottom: 16 }}>{game.description}</p>

                    {game.embedCode ? (
                      <button onClick={() => onPlayGame(game.embedCode!)} style={cardBtnStyle}>
                        Oyunu Aç 🎮
                      </button>
                    ) : (
                      <button style={{ ...cardBtnStyle, opacity: 0.6, cursor: 'not-allowed' }}>
                        Yakında
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function GamePlayer({ html, onClose }: { html: string; onClose: () => void }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: '#020617',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <div
        style={{
          padding: 16,
          background: '#0f172a',
          borderBottom: '1px solid #1e293b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ fontWeight: 700 }}>🚀 Fen Oyunları - Oyun Modu</div>
        <button onClick={onClose} style={navBtnStyle}>
          Kapat ✖
        </button>
      </div>

      <div style={{ flexGrow: 1 }}>
        <iframe srcDoc={html} title="Oyun Ekranı" style={{ width: '100%', height: '100%', border: 'none' }} />
      </div>
    </div>
  );
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'detail' | 'guide'>('home');
  const [selectedClass, setSelectedClass] = useState<typeof CLASSES[number] | null>(null);
  const [activeGameCode, setActiveGameCode] = useState<string | null>(null);

  // false bırak: onay almadan önce sadece placeholder gösterir.
  // Adsense hazır olunca true yap.
  const adsEnabled = false;

  return (
    <div style={{ minHeight: '100vh', background: '#020617', color: '#e2e8f0' }}>
      <Navbar onNavigate={(page) => setCurrentPage(page as 'home' | 'detail' | 'guide')} />

      {currentPage === 'home' && (
        <HomePage
          adsEnabled={adsEnabled}
          onSelectClass={(cls) => {
            setSelectedClass(cls);
            setCurrentPage('detail');
          }}
        />
      )}

      {currentPage === 'guide' && <GuidePage adsEnabled={adsEnabled} />}

      {currentPage === 'detail' && selectedClass && (
        <GradeDetailPage
          selectedClass={selectedClass}
          onBack={() => setCurrentPage('home')}
          onPlayGame={setActiveGameCode}
          adsEnabled={adsEnabled}
        />
      )}

      {activeGameCode && <GamePlayer html={activeGameCode} onClose={() => setActiveGameCode(null)} />}

      <Footer />
    </div>
  );
}

// --- STYLES ---

const navBtnStyle: React.CSSProperties = {
  background: '#0f172a',
  border: '1px solid #334155',
  color: '#e2e8f0',
  borderRadius: 12,
  padding: '10px 14px',
  cursor: 'pointer'
};

const navBtnPrimaryStyle: React.CSSProperties = {
  background: '#1d4ed8',
  border: '1px solid #2563eb',
  color: 'white',
  borderRadius: 12,
  padding: '10px 14px',
  cursor: 'pointer'
};

const cardBtnStyle: React.CSSProperties = {
  background: '#1d4ed8',
  color: '#fff',
  border: 'none',
  borderRadius: 12,
  padding: '10px 14px',
  cursor: 'pointer',
  fontWeight: 700
};

const backBtnStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.12)',
  color: '#fff',
  border: '1px solid rgba(255,255,255,0.2)',
  borderRadius: 12,
  padding: '10px 14px',
  cursor: 'pointer'
};

const contentCardStyle: React.CSSProperties = {
  background: '#0f172a',
  border: '1px solid #1e293b',
  borderRadius: 20,
  padding: 20,
  marginBottom: 16
};