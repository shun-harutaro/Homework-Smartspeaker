'use strict';
/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
const axiosBase = require('axios');
// 環境変数(.env.yaml)
const TIMETREE_PERSONAL_TOKEN = process.env.timetreetoken; // パーソナルアクセストークン
const TIMETREE_CALENDAR_ID = process.env.timetreeid; // calendarid
exports.addwork = (req, res) => {
    /** 
    *webhockから受け取ったJSONを分ける。
    *@param {title} イベント名（課題名）
    *@param {limit} 締め切り（day）
     */
    let title = String(req.body.title);
    let limit = req.body.limit;
    
    // イベント作成関数
    const createEvent = () => {
        axios.post(`calendars/${TIMETREE_CALENDAR_ID}/events`, JSON.stringify(params))
        .then(response => console.log(response))
    };

    // limitを取得し適切な日付に変換(ISO8601)
    function dateMake(limit) {
        let dt = new Date(); //現在の時刻を取得(UTC)
        let year  = dt.getFullYear();
        let month = dt.getMonth()+1; //月は0始まり
        let day   = dt.getDate();
        // limitが実行時の日にちより前の場合monthを次の月にする
        if (limit<=day){
            month+=1;
            if (month>12){
                year+=1
            }
        };
        dt = new Date(year, month-1, limit, 0, 0, 0, 0);
        return dt; // iso8601で返す
    }

    const axios = axiosBase.create({
        baseURL: 'https://timetreeapis.com/', // クライアント
        headers: {
          'Content-Type': 'application/json', // データ形式
          'Accept': 'application/vnd.timetree.v1+json', //APIバージョン
          'Authorization': `Bearer ${TIMETREE_PERSONAL_TOKEN}` // パーソナルアクセストークンによる認証
        },
        responseType: 'json'
    });

    let date = dateMake(limit);

    // POST /calendars/:calendar_id/events のときのパラメーター
    // https://developers.timetreeapp.com/ja/docs/api#post-calendarscalendar_idevents
    let params = {
        data: {
            attributes: {
                category: 'schedule',
                title: title,
                all_day: true,
                start_at: date,
                start_timezone: 'UTC',
                end_at: date,
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
    createEvent();
    console.log(date);
    console.log(title);
}