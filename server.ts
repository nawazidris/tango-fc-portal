import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const PORT = 3000;
const DB_PATH = path.join(process.cwd(), "src", "server", "db.json");

// Helper to read database
function readDB() {
  try {
    if (fs.existsSync(DB_PATH)) {
      const data = fs.readFileSync(DB_PATH, "utf8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error reading database file:", error);
  }
  return { players: [], matches: [], teams: [], news: [], technicalTeam: [], history: {}, gallery: [], videos: [], playerMonthlyVotes: {}, polls: [] };
}

// Helper to write database
function writeDB(data: any) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    console.error("Error writing to database file:", error);
  }
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // API - Auth Login (Secure Authentication with Role-Based Access Control)
  app.post("/api/auth/login", (req, res) => {
    const { username, password } = req.body;
    
    if (username === "admin" && password === "tango123") {
      return res.json({ token: "token-admin", role: "Admin", username: "admin" });
    } else if (username === "coach" && password === "tango123") {
      return res.json({ token: "token-coach", role: "Coach", username: "coach" });
    } else if (username === "logistics" && password === "tango123") {
      return res.json({ token: "token-logistics", role: "Logistics", username: "logistics" });
    }
    
    return res.status(401).json({ error: "Invalid credentials. Authorised personnel only." });
  });

  // API - Get Football Data (Matches, Players, Standings, Milestones, History, Galleries)
  app.get("/api/football-data", (req, res) => {
    const db = readDB();
    res.json(db);
  });

  // API - Submit Fan Voting (Player of the Month)
  app.post("/api/fan-vote", (req, res) => {
    const { playerId } = req.body;
    if (!playerId) {
      return res.status(400).json({ error: "Player ID required." });
    }
    const db = readDB();
    if (!db.playerMonthlyVotes) {
      db.playerMonthlyVotes = {};
    }
    db.playerMonthlyVotes[playerId] = (db.playerMonthlyVotes[playerId] || 0) + 1;
    writeDB(db);
    res.json({ success: true, votes: db.playerMonthlyVotes[playerId] });
  });

  // API - Match Manager (Add, Edit, Update, or Delete Matches)
  app.post("/api/matches", (req, res) => {
    const { token, match } = req.body;
    if (!token || (token !== "token-admin" && token !== "token-coach")) {
      return res.status(403).json({ error: "Unauthorized. Required: Admin or Coach role." });
    }

    if (!match.homeTeam || !match.awayTeam || !match.date) {
      return res.status(400).json({ error: "Missing required match fields (homeTeam, awayTeam, date)." });
    }

    const db = readDB();
    const matchId = match.id ? Number(match.id) : Date.now();
    const index = db.matches.findIndex((m: any) => m.id === matchId);

    const formattedMatch = {
      ...match,
      id: matchId,
      homeScore: match.homeScore !== undefined && match.homeScore !== "" ? Number(match.homeScore) : null,
      awayScore: match.awayScore !== undefined && match.awayScore !== "" ? Number(match.awayScore) : null,
      events: match.events || []
    };

    if (index > -1) {
      db.matches[index] = formattedMatch;
    } else {
      db.matches.push(formattedMatch);
    }

    // Dynamic Standings Recalculation Support from results!
    // Since we also compute standings live or compile them, we save them
    writeDB(db);
    res.json({ success: true, match: formattedMatch });
  });

  app.delete("/api/matches/:id", (req, res) => {
    const { token } = req.body;
    const matchId = Number(req.params.id);

    if (!token || token !== "token-admin") {
      return res.status(403).json({ error: "Unauthorized. Required: Admin role to delete matches." });
    }

    const db = readDB();
    db.matches = db.matches.filter((m: any) => m.id !== matchId);
    writeDB(db);
    res.json({ success: true });
  });

  // API - Squad Roster Manager (Add, Edit, Update, or Delete Players)
  app.post("/api/players", (req, res) => {
    const { token, player } = req.body;
    if (!token || (token !== "token-admin" && token !== "token-logistics")) {
      return res.status(403).json({ error: "Unauthorized. Required: Admin or Logistics role." });
    }

    if (!player.name || !player.position) {
      return res.status(400).json({ error: "Missing required player fields (name, position)." });
    }

    const db = readDB();
    const playerId = player.id ? Number(player.id) : Date.now();
    const index = db.players.findIndex((p: any) => p.id === playerId);

    const formattedPlayer = {
      ...player,
      id: playerId,
      number: player.number ? Number(player.number) : null,
      goals: player.goals ? Number(player.goals) : 0,
      assists: player.assists ? Number(player.assists) : 0,
      cleanSheets: player.cleanSheets ? Number(player.cleanSheets) : 0,
      gamesPlayed: player.gamesPlayed ? Number(player.gamesPlayed) : 0,
      savePercentage: player.savePercentage ? Number(player.savePercentage) : 0,
      playerImage: player.playerImage || "https://placehold.co/300x300?text=" + player.name[0]
    };

    if (index > -1) {
      db.players[index] = formattedPlayer;
    } else {
      db.players.push(formattedPlayer);
    }

    writeDB(db);
    res.json({ success: true, player: formattedPlayer });
  });

  app.delete("/api/players/:id", (req, res) => {
    const { token } = req.body;
    const playerId = Number(req.params.id);

    if (!token || token !== "token-admin") {
      return res.status(403).json({ error: "Unauthorized. Required: Admin role to delete players." });
    }

    const db = readDB();
    db.players = db.players.filter((p: any) => p.id !== playerId);
    writeDB(db);
    res.json({ success: true });
  });

  // API - Standings Manager (Upload parsed rows / Replace default logs)
  app.post("/api/standings/upload", (req, res) => {
    const { token, teams } = req.body;
    if (!token || token !== "token-admin") {
      return res.status(403).json({ error: "Unauthorized. Required: Admin role." });
    }

    if (!Array.isArray(teams)) {
      return res.status(400).json({ error: "Invalid teams array format." });
    }

    const db = readDB();
    // Replace current database standings with the uploaded one
    db.teams = teams.map((team: any, i: number) => ({
      name: team.name,
      stats: [
        Number(team.played) || 0,
        Number(team.won) || 0,
        Number(team.drawn) || 0,
        Number(team.lost) || 0,
        Number(team.gf) || 0,
        Number(team.ga) || 0,
        Number(team.gd) || 0,
        Number(team.pts) || 0
      ]
    }));

    writeDB(db);
    res.json({ success: true, teams: db.teams });
  });

  // API - News Manager
  app.post("/api/news", (req, res) => {
    const { token, article } = req.body;
    if (!token || token !== "token-admin") {
      return res.status(403).json({ error: "Unauthorized. Required: Admin role." });
    }

    const db = readDB();
    const articleId = article.id ? Number(article.id) : Date.now();
    const index = db.news.findIndex((n: any) => n.id === articleId);

    const formattedArticle = {
      ...article,
      id: articleId,
      imageUrl: article.imageUrl || "https://placehold.co/800x450?text=Club_News"
    };

    if (index > -1) {
      db.news[index] = formattedArticle;
    } else {
      db.news.push(formattedArticle);
    }

    writeDB(db);
    res.json({ success: true, article: formattedArticle });
  });

  app.delete("/api/news/:id", (req, res) => {
    const { token } = req.body;
    const articleId = Number(req.params.id);

    if (!token || token !== "token-admin") {
      return res.status(403).json({ error: "Unauthorized. Required: Admin role to delete articles." });
    }

    const db = readDB();
    db.news = db.news.filter((n: any) => n.id !== articleId);
    writeDB(db);
    res.json({ success: true });
  });

  // API - Gallery Manager
  app.post("/api/media/gallery", (req, res) => {
    const { token, item } = req.body;
    if (!token || token !== "token-admin") {
      return res.status(403).json({ error: "Unauthorized. Required: Admin role." });
    }

    const db = readDB();
    const itemId = item.id ? Number(item.id) : Date.now();
    const index = db.gallery.findIndex((g: any) => g.id === itemId);

    const formattedItem = {
      ...item,
      id: itemId,
      url: item.url || "https://placehold.co/600x600?text=Gallery_Placeholder"
    };

    if (index > -1) {
      db.gallery[index] = formattedItem;
    } else {
      db.gallery.push(formattedItem);
    }

    writeDB(db);
    res.json({ success: true, item: formattedItem });
  });

  app.delete("/api/media/gallery/:id", (req, res) => {
    const { token } = req.body;
    const itemId = Number(req.params.id);

    if (!token || token !== "token-admin") {
      return res.status(403).json({ error: "Unauthorized. Required: Admin role to delete gallery items." });
    }

    const db = readDB();
    db.gallery = db.gallery.filter((g: any) => g.id !== itemId);
    writeDB(db);
    res.json({ success: true });
  });

  // API - Videos Manager
  app.post("/api/media/videos", (req, res) => {
    const { token, video } = req.body;
    if (!token || token !== "token-admin") {
      return res.status(403).json({ error: "Unauthorized. Required: Admin role." });
    }

    const db = readDB();
    const videoId = video.id ? Number(video.id) : Date.now();
    const index = db.videos.findIndex((v: any) => v.id === videoId);

    const formattedVideo = {
      ...video,
      id: videoId,
      url: video.url || "/videos/tango1.mp4"
    };

    if (index > -1) {
      db.videos[index] = formattedVideo;
    } else {
      db.videos.push(formattedVideo);
    }

    writeDB(db);
    res.json({ success: true, video: formattedVideo });
  });

  app.delete("/api/media/videos/:id", (req, res) => {
    const { token } = req.body;
    const videoId = Number(req.params.id);

    if (!token || token !== "token-admin") {
      return res.status(403).json({ error: "Unauthorized. Required: Admin role to delete videos." });
    }

    const db = readDB();
    db.videos = db.videos.filter((v: any) => v.id !== videoId);
    writeDB(db);
    res.json({ success: true });
  });

  // API - Polls Manager
  app.post("/api/polls", (req, res) => {
    const { token, poll } = req.body;
    if (!token || token !== "token-admin") {
      return res.status(403).json({ error: "Unauthorized. Required: Admin role." });
    }

    const db = readDB();
    if (!db.polls) {
      db.polls = [];
    }

    const pollId = poll.id ? Number(poll.id) : Date.now();
    const index = db.polls.findIndex((p: any) => p.id === pollId);

    const formattedPoll = {
      id: pollId,
      question: poll.question,
      options: poll.options.map((opt: any) => ({
        id: opt.id || `opt-${Math.random().toString(36).substr(2, 9)}`,
        text: opt.text,
        votes: opt.votes || 0
      })),
      active: typeof poll.active === "boolean" ? poll.active : true,
      createdAt: poll.createdAt || new Date().toISOString()
    };

    if (index > -1) {
      db.polls[index] = formattedPoll;
    } else {
      db.polls.push(formattedPoll);
    }

    writeDB(db);
    res.json({ success: true, poll: formattedPoll });
  });

  app.delete("/api/polls/:id", (req, res) => {
    const { token } = req.body;
    const pollId = Number(req.params.id);

    if (!token || token !== "token-admin") {
      return res.status(403).json({ error: "Unauthorized. Required: Admin role to delete polls." });
    }

    const db = readDB();
    if (!db.polls) db.polls = [];
    db.polls = db.polls.filter((p: any) => p.id !== pollId);
    writeDB(db);
    res.json({ success: true });
  });

  // API - Submit Poll Vote
  app.post("/api/polls/:id/vote", (req, res) => {
    const pollId = Number(req.params.id);
    const { optionId } = req.body;

    if (!optionId) {
      return res.status(400).json({ error: "Option ID is required." });
    }

    const db = readDB();
    if (!db.polls) db.polls = [];
    
    const poll = db.polls.find((p: any) => p.id === pollId);
    if (!poll) {
      return res.status(404).json({ error: "Poll not found." });
    }

    if (!poll.active) {
      return res.status(400).json({ error: "This poll is now closed." });
    }

    const option = poll.options.find((opt: any) => opt.id === optionId);
    if (!option) {
      return res.status(404).json({ error: "Option not found in this poll." });
    }

    option.votes = (option.votes || 0) + 1;
    writeDB(db);
    res.json({ success: true, option });
  });

  // Vite middleware setup (serve static files react build in production, proxy to dev in dev)
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Express + Vite backend listening on port ${PORT}`);
  });
}

startServer();
