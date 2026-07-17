/* =========================================================================
   github.js — admin '발행' : content.json 을 GitHub 레포에 커밋
   ---------------------------------------------------------------------------
   백엔드/도메인 없이 콘텐츠를 영속화하는 경로.
   공개 레포 KennethKarl/korea-care2 = 빌드된 dist 가 루트에 들어가 Pages 가 서빙.
   admin 이 GitHub Contents API 로 레포 루트 content.json 을 커밋하면 Pages 가
   그대로 서빙 → 앱이 런타임에 /korea-care2/content.json 을 fetch → 반영(재빌드 불필요,
   Pages 전파 ~1분). 토큰은 런타임에 사용자가 입력(코드/사이트에 박지 않음).
   필요한 토큰: fine-grained PAT, 대상 레포 Contents = Read and write.
   ========================================================================= */

// 발행 대상 (kennethkarl.github.io/korea-care2 를 서빙하는 공개 레포의 루트 content.json)
export const PUBLISH_TARGET = {
  owner: "KennethKarl",
  repo: "korea-care2",
  path: "public/content.json",   // 소스+Actions 모델: public/ → dist/content.json 으로 빌드·서빙. 커밋 시 Actions 재빌드
  branch: "main",
};

const GH = "https://api.github.com";
const headers = (token) => ({
  Authorization: `Bearer ${token}`,
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  "Content-Type": "application/json",
});

// UTF-8 안전 base64 (한글 콘텐츠 포함)
function toBase64(str) {
  return btoa(unescape(encodeURIComponent(str)));
}

// 바이너리(ArrayBuffer) → base64 (대용량 안전: 청크 처리)
function bufToBase64(buf) {
  const bytes = new Uint8Array(buf);
  let bin = "";
  const CH = 0x8000;
  for (let i = 0; i < bytes.length; i += CH) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + CH));
  return btoa(bin);
}

async function ghJson(res) {
  const j = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = j.message || `${res.status} ${res.statusText}`;
    const err = new Error(`GitHub: ${msg}`);
    err.status = res.status;
    throw err;
  }
  return j;
}

/** 현재 파일 sha 조회 (없으면 null = 신규 생성) */
export async function getFileSha({ token, owner, repo, path, branch }) {
  const url = `${GH}/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}?ref=${encodeURIComponent(branch)}`;
  const res = await fetch(url, { headers: headers(token) });
  if (res.status === 404) return null;
  const j = await ghJson(res);
  return Array.isArray(j) ? null : j.sha || null;
}

/**
 * content.json 발행(커밋).
 * @returns { commitUrl, sha } 커밋 정보
 */
export async function publishContentJson({ token, contentObject, message, target = PUBLISH_TARGET }) {
  const { owner, repo, path, branch } = target;
  const json = JSON.stringify(contentObject, null, 2);
  const sha = await getFileSha({ token, owner, repo, path, branch });
  const url = `${GH}/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`;
  const body = {
    message: message || `chore(content): admin 발행 (${new Date().toISOString()})`,
    content: toBase64(json),
    branch,
    ...(sha ? { sha } : {}),
  };
  const res = await fetch(url, { method: "PUT", headers: headers(token), body: JSON.stringify(body) });
  const j = await ghJson(res);
  return { commitUrl: j.commit?.html_url || "", sha: j.content?.sha || "" };
}

/* =========================================================================
   여러 파일 원자적 커밋 (Git Data API) — 소스+Actions 모델의 번역 발행용.
   여러 파일을 1커밋으로 올려 Actions 재빌드를 1회만 트리거한다.
   files: [{ path, content }]   utf-8 텍스트(JSON 등)
        | [{ path, buffer }]    바이너리(ArrayBuffer, 예: xlsx) → blob 생성
   ========================================================================= */
export async function commitFiles({ token, files, message, target = PUBLISH_TARGET }) {
  const { owner, repo, branch } = target;
  const api = `${GH}/repos/${owner}/${repo}`;
  const H = headers(token);
  // 1) 최신 커밋 → 베이스 트리
  const ref = await ghJson(await fetch(`${api}/git/ref/heads/${encodeURIComponent(branch)}`, { headers: H }));
  const baseCommitSha = ref.object.sha;
  const baseCommit = await ghJson(await fetch(`${api}/git/commits/${baseCommitSha}`, { headers: H }));
  const baseTree = baseCommit.tree.sha;
  // 2) 트리 엔트리(바이너리는 blob 선생성)
  const tree = [];
  for (const f of files) {
    if (f.buffer != null) {
      const blob = await ghJson(await fetch(`${api}/git/blobs`, { method: "POST", headers: H, body: JSON.stringify({ content: bufToBase64(f.buffer), encoding: "base64" }) }));
      tree.push({ path: f.path, mode: "100644", type: "blob", sha: blob.sha });
    } else {
      tree.push({ path: f.path, mode: "100644", type: "blob", content: f.content });
    }
  }
  const newTree = await ghJson(await fetch(`${api}/git/trees`, { method: "POST", headers: H, body: JSON.stringify({ base_tree: baseTree, tree }) }));
  const commit = await ghJson(await fetch(`${api}/git/commits`, { method: "POST", headers: H, body: JSON.stringify({ message, tree: newTree.sha, parents: [baseCommitSha] }) }));
  await ghJson(await fetch(`${api}/git/refs/heads/${encodeURIComponent(branch)}`, { method: "PATCH", headers: H, body: JSON.stringify({ sha: commit.sha }) }));
  return { commitUrl: commit.html_url || "", sha: commit.sha };
}

/**
 * 번역 발행: i18n-strings.json(+ui) [+원본 xlsx] 를 1커밋으로 소스 레포에 올린다.
 * 커밋 → GitHub Actions 가 언어별 프리렌더 재빌드·배포(~2분).
 */
export async function publishStrings({ token, dataMap, uiMap, xlsxBuffer, message }) {
  const files = [{ path: "src/i18n-strings.json", content: JSON.stringify(dataMap) }];
  if (uiMap && Object.keys(uiMap).length) files.push({ path: "src/i18n-ui.json", content: JSON.stringify(uiMap) });
  if (xlsxBuffer) files.push({ path: "docs/i18n/strings.xlsx", buffer: xlsxBuffer });
  return commitFiles({ token, files, message: message || `chore(i18n): admin 엑셀 업로드 번역 발행 (${new Date().toISOString()})` });
}
