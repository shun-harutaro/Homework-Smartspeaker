'use strict';
/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
const axiosBase = require('axios');
const Firestore = require('@google-cloud/firestore');
const Promise = require('promise');

// Firestoreの初期化
const db = new Firestore();

// 環境変数(.env.yaml)
const TIMETREE_PERSONAL_TOKEN = process.env.timetreetoken; // パーソナルアクセストークン
const TIMETREE_CALENDAR_ID = process.env.timetreeid; // calendarid

const subjects = {
    "化":"chemistry",
    "デ":"digital",
    "工":"experiment",
    "現":"expression",
    "歴":"history",
    "国":"japanese",
    "カ":"katsu",
    "線":"math",
    "物":"physics",
    "プ":"programing",
    "読":"reading",
    "A":"track-a",
    "B":"track-b"
};

// limitを取得し適切な日付に変換(ISO8601)
const dateMake = (limit) => {
    let dt = new Date(); //現在の時刻を取得(UTC)
    let year  = dt.getFullYear();
    let month = dt.getMonth()+1; //月は0始まり
    let day   = dt.getDate();
    // limitが実行時の日にちより前の場合monthを次の月にする
    if (limit<day){
        month+=1;
        if (month>12){
            year+=1
        }
    };
    dt = new Date(year, month-1, limit, 0, 0, 0, 0);
    return dt; // iso8601で返す
}

var timetree = axiosBase.create({
    baseURL: 'https://timetreeapis.com/', // クライアント
    headers: {
      'Content-Type': 'application/json', // データ形式
      'Accept': 'application/vnd.timetree.v1+json', //APIバージョン
      'Authorization': `Bearer ${TIMETREE_PERSONAL_TOKEN}` // パーソナルアクセストークンによる認証
    },
    responseType: 'json'
});

exports.addwork = (req, res) => {
    /** 
    *webhockから受け取ったJSONを分ける。
    *@param {title} イベント名（課題名）
    *@param {limit} 締め切り（day）
     */
    const title = req.body.title;
    const limit = req.body.limit;
    const useparams = params;
    // POST /calendars/:calendar_id/events のときのパラメーター
    // https://developers.timetreeapp.com/ja/docs/api#post-calendarscalendar_idevents
    let params = {
        data: {
            attributes: {
                category: 'schedule',
                title: null,
                all_day: true,
                start_at: null,
                start_timezone: 'UTC',
                end_at: null,
                end_timezone: 'UTC',
                description: '',
            },
            relationships: {
                label: {
                    data: {
                        id: `${TIMETREE_CALENDAR_ID},6`, // ラベル（未提出:#e73b3b）
                        type: "label"
                    }
                }
            }
        }
    };

    // イベント作成関数
    const createEvent = (title,limit) => {
        var dateresult = new Promise(function(resolve){
            resolve(dateMake(limit))
        })
        dateresult.then((date) => {
            params.data.attributes.title=title;
            params.data.attributes.start_at=date;
            params.data.attributes.end_at=date;
        }).then(()=> {
        console.log(title,limit,params)
        timetree.post(`calendars/${TIMETREE_CALENDAR_ID}/events`, JSON.stringify(params))
        }).then((response) => {
                console.log(response)
                // DB保存
                let initial = title.slice(0,1);
                if (initial==="英" || initial==="回") {
                    let end = title.slice(-1)
                    initial = end
                };
                const subject = subjects[initial]
                const id = response.data.data.id
                console.log(subject)
                console.log(id)
                let setID = db.collection('timetree-i-19s').doc('subject');
                setID.update({[subject]: id})
                .then(() => {
                    console.log('Write succeeded!')
                });
            })
            .catch(error=>{
                console.log("イベントを作成できませんでした"+error)
            });
    };
    createEvent(title,limit);
}