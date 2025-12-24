import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Groq from "groq-sdk";
import fetch from "node-fetch";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// 🎬 function to get movies from TMDB
async function getMoviesByGenre(genreName) {
  const genreMap = {
    action: 28,
    comedy: 35,
    horror: 27,
    romance: 10749,
    animation: 16,
  };

  const genreId = genreMap[genreName.toLowerCase()];
  if (!genreId) return [];

  const url = `https://api.themoviedb.org/3/discover/movie?api_key=${process.env.TMDB_API_KEY}&with_genres=${genreId}&sort_by=popularity.desc`;

  const response = await fetch(url);
  const data = await response.json();

  return data.results.slice(0, 5).map(movie => movie.title);
}

app.post("/api/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    const genres = ["action", "comedy", "horror", "romance", "animation"];
    const foundGenre = genres.find(g =>
      userMessage.toLowerCase().includes(g)
    );

    let movieListText = "No movie data available.";

    if (foundGenre) {
      const movies = await getMoviesByGenre(foundGenre);
      movieListText = movies.join(", ");
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `
You are a movie assistant for a movie website.
The website uses TMDB as its movie database.
Only recommend movies from this list:
${movieListText}
If the list is empty, say you couldn't find movies.
          `,
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
    });

    res.json({
      reply: completion.choices[0].message.content,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Movie AI error" });
  }
});

// ✅ THIS is what Vercel needs
export default app;
