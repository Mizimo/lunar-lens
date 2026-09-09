// Historical 1.2 report generator. Do not use to certify the rollback.
// Produce the release narrative only after the final runtime has passed native captures.
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {fileURLToPath} from 'node:url';import assert from 'node:assert/strict';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
assert.equal(JSON.parse(fs.readFileSync(path.join(root,'package.json'))).version,'1.2.0','Historical report generator: requires a 1.2.0 checkout');
const read=name=>JSON.parse(fs.readFileSync(path.join(root,'docs',name+'-validation.json'),'utf8'));
const d=read('dynamics'),b=read('behaviour'),songs=[read('blossoms-full'),read('isekai-full')],session=read('session'),ui=read('ui-callback'),kick=JSON.parse(fs.readFileSync(path.join(root,'docs/kick-timing-current.json'),'utf8'));
assert.equal(kick.matched,42);assert.equal(kick.totalLowEvents,42);assert.equal(kick.unmatchedLowEventTimes.length,0);
for(const report of [d,b,session,ui,kick,...songs])for(const [f,h] of Object.entries(report.runtimeHashes))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,f))).digest('hex'),h,'Report from another runtime: '+f);
assert.equal(b.version,'1.2.0');assert.equal(session.version,'1.2.0');
const songRows=songs.map(s=>`| ${s.sourceName} | ${s.durationSeconds.toFixed(2)} s | ${s.frames} | ${s.meanFrameMs.toFixed(2)} / ${s.p99FrameMs.toFixed(2)} ms | ${s.eventCounts.join(' / ')} |`).join('\n');
const text=`# 驗證紀錄 · 1.2.0

2026-09-09 · macOS · Max 9.1.4 arm64。定稿版本主 patch 重新載入後，依序完成底鼓時間測試、原創動態訊號、行為回歸、兩首全曲與操作／效果器測試。程式碼、原生 DSP、資料重播與實體硬體的證據分別說明。

## 底鼓與可見光幀時間

42 個已知時間的原創合成底鼓，以向下掃頻和短槌頭構成；後半加入持續低音與和聲。每次相隔 503 ms，避免固定對齊分析／繪圖時鐘。結果 ${kick.matched} / ${kick.expected} 個匹配，總共 ${kick.totalLowEvents} 個低頻事件，額外事件 ${kick.unmatchedLowEventTimes.length}。

| 起音至第一個可見光幀 | 時間 |
| --- | --- |
| 中位數 | ${kick.firstVisibleMs.median.toFixed(1)} ms |
| 95 百分位 | ${kick.firstVisibleMs.p95.toFixed(1)} ms |
| 最慢 | ${kick.firstVisibleMs.max.toFixed(1)} ms |

最亮幀的中位數 ${kick.brightestFrameMs.median.toFixed(1)} ms、95 百分位 ${kick.brightestFrameMs.p95.toFixed(1)} ms。這檢查的不只是事件計數，也檢查是否把亮起的重心延後到擴散尾部。

量測從已知音訊起點到 RGB 幀輸出；繪製後另外請求 sfplay~ 位置，收到回覆才寫入 trace。仍有音訊向量時間誤差，**不包含 DAC、螢幕刷新和 Launchpad USB／LED 延遲**，也不是商業錄音辨識率。[逐事件報告](kick-timing-current.json)。

本版低頻用 8 ms 快速 RMS、8 ms 速度平滑及即時越檻觸發；起音直接送出局部亮擊，33 ms 排程只接續尾跡。獨立 v8ui 網格與較慢的文字面板共用 Dict 傳輸，避免大型 JSON 訊息使主執行緒停頓。尾音反彈保護與新短擊補回條件見工程設計，所有錄音使用同一套規則。

## 每段起音、密度切換與力度

55 秒原創測試在 Max 實際播放。密集強擊最後一次在 15.8 秒，較小重音從 16.0 秒立即接上，持續 90 Hz 底層沒有中斷。生產引擎不讀這些時間；時間只供驗收比對。

| 測試 | 結果 |
| --- | --- |
| 持續 90 Hz 上疊加小重音 | ${d.knownEventGroups.heldAccents.matched} / ${d.knownEventGroups.heldAccents.expected} |
| 200 ms 間隔的密集強擊 | ${d.knownEventGroups.dense.matched} / ${d.knownEventGroups.dense.expected} |
| 緊接密集段的小重音 | ${d.knownEventGroups.afterDense.matched} / ${d.knownEventGroups.afterDense.expected} |
| 8 個音域各自起音 | ${d.perRegisterMatches.reduce((a,b)=>a+b)} / 8 |
| 緩慢低音漸強誤觸 | ${d.slowSwellFalseEvents.length} |
| 弱／中／強（第一輪） | ${d.strengthSequence.slice(0,3).map(e=>e.strength.toFixed(3)).join(' / ')} |
| 弱／中／強（第二輪） | ${d.strengthSequence.slice(3).map(e=>e.strength.toFixed(3)).join(' / ')} |

力度是事件前 65 ms 的最大實測值，與是否跨過門檻分開；Native 與 Renderer 同步追蹤這段短峰。事件匹配採一對一容差；位置來自繪製後的播放器回覆，不拿它宣稱實體 LED 的延遲。末段完全黑屏，24 路資料有限。參見 [原始報告](dynamics-validation.json) 與 [力度圖](../media/impact-weights.png)。

起音上升速度由 DSP 時鐘計算，保留短峰，再抑制局部微小波動。20 ms 數學包絡模型的 v1.1 對照保存在 dynamics-model-comparison.json；它不是原生 DSP 或商業錄音準確率。

## 行為分層與音訊回歸

56 秒原創訊號使用相同 440 / 660 / 1100 Hz 音域：延續、音節式短音與兩者同時存在。穩定延續段事件增量為 [${b.regions.held.events.join(', ')}]，前景與鋪陳可同時存在的比例為 ${(b.regions.combined.phraseAndBedActiveFraction*100).toFixed(1)}%。

八個短低音找到 ${b.regions.impacts.events[0]} 個；300 Hz 在預設低頻範圍內誤觸 ${b.regions.outsideDefaultBand.events[0]} 次，放寬上限後找到 ${b.regions.insideWiderBand.events[0]} 個。慢漸強誤觸 ${b.regions.swell.events[0]} 次。輸出與輸入對齊後增益 ${b.audio.gain.toFixed(6)}、相關度 ${b.audio.correlation.toFixed(6)}，峰值 ${b.audio.peakDbFS.toFixed(2)} dBFS，沒有非有限樣本。詳見 behaviour-validation.json。

## 使用者指定的兩首錄音

兩首都用相同預設，原速 1× 完整播放，完成時停止且黑屏；沒有逐曲事件表。每個 RGB 值均為 0–127 整數。

| 錄音 | 長度 | 幀數 | 平均 / P99 更新間隔 | 低／中／高事件數 |
| --- | --- | --- | --- | --- |
${songRows}

全曲事件數和力度分布是運行記錄，**不是拍點或聽感準確率**；兩首沒有人工逐起音標籤。各頻段計數、力度分位數、角色相關性、最大更新間隔和定稿 runtime SHA-256 在 blossoms-full-validation.json / isekai-full-validation.json。

測試以監聽 OFF 開始。資料中的全程 OFF 結果：動態 ${d.monitorOffThroughout}，行為 ${b.monitorOffThroughout}，Blossoms ${songs[0].monitorOffThroughout}，ヰ世界 ${songs[1].monitorOffThroughout}。使用者可切換監聽，聲音 ON 不改變效果前分析。報告記錄真實狀態，不假定整輪皆為靜音。

## 操作、效果器與視覺

定稿版本重跑 Pause / Resume、Seek、Restart、Stop、Blackout、Freeze、Focus、還原、壓力、雙觸點與釋放。選用本機存在的 FabFilter Pro-R 2 測試載入、音訊通過與 bypass；預設原生聲音路徑不需要它。結果在 session-validation.json。這是命令注入及音訊量測，不代表人耳評審或實體手指操作。另在原生 v8ui 直接呼叫 onclick / ondrag，驗證 Play／Pause／Stop／構圖／Blackout／網格／壓力／釋放；詳見 ui-callback-validation.json。自動化滑鼠輸入沒有成功操作自訂 UI 或 Max 原生選單，因此未宣稱實際滑鼠操作已通過。

71 組軟體測試通過，包含 24 路 Gen 內外出口接線、DSP 描述量的微小波動抑制、持續底層上的重音、緊接密集段的小重音、靈敏度與力度解耦，以及六個構圖中的輕重光量和壽命差異。

已目視原生 Max 的八段讀值、1–8 / LOW 選擇、頻率上下限、門檻／力度、五個行為、8×8 預覽與 MIDI 路由。media/impact-weights.png、behaviour-comparison.png 與 preview.png 使用正式 Renderer 重播原生特徵；螢幕 gamma 不代表實體 LED 光度。舊 roles-in-motion.mp4 保留為 1.1 構圖設計參考。

本機 MIDI 路由為 none；本輪沒有 Launchpad 實體按鍵、LED 光度或端到端延遲驗收。頻帶和時間行為不是來源分離，顫音、失真與複雜重疊仍可能誤判。

## 重現與封裝

一般運行只需 Max 9；重建使用 Node。先關閉主 patch，再執行 npm run build 和 npm test，然後重新開主 patch。原生自動驗收另需 Python / numpy / ffmpeg，圖像重播需 Pillow。

主 patch 有 99 個物件、172 條連線。驗收時另外開啟生成的 tmp/runtime-control.maxpat，底鼓時間使用 make-kick-timing-fixture.py → run-kick-timing.py current → verify-kick-timing.py current；動態測試依序執行 make-dynamics-fixture.py → run-dynamics-check.py → verify-dynamics.py；行為測試用對應的 make / run / verify-behaviour；全曲用 run-song-check.py 音訊路徑 報告標籤 → verify-song-trace.py 報告標籤。這個本機橋接不收進正式封裝。

npm run package 生成 SHA256SUMS.json 和獨立 1.2.0 ZIP；python3 scripts/verify-release.py 在專案外解開、重建、執行測試並核對生成檔案逐位元組相同。舊 1.0.0 / 1.1.0 ZIP 的 SHA-256 與本次修改前相同；Lunar Departure 保留。歷史報告在 archive-v0.1 / archive-v1.0 / archive-v1.1，不能充當本版驗收。
`;
fs.writeFileSync(path.join(root,'docs/驗證紀錄.md'),text);console.log('Wrote final validation narrative after runtime hash verification.');
