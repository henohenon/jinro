"use strict"
/*
* ルームが増えたり減ったりした時に、あれだね全員の情報入ってるやつとかの番号困るね名前にしよっか
* ということで番号システムは廃止、名前システムに切り替えること
* しません。ルームオブジェクトの番号は消す、all_memb_ronuは残す。
* で、ストーリー(？)的に進むやつの引数はthis_roomにすること〜他のやつは名前から頑張って特定！
* deathはall_memb_ronuだけfor文で舐めまわして処理
* 
* えっとcompっていうDM送った？ってやつあれね0と1だけじゃなくしようぜじゃないとやっかい...まぁでもやりやすいかなnext_funcもあるし
*/
//実際にやるときは...
//・スタート、夜、朝、投票の初期化をいじるぐらい...
//・まぁinfoの初期化の時の投票-1にしてもいいけど逆にバグの原因になりそう→全然そんなことなかったです買えなくていい→うん-1絶対だめ
//・killedの初期のやつ
//・占い師とかのcomp系
//・職業の初期化のやつ
//・俺だけ特別扱い職業

/*** オブジェクトとか配列とか ***/

let help_message=
"ゲームの流れ\n"
+"・１、(ゲームの作成)まず、「人狼bot game_create メンバーの表示名,メンバーの表示名,メンバーの表示名... ルームの名前」と言って、ルームを作ってください。(スレッド推奨)\n"
+"・２、(職業確認)次に、全員人狼botとのDMで、「st」と言ってください。(事前に人狼botとのDMを建てることをお勧めします)\n"
+"・３、(初夜)続いて、占い師は、botとのDMで「jn(数字)」(例：jn1)と言ってください。\n"
+"・４、(朝)そして、全員botとのDMで「jt(数字)」(例：j52)と言って、投票してください。\n"
+"・５、(夜)そのあと、特殊な職業の人はbotとのDMで「jn(数字)」(例：jn4)のように言ってください。\n"
+"・４、５を繰り返します。\n"
+"役職一覧\n"
+"・村人：村人側の役職です。特殊能力などはありません。手元にある情報を元に人狼は誰か推理しましょう。\n"
+"・占い師：村人側の役職です。夜のターンで、一人占って人狼かどうかを知ることができます。人狼か、そうでないかしか占えないので、占い先が役職持ち(狂人や騎士)であっても、村人としかわかりません。\n"
+"・狩人：村人側の役職です。夜のターンで、誰か一人を人狼の襲撃から守ることができます。狩人が守っている人を人狼が襲撃した場合、襲撃は失敗し、翌日犠牲者は発生しません。\n"
+"・人狼：人狼側の役職です。夜のターンで、誰か一人を襲撃して殺します。人狼は人間に、1対1では勝てるものの、相手が村人2名だと勝てません。よって、村人に人狼だと悟られないようにうまく立ち回り、人が残り一人になるまで夜のターンでこっそり人を殺していきましょう。\n"
+"・狂人：人狼側の役職です。素性は村人ですが、人狼に加担する人です。人狼サイドが勝利することで、自分が死んでも狂人も勝利となります。占い師に占われても村人と判断されます。だれが人狼なのかを知ることはできません。\n"
+"コマンド一覧\n"
+"・「人狼bot game_create メンバーの表示名,メンバーの表示名,メンバーの表示名... ルームの名前」\n"
+"　　　...ルームを建てるコマンド、普通のチャンネルで行う、スレッド推奨\n"
+"・「st」\n"
+"　　　...職業確認コマンド、のくせに一回しか使えません、DMで行う\n"
+"・「jn(数字)」\n"
+"　　　...夜のターンに人狼、占い師、狩人が対象を設定するコマンド、DM内で行う、例：jn1\n"
+"・「jt(数字)」\n"
+"　　　...投票時の対象を設定するコマンド、DM内で行う、例：jt3\n"
+"・「人狼bot finish」\n"
+"　　　...ゲームを強制終了させるコマンド、どこでもokただし、stで、botに認証されたプレイヤーしか使えません、死んでもダメです。\n"
+"・「人狼bot help」\n"
+"　　　...この文章を出すヘルプコマンド、\n"
+ "注意点\n"
+"・このbotは、多人数プレイには向いていません。4〜6人ぐらいが最も楽しめると思います。\n"
+"・また、botのコメント数には限界がありますので、5ルームとか建てるのは、やめてください。\n"
+"・ルームを建てるときは、メンションではなく、表示名でお願いします。また、コピペだとリンクと太文字がついてしまうので、リンクを削除して太文字を解除(「,」とかにリンクが残らないか注意です)するか、一つ一つ入力してください。\n"
+"※これバグじゃね？みたいなの(こここうして欲しい！でもok)があれば、お手数ですが、作者へのDMか何かで知らせていただけるとありがたいです！(「キタ」ぐらいで検索して、へのへのもへじっぽいアイコンのやつがいれば、だいたいそいつです。)"
function memb_ronu()//all_memb_rinuの中身
{
    room_name:"";//ルームの名前
    room_numb:0;//ルームの番号
    numb_inroom:0;
    info:new Array();//メンバーの情報:each_info
}
function each_info()//メンバーの情報というかオブジェクト...
{
    compreat:1;//やらなあかんこと変数
    //0=何もなし,1=start送って,2=夜,3=投票
    msg_dm:null;//dmのmsg？
    touhyo:-1;//投票する変数
    each_name:"";//名前
    each_jobs_numb:0;//役割のナンバー
}    
function room()//roomオブジェクト
{
    msg:null;//スタートしたとこのmsg
    name:"";//ルームの名前(実はなくてもいい)
    memb_info:new Array();//ルームのメンバー情報の配列:each_info
    killed:0;//人狼の指定した人(？)というか被害者
    saved:-1;//騎士の守る人
    isfin:0;
    turn:0;
}
let jobs=["村人","人狼","占い師","狩人","狂人"];//職業(文字)
let jobs_setu=//その職業の説明
["村人側の役職です。\n特殊能力などはありません。\n手元にある情報を元に人狼は誰か推理しましょう。",
"人狼側の役職です。\n夜のターンで、誰か一人を襲撃して殺します。\n人狼は人間に、1対1では勝てるものの、相手が村人2名だと勝てません。\nよって、村人に人狼だと悟られないようにうまく立ち回り、\n人が残り一人になるまで夜のターンでこっそり人を殺していきましょう",
"村人側の役職です。\n夜のターンで、一人占って人狼かどうかを知ることができます。\n人狼か、そうでないかしか占えないので、\n占い先が役職持ち(狂人や騎士)であっても、村人としかわかりません。",
"村人側の役職です。\n夜のターンで、誰か一人を人狼の襲撃から守ることができます。\n狩人が守っている人を人狼が襲撃した場合、襲撃は失敗し、翌日犠牲者は発生しません。",
"人狼側の役職です。\n素性は村人ですが、人狼に加担する人です。\n人狼サイドが勝利することで、自分が死んでも狂人も勝利となります。\n占い師に占われても村人と判断されます。だれが人狼なのかを知ることはできません。"];
let all_memb_ronu=new Array();//ありとあらゆるルームに所属する人の情報とどこのルームに入ってるかが入ってる:memb_ronu
let all_name=new Array();//全員の名前だけの入れる:string
let rooms=new Array();//ルームシステムうまくいく保証がなさすぎてやばい:room
let tohyo_logs=new Array();


