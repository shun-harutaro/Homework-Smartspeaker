'use strict';
/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
const axiosBase = require('axios');
const Firestore = require('@google-cloud/firestore');
const { FieldPath } = require('@google-cloud/firestore');

// Firestoreの初期化
const db = new Firestore();

// 環境変数(.env.yaml)
const TIMETREE_PERSONAL_TOKEN = process.env.timetreetoken; // パーソナルアクセストークン
const TIMETREE_CALENDAR_ID = process.env.timetreeid; // calendarid

// propatyname
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

// axiospropaty
var timetree = axiosBase.create({
    baseURL: 'https://timetreeapis.com/', // クライアント
    headers: {
      'Content-Type': 'application/json', // データ形式
      'Accept': 'application/vnd.timetree.v1+json', //APIバージョン
      'Authorization': `Bearer ${TIMETREE_PERSONAL_TOKEN}` // パーソナルアクセストークンによる認証
    },
    responseType: 'json'
});

// make propaty name
const indexMake = (name) => {
    let initial = name.slice(0,1);
    if (initial==="英" || initial==="回") {
        let end = name.slice(-1)
        initial = end
    };
    return subjects[initial];
};

// getFirestore
const DB = (key) => {
    console.log(key)
    this.UseKey = key;
    const workRef = db.collection('timetree-i-19s').doc('subject');
    return workRef.get().then((doc) => {
        if (!doc.exists) {
            console.log('No such document!');
        } else {
            this.field = doc.data();
            console.log(this.field);
            this.eventID = this.field[this.UseKey];
            console.log(this.eventID);
            return this.eventID
        }
    }).catch(err => {
        console.log('Error getting document', err);
    })
};


const getTimeTree = (id) => {
    this.eventID = id;
    return timetree.get(`calendars/${TIMETREE_CALENDAR_ID}/events/${id}`)
        .then(response => {
            console.log(response)
            console.log(response.data.data.attributes.start_at)
            return response.data.data.attributes.start_at
        }).catch(error => console.log("イベントを取得できませんでした"+error))
};

// set prameter
const paramsMake = (date,name) => {
    console.log(date,name);
    // When POST /calendars/:calendar_id/events
    // https://developers.timetreeapp.com/ja/docs/api#post-calendarscalendar_idevents
    this.params = {
        data: {
            attributes: {
                category: 'schedule',
                title: name,
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
                        id: `${TIMETREE_CALENDAR_ID},1`, // label(submitted:#2ecc87）
                        type: "label"
                        }
                    }   
                }
            }
        };
    return this.params
};

// update event
const putTimeTree = (params,id) => {
    console.log(params,id);
    return timetree.put(`calendars/${TIMETREE_CALENDAR_ID}/events/${id}`, JSON.stringify(params))
    .then((response) => {
        console.log(response)
    }).catch((error) => {
        console.log("イベントを更新できませんでした"+error)
    })
};

exports.complete = (req, res) => {
    const title = req.body.title; //from webhook

    const doAsync = async(title) => {
        const getKey = await indexMake(title);
        const getID = await DB(getKey);
        const getDate = await getTimeTree(getID);
        const setParams = await paramsMake(getDate,title)
        const update = await putTimeTree(setParams,getID)
    }
    doAsync(title);
};