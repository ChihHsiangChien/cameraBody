# Human Anatomy 3D｜互動 3D 人體器官系統解剖圖譜

[English](README.md) · [**GitHub Pages 線上開啟**](https://chihhsiangchien.github.io/human-anatomy-3d/) · [GitHub 專案儲存庫](https://github.com/ChihHsiangChien/human-anatomy-3d)

免攝影機、純瀏覽器本機執行的互動式 3D 人體解剖探索圖譜。以 Three.js 搭配 **BodyParts3D 3.0**、**Human Reference Atlas** 與 **Z-Anatomy** 真實醫學 3D 網格建構，提供 **6 個獨立器官系統專頁**，支援自由旋轉、縮放、平移、半透明骨骼透視與個別構造顯示／隱藏，全程不需鏡頭權限、無任何資料上傳。

## 六大器官系統 3D 專頁

可透過上方分頁列即時切換，或直接使用獨立 `?page=<id>` 連結開啟：

| 專頁 | 線上直達連結 | 收錄 3D 解剖構造 |
| --- | --- | --- |
| **神經系統＋骨骼**（預設首頁） | [`?page=nervous`](https://chihhsiangchien.github.io/human-anatomy-3d/?page=nervous) | 大腦解剖四葉（額／頂／顳／枕葉）、胼胝體、小腦、腦幹與視路徑；**10 大腦功能皮質分區**＋左／右／雙側大腦半球與「腦葉／功能疊加」模式切換；**12 對腦神經 (CN I–XII)** 各自獨立顯示；與延腦同軸對齊之脊髓＋背腹側脊神經根與周邊神經；獨立頸／胸／腰／薦椎、頭骨、胸廓骨盆與完整雙手 27 塊骨骼 |
| **1. 循環系統＋骨骼** | [`?page=circulatory`](https://chihhsiangchien.github.io/human-anatomy-3d/?page=circulatory) | 左右心室與心房、真實 BodyParts3D 主動脈（升主動脈／弓／胸腹主動脈）、上下腔靜脈、肺動靜脈與冠狀血管、頭頸椎動脈／頸內靜脈與硬腦膜竇、肝門靜脈系、上下肢動靜脈與全身骨骼 |
| **2. 呼吸系統＋骨骼＋呼吸肌** | [`?page=respiratory`](https://chihhsiangchien.github.io/human-anatomy-3d/?page=respiratory) | 鼻腔／副鼻竇與咽部、真實 BodyParts3D 甲狀軟骨與喉部、氣管與完整支氣管樹、**右肺三葉＋左肺二葉**獨立切換、真實 BodyParts3D **雙穹頂橫膈膜**、半透明真實**肋間肌（外／內／最內肋間肌）**、頸部輔助吸氣肌、半透明腹壁呼氣肌與全身骨骼 |
| **3. 泌尿系統＋骨骼** | [`?page=urinary`](https://chihhsiangchien.github.io/human-anatomy-3d/?page=urinary) | 左右腎臟（T11–L3）、真實 BodyParts3D 腎盞與腎盂、雙側輸尿管、Loop 細分平滑膀胱、尿道與括約肌、腹主動脈／腎動脈與下腔靜脈／腎靜脈、全身骨骼 *（嚴格限定泌尿構造，腎上腺僅歸類於內分泌系統）* |
| **4. 內分泌系統** | [`?page=endocrine`](https://chihhsiangchien.github.io/human-anatomy-3d/?page=endocrine) | 真實 BodyParts3D 下視丘、腦下垂體、松果體、胸腺、左右腎上腺、**胰臟與主胰管（蘭氏胰島）**、**男性參照性腺（睪丸與附睪）**，搭配對位於甲狀軟骨下方之甲狀腺與四枚副甲狀腺、半透明腦幹／雙腎空間參照與全身骨骼 |
| **5. 消化系統＋骨骼** | [`?page=digestive`](https://chihhsiangchien.github.io/human-anatomy-3d/?page=digestive) | 口腔舌部／三大唾液腺與咽部、真實 BodyParts3D 食道、胃、肝臟右葉／左葉、真實膽囊與膽道系統、真實胰臟、十二指腸／空腸／迴腸、盲腸闌尾／升橫降乙狀結腸與直腸、全身骨骼 |

## 操作與顯示功能

- **直覺 3D 視角操作**：拖曳旋轉 360°、滾輪或雙指縮放、左上／左下控制列一鍵切換 **旋轉 / 平移 (`↻`)** 與 **正面 / 背面 / 側面 / 聚焦頭部 / 聚焦脊椎** 視角。
- **精細勾選與構造檢視卡**：右側控制面板提供「全部顯示／僅器官／器官＋脊椎／器官＋全身骨骼」快捷預設、即時搜尋過濾、各系統全選／全關與單一構造顯示切換；點擊任一 3D 構造即可查看中英文名稱與解剖臨床說明。
- **預設乾淨畫面（文字標籤預設關閉）**：全部 6 個專頁進入時皆預設關閉所有 3D 浮動引線文字標籤，避免遮擋器官立體細節；如需對照位置，可隨時於右側控制面板勾選「顯示 3D 構造引線標示」或大腦功能分區標示開啟。
- **人體外框與半透明骨骼模式**：支援開關青色全像人體外框背景並調整透明度，以及切換半透明骨骼以透視顱腔、胸廓與骨盆內部構造。
- **中／英雙語介面**：預設依瀏覽器語系顯示，頁首按鈕可即時切換中文 / English，亦支援網址參數 `?lang=zh` 或 `?lang=en`。

## 本機開發、測試與建置

需使用 Node.js **22.12 或更新版本**。

```sh
npm ci
npm run dev
```

執行原始碼檢查、單元測試與正式建置：

```sh
npm run lint
npm test
BASE_PATH=/human-anatomy-3d/ npm run build
```

建置產物輸出為純靜態 `dist/` 目錄，並檢查產出容量預算（總計 ≤ 15 MB，已移除舊版攝影機／MediaPipe 模型後約 7 MB）。推送至 `main` 分支後，GitHub Actions（[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)）會自動執行建置並部署至 GitHub Pages（自動帶入 `BASE_PATH=/${{ github.event.repository.name }}/`）。

### 重建擴充真實器官資料包（`public/anatomy/organs-extra.*`）

網站執行不需要 Python；僅在需要重新從官方固定版本 **BodyParts3D 3.0** (`BodyParts3D_3.0_obj_99.zip`，SHA-256 校驗) 抽取 22 組器官網格至 `public/anatomy/organs-extra.bin` 與 `public/anatomy/organs-extra.json` 時執行：

```sh
python3 -m venv tools/.venv
tools/.venv/bin/pip install numpy fast-simplification
tools/.venv/bin/python tools/build_organs_extra.py
```

下載檔案會快取於 `.gitignore` 的 `tools/cache/`；`public/anatomy/` 內既有的基礎資產（`body.*`、`head.*`、`muscles.*`、`nerves.*`、`peripheral.*`）維持位元組完全不變，並由 `tests/unit/rebuild-immutable.test.js` 驗證保護。

## 資料來源、致謝與授權

本專案獨立修改與擴充程式碼採 **MIT License**（見 [LICENSE](LICENSE)），並基於以下開源專案衍生創作：
- **[3D Anatomy Camera](https://github.com/keanu77/3D_anatomy_camera)** — 運動醫學科 **吳易澄醫師**（[sportsmedicine.tw](https://sportsmedicine.tw/)，Copyright (c) 2026 吳易澄，MIT License）
- 構想啟發自 Hashem Al-Ghaili 的 X-Ray Mirror（[原貼文](https://x.com/HashemGhaili/status/2120202746121085321)）。

3D 解剖網格各自保留原始來源授權，**不適用程式碼的 MIT 授權**：

| 素材內容 | 來源與授權 |
| --- | --- |
| `public/anatomy/` 身體、頭手、肌肉、視路徑與 `organs-extra.*` 器官網格 | [BodyParts3D 3.0, © DBCLS](LICENSES/BodyParts3D.md)，CC BY-SA 2.1 Japan |
| `nerves.*` 脊髓節段 | [Human Reference Atlas / HuBMAP](LICENSES/HRA-spinal-cord.md)，CC BY 4.0（[DOI:10.48539/HBM366.MTJD.685](https://doi.org/10.48539/HBM366.MTJD.685)） |
| `peripheral.*` 周邊神經與腦神經曲線 | [Z-Anatomy](LICENSES/Z-Anatomy.md)，CC BY-SA 4.0（保留其 BodyParts3D 來源標註） |
| Three.js | MIT License（[LICENSES/three-MIT.txt](LICENSES/three-MIT.txt)） |

## 教育用途說明與限制

本工具呈現來自公開成人男性參考解剖資料庫的立體教學模型，並非個人醫學影像掃描，也不模擬組織生物力學變形；僅供解剖學習與空間位置理解之用，不可用於任何臨床診斷或醫療決策。