/*** この辺はスタートから一連の処理 ***/

function start(memb_name,room_name,msg)//メンバーの名前変数,スタートのとこのmsg
{
    let job=set_jobs(memb_name.length);//ここで職業の数、種類を決める
    let job_names=new Array();
    for(let i=0;i<job.length;i++)
    {
        job_names.push(jobs[job[i]]);
    }
    let this_room=make_game(memb_name,job,room_name,msg);;//ゲーム(ルーム？)を作成&ルームをもらってきてる、わかりづらいけど...
    /** これは、テスト以外なら消して、初期化でやること **/
    for(let i=0;i<this_room.memb_info.length;i++)
    {
        /*
        if(this_room.memb_info[i].each_name!=="たむら")
        {
            */
            this_room.memb_info[i].compreat=1;//初期化で1にしてるので、俺以外を0にする。←ここを初期化で全部やる
        //}
    }
    logs(this_room.msg,"では、"+memb_name.join("さん、")+"さんの"+memb_name.length
    +"人でゲーム:「"+room_name+"」を始めます。\n全員人狼botとのDMを開き、2分以内に「st」と言ってください\n編成は、「"+job_names.join("、")+"」です");//はじめまっせーって
    for (let i=0; i<job.length;i++)
    {
        tohyo_logs[this_room.memb_info[0].room_numb]+=this_room.memb_info[i].each_name+"＝"+jobs[job[i]]+"、"+i;
    }
    tohyo_logs[this_room.memb_info[0].room_numb]+="\n初夜：   "
    let time=24;//2分ぐらい待たせるつもり
    var timeout_id=
    setTimeout(koredo.bind(this,0,this_room,time,timeout_id,0),5000);//5秒＊time秒まつ、5秒毎に、投票とかが終わったか確認
    //ゲーム開始！
    return;
}

//最初の夜は占い師だけなんかさせるので特殊...
function first_yoru(this_room)//ルーム
{
    logs(this_room.msg,"最初の夜が来ました\n書き込みをやめてください。占い師の人は、人狼botとのDMで3分以内に「jn(選んだ人の数字)」と言って誰か一人占ってください。");//アナウンス
    let targets=new Array();//占う対象とかを入れる配列
    for(let num=0;num<this_room.memb_info.length;num++)
    {
         targets.push((num+1) + ":"+this_room.memb_info[num].each_name);//数字：名前を入れてる
    }
    for(let i=0;i<this_room.memb_info.length;i++)//メンバーに夜のアナウンス
    {
        if(this_room.memb_info[i].each_jobs_numb===2)//
        {
            /** ここテスト以外だったらif文と、else、elseの中身消す **/
            /*
            if(this_room.memb_info[i].each_name==="たむら")
            {
            */
                this_room.memb_info[i].compreat=2; //占い師だったら、夜の動きをしてねっていう2に
            /*}
            else
            {
                this_room.memb_info[i].compreat=0;
            }
            */
            this_room.memb_info[i].msg_dm.send("夜になりました。\n占う人を選んで「jn(選んだ人の数字)」と言ってください。\n"+targets.join("\n"));//DMに誰殺す？って聞いてる
        }
        else //その他は全員！
        {
            //if(this_room.memb_info[i].each_name==="キタムラ")
            this_room.memb_info[i].compreat=0;//なんもすることないよーって
            this_room.memb_info[i].msg_dm.send("夜になりました\n"+"しばらくお待ちください、書き込みはやめましょう。");//DMにちょっと待っててねっていう
            
        }
    }
    let time=36;//3分ぐらい待つつもり
    var timeout_id=
    setTimeout(koredo.bind(this,0,this_room,time,timeout_id,1),5000);//5秒＊time秒まつ、5秒毎に、投票とかが終わったか確認
    return;
}

