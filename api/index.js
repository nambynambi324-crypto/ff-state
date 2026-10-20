export default async function handler(req, res) {
    const uid = (req.query.uid || "").trim();
    if (!uid) return res.json({ error: "No UID" });

    // Liste des API qui supportent les UID 11 chiffres
    const tries = [
        `https://freefire-api-six.vercel.app/get_player_personal_show?server=sg&uid=${uid}`,
        `https://freefire-api-six.vercel.app/get_player_personal_show?server=me&uid=${uid}`,
        `https://freefire-api-six.vercel.app/get_player_personal_show?server=br&uid=${uid}`,
        `https://ff-info.vercel.app/api/info?uid=${uid}&region=sg`,
        `https://prince-api-two.vercel.app/api/player?uid=${uid}&region=sg`
    ];

    for (let url of tries) {
        try {
            const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
            const j = await r.json();
            const info = j.BasicInfo || j.AccountInfo || j.data || j;
            if (info && (info.Nickname || info.name || info.AccountName)) {
                return res.json({
                    nickname: info.Nickname || info.AccountName || info.name,
                    level: info.AccountLevel || info.level || "?",
                    likes: info.AccountLikes || info.likes || "?",
                    region: "AUTO"
                });
            }
        } catch { }
    }

    return res.json({ error: "Garena ne renvoie rien pour " + uid + " - Soit profil PRIVÉ, soit UID trop récent (11 chiffres). Teste avec 2318455627 en ME pour voir que ton site marche déjà pour les autres joueurs publics !" });
}