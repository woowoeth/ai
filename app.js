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

