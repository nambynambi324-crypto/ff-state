export default async function handler(req, res) {
  const uid = (req.query.uid || "").trim();
  const region = req.query.region || "sg";
  let player = null;
  let raw = null;

  if (uid) {
    const apis = [
      `https://freefire-api-six.vercel.app/get_player_personal_show?server=${region}&uid=${uid}`,
      `https://freefire-api-six.vercel.app/get_player_personal_show?server=me&uid=${uid}`,
      `https://freefire-api-six.vercel.app/get_player_personal_show?server=br&uid=${uid}`
    ];

    for (const url of apis) {
      try {
        const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
        const j = await r.json();
        // Si l'API retourne quelque chose
        if (j && (j.BasicInfo || j.AccountInfo || j.error !== "Player not found")) {
          raw = j;
          const info = j.BasicInfo || j.AccountInfo || j;
          player = {
            nickname: info.Nickname || info.AccountName || info.nickname || "Inconnu",
            level: info.AccountLevel || info.Level || info.level || "?",
            likes: info.AccountLikes || info.Likes || info.likes || "?",
            rank: info.Rank || info.BrankPoint || "?",
            exp: info.AccountExp || "?",
            region: info.AccountRegion || region.toUpperCase(),
            bio: j.SocialInfo?.AccountSignature || info.AccountSignature || "",
            avatar: j.AccountProfile?.AccountAvatarId || ""
          };
          if (player.nickname !== "Inconnu") break;
        }
      } catch {}
    }
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end(`
<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>FF STATE - REAL SEARCH</title>
<style>
body{background:#080808;color:#fff;font-family:Arial;text-align:center;padding:15px}
.search{background:#151515;padding:15px;border-radius:12px;max-width:500px;margin:auto}
input{padding:14px;width:55%;border-radius:10px;border:none;background:#222;color:#fff}
select{padding:14px;border-radius:10px;border:none;background:#222;color:#fff}
button{padding:14px 20px;background:#ffcc00;color:#000;font-weight:900;border:none;border-radius:10px;cursor:pointer;margin-top:10px}
.card{background:#111;border:2px solid #ffcc00;border-radius:15px;padding:20px;max-width:450px;margin:20px auto;text-align:left}
.row{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #222}
.label{color:#888} .value{color:#fff;font-weight:bold}
.title{color:#ffcc00;font-size:22px;font-weight:900}
</style></head><body>
<div class="title">👑 FF STATE - REAL SEARCH</div>
<p style="color:#666">Trouve n'importe quel joueur Free Fire - 0 Fake</p>

<div class="search">
<form method="GET">
<input name="uid" value="${uid}" placeholder="Entre UID ex: 10053266039" required>
<select name="region"><option value="sg" ${region=='sg'?'selected':''}>SG/MG</option><option value="me" ${region=='me'?'selected':''}>ME</option><option value="br" ${region=='br'?'selected':''}>BR</option><option value="ind" ${region=='ind'?'selected':''}>IND</option><option value="id" ${region=='id'?'selected':''}>ID</option></select>
<br><button>🔍 CHERCHER JOUEUR RÉEL</button>
</form>
</div>

${uid ? (player ? `
<div class="card">
<div class="row"><span class="label">UID</span><span class="value">${uid}</span></div>
<div class="row"><span class="label">Pseudo</span><span class="value">${player.nickname}</span></div>
<div class="row"><span class="label">Niveau RÉEL</span><span class="value">${player.level}</span></div>
<div class="row"><span class="label">Likes RÉEL</span><span class="value">${player.likes}</span></div>
<div class="row"><span class="label">Rang</span><span class="value">${player.rank}</span></div>
<div class="row"><span class="label">Région</span><span class="value">${player.region}</span></div>
<div class="row"><span class="label">Bio</span><span class="value" style="font-size:12px">${player.bio}</span></div>
<p style="color:#0f0;font-size:11px;margin-top:15px">✅ DONNÉES LIVE DE GARENA - Pas codé en dur</p>
</div>
` : `<div class="card"><p style="color:red">Joueur ${uid} introuvable en région ${region}. Essaie SG, ME ou BR.</p><pre style="color:#555;font-size:10px">${JSON.stringify(raw||{}, null, 2).substring(0,500)}</pre></div>`) : ""}

</body></html>
`);
}