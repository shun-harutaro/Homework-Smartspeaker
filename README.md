# Homework-Smartspeaker
## about
### スマートスピーカーに話しかけて、TimeTreeに予定を追加できる。
## Use Service
- IFTTT
    - GoogleAssistant or Alexa
    - Webhooks
- GoogleCloudPlatform
    - Functions
    - Firestore
- Node.js
    - axios
- TimeTree
    - TimeTreeAPI
## Structure
- addwork
    - イベントの作成
    - FirestoreにイベントIDを保存
- submitted
    - Firestoreの読み込み
    - イベントの更新