//誰々を占うっていうまでまつ

//初めての朝なので、アナウンスが特殊
function first_asa(this_room)//ルーム
{
    //なんとなく演出っぽくしたくて分けてますが、別に待ち時間がないので特に意味ないです。
    //ここで、犠牲者がいるのか、いるとしたら誰かの判定＆告知(？)です。
    let taisyos=new Array();//投票の対象者配列の元
    for(let i=0;i<this_room.memb_info.length;i++)
    {
        /** テストでなければif文消す **/
        /*
         if(this_room.memb_info[i].each_name==="たむら")
        {
            */
            this_room.memb_info[i].compreat=3;//投票した？
        //}
        /** テストでなければこれは-1に **/
        this_room.memb_info[i].tohyo=-1;
        taisyos.push((i+1)+":"+this_room.memb_info[i].each_name);//番号:名前,の配列を作る
    }
    logs(this_room.msg,"朝になりました。どうやら、この村には狼が潜んでいるようです。\n話し合いの後、人狼だと思う人一人に人狼botとのDMで、「jt(選んだ人の数字)」と言って投票してください。一番票が集まった人は吊るされます。\n投票する時間も含めて、話し合いの時間は7分30秒です。");//中途半端な時間...
    for(let i=0;i<this_room.memb_info.length;i++)//全員分のDMに、投票してね。っていう
    {
        this_room.memb_info[i].msg_dm.send("朝になりました\n話し合いが終わったら、投票する人を選んで「jt(選んだ人の数字)」と言ってください。\n一番投票数の多かった人は吊るされます。\n"+taisyos.join("\n"));//言ってる
    }
    let time=90;//5分ぐらい待つんやで
    var timeout_id=
    setTimeout(koredo.bind(this,0,this_room,time,timeout_id,2),5000);//5*time秒待つ的な
    return;
}

//で、いったん全員からDMが送られるのを待ちます。(koredo関数で)

//普通の夜の関数、そのまんま
function start_yoru(this_room)//ルーム
{
    logs(this_room.msg,"夜が来ました\n書き込みをやめてください。\n人狼などの特殊な役割の人は人狼botとのDMで3分以内に、「jn(選んだ人の数字)」のように言ってください。");
    let targets=new Array();//メンバーと数字、対象みたいな
    for(let num=0;num<this_room.memb_info.length;num++)
    {
        targets.push((num+1) + ":"+this_room.memb_info[num].each_name);//中身を入れてる
    }
    for(let i=0;i<this_room.memb_info.length;i++)//特別な役割を持ってたらやることやってな変数を1に
    {
        if(this_room.memb_info[i].each_jobs_numb===0)//平民かどうか
        {
            /** テストじゃなきゃこのif文も消す **/
            /*
            if(this_room.memb_info[i].each_name==="たむら")
            {
                */
                this_room.memb_info[i].compreat=0;//やることない
            //}
            this_room.memb_info[i].msg_dm.send("しばらくお待ちください。");//DMにちょっと待っててねっていう
            
        }
        else if(this_room.memb_info[i].each_jobs_numb===1)//人狼なら
        {
            /** テストじゃなきゃこのif文も消す **/
            /*
            if(this_room.memb_info[i].each_name==="たむら")
            {
                */
                this_room.memb_info[i].compreat=2; //夜のアレしてねってやつ
            /*}
            else
            {
                this_room.memb_info[i].compreat=0;
            }
              */
            this_room.memb_info[i].msg_dm.send("夜になりました\n襲撃する人を「jn(選んだ人の数字)」のように言って選んでください\n"+targets.join("\n"));//DMに誰殺す？って聞いてる
        }
        else if(this_room.memb_info[i].each_jobs_numb===2)//占い師なら
        {
            /** テストじゃなきゃこのif文も消す **/
            /*if(this_room.memb_info[i].each_name==="たむら")
            {
                */
                this_room.memb_info[i].compreat=2; //占ってねー
            /*}
            else
            {
                this_room.memb_info[i].compreat=0; 
            }
            */
            this_room.memb_info[i].msg_dm.send("夜になりました\n占う人を「jn(選んだ人の数字)」のように言って選んでください\n"+targets.join("\n"));//DMに誰占う？って聞いてる
        }
        else if(this_room.memb_info[i].each_jobs_numb===3)//騎士ならば
        {
            /** テストじゃなきゃこのif文も消す **/
            /*
            if(this_room.memb_info[i].each_name==="たむら")
            {
                */
                this_room.memb_info[i].compreat=2; //誰を守るか選んどいてぇ〜って
            /*}
            else
            {
                this_room.memb_info[i].compreat=0; 
            }*/
            this_room.memb_info[i].msg_dm.send("夜になりました\n守る人を「jn(選んだ人の数字)」のように言って選んでください\n"+targets.join("\n"));//DMに誰守る？って聞いてる
        }}
    let time=36;//2分ぐらい待つつもり
    var timeout_id=
    setTimeout(koredo.bind(this,0,this_room,time,timeout_id,4),5000);
    //秒数を入れれば、三回その秒数待ってくれる関数。
}
//で、また人狼とか占い師とかから回答が来るのを待ちます。

