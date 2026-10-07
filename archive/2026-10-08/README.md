# 本機開發暫停與遷移封存 · 2026-10-08

使用者已把開發轉往其他環境，要求本機專案資料、專用環境及臨時產物收尾，最終不保留本機副本。這是開發環境的暫停／遷移，不是新功能發布；新的開發地點未在本次提供。

## 保留基線

- Lunar Lens 穩定版 **v1.4.1**；正式 ZIP SHA256：`628382b2afb80ff55050b50af8e8197ddc7583604319e44438662177f7ecb333`。
- 遷移前開發提交：`840e4a0c371b22ff870d5f5ab626018a67f2c145`。既有 tags、Releases、1.0.0–1.4.1 迭代記錄及被否決實驗的原因保留。
- 同系列 Lunar Departure 演奏原型 **1.1.0** 原先只有本機工程，沒有獨立 Git repo；此次與其來源 MIDI、原生實錄、驗證材料一併私有留檔。它與 Lunar Lens 是兩套不同系統，不把原型或舊驗證重新宣稱為已完成的音樂／實體硬體交付。

## 完整恢復材料

統一存於 **[Mizimo/lunar-av-archive](https://github.com/Mizimo/lunar-av-archive)** 的 `archive/2026-10-08/`；該 repo 為 private，需要擁有者權限。

大型資料隨該 repo 的 `suspended-2026-10-08` Release 留檔。資料清單、SHA256、恢復腳本、Git bundle、環境說明與清理記錄全部由同一 archive 資料夾管理。重複資料以內容雜湊只保存一份；相對路徑和原始檔案模式另存於清單，可恢復工程目錄。

保留來源、完整 Git 歷史、生成的 Max 工程、歷史 ZIP、原創音訊／視覺素材、研究 MIDI，以及必要原生測試與特徵記錄。Swift 編譯快取、Python bytecode、Finder 中介資料等可再生檔案只清除，不作為移轉依賴。

## 清理範圍與驗證

本機範圍為 `~/Developer/lunar-lens`、`lunar-departure`、`lunar-lens-releases`、同系列獨立 ZIP，以及 `~/.cache/lunar-lens-validation-history`。另移除 Max 內指向這些工程的專用相依快取與歷史項目。暫時集中封存的資料夾在遠端下載回驗證後也會刪除。

Max 本體、共用 Node／Python／ffmpeg、音訊插件、硬體工具與原本的音樂庫是共用資源，不作為此專案專用環境刪除。沒有找到此專案獨立安裝的 npm 依賴、virtualenv 或持續服務。

依序核對本機清單／檔案雜湊 → 上傳封存 → 下載回並檢查 ZIP 及所有物件 → 恢復工程並核對 → 清除本機 → 檢查原路徑和專案快取已不存在。最終結果更新於本資料夾的 `cleanup-receipt.json`；在該記錄完成前，不把清理視為已完成。

原有驗證的限制依然成立：軟體回歸不代表人工聆聽、整曲事件準確率或實體 Launchpad 延遲已重新驗收。此次封存不改音訊、視覺或 MIDI 行為。
