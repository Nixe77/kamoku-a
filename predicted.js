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

  // 9) 16進→10進
  (function(){ var vs=[]; [['2F',47],['3C',60],['A0',160],['FF',255],['80',128],['1B',27]].forEach(function(p){
    var hx=p[0],n=p[1];
    vs.push(K("テクノロジ","基礎理論","基数変換",
      "16進数 "+hx+" を10進数で表したものはどれか。",
      uniq4(String(n),[String(n+1),String(n-1),String(n+16)]),
      "各桁を16の重みで展開。0x"+hx+"＝"+Math.floor(n/16)+"×16＋"+(n%16)+"＝"+n+"。覚え方のコツ: 16進2桁＝上位×16＋下位。A〜Fは10〜15。"));
  }); addSlot(vs); })();

  // 10) 2進→10進
  (function(){ var vs=[]; ['1011','110010','10101','1111','100100','11011'].forEach(function(b){
    var n=parseInt(b,2);
    vs.push(K("テクノロジ","基礎理論","基数変換",
      "2進数 "+b+" を10進数で表したものはどれか。",
      uniq4(String(n),[String(n+1),String(n-1),String(n+2)]),
      "各ビットに上位から2のべき乗の重みを掛けて足す。"+b+"(2)＝"+n+"。覚え方のコツ: 右から 1,2,4,8,16… の重み。立っているビットの重みの合計。"));
  }); addSlot(vs); })();

  // 11) サブネットのホスト数（2^n-2）
  (function(){ var vs=[]; [8,4,6,5,7,3].forEach(function(h){
    var n=Math.pow(2,h)-2;
    vs.push(K("テクノロジ","ネットワーク","通信プロトコル",
      "ホスト部が "+h+" ビットのとき、1つのサブネットに割り当てられるホストアドレスの最大数はどれか。",
      uniq4(String(n),[String(Math.pow(2,h)),String(Math.pow(2,h)-1),String(Math.pow(2,h-1)-2)]),
      "ホスト部"+h+"ビットで2^"+h+"＝"+Math.pow(2,h)+"通り。ネットワークアドレスとブロードキャストアドレスの2つを除き "+Math.pow(2,h)+"−2＝"+n+"。覚え方のコツ: 割当て可能数＝『2^ホストビット − 2』。"));
  }); addSlot(vs); })();

  // 12) サイコロ2個の和の組合せ数
  (function(){ var vs=[]; [[5,4],[6,5],[7,6],[8,5],[9,4],[4,3]].forEach(function(p){
    var s=p[0],c=p[1];
    vs.push(K("テクノロジ","基礎理論","確率・統計",
      "大小2個のサイコロを同時に投げるとき、出た目の和が "+s+" になる場合は何通りあるか。",
      uniq4(String(c),[String(c+1),String(c-1),String(c+2)]),
      "和が"+s+"になる(大,小)の組を数えると"+c+"通り（全36通り中）。覚え方のコツ: 和7が最多の6通り、7から1離れるごとに1通りずつ減る(2と12は1通り)。"));
  }); addSlot(vs); })();

  // 13) MIPS（1命令の平均実行時間→MIPS）
  (function(){ var vs=[]; [2,4,5,1,8,10].forEach(function(t){
    var mips=1000/t;
    vs.push(K("テクノロジ","コンピュータ構成","プロセッサ",
      "1命令の実行に平均 "+t+" ナノ秒を要するプロセッサの処理性能はおよそ何MIPSか。",
      uniq4(dec(mips),[dec(mips/2),dec(mips*2),String(t*100)]),
      "MIPSは1秒あたりの実行命令数(百万命令単位)。1命令"+t+"ナノ秒なので1秒では 1000÷"+t+"＝"+mips+"百万命令＝"+mips+"MIPS。覚え方のコツ: MIPS＝1000÷(1命令のナノ秒)。"));
  }); addSlot(vs); })();

  // 14) 集合（包除原理）
  (function(){ var vs=[]; [[30,20,8],[25,18,5],[40,30,12],[15,12,4],[35,22,10],[28,16,6]].forEach(function(p){
    var a=p[0],b=p[1],c=p[2],n=a+b-c;
    vs.push(K("テクノロジ","基礎理論","応用数学",
      "あるクラスで X を好む人が "+a+"人、Y を好む人が "+b+"人、両方好む人が "+c+"人いる。X または Y を好む人は何人か。",
      uniq4(String(n),[String(a+b),String(a+b-2*c),String(a+b+c)]),
      "『X または Y』＝Xの人数＋Yの人数−両方の人数＝"+a+"＋"+b+"−"+c+"＝"+n+"人。覚え方のコツ: 和集合は『足してダブり(積集合)を1回引く』(包除原理)。"));
  }); addSlot(vs); })();

  // 15) 情報量（N種類に必要なビット数）
  (function(){ var vs=[]; [256,1000,100,16,500,64].forEach(function(N){
    var bits=Math.ceil(Math.log2(N));
    vs.push(K("テクノロジ","基礎理論","情報量・符号化",
      N+" 種類の文字を区別して符号化するには、1文字あたり最低何ビット必要か。",
      uniq4(bits+"ビット",[(bits-1)+"ビット",(bits+1)+"ビット",(bits+2)+"ビット"]),
      "nビットで2^n通り表せる。2^"+(bits-1)+"＝"+Math.pow(2,bits-1)+"では足りず、2^"+bits+"＝"+Math.pow(2,bits)+"で"+N+"種類を表せるので"+bits+"ビット。覚え方のコツ: 必要ビット数は『2^n ≧ 種類数 となる最小のn』。"));
  }); addSlot(vs); })();

  // 16) n台直列の稼働率
  (function(){ var vs=[]; [[2,0.9],[3,0.9],[4,0.9],[2,0.95],[3,0.8],[5,0.9]].forEach(function(p){
    var n=p[0],base=p[1],correct=dec(Math.pow(base,n));
    vs.push(K("テクノロジ","コンピュータ構成","システムの評価指標",
      "稼働率がいずれも "+base+" の装置を "+n+" 台直列に接続したシステム全体の稼働率はおよそどれか。",
      uniq4(correct,[dec(base),dec(1-Math.pow(1-base,n)),dec(Math.pow(base,n+1))]),
      "直列は全装置が動いて初めて稼働するので積。"+base+"^"+n+"＝"+correct+"。覚え方のコツ: 直列は掛け算で台数が増えるほど下がる、並列は 1-(1-x)^n で上がる。"));
  }); addSlot(vs); })();

  /* ===== 知識スロット（predicted_know.js から取り込み） ===== */
  var KN = window.PRED_KNOW_SLOTS || [];
  KN.forEach(function(slotVariants){ addSlot(slotVariants); });

  window.PREDICTED_INFO = { slots: SLOTS.length-1 };
  return SLOTS;
})();