//朝の処理
function asa(this_room)//ルーム
{
    //なんとなく演出っぽくしたくて分けてますが、別に待ち時間がないので特に意味ないです。
    logs(this_room.msg,"朝になりました。\n今日の犠牲者は...");
    //ここで、犠牲者がいるのか、いるとしたら誰かの判定＆告知(？)です。
    if(this_room.killed===this_room.saved)//人狼が襲った人を騎士が守ってるか
    {
        logs(this_room.msg,"いません。");//守ってたら
    }
    else
    {
        logs(this_room.msg,this_room.memb_info[parseInt(this_room.killed, 10)].each_name+"さんです。");//死んじゃった...って
        if(Death_hante(this_room,this_room.killed)===false)//一人殺す＆ゲームが終わるのかの判定
        {
            finish(this_room);
            return;//もし、人狼の勝ちになったらここで終了します。
        }
    }
    let taisyos=new Array();//投票の対象者配列の元
    for(let i=0;i<this_room.memb_info.length;i++)
    {
        /** テストじゃなきゃこのif文を消す **/
        /*
        if(this_room.memb_info[i].each_name==="たむら")
        {
            */
            this_room.memb_info[i].compreat=3;//投票した？
        //}
        //こいつも-1
        this_room.memb_info[i].tohyo=-1;
        taisyos.push((i+1)+":"+this_room.memb_info[i].each_name);//番号:名前,の配列を作る
    }
    logs(this_room.msg,"それでは、話し合いを始めてください。\n投票する人が決まったら人狼botとのDMで「jt(選んだ人数字)」と言ってください。");
    for(let i=0;i<this_room.memb_info.length;i++)
    {
        this_room.memb_info[i].msg_dm.send("朝になりました\n話し合いが終わったら、投票する人を「jt(選んだ人の数字)」選んでください。一番投票数の多かった人は処刑されます。\n投票する時間も含めて、話し合いの時間は7分30秒です。\n"+taisyos.join("\n"));
    }
    let time=90;//7.5分ぐらい待つんやで
    var timeout_id=
    setTimeout(koredo.bind(this,0,this_room,time,timeout_id,2),5000);//5秒*90回まつ
    return;
}

//で、全員の投票が終わるまで待ちます。

//投票の集計関数
function tohyo(this_room)//ルーム
{
    let mems=new Array;//メンバーの投票数が入ってるやつです
    let No_one=0;//こっちは、一番投票数が多い人を入れるやつ
    let No_tohyo=0;//これは、一番投票数が多い人の投票数
    for(let i=0;i<this_room.memb_info.length;i++)//多分もっとスマートな初期化法があるかな...
    {
        mems.push(0);
    }
    for(let i=0;i<this_room.memb_info.length;i++)//実際に集計
    {
        if(this_room.memb_info[i].touhyo>-1)
        {
            mems[this_room.memb_info[i].touhyo]+=1;//集計
            tohyo_logs[this_room.memb_info[0].room_numb]+=this_room.memb_info[i].touhyo+"      ";
            if(No_tohyo<mems[this_room.memb_info[i].touhyo])//ランクのやつを上手い具合にしてる
            {
                No_one=this_room.memb_info[i].touhyo;//なんばーわん
                No_tohyo=mems[this_room.memb_info[i].touhyo];//なんばーわんの投票数
            }   
            this_room.memb_info[i].tohyo=-1;//ここでも-1にしてるのか...無駄だな
        }
    }//同数だった場合？知らないよそんなの(まぁ調べてそこまで厳正なルールなさそうだったから別にいいでしょう)
    logs(this_room.msg,"今日吊るされたのは...");
    logs(this_room.msg,this_room.memb_info[No_one].each_name+"さんです。");
    if(Death_hante(this_room,No_one)===true)
    {
        tohyo_logs[this_room.memb_info[0].room_numb]+="\n"+(this_room.turn+1)+"夜：　";
        start_yoru(this_room);//ゲームが終わらないなら、また夜に戻ります。
    }
    else
    {
        finish(this_room);//終わらせる〜
    }
    return;
}
//終了したときの処理はDeath関数に任せてる


/*** 何秒待つ系の関数 ***/

//5秒ごとに投票とかしたか判定をtime回繰り返し、time回に近づくと、終了するよって警告してくれる関数
//for文だとうまく行かないので、自分何回かを呼ぶ感じに
function koredo(num,this_room,time,id,next_num)//iみたいな感じ何回繰り返したか,ルーム,何回繰り返すか,次にどの関数を実行するか(数値)
{
    let boolean=iscompret(this_room);//ここで全員投票したかとかを判定
    if(boolean.length===0)//全員終わったなら
    {
        next_func(this_room,next_num);//次の関数を実行
        clearTimeout(id); //念のため、待つ関数をクリア
        return;
    }
    else if(this_room.isfin===1)//finish ルーム名で強制的に終了された時
    {
        finish(this_room);
        return;
    }
    else
    {
        if(num===time)//もし、time回待ったなら、終了させる。
        {
            if(this_room.memb_info[boolean[0]].compreat===3&&boolean.length<=this_room.memb_info.length)//投票の場合、数が足りなくても強制
            {
                next_func(this_room,next_num);//次の関数を実行
                clearTimeout(id); //念のため、待つ関数をクリア
                return;
            }
            else
            {
                finish(this_room);//終わらせる関数
                clearTimeout(id); //一応ね、クリア
                return;
            }
        }
        else
        {
            if((Math.round(time/10)*6)===num||(Math.round(time/10)*9)===num||time-2===num)//6割、9割、最後の2回で警告
            {
                if(this_room.memb_info[boolean[0]].compreat===1)//一番最初の時だけは、DMわかんないから、game_createって言われたとこに、できてない人を書く
                {
                    let taget=[];//ターゲットではないな
                    for(let i=0;i<boolean.length;i++)
                    {
                        taget.push(this_room.memb_info[boolean[i]].each_name);
                    }
                    logs(this_room.msg,taget.join("さん、")+"さんが、まだ回答を送っていません。");//誰が送ってないか   
                    logs(this_room.msg,"あと、"+(5*(time-(num)))+"秒以内に必要な回答が揃わない場合ゲーム「"+this_room.name+"」は終了となります。");//警告文
                }
                else if(next_num===2)//強制集計をつけてしまったせいで分ける必要が...
                {
                    logs(this_room.msg,"あと、"+(5*(time-(num)))+"秒以内に必要な回答が揃わない場合、回答されたものだけで集計します。");//警告文
                    for(let i=0;i<boolean.length;i++)
                    {
                        logs(this_room.memb_info[boolean[i]].msg_dm,"まだあなたは回答を送っていません。");//DMへ警告文    
                    }
                }
                else
                {
                    logs(this_room.msg,"あと、"+(5*(time-(num)))+"秒以内に必要な回答が揃わない場合ゲーム「"+this_room.name+"」は終了となります。");//警告文
                    for(let i=0;i<boolean.length;i++)
                    {
                        logs(this_room.memb_info[boolean[i]].msg_dm,"まだあなたは回答を送っていません。");//DMへの警告文    
                    }
                }
            }
            num++;//何回繰り返したかを足してる
            var time_id=//一応クリアするためにidを所得
            setTimeout(koredo.bind(this,num,this_room,time,time_id,next_num),5000);//また自分を呼び出してる
            return;
        }
    }
}

