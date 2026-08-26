// AI Bubble Detector scoring
(function(){
var items = Array.prototype.slice.call(document.querySelectorAll('.tier .ti'));
  var scored = items.filter(function(el){ return el.getAttribute('data-h') !== 'd'; });
  var hit = scored.filter(function(el){ return el.getAttribute('data-h') === '1'; }).length;

  // 点状图：引爆层单独用红色，因为一条即触发
  var board = document.getElementById('dotBoard');
  scored.forEach(function(el){
    var d = document.createElement('span');
    var isA = el.closest('.tier').classList.contains('a');
    d.className = 'dot' + (el.getAttribute('data-h') === '1' ? (isA ? ' on a' : ' on') : '');
    board.appendChild(d);
  });

  // 各层计数写回表头与记分板
  [['a','门槛 1'],['b','门槛 3'],['c','门槛 4']].forEach(function(pair){
    var tier = document.querySelector('.tier.' + pair[0]);
    if (!tier) return;
    var s = Array.prototype.slice.call(tier.querySelectorAll('.ti'))
              .filter(function(el){ return el.getAttribute('data-h') !== 'd'; });
    var h = s.filter(function(el){ return el.getAttribute('data-h') === '1'; }).length;
    var gate = tier.querySelector('.gate');
    if (gate) gate.textContent = pair[1] + ' · 当前 ' + h + ' / ' + s.length;
    var cellV = document.querySelector('.cell .v[data-t="' + pair[0] + '"]');
    if (cellV) cellV.textContent = h + ' / ' + s.length;
  });

  document.getElementById('boardNote').textContent =
    scored.length + ' 条红线，已破 ' + hit + ' 条 —— 全部集中在结构与环境两层。另有 3 条阈值待定，不计入。';

  // 已过期的倒计时行
  var today = new Date('2026-08-26T00:00:00Z');
  document.querySelectorAll('tr.tr2').forEach(function(tr){
    if (new Date(tr.getAttribute('data-due') + 'T00:00:00Z') < today) tr.classList.add('past');
  });
})();