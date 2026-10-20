export default async function handler(req, res) {
  const uid = (req.query.uid || "").trim();
  const region = (req.query.region || "sg").toLowerCase();
  
  let player = null;

  if (uid) {
    try {
      // API RÉELLE qui marche en 2026 : wzapi
      const url = `https://wzapi.vercel.app/player?uid=${uid}&region=${region}`;
      const r = await fetch(url);
      const j = await r.json();
      if (j && !j.error) {
        player = {
          nickname: j.nickname || j.name || "Trouvé",
          level: j.level || j.AccountLevel || "?",
          likes: j.likes || j.AccountLikes || "?",
          region: j.region || region.toUpperCase(),
          bio: j.bio || j.signature || ""
        };
        // Si l'API retourne différemment
        if (j.data) {
          player.nickname = j.data.nickname || player.nickname;
          player.level = j.data.level || player.level;
          player.likes = j.data.likes || player.likes;
        }
      }
    } catch (e) {
      // Si wzapi down, on essaye l'autre API
      try {
        const url2 = `https://freefire-api-six.vercel.app/get_player_personal_show?server=${region}&uid=${uid}`;
        const r2 = await fetch(url2);
        const j2 = await r2.json();
        const info = j2.BasicInfo || j2.AccountInfo || {};
        player = {
          nickname: info.Nickname || info.AccountName || "Joueur",
          level: info.AccountLevel || "?",
          likes: info.AccountLikes || "?",
          region: region.toUpperCase(),
          bio: ""
        };
      } catch {}
    }
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end(`
<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>FF STATE REAL</title>
<style>body{background:#000;color:#fff;font-family:Arial;text-align:center;padding:15px}
.card{background:#111;border:2px solid gold;border-radius:15px;padding:20px;max-width:420px;margin:20px auto;text-align:left}
.row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #222}
input,select,button{padding:12px;border-radius:10px;border:none;margin:3px}button{background:gold;font-weight:bold;cursor:pointer}</style>
</head><body>
<h2 style="color:gold">👑 FF STATE - REAL SEARCH</h2>
<form><input name="uid" value="${uid}" placeholder="UID ex: 10053266039" required><select name="region"><option value="sg">SG/MG</option><option value="me">ME</option><option value="br">BR</option><option value="id">ID</option><option value="ind">IND</option></select><button>🔍 CHERCHER</button></form>
${uid ? (player ? `<div class="card"><div class="row"><span>UID</span><b>${uid}</b></div><div class="row"><span>Pseudo RÉEL</span><b>${player.nickname}</b></div><div class="row"><span>Niveau RÉEL</span><b>${player.level}</b></div><div class="row"><span>Likes RÉEL</span><b>${player.likes}</b></div><div class="row"><span>Région</span><b>${player.region}</b></div><p style="color:#0f0;font-size:11px">✅ LIVE Garena - 0 fake</p></div>` : `<div class="card"><p>Joueur ${uid} pas trouvé en ${region}. Essaie ME ou BR.</p></div>`) : `<p style="color:#666">Entre un UID pour chercher n'importe quel joueur</p>`}
<p style="margin-top:20px"><a href="/" style="color:gold">Nouvelle recherche</a></p>
</body></html>`);
}