//やるべきことは全部終わったかい？関数
function iscompret(this_room)//どこのルームか,次がどれかによって値が変わるため
{
    let comps=[];
    for(let num=0;num<this_room.memb_info.length;num++)//メンバー回繰り返す
    {
        if(this_room.memb_info[num].compreat!==0)//compreatが0(終わった状態多分)になってなかった人の番号を配列に入れてる
        {  
            comps.push(num);
        }
    }
    return comps;//で、配列を返す
}

//待ちが終わって次何すればええんってやつすわ
function next_func(this_room,fun_num)
{
    if(fun_num===0)//初夜に送る
    {
        first_yoru(this_room)
    }
    else if(fun_num===1)//初朝に送る
    {
        first_asa(this_room);
    }
    else if(fun_num===2)//投票に送る
    {
        tohyo(this_room);
    }
    else if(fun_num===3)//普通の夜
    {
        start_yoru(this_room);//使ってない気が...
    }
    else if(fun_num===4)//普通のあさに送る
    {
        asa(this_room);
    }
}


/*** 雑多(？)な関数達 ***/

//ルームの作成関数
function make_game(memb_name,jobs,room_name,msg)//メンバーの名前配列,職業の配列(数値),ルームの名前,msgスタートのmsg(意味わかってない)
{
    var new_room=new room();//ルームの元
    let info=new Array();//情報の元
    let room_numb=0;//ルームの番号
    if(rooms.length!==0)//0なら0、それ以外なら、+1(length出しやってない)
    {
        room_numb=rooms.length;
    }
    tohyo_logs.push("投票ログ\n　　　");
    for(let i=0; i<memb_name.length;i++)//メンバーの情報入力
    {
        info.push(make_info(memb_name[i],jobs,room_name,room_numb,msg,i));//入れる
    }
    new_room.name=room_name;//ルームの名前
    new_room.memb_info=info;//メンバーの情報
    new_room.msg=msg;//スタートしたとこのmsg
    new_room.killed=-1;//ルームの名前
    new_room.saved=-1;//メンバーの情報
    new_room.isfin=0;//fisnishするかみたいな
    new_room.turn=0;
    rooms.push(new_room);//ルームを入れるで
    return rooms[room_numb];//ややっこしいけどルームを返す
}
//情報入れる関数
function make_info(name,jobs,room_name,room_numb,msg,i)//名前,職業(数値),ルームの名前,ルームのナンバー,dmのmsgなんだけど初期化のためにスタート位置のmsgを入れてまう
{
    let jobs_num;//職業配列の長さを入れていい感じにランダムに取り出してんのかな？
    let job_num;//職業の番号
    /** テストの時、職業を固定するため **/
    /*
    if(name==="キタムラ")
    {
        job_num=1;//ここでなんの職業にするか。その番号を初期化のやつから消しとく   
    }
    else
    {
        */
        jobs_num=rand_seis(jobs);
        //jobs_num=0;
        job_num=jobs[jobs_num]
        jobs.splice(jobs_num,1);//自分の職業を削除してかぶりがないように
    //}

    //console.log(job_num,name);
    
    let info=new each_info();//新しい情報
    info.each_name=name;//名前
    info.compreat=1;//やることしました？な変数だよ
    info.msg_dm=msg;//あとでDMのmsgが入りますぜよ
    info.touhyo=-1;//投票する人の番号
    info.each_jobs_numb=job_num;//職業の番号を入れてる

    all_name.push(name);//全員分の名前の入ってる配列へ名前を入れる

    let new_memb_ronu=new memb_ronu();//全員の情報その他の配列の元
    new_memb_ronu.info=info;//情報を入れる上野を流用
    new_memb_ronu.numb_inroom=i;//ルーム内で自分が何番目か
    new_memb_ronu.room_name=room_name;//ルームの名前を入れてる
    new_memb_ronu.room_numb=room_numb;//ルームの番号を入れてる
    new_memb_ronu.each_jobs_numb=job_num;//ルームの番号を入れてる
    all_memb_ronu.push(new_memb_ronu);//元を配列に
    return info;//returnで返してルームに情報を入れてる(確か)
}
//ランダムに職業配列の中から職業を決める関数
function rand_seis(array)//職業の配列(数値)
{
    return Math.floor(Math.random() * array.length);//ランダムで取り出せるらしいっすね
}
//職業を人数に応じて作りまっせ関数
function set_jobs(memb_leng)//メンバーの人数
{
    let jobs_arry=[1,2,3];//初期化→テスト以外は[1,2,3]
    for(let i=0;i<memb_leng-3;i++)//ここ-3が正しい狂人をしたいとき様
    {
        if(i===1)
        {
            jobs_arry.push(4);//とりあえず人数に合わせて平民だけを追加
        }
        else
        {
            jobs_arry.push(0);//とりあえず人数に合わせて平民だけを追加
        }
    }
    return jobs_arry;//で、返すと
}
//誰か一人が死んじゃったときの関数、結構重要。
function Death(this_room,num)//ルームの番号,何番目のプレイヤーか
{
    let where_all=0;
    let room_leng=0;
    for(let i=0;i<rooms.length;i++)
    {
        if(this_room.name===rooms[i].name)//thisroomが何番目のルームか探す
        {
            room_leng=i;
            break;
        }   
    }
    for(let i=0;i<room_leng;i++)
    {
        where_all+=rooms[i].memb_info.length;
    }
    where_all+=num;
    //console.log("ああー",all_memb_ronu,where_all,num);
    //console.log("悪い",this_room.memb_info);
    for(let i=0;i<(this_room.memb_info.length)-num;i++)
    {
      //  console.log("一応ねー",this_room.memb_info.length-num)
        all_memb_ronu[where_all+i].numb_inroom--;
    }
    all_name.splice(where_all,1);
    all_memb_ronu.splice(where_all,1);
    this_room.memb_info.splice(num,1);//食い違いが起こって変なとこ消してる
    return;
}
//死んじゃった時でゲームが終了するか判定を行うやつ
function Death_hante(this_room,num)//ルームの番号,何番目のプレイヤーか
{
    this_room.memb_info[num].msg_dm.send("あなたは死にました...");
    if(this_room.memb_info[num].each_jobs_numb===1)
    {
        logs(this_room.msg,"村人側の勝ちです！");
        Death(this_room,num);
        return false;
    }
    Death(this_room,num);
    if(isfin(this_room))
    {
        logs(this_room.msg,"人狼側の勝ちです！");
        return false;
    }
    return true;
}

