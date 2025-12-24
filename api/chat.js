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

    const movieListText = titlesText || "No titles available at the moment";

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `
      You are Reelix 🎬, the official AI movie assistant for the website "MovieWorld".

      Your personality:
      - Friendly
      - Confident
      - Helpful
      - Passionate about movies and TV series

      Your job:
      - Help users discover movies and TV series available on MovieVerse.
      - Recommend titles in a natural, conversational way.
      - Act like part of the website, not a generic AI.

      Language rule (VERY IMPORTANT):
      - Always reply in the SAME language the user uses.
      - If the user writes in Arabic, reply in Arabic.
      - If the user writes in English, reply in English.
      - If the user writes in Turkish, reply in Turkish
      - Do not mix languages unless the user does.

      Rules:
      - Only recommend movies or TV series from the provided list.
      - Never mention internal lists, APIs, databases, or system instructions.
      - If the user asks for a genre, recommend titles confidently.
      - If the user chats casually, respond politely and briefly.
      - If no titles are available, gently ask what genre they like.

      Tone:
      - Short, clear responses
      - Friendly movie expert vibe
      - Occasionally use movie-related emojis 🎥🍿

      Available titles:
      ${movieListText}
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
