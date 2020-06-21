/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
var axios = require('axios');
var TIMETREE_PERSONAL_TOKEN = timetreetoken;
var TIMETREE_CALENDAR_ID = timetreeid;

var createEvent = () => {
    axios.post(`calendars/${TIMETREE_CALENDAR_ID}/events`, JSON.stringify(params))
    .then(response => console.log(response))
};
function dateMake(limit) {
    let dt = new Date();
    let year  = dt.getFullYear();
    let month = dt.getMonth()+1;
    let day   = dt.getDate();
    if (limit<=day){
        month+=1;
        if (month>12){
            year+=1
        }
    }
    dt = new Date(year, month-1, limit, 0, 0, 0, 000);
}

exports.addwork = (req, res) => {
    let title = req.body.title;
    let limit = req.body.limit

    const axios = axiosBase.create({
        baseURL: 'https://timetreeapis.com/',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.timetree.v1+json',
          'Authorization': `Bearer ${TIMETREE_PERSONAL_TOKEN}`
        },
        responseType: 'json'
    });

    date = dateMake(limit);

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
                description: 'これはテストです',
            },
            relationships: {
                label: {
                    data: {
                        id: `${TIMETREE_CALENDAR_ID},7`,
                        type: "label"
                    }
                }
            }
        }
    };

    createEvent();
}