//終了判定関数
function isfin(this_room)//ルーム
    {
        if(this_room.memb_info.length<3)
        {
            return true;//人数が2人より少なくなったので人狼の勝ち
        }
        return false;
    }
//コンソールとslackに書く関数
function logs(msg,message)
{
    console.log(message);
    msg.send(message)
}
//強制終了関数
function finish(this_room)
{
    let msg=this_room.msg;
    let name=this_room.name;
    logs(tohyo_logs[this_room.msg,this_room.memb_info[0].room_numb]);
    //console.log(this_room.memb_info,all_name);
    let startpos=all_memb_ronu[all_name.indexOf(this_room.memb_info[0].each_name)].room_numb;
    let membs=this_room.memb_info.length;
    for(let i=0;i<membs;i++)
    {
        Death(this_room,0);
    }
    let where_all=0;
    for(let i=0;i<startpos;i++)
    {
        where_all+=rooms[i].memb_info.length;
    }
    //console.log("ああー",all_memb_ronu,where_all,num);
    //console.log("悪い",this_room.memb_info);
    for(let i=0;i<all_memb_ronu.length-where_all;i++)
    {
      //  console.log("一応ねー",this_room.memb_info.length-num)
        all_memb_ronu[where_all+i].room_numb--;
    }
    rooms.splice(startpos,1);
    logs(msg,"ゲーム「"+name+"」は終了しました。");
}


/***この辺はinputというかなんか言われた時の関数***/

