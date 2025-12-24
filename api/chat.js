import Groq from "groq-sdk";
import fetch from "node-fetch";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// 🎬 get movies from TMDB
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

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message } = req.body;

    const genres = ["action", "comedy", "horror", "romance", "animation"];
    const foundGenre = genres.find(g =>
      message.toLowerCase().includes(g)
    );

    let movieListText = "No movie data available.";

    if (foundGenre) {
      const movies = await getMoviesByGenre(foundGenre);
      movieListText = movies.length
        ? movies.join(", ")
        : "No movies found.";
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `
You are a movie assistant for a movie website.
Only recommend movies from this list:
${movieListText}
If the list is empty, say you couldn't find movies.
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
