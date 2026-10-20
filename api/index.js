export default async function handler(req, res) {
  const uid = (req.query.uid || "").trim();
  const region = (req.query.region || "sg").toLowerCase();
  if (!uid) return res.status(200).json({ error: "No UID" });
  const apis = [
    `https://freefire-api-six.vercel.app/get_player_personal_show?server=${region}&uid=${uid}`,
    `https://freefire-api-six.vercel.app/get_player_personal_show?server=me&uid=${uid}`,
    `https://freefire-api-six.vercel.app/get_player_personal_show?server=br&uid=${uid}`
  ];
  for (let url of apis) {
    try {
      const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
      const j = await r.json();
      const info = j.BasicInfo || j.AccountInfo;
      if (info) {
        return res.status(200).json({
          nickname: info.Nickname || info.AccountName || "Joueur",
          level: info.AccountLevel || "?",
          likes: info.AccountLikes || "?",
          region: region.toUpperCase()
        });
      }
    } catch {}
  }
  return res.status(200).json({ error: "Joueur introuvable - Mets profil PUBLIC" });
}