//ゲームを既にやっているか関数
function isplay(user_name)//名前
{
    return all_name.some(value => value === user_name);//全員の名前だけの配列に含まれるか
}
//役割はなんなのか一番最初に言うやつです
function what_job(user_name)//名前
{
    let who=all_name.indexOf(user_name);//何番目に自分の名前が含まれるか
    var job=all_memb_ronu[who].info.each_jobs_numb;//頑張ってルームから取り出してる
    return job;//数値型で返す
}
//人狼が対象を設定するときの内部処理？的なやつです
function set_killed(user_name,num)//人狼の名前(これいるかな...),指定した番号
{
    let this_room=get_room_byna(user_name);
    let who=all_name.indexOf(user_name);//ユーザーが何番目か
    this_room.killed=num-1;//頑張ってルーム探したりして襲う対象を設定
    this_room.memb_info[all_memb_ronu[who].numb_inroom].compreat=0;//人狼は指定し終わりましたよ
}
function set_saved(user_name,num)//人狼の名前(これいるかな...),指定した番号
{
    let this_room=get_room_byna(user_name);
    let who=all_name.indexOf(user_name);//ユーザーが何番目か
    this_room.saved=num-1;//頑張ってルーム探したりして襲う対象を設定
    this_room.memb_info[all_memb_ronu[who].numb_inroom].compreat=0;//人狼は指定し終わりましたよ
}
//占い師の占い関数
function get_uranai(user_name,num)//人狼の名前,指定した番号
{
    let this_room=get_room_byna(user_name);
    let who=all_name.indexOf(user_name);//ユーザーが何番目か
    this_room.memb_info[all_memb_ronu[who].numb_inroom].compreat=0;//占い終わりー
    return this_room.memb_info[num].each_jobs_numb;//占う相手の職業を数値で返す。
}
//投票するときの内部処理(？)関数
function set_tohyo(user_name,num)//投票する人の名前,指定した番号
{
    let this_room=get_room_byna(user_name);
    let who=all_name.indexOf(user_name);//ユーザーが何番目か
    this_room.memb_info[all_memb_ronu[who].numb_inroom].touhyo=num-1;//投票の番号を頑張って指定
    this_room.memb_info[all_memb_ronu[who].numb_inroom].compreat=0; //投票終わりましたよ！
}
//スタートから、DMをもらってるとこ
function start_go(user_name,msg)//ユーザーの名前と、msgをもらってる
{
    let this_room=get_room_byna(user_name);
    let who=all_name.indexOf(user_name);//ユーザーが何番目か
    this_room.memb_info[all_memb_ronu[who].numb_inroom].compreat=0;//なるほどDMのmsgいただきました！って感じ
    this_room.memb_info[all_memb_ronu[who].numb_inroom].msg_dm=msg;//msgを設定
}
function get_room_byna(user_name)
{
    let who=all_name.indexOf(user_name);//ユーザーが何番目か
    let this_room=rooms[all_memb_ronu[who].room_numb];
    return this_room;
}
//例外処理系、ルーム作るのはまた別、夜、投票専用で村人の時のやつとかはここにはない
function reiga_syo_yoru_tohyo(msg,user_name,name_num,comp_num)//msg,ユーザーの名前,設定した番号,今夜なのかとか
{
    if(isplay(user_name))//ゲームに参加しているか
    {
        let who=all_name.indexOf(user_name);
        if(comp_num===rooms[all_memb_ronu[who].room_numb].memb_info[all_memb_ronu[who].numb_inroom].compreat)//夜のコマンドをもらったとしたら今は夜か
        {
            if(comp_num===2&&(what_job(user_name)===0||what_job(user_name)===4))//夜かつ村人か狂人
            {
                logs(msg,"あなたの役職では夜にやることはありません、しばらくお待ちください。");   
                return false;
            }
            if(isFinite(name_num)&&name_num%1==0)//小数点なしの数字か
            {
                if(get_room_byna(user_name).memb_info.length>=name_num&&0<name_num&&name_num>0)//範囲内の数字かどうか
                {
                    return true;
                }
                else
                {
                    logs(msg,"範囲内の数字を選択してください。");   
                    return false;
                }
                
            }
            else
            {
                logs(msg,"小数点などのない数字を半角英数で入力して選択してください。");
                return false;
            }
        }
        else
        {
            /*
            if(comp_num===3&&(what_job(user_name)===0||what_job(user_name)===4))//投票中かつ村人か狂人
            {
                logs(msg,"しばらくお待ちください。");//ちょっと待ってね
                return false;
            }
        */
            if(rooms[all_memb_ronu[who].room_numb].memb_info[all_memb_ronu[who].numb_inroom].compreat===0)
            {
                logs(msg,"しばらくお待ちください。");//投票終わった人とか、自分だけ、夜に選択し忘れて時とか
            }
            else
            {
                logs(msg,"今はその時間ではありません。");//人狼とかが投票中にnightか夜にtohyoがきたらこれ
                return false;
            }
        }    
    }else
    {
        logs(msg,"参加しているゲームがありません。");
        return false;
    }
}
//jinrou_bot startって言われた時用の例外処理系
function reiga_syo_start(msg,user_name)//msg,ユーザーの名前,設定した番号,今夜なのかとか
{
    if(isplay(user_name))
    {
        let who=all_name.indexOf(user_name);
        if(rooms[all_memb_ronu[who].room_numb].memb_info[all_memb_ronu[who].numb_inroom].compreat===1)//スタートの回答を求めているのか
        {
            return true;        
        }
        else
        {
            logs(msg,"あなたはもうすでにゲームに参加しています。");//人狼とかが投票中にnightか夜にtohyoがきたらこれ
            return false;
        }    
    }
    else
    {
        let message="誘われているゲームがありません。";
        logs(msg,message);
        return false;
    }
}
function reiga_syo_finish(msg,room_name,user_name)//msg,ユーザーの名前,設定した番号,今夜なのかとか
{
    if(isplay(user_name))
    {
        let who=all_name.indexOf(user_name);
        if(all_memb_ronu[who].room_name===room_name)
        {
            return true;
        }
    }
    logs(msg,"この処理は、ゲームに参加している(startといった人)人しか行えません。死んでしまった場合も同じです。");
    return false;
}
//gamestartって言われた時のやつ
function reiga_syo_game_start(msg,memb_name,room_name)//msg,ユーザーの名前,設定した番号,今夜なのかとか
{
    if(memb_name.length<3)
    {
        logs(msg,"メンバーが少なすぎます。最低三名いないとプレイできません。");
        return false;
    }
    else if(memb_name.length>7)
    {
        logs(msg,"(そこまで人狼に詳しくない作者の考える)推奨プレイ人数は、三人以上七名以下です。\nこのままだと、編成が「人狼×１、占い師×１、狩人×１、狂人×１、村人×"+(memb_name.length-4)+"」となります。\nこれでも良ければこのままお楽しみください。\nもし、メンバーを分ける場合は、「人狼bot finish(ゲームの名前)」のように言って、このゲームを終了してからにしてください。")
    }
    for(let i=0;i<memb_name.length;i++)
    {
        let new_membs=memb_name.slice(0, memb_name.length);
        new_membs.splice(i,1);
        if(new_membs.some(value => value === memb_name[i]))
        {
            logs(msg,memb_name[i]+"さんが、二人います。メンバーを変えてもう一度お試しください。");
            return false;
        }
        if(all_name.some(value => value === memb_name[i]))
        {
            logs(msg,memb_name[i]+"さんが、すでに他のゲームに参加しています。複数のゲームに同時に参加することはできません。\n"+memb_name[i]+"さんの参加しているゲームが終わるまで待つか、\n"+memb_name[i]+"さんを抜いてもう一度お試しください。");
            return false;
        }
    }
    for(let i=0;i<rooms.length;i++)
    {
        if(rooms[i].name===room_name)
        {
            logs(msg,"ルーム名「"+room_name+"」はすでに別のゲームで使われています。名前を変えるか、少し待ってからもう一度お試しください。");
            return false;
        }
    }
    return true;
}
//ゲームスタートする時の関数をスタートできるか判定をする関数を実行する関数(？)
function command_gamestart(msg,memb_name,room_str)
{
    if(reiga_syo_game_start(msg,memb_name,room_str))
    {
        start(memb_name,room_str,msg);
    }
    return;
}
function command_start(msg,user_name)
{
    if(reiga_syo_start(msg,user_name))
    {    
        start_go(user_name,msg);
        let myjob=what_job(user_name);
        logs(msg,"あなたは"+jobs[myjob]+"です。");
        logs(msg,jobs_setu[myjob]);
    }
    return;
  }
