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
    scored.length + ' 条计分红线，已破 ' + hit + ' 条 —— 全部在结构与环境两层，引爆层 0。另有 ' + (items.length - scored.length) + ' 条口径分歧或阈值待定，不计分。';

  // 已过期的倒计时行
  var today = new Date();
  document.querySelectorAll('tr.tr2').forEach(function(tr){
    if (new Date(tr.getAttribute('data-due') + 'T00:00:00Z') < today) tr.classList.add('past');
  });
})();

// scrollspy: 当前章节高亮 + 活动胶囊在导航条内自动居中
(function(){
  var nav=document.querySelector('.navin'); if(!nav) return;
  var links=Array.prototype.slice.call(nav.querySelectorAll('a[href^="#"]'));
  var secs=links.map(function(a){ return document.getElementById(a.getAttribute('href').slice(1)); });
  var last=-1;
  function mark(){
    var best=-1,bestTop=-1e9;
    for(var i=0;i<secs.length;i++){
      if(!secs[i]) continue;
      var top=secs[i].getBoundingClientRect().top-80;
      if(top<=0&&top>bestTop){bestTop=top;best=i;}
    }
    if(best===last) return;
    last=best;
    for(var j=0;j<links.length;j++) links[j].classList.toggle('on',j===best);
    if(best>=0){
      var a=links[best];
      try{ nav.scrollTo({left:a.offsetLeft-(nav.clientWidth-a.offsetWidth)/2,behavior:'smooth'}); }
      catch(e){ nav.scrollLeft=a.offsetLeft-(nav.clientWidth-a.offsetWidth)/2; }
    }
  }
  var t=null;
  window.addEventListener('scroll',function(){ if(t)return; t=setTimeout(function(){t=null;mark();},150); },{passive:true});
  mark();
})();


