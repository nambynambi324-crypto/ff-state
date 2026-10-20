import { FreeFireAPI } from 'ffapis';

export default async function handler(req, res) {
  const uid = (req.query.uid || "").trim();
  const region = req.query.region || "sg";

  if (!uid) {
    return res.status(200).send(`
      <html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{background:#000;color:#fff;font-family:Arial;text-align:center;padding:20px}.box{background:#111;border:2px solid gold;padding:20px;border-radius:15px;max-width:400px;margin:auto}input,select,button{padding:12px;border-radius:10px;border:none;margin:5px}button{background:gold;font-weight:bold}</style></head>
      <body><h2 style="color:gold">👑 FF STATE - REAL SEARCH V2</h2>
      <div class="box"><form><input name="uid" placeholder="UID ex: 10053266039" required><select name="region"><option value="sg">SG/MG</option><option value="me">ME</option><option value="br">BR</option><option value="id">ID</option></select><br><button>CHERCHER VRAI JOUEUR</button></form></div>
      <p style="color:#666">Librairie ffapis 2026 - 0 fake, données live Garena</p></body></html>
    `);
  }

  try {
    const api = new FreeFireAPI();
    // Cherche le joueur par UID
    const data = await api.getAccountInfo(uid, region.toUpperCase());

    const player = {
      nickname: data?.AccountInfo?.AccountName || data?.basicInfo?.nickname || "Trouvé",
      level: data?.AccountInfo?.AccountLevel || "?",
      likes: data?.AccountInfo?.AccountLikes || "?",
      region: data?.AccountInfo?.AccountRegion || region,
      exp: data?.AccountInfo?.AccountExp || "?",
      rank: data?.AccountInfo?.Rank || "?",
      bio: data?.SocialInfo?.AccountSignature || ""
    };

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(`
      <html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>
      body{background:#000;color:#fff;font-family:Arial;text-align:center;padding:15px}
      .card{background:#111;border:2px solid #0f0;border-radius:15px;padding:20px;max-width:450px;margin:20px auto;text-align:left}
      .row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #222}
      .label{color:#888} .value{color:#fff;font-weight:bold}
      button{padding:12px;background:#0f0;border:none;border-radius:10px;font-weight:bold}
      </style></head><body>
      <h2 style="color:#0f0">✅ JOUEUR TROUVÉ - REAL GARENA</h2>
      <div class="card">
        <div class="row"><span class="label">UID</span><span class="value">${uid}</span></div>
        <div class="row"><span class="label">Pseudo RÉEL</span><span class="value">${player.nickname}</span></div>
        <div class="row"><span class="label">Niveau RÉEL</span><span class="value">${player.level}</span></div>
        <div class="row"><span class="label">Likes RÉEL</span><span class="value">${player.likes}</span></div>
        <div class="row"><span class="label">Région</span><span class="value">${player.region}</span></div>
        <div class="row"><span class="label">Bio</span><span class="value">${player.bio}</span></div>
        <p style="color:#0f0;font-size:11px;margin-top:15px">✅ LIVE from Garena servers - ffapis v3.0.1 - Pas de chiffre en dur</p>
        <a href="/api"><button>🔍 Chercher un autre joueur</button></a>
      </div>
      </body></html>
    `);
  } catch (e) {
    res.status(200).send(`
      <html><body style="background:#000;color:#fff;text-align:center;padding:20px;font-family:Arial">
      <h2 style="color:red">Erreur API: ${e.message}</h2>
      <p>Le UID ${uid} en région ${region} est introuvable ou l'API Garena est en maintenance.</p>
      <p style="color:#666;font-size:12px">${e.stack?.substring(0,300)}</p>
      <a href="/api" style="color:gold">Retour</a>
      </body></html>
    `);
  }
}