function command_night(msg,user_name,name_num)
{
    if(reiga_syo_yoru_tohyo(msg,user_name,name_num,2))
    {
        if(jobs[what_job(user_name)]==="人狼")
        {
            set_killed(user_name,name_num);
            let message="対象を設定しました:"+all_name[name_num-1];
            msg.send(message);
        }
        else if(jobs[what_job(user_name)]==="占い師")
        {
            let message=all_name[name_num-1]+"さんは...";
            msg.send(message);
            if(get_uranai(user_name,name_num-1)===1)//あれみたいです、騎士とか狂人とかが出ても村人って出るみたいです。
            {
                message="人狼です";
            }else
            {
                message="村人です";
            }
            msg.send(message);
        }
        else if(jobs[what_job(user_name)]==="狩人")
        {
            set_saved(user_name,name_num);
            let message="対象を設定しました:"+all_name[name_num-1];
            msg.send(message);
        }
        else
        {
            let message="あなたの役職では夜にすることはありません。";
            msg.send(message);
        }
    }
    return;
}
function command_tohyo(msg,user_name,name_num)
{
    if(reiga_syo_yoru_tohyo(msg,user_name,name_num,3))
    {
        if(isplay(user_name))
        {
            if(name_num>0&&name_num%1==0)
            {
                set_tohyo(user_name,name_num);
                let message="対象を設定しました:"+all_name[name_num-1];
                msg.send(message);
            }
        }
        else
        {
            let message="参加しているゲームがありません。";
            msg.send(message);
        }  
    }
    return;
}
function command_finish(msg,name_room,user_name)
{
    if(reiga_syo_finish(msg,name_room,user_name))
    {
        let this_room=get_room_byna(user_name);
        this_room.isfin=1;//何回か繰り返してやるやつで判定するために4それだけだな
        logs(msg,"終了まで時間がかかる可能性があります。\nまた、完全に終了しないと、別のゲームに参加できません。ご了承ください。");
    }
    return;
}
function command_help(msg)
{
    msg.send(help_message);
}


/***この辺は反応する系です***/

module.exports = robot => {
    //テスト用入力のゲームスタートgamestartっていうだけで勝手にスタートする
    /*
    robot.hear(/game_create/i, msg => 
    {
        var memb_strs = ["user_1","user_2","user_3","user_4","キタムラ"];//メンバー名前
        var room_str = "への";//ルームの名前
        console.log(msg);
        start(memb_strs,room_str,msg);
    });
    */
    //本命「jinrou_bot gamestart (メンバーの名前),(メンバーの名前),(メンバーの名前)... (ルームの名前)」で起動
    robot.respond(/game_create (.+) (.+)/i, msg => 
    {
        var memb_strs = msg.match[1].trim();//メンバー名前
        let memb_name=memb_strs.split(",");//メンバーの名前を配列に
        var room_str = msg.match[2].trim();//ルームの名前
        command_gamestart(msg,memb_name,room_str);//ここで例外処理その他してstart
    });
    robot.hear(/st/i, msg => 
    {
        let user_name=msg.message.user.slack.profile.display_name;
        command_start(msg,user_name);
    });
    robot.hear(/jn(.+)/i,msg=>
    {
        let user_name=msg.message.user.slack.profile.display_name;
        let name_num=msg.match[1].trim();
        command_night(msg,user_name,name_num);
    })
    robot.hear(/jt(.+)/i,msg=>
    {
        let user_name=msg.message.user.slack.profile.display_name;
        let name_num=msg.match[1].trim();
        command_tohyo(msg,user_name,name_num);
    })
    robot.respond(/finish (.+)/i,msg=>
    {
        let user_name=msg.message.user.slack.profile.display_name;
        let name_room=msg.match[1].trim();
        command_finish(msg,name_room,user_name);
    })
    robot.hear(/help/i,msg=>
    {
        command_help(msg);
    })
};
