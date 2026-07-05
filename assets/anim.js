// ===== แอนิเมชันร่วมของทุกหน้า =====

// ----- ธีม: dark เป็นค่าเริ่มต้น สลับได้ จำค่าที่เลือกไว้ -----
(function () {
  let saved = 'dark';
  try { saved = localStorage.getItem('theme') || 'dark'; } catch (e) {}
  document.documentElement.setAttribute('data-theme', saved);
})();

// องค์ประกอบหลักทุกชิ้น "ปรากฏ" เมื่อเลื่อนถึง + สร้างปุ่มสลับธีม
document.addEventListener('DOMContentLoaded', () => {
  const targets = document.querySelectorAll(
    '.card, .demo, .exercise, .goal-box, .ladder-box, .resources, h2, .ladder li, details.deepdive, ol.steps > li');
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('shown'); io.unobserve(e.target); }
    });
  }, { threshold: 0.1 });
  targets.forEach(el => { el.classList.add('reveal'); io.observe(el); });

  // ปุ่มสลับธีมมุมขวาล่าง
  const btn = document.createElement('button');
  btn.className = 'theme-toggle';
  btn.title = 'สลับธีมมืด/สว่าง';
  const setIcon = () =>
    btn.textContent = document.documentElement.getAttribute('data-theme') === 'dark' ? '☀️' : '🌙';
  setIcon();
  btn.onclick = () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
    setIcon();
  };
  document.body.appendChild(btn);

  // ----- step-player: อัปเกรด "เข้าใจทีละขั้น" เป็นโหมดโต้ตอบ -----
  const stepsList = document.querySelector('ol.steps');
  if (stepsList) {
    const items = [...stepsList.children];
    stepsList.classList.add('interactive');
    let cur = -1, playTimer = null;

    // เวทีภาพประกอบ (เฉพาะหน้าที่กำหนดฉากไว้ใน window.stepScenes)
    let stage = null;
    const stageIdle = '<em style="color:#5b6475">👇 กด "▶ เล่นทีละขั้น" หรือคลิกขั้นตอนใดก็ได้ — ภาพประกอบของขั้นนั้นจะแสดงตรงนี้</em>';
    if (window.stepScenes) {
      // จัดเป็นสองคอลัมน์: เวที (ลอยติดตาม) | รายการขั้น — จอแคบเวทีปักบนสุดตลอด
      stage = document.createElement('div');
      stage.className = 'step-stage';
      stage.innerHTML = stageIdle;
      const wrap = document.createElement('div');
      wrap.className = 'step-wrap';
      stepsList.parentNode.insertBefore(wrap, stepsList);
      wrap.appendChild(stage);
      wrap.appendChild(stepsList);
    }

    const setStep = (i, scroll) => {
      cur = i;
      stepsList.classList.add('started');
      items.forEach((li, j) => {
        li.classList.toggle('active', j === i);
        li.classList.toggle('done', j < i);
      });
      if (scroll && items[i]) items[i].scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (stage && window.stepScenes[i]) {
        // หัวเวทีบอกว่ากำลังดูขั้นไหน — คำอธิบายกับภาพอยู่ด้วยกันเสมอ
        const t = items[i].querySelector('strong');
        stage.innerHTML = '<div class="stg-head">ขั้นที่ ' + (i + 1) + '/' + items.length +
          (t ? ' — ' + t.textContent.replace(/[:：]\s*$/, '') : '') + '</div><div class="stg-body"></div>';
        const body = stage.querySelector('.stg-body');
        window.stepScenes[i](body);
        // แท่งกราฟที่ประกาศ data-w จะค่อยๆ ยืดออกเอง
        body.querySelectorAll('.bar[data-w]').forEach(b =>
          requestAnimationFrame(() => requestAnimationFrame(() => { b.style.width = b.dataset.w; })));
      }
    };

    items.forEach((li, i) =>
      li.addEventListener('click', () => { clearInterval(playTimer); setStep(i, false); }));

    const controls = document.createElement('div');
    controls.className = 'step-controls';
    controls.innerHTML =
      '<button data-a="play">▶ เล่นทีละขั้น</button>' +
      '<button data-a="next">⏭ ขั้นถัดไป</button>' +
      '<button data-a="reset">↺ เริ่มใหม่</button>';
    const anchor = stage ? stage.parentNode : stepsList;
    anchor.parentNode.insertBefore(controls, anchor);
    controls.addEventListener('click', e => {
      const a = e.target.dataset && e.target.dataset.a;
      if (!a) return;
      clearInterval(playTimer);
      if (a === 'next') setStep(Math.min(cur + 1, items.length - 1), true);
      if (a === 'reset') {
        cur = -1;
        stepsList.classList.remove('started');
        items.forEach(li => li.classList.remove('active', 'done'));
        if (stage) stage.innerHTML = stageIdle;
      }
      if (a === 'play') {
        setStep(0, true);
        playTimer = setInterval(() => {
          if (cur >= items.length - 1) clearInterval(playTimer);
          else setStep(cur + 1, true);
        }, 5000);
      }
    });
  }

  // ----- เครื่องเล่นเฉลยทีละขั้น: ทุก .ans ที่มีโครง "ขั้น 1/2/3 + ✅" -----
  document.querySelectorAll('details.example .ans').forEach(ans => {
    // แยกเนื้อเฉลยเป็นท่อนตามหัว <strong>ขั้น ... และบรรทัดสรุป ✅
    const parts = ans.innerHTML.split(/(?=<strong>ขั้น)|(?=✅)|(?=<span class="ans-ok")/)
      .filter(p => p.replace(/<[^>]*>/g, '').trim() !== '');
    if (parts.length < 2) return;
    ans.innerHTML =
      '<div class="ans-controls">' +
      '<button type="button" class="primary" data-a="play">▶ ดูเฉลยทีละขั้น</button>' +
      '<button type="button" data-a="next">⏭ ขั้นถัดไป</button>' +
      '<button type="button" data-a="all">แสดงทั้งหมด</button></div>' +
      parts.map((p, i) =>
        '<div class="ans-step">' +
        (i < parts.length - 1 ? '<span class="stepdot">' + (i + 1) + '</span>' : '') + p + '</div>').join('');
    const steps = [...ans.querySelectorAll('.ans-step')];
    let timer = null, idx = steps.length - 1;
    const show = n => {
      idx = n;
      steps.forEach((st, i) => {
        st.classList.toggle('shown', i <= n);
        st.classList.toggle('current', i === n && n < steps.length - 1);
      });
    };
    ans.querySelector('.ans-controls').addEventListener('click', e => {
      const a = e.target.dataset && e.target.dataset.a;
      if (!a) return;
      clearInterval(timer);
      if (a === 'all') show(steps.length - 1);
      if (a === 'next') show(Math.min(idx + 1, steps.length - 1));
      if (a === 'play') {
        show(0);
        timer = setInterval(() => {
          if (idx >= steps.length - 1) clearInterval(timer);
          else show(idx + 1);
        }, 2600);
      }
    });
    show(steps.length - 1); // ค่าเริ่มต้น: แสดงครบ (อ่านปกติได้) — กด ▶ เพื่อดูแบบไล่ทีละขั้น
  });

  // แถบความคืบหน้าการอ่าน ด้านบนสุดของหน้า
  const bar = document.createElement('div');
  bar.className = 'scroll-progress';
  document.body.appendChild(bar);
  const updateBar = () => {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
  };
  addEventListener('scroll', updateBar, { passive: true });
  updateBar();
});

// พิมพ์ข้อความทีละตัวอักษรลงใน element (คืน Promise เพื่อต่อคิวแอนิเมชันได้)
function typeText(el, text, speed = 30) {
  return new Promise(resolve => {
    el.textContent = '';
    let i = 0;
    const t = setInterval(() => {
      el.textContent += text[i++];
      if (i >= text.length) { clearInterval(t); resolve(); }
    }, speed);
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