// ── 触发位置图与小曲线（2026-09-01 之三）────────────────────────────────
// 全部数值读自条目的 data-* 属性，与计分同源；本文件不硬编码任何读数。
// 破线判定由 now / line / dir 推出，并与 data-h 交叉校验——两者不一致即在控制台报错。
(function(){
  var NS = 'http://www.w3.org/2000/svg';
  function E(n, a, txt){
    var e = document.createElementNS(NS, n);
    for (var k in a) e.setAttribute(k, a[k]);
    if (txt != null) e.textContent = txt;
    return e;
  }
  function num(el, k){ var v = el.getAttribute(k); return v == null ? null : parseFloat(v); }
  function fmt(v){
    var a = Math.abs(v);
    return (a >= 100 ? Math.round(v) : Math.round(v * 100) / 100) + '';
  }
  function ser(el, k){
    var raw = el.getAttribute(k);
    if (!raw) return null;
    try { var a = JSON.parse(raw); return (a && a.length) ? a : null; }
    catch(e){ console.error('data-' + k + ' 不是合法 JSON', e); return null; }
  }
  function val(p){ return p.v != null ? p.v : (p.lo + p.hi) / 2; }

  var W = 320;

  // ---- 触发位置条 ----
  function gauge(item, unit){
    var line = num(item, 'data-line');
    var lo = num(item, 'data-now-lo'), hi = num(item, 'data-now-hi');
    var now = num(item, 'data-now');
    if (now == null && lo != null) now = (lo + hi) / 2;
    if (now == null || line == null) return null;
    var dir = item.getAttribute('data-dir') || 'up';

    // 交叉校验：由数字推出的破线状态必须等于 data-h
    var broke = (dir === 'up') ? (now >= line) : (now <= line);
    var dh = item.getAttribute('data-h');
    if (dh !== 'd' && ((dh === '1') !== broke)) {
      console.error('触发位置与 data-h 不一致：', item.querySelector('h4').textContent.trim(),
                    'now=' + now, 'line=' + line, 'dir=' + dir, 'data-h=' + dh);
    }

    var aLo = num(item, 'data-axis-lo'), aHi = num(item, 'data-axis-hi');
    var vLo = aLo != null ? aLo : Math.min(0, now, line);
    var vHi = aHi != null ? aHi : Math.max(now, line, (hi == null ? -Infinity : hi));
    if (aHi == null) vHi = vHi + Math.max((vHi - vLo) * 0.18, 0.001);
    var H = 46, padL = 2, padR = 2, tY = 24, tH = 8;
    var x = function(v){
      var t = (v - vLo) / (vHi - vLo);
      t = Math.max(0, Math.min(1, t));
      return padL + t * (W - padL - padR);
    };

    var svg = E('svg', {viewBox: '0 0 ' + W + ' ' + H, width: '100%',
      role: 'img', class: 'gz'});
    // 轨道
    svg.appendChild(E('rect', {x: padL, y: tY, width: W - padL - padR, height: tH,
      rx: tH/2, class: 'gz-track'}));
    // 越线区（红线的“坏”那一侧）
    var bx = dir === 'up' ? x(line) : padL;
    var bw = dir === 'up' ? (W - padR - x(line)) : (x(line) - padL);
    if (bw > 0) svg.appendChild(E('rect', {x: bx, y: tY, width: bw, height: tH,
      rx: tH/2, class: 'gz-bad'}));
    // 当前值：区间则画带，点值则画点
    if (lo != null && hi != null){
      svg.appendChild(E('rect', {x: x(lo), y: tY, width: Math.max(x(hi) - x(lo), 2),
        height: tH, rx: tH/2, class: 'gz-now-band'}));
    } else {
      svg.appendChild(E('rect', {x: padL, y: tY, width: Math.max(x(now) - padL, 0),
        height: tH, rx: tH/2, class: 'gz-fill'}));
    }
    svg.appendChild(E('circle', {cx: x(now), cy: tY + tH/2, r: 5, class: 'gz-dot' + (broke ? ' brk' : '')}));
    // 红线标记
    svg.appendChild(E('line', {x1: x(line), y1: tY - 7, x2: x(line), y2: tY + tH + 7, class: 'gz-line'}));
    // 标签
    var nowTxt = (lo != null ? fmt(lo) + '~' + fmt(hi) : fmt(now)) + (unit || '');
    var lt = E('text', {x: x(now), y: tY - 11, class: 'gz-t gz-t-now',
      'text-anchor': x(now) > W * 0.72 ? 'end' : (x(now) < W * 0.14 ? 'start' : 'middle')}, '现在 ' + nowTxt);
    svg.appendChild(lt);
    var rt = E('text', {x: x(line), y: tY + tH + 17, class: 'gz-t gz-t-line',
      'text-anchor': x(line) > W * 0.72 ? 'end' : (x(line) < W * 0.14 ? 'start' : 'middle')},
      '红线 ' + fmt(line) + (unit || ''));
    svg.appendChild(rt);
    svg.appendChild(E('title', {}, '现在 ' + nowTxt + '，红线 ' + fmt(line) + (unit || '') +
      '，' + (broke ? '已破' : '未破')));
    return svg;
  }

  // ---- 事件型两态开关 ----
  function evSwitch(item){
    var on = item.getAttribute('data-h') === '1';
    var offL = item.getAttribute('data-ev-off') || '未发生';
    var onL  = item.getAttribute('data-ev-on')  || '已触发';
    var H = 30, tY = 8, tH = 14, gap = 3, half = (W - gap) / 2;
    var svg = E('svg', {viewBox: '0 0 ' + W + ' ' + H, width: '100%', role: 'img', class: 'gz'});
    svg.appendChild(E('rect', {x: 0, y: tY, width: half, height: tH, rx: 4,
      class: 'gz-ev' + (on ? '' : ' act')}));
    svg.appendChild(E('rect', {x: half + gap, y: tY, width: half, height: tH, rx: 4,
      class: 'gz-ev' + (on ? ' act on' : '')}));
    svg.appendChild(E('text', {x: half/2, y: tY + tH - 4, 'text-anchor': 'middle',
      class: 'gz-t' + (on ? '' : ' gz-t-str')}, offL));
    svg.appendChild(E('text', {x: half + gap + half/2, y: tY + tH - 4, 'text-anchor': 'middle',
      class: 'gz-t' + (on ? ' gz-t-str gz-t-brk' : '')}, onL));
    svg.appendChild(E('title', {}, '事件型：只有两态，没有中间距离。当前「' + (on ? onL : offL) + '」'));
    return svg;
  }

  // ---- 小曲线 ----
  function spark(pts, line, unit, label, cls){
    var H = 58, padL = 2, padR = 2, top = 16, bot = 40;
    var vals = [];
    pts.forEach(function(p){
      if (p.lo != null){ vals.push(p.lo); vals.push(p.hi); } else vals.push(p.v);
    });
    if (line != null) vals.push(line);
    var vLo = Math.min.apply(null, vals), vHi = Math.max.apply(null, vals);
    var pad = (vHi - vLo) * 0.18 || Math.abs(vHi) * 0.1 || 1;
    vLo -= pad; vHi += pad;
    var x = function(i){ return padL + (pts.length === 1 ? 0.5 : i / (pts.length - 1)) * (W - padL - padR); };
    var y = function(v){ return bot - (v - vLo) / (vHi - vLo) * (bot - top); };

    var svg = E('svg', {viewBox: '0 0 ' + W + ' ' + H, width: '100%', role: 'img', class: 'gz ' + (cls || '')});
    if (label) svg.appendChild(E('text', {x: 0, y: 8, class: 'gz-t gz-t-cap'}, label));
    // 红线（虚线）
    if (line != null){
      svg.appendChild(E('line', {x1: padL, y1: y(line), x2: W - padR, y2: y(line), class: 'gz-thr'}));
      svg.appendChild(E('text', {x: W - padR, y: y(line) - 3, 'text-anchor': 'end',
        class: 'gz-t gz-t-line'}, '红线 ' + fmt(line) + (unit || '')));
    }
    // 区间带
    var hasBand = pts.some(function(p){ return p.lo != null; });
    if (hasBand){
      var up = [], dn = [];
      pts.forEach(function(p, i){
        var l = p.lo != null ? p.lo : p.v, h = p.hi != null ? p.hi : p.v;
        up.push(x(i) + ',' + y(h)); dn.unshift(x(i) + ',' + y(l));
      });
      svg.appendChild(E('polygon', {points: up.concat(dn).join(' '), class: 'gz-band'}));
    }
    // 折线
    svg.appendChild(E('polyline', {class: 'gz-path',
      points: pts.map(function(p, i){ return x(i) + ',' + y(val(p)); }).join(' ')}));
    // 点
    pts.forEach(function(p, i){
      var last = i === pts.length - 1;
      svg.appendChild(E('circle', {cx: x(i), cy: y(val(p)), r: last ? 4 : 2.6,
        class: 'gz-pt' + (p.est ? ' est' : '') + (last ? ' last' : '')}));
    });
    // 首末标签
    var f = pts[0], l = pts[pts.length - 1];
    svg.appendChild(E('text', {x: padL, y: H - 2, class: 'gz-t gz-t-cap'},
      f.t + ' ' + (f.lo != null ? f.lo + '~' + f.hi : fmt(f.v)) + (unit || '')));
    if (pts.length > 1)
      svg.appendChild(E('text', {x: W - padR, y: H - 2, 'text-anchor': 'end', class: 'gz-t gz-t-cap gz-t-str'},
        l.t + ' ' + (l.lo != null ? l.lo + '~' + l.hi : fmt(l.v)) + (unit || '') + (l.est ? '（预估）' : '')));
    return svg;
  }

  // ---- 逐条渲染 ----
  var n = {g: 0, e: 0, s: 0, skip: 0};
  Array.prototype.slice.call(document.querySelectorAll('.tier .ti')).forEach(function(item){
    var unit = item.getAttribute('data-unit') || '';
    var why = item.getAttribute('data-nochart');
    var box = document.createElement('div');
    box.className = 'gzbox';

    if (why){
      var w = document.createElement('p');
      w.className = 'gz-why';
      w.textContent = '不配图：' + why + '。';
      box.appendChild(w);
      n.skip++;
    } else if (item.getAttribute('data-kind') === 'event'){
      box.appendChild(evSwitch(item)); n.e++;
    } else {
      var g = gauge(item, unit);
      if (g){ box.appendChild(g); n.g++; }
    }

    [['data-series', 'data-series-label', 'data-series-note'],
     ['data-series2', 'data-series2-label', null]].forEach(function(keys){
      var pts = ser(item, keys[0]);
      if (!pts) return;
      // 序列末点必须等于当前读数（区间则对齐区间），否则报错
      var last = pts[pts.length - 1], now = num(item, 'data-now'),
          nlo = num(item, 'data-now-lo'), nhi = num(item, 'data-now-hi');
      if (keys[0] === 'data-series' && item.getAttribute('data-kind') !== 'event'){
        if (nlo != null && last.lo != null){
          if (last.lo !== nlo || last.hi !== nhi)
            console.error('序列末点与 data-now-lo/hi 不一致：', item.querySelector('h4').textContent.trim());
        } else if (now != null && last.v != null && Math.abs(last.v - now) > 1e-9){
          console.error('序列末点与 data-now 不一致：', item.querySelector('h4').textContent.trim(),
                        last.v, now);
        }
      }
      var lbl = keys[1] ? item.getAttribute(keys[1]) : null;
      var thr = (item.getAttribute('data-kind') === 'event') ? null : num(item, 'data-line');
      box.appendChild(spark(pts, thr, unit, lbl, keys[0] === 'data-series2' ? 'alt' : ''));
      n.s++;
    });

    var note = item.getAttribute('data-series-note');
    if (note){
      var p = document.createElement('p');
      p.className = 'gz-note';
      p.textContent = '读图：' + note + '。';
      box.appendChild(p);
    }

    if (box.childNodes.length){
      var fig = item.querySelector('.fig');
      if (fig && fig.nextSibling) item.insertBefore(box, fig.nextSibling);
      else if (fig) item.appendChild(box);
      else item.insertBefore(box, item.querySelector('h4').nextSibling);
    }
  });

  var lg = document.getElementById('gzLegend');
  if (lg) lg.textContent = '本次为 ' + n.g + ' 条画了触发位置条、' + n.e +
    ' 条事件型画了两态开关、' + n.s + ' 条画了历史曲线，另 ' + n.skip + ' 条明确不配图。' +
    '所有坐标由脚本从条目数据现算，与记分同源——数字改了图自动跟着改，改不动的地方自检会报错。';
})();
