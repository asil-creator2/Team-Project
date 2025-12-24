import Groq from "groq-sdk";
import fetch from "node-fetch";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// 🎬 MOVIES from TMDB
async function getMoviesByGenre(genreName) {
  const genreMap = {
    action: 28,
    comedy: 35,
    horror: 27,
    romance: 10749,
    animation: 16,
    drama: 18,
    crime: 80,
  };

  const genreId = genreMap[genreName.toLowerCase()];
  if (!genreId) return [];

  const url = `https://api.themoviedb.org/3/discover/movie?api_key=${process.env.TMDB_API_KEY}&with_genres=${genreId}&sort_by=popularity.desc`;

  const response = await fetch(url);
  const data = await response.json();

  return data.results.slice(0, 5).map(movie => movie.title);
}

// 📺 TV SERIES from TMDB
async function getTVSeriesByGenre(genreName) {
  const genreMap = {
    action: 10759, // Action & Adventure
    comedy: 35,
    drama: 18,
    animation: 16,
    crime: 80,
  };

  const genreId = genreMap[genreName.toLowerCase()];
  if (!genreId) return [];

  const url = `https://api.themoviedb.org/3/discover/tv?api_key=${process.env.TMDB_API_KEY}&with_genres=${genreId}&sort_by=popularity.desc`;

  const response = await fetch(url);
  const data = await response.json();

  return data.results.slice(0, 5).map(show => show.name);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message } = req.body;
    const text = message.toLowerCase();

    const genres = [
      "action",
      "comedy",
      "horror",
      "romance",
      "animation",
      "drama",
      "crime",
    ];

    const foundGenre = genres.find(g => text.includes(g));

    let titlesText = "";

    if (foundGenre) {
      if (
        text.includes("tv") ||
        text.includes("series") ||
        text.includes("show")
      ) {
        const shows = await getTVSeriesByGenre(foundGenre);
        titlesText = shows.join(", ");
      } else {
        const movies = await getMoviesByGenre(foundGenre);
        titlesText = movies.join(", ");
      }
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `
You are a smart, friendly assistant on a movie & TV website.

Behavior rules:
- Recommend titles naturally, like a human.
- ONLY recommend from the titles provided below.
- Never mention lists, databases, APIs, or missing information.
- If no titles are provided, ask what genre or type they want.
- If the user thanks you or chats casually, respond politely.

Style:
- Friendly
- Confident
- Short and helpful 🎬📺

Titles you can recommend:
${titlesText}
          `,
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    res.status(200).json({
      reply: completion.choices[0].message.content,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Movie AI error" });
  }
}
