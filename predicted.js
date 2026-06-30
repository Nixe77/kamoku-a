// 模擬試験（予想模試）: スロット×変種プール。出題時に各スロットからランダムに1問を選ぶ＝毎回違うテスト。
// ・計算スロット … このファイルでプログラム生成（数値が毎回変わり、答えは計算で保証）
// ・知識スロット … predicted_know.js（window.PRED_KNOW_SLOTS）を取り込む
// 選択肢の正解位置は実行時に prep() がシャッフルするので、ここでは correct を choices[0]・answer:0 とする。
window.PREDICTED_SLOTS = (function(){
  var SLOTS=[null];                 // index 0 は未使用（スロットは1始まり）
  var _id=100000;
  function addSlot(vs){ if(!vs||!vs.length) return; vs.forEach(function(v){ v.predicted=true; v.slot=SLOTS.length; v.id=_id++; }); SLOTS.push(vs); }
  function H(n){ n=((n%65536)+65536)%65536; var s=n.toString(16).toUpperCase(); while(s.length<4)s='0'+s; return s; }
  function dec(x){ return (Math.round(x*1000)/1000).toString(); }
  function uniq4(correct, ds){
    var out=[String(correct)], seen={}; seen[String(correct)]=true;
    for(var i=0;i<ds.length && out.length<4;i++){ var s=String(ds[i]); if(!seen[s]){ seen[s]=true; out.push(s); } }
    var k=2; while(out.length<4){ var s=String(correct)+'?'+k; if(!seen[s]){ seen[s]=true; out.push(s); } k++; }
    return out;
  }
  function K(cat,field,topic,q,choices,expl){ return {cat:cat,field:field,topic:topic,question:q,choices:choices,answer:0,explanation:expl}; }

  /* ===== 計算スロット（プログラム生成） ===== */

  // 1) 基数変換（10進→16進）
  (function(){ var vs=[]; [173,200,250,46,144,99,212,88].forEach(function(n){
    var hex=n.toString(16).toUpperCase();
    vs.push(K("テクノロジ","基礎理論","基数変換",
      "10進数 "+n+" を16進数で表したものはどれか。",
      uniq4(hex,[(n+1).toString(16).toUpperCase(),(n-1).toString(16).toUpperCase(),(n+16).toString(16).toUpperCase()]),
      "16で割った商と余りを並べる。"+n+"÷16＝商"+Math.floor(n/16)+" 余り"+(n%16)+" なので "+hex+"(16)。覚え方のコツ: 16進1桁＝4ビット。10進→2進→4ビット区切りでも求まる。"));
  }); addSlot(vs); })();

  // 2) 2の補数（16ビット, -N → 16進）
  (function(){ var vs=[]; [100,200,255,50,1000,73,500,128].forEach(function(n){
    var correct=H(65536-n);
    vs.push(K("テクノロジ","基礎理論","補数",
      "負数を2の補数で表す16ビットのレジスタに、10進数の －"+n+" を設定した。レジスタの内容を16進数で表したものはどれか。最上位ビットは符号(非負0・負1)とする。",
      uniq4(correct,[H(n),H(65535-n),H(65536-n+1)]),
      "負数の2の補数は『2^16から引く』が速い：65536－"+n+"＝"+(65536-n)+"＝"+correct+"(16)。手順では "+n+" を2進化→全ビット反転→+1。覚え方のコツ: 16ビット負数は『0x10000から引く』、先頭はF系になる。"));
  }); addSlot(vs); })();

  // 3) 直列接続の稼働率（a×b）
  (function(){ var vs=[]; [[0.9,0.8],[0.95,0.8],[0.9,0.7],[0.8,0.75],[0.95,0.9],[0.85,0.8]].forEach(function(p){
    var a=p[0],b=p[1],correct=dec(a*b);
    vs.push(K("テクノロジ","コンピュータ構成","システムの評価指標",
      "稼働率 "+a+" の装置と稼働率 "+b+" の装置を直列に接続したシステム全体の稼働率はおよそどれか。",
      uniq4(correct,[dec(a),dec(b),dec(1-(1-a)*(1-b))]),
      "直列は全装置が動いて初めて稼働するので稼働率の積。"+a+"×"+b+"＝"+correct+"。覚え方のコツ: 直列は『掛け算』で必ず下がる、並列は『1-(1-a)(1-b)』で上がる。"));
  }); addSlot(vs); })();

  // 4) 並列接続の稼働率（1-(1-a)(1-b)）
  (function(){ var vs=[]; [[0.8,0.7],[0.9,0.8],[0.6,0.7],[0.9,0.6],[0.8,0.5],[0.7,0.6]].forEach(function(p){
    var a=p[0],b=p[1],correct=dec(1-(1-a)*(1-b));
    vs.push(K("テクノロジ","コンピュータ構成","システムの評価指標",
      "稼働率 "+a+" の装置と稼働率 "+b+" の装置を並列に接続し、どちらか一方が動作すればよいシステム全体の稼働率はおよそどれか。",
      uniq4(correct,[dec(a*b),dec(a),dec(b)]),
      "並列はどちらか動けばよい。全停止確率＝(1-"+a+")(1-"+b+")＝"+dec((1-a)*(1-b))+"。稼働率＝1－それ＝"+correct+"。覚え方のコツ: 並列は『両方壊れる確率を1から引く』。"));
  }); addSlot(vs); })();

  // 5) MTBF/MTTR から稼働率（％）
  (function(){ var vs=[]; [[475,25],[90,10],[196,4],[360,40],[950,50],[1960,40]].forEach(function(p){
    var mtbf=p[0],mttr=p[1],pct=Math.round(mtbf/(mtbf+mttr)*100),correct=pct+"%";
    vs.push(K("テクノロジ","コンピュータ構成","システムの評価指標",
      "あるシステムのMTBFが "+mtbf+" 時間、MTTRが "+mttr+" 時間であるとき、このシステムの稼働率はおよそ何％か。",
      uniq4(correct,[Math.round(mttr/(mtbf+mttr)*100)+"%",Math.round(mtbf/mttr)+"%",(pct-5)+"%"]),
      "稼働率＝MTBF÷(MTBF＋MTTR)＝"+mtbf+"÷"+(mtbf+mttr)+"＝"+(Math.round(mtbf/(mtbf+mttr)*1000)/1000)+"＝"+correct+"。覚え方のコツ: MTBF＝平均故障間隔(動く)、MTTR＝平均修復時間(直す)。稼働率は『動く÷(動く＋直す)』。"));
  }); addSlot(vs); })();

  // 6) キャッシュ実効アクセス時間
  (function(){ var vs=[]; [[0.9,10,100],[0.8,10,60],[0.9,20,100],[0.75,8,40],[0.6,10,100],[0.95,10,90]].forEach(function(p){
    var h=p[0],tc=p[1],tm=p[2],eff=Math.round((h*tc+(1-h)*tm)*100)/100,correct=dec(eff)+"ナノ秒";
    vs.push(K("テクノロジ","コンピュータ構成","メモリ",
      "キャッシュメモリのヒット率が "+h+"、キャッシュのアクセス時間が "+tc+" ナノ秒、主記憶のアクセス時間が "+tm+" ナノ秒のとき、実効アクセス時間はおよそどれか。",
      uniq4(correct,[tc+"ナノ秒",tm+"ナノ秒",dec(Math.round((tc+tm)/2*100)/100)+"ナノ秒"]),
      "実効時間＝ヒット率×キャッシュ＋(1−ヒット率)×主記憶＝"+h+"×"+tc+"＋"+dec(1-h)+"×"+tm+"＝"+correct+"。覚え方のコツ: ヒットした分は速いキャッシュ、外した分だけ遅い主記憶。重み付き平均で求める。"));
  }); addSlot(vs); })();

  // 7) 伝送時間
  (function(){ var vs=[]; [[100,10,75],[50,10,80],[200,100,50],[60,8,75],[90,6,75],[40,4,100]].forEach(function(p){
    var mb=p[0],mbps=p[1],eff=p[2],sec=Math.round(mb*8/(mbps*eff/100)),correct=sec+"秒";
    vs.push(K("テクノロジ","ネットワーク","ネットワーク方式",
      mbps+"Mビット/秒の回線で "+mb+"Mバイトのファイルを送信するとき、伝送におよそ何秒かかるか。回線の伝送効率は "+eff+"％、1Mバイト＝8Mビットとする。",
      uniq4(correct,[Math.round(mb/(mbps*eff/100))+"秒",Math.round(mb*8/mbps)+"秒",Math.round(sec/2)+"秒"]),
      mb+"Mバイト＝"+(mb*8)+"Mビット。実効速度＝"+mbps+"×"+(eff/100)+"＝"+dec(mbps*eff/100)+"Mビット/秒。"+(mb*8)+"÷"+dec(mbps*eff/100)+"≒"+correct+"。覚え方のコツ: まずバイト→ビットは×8、効率を速度に掛けてから『データ量÷実効速度』。"));
  }); addSlot(vs); })();

  // 8) 損益分岐点（販売数量）
  (function(){ var vs=[]; [[3000000,3000],[600000,1500],[1500000,2500],[800000,1600],[1200000,4000],[4500000,1500]].forEach(function(p){
    var fixed=p[0],margin=p[1],qty=fixed/margin,correct=qty.toLocaleString()+"個";
    vs.push(K("ストラテジ","ストラテジ","会計・財務",
      "固定費が "+fixed.toLocaleString()+" 円、製品1個あたりの限界利益が "+margin.toLocaleString()+" 円のとき、損益分岐点となる販売数量はどれか。",
      uniq4(correct,[(Math.round(fixed/margin/2)).toLocaleString()+"個",(qty*2).toLocaleString()+"個",(Math.round(fixed/(margin*1.5))).toLocaleString()+"個"]),
      "損益分岐点数量＝固定費÷1個あたりの限界利益＝"+fixed.toLocaleString()+"÷"+margin.toLocaleString()+"＝"+qty.toLocaleString()+"個。この数量で利益がちょうど0。覚え方のコツ: 限界利益＝売価−変動費。固定費をこの限界利益で割れば損益トントンの数量。"));
  }); addSlot(vs); })();

  /* ===== 知識スロット（predicted_know.js から取り込み） ===== */
  var KN = window.PRED_KNOW_SLOTS || [];
  KN.forEach(function(slotVariants){ addSlot(slotVariants); });

  window.PREDICTED_INFO = { slots: SLOTS.length-1 };
  return SLOTS;
})();
