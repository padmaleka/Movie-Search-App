const API_KEY = "a040655e";  // OMDB API key

const searchButton = document.getElementById('searchButton');
const searchInput = document.getElementById('searchInput');
const resultsDiv = document.getElementById('results');
const movieDetailsDiv = document.getElementById('movieDetails');
const loadingDiv = document.getElementById('loading');

let currentQuery = "";
let currentPage = 1;
let totalResults = 0;


// Search button click handler
searchButton.addEventListener('click', () => {
  const searchTerm = searchInput.value.trim();
  if (searchTerm === "") {
    alert("Please enter a movie name");
    return;
  }
  searchMovies(searchTerm);
});


// Search for movies 
async function searchMovies(query, page = 1) {

  const loadingDiv = document.getElementById('loading');
    loadingDiv.style.display = 'block'; // Show loading

    try {
        currentQuery = query;
        currentPage = page;

        const response = await fetch(`https://www.omdbapi.com/?s=${query}&page=${page}&apikey=${API_KEY}`);
        const data = await response.json();

        if (data.Response === "True") {
            totalResults = parseInt(data.totalResults);
            displayMovies(data.Search);
            displayPagination();
        } else {
            resultsDiv.innerHTML = `<p>No movies found. Please try again.</p>`;
            document.getElementById('pagination').innerHTML = ''; // Clear pagination
        }
    } catch (error) {
        console.error("Error fetching movies:", error);
        resultsDiv.innerHTML = `<p>Something went wrong. Please try again later.</p>`;
    }
    finally {
        loadingDiv.style.display = 'none'; // Hide loading (success or fail)
    }
}


// Display movie cards........
function displayMovies(movies) {
  resultsDiv.innerHTML = ''; 

  movies.forEach(movie => {
    const movieItem = document.createElement('div');
    movieItem.className = 'movie-item';

    const posterSrc = movie.Poster && movie.Poster !== "N/A"
      ? movie.Poster
      : "./images/Placeholder.jpg";

    movieItem.innerHTML = `
      <img src="${posterSrc}" alt="${movie.Title}" onerror="this.onerror=null;this.src='./images/Placeholder.jpg';" />
      <h3>${movie.Title}</h3>
      <p>${movie.Year}</p>
      <button class="add-btn" onclick="addToFavorites('${movie.imdbID}', '${movie.Title}')">❤️ Add</button>
    `;

    movieItem.addEventListener('click', () => fetchMovieDetails(movie.imdbID, movieItem));

    resultsDiv.appendChild(movieItem);
  });
}


// Display detailed info...
async function fetchMovieDetails(imdbID, movieCard) {
  try {
    const res = await fetch(`https://www.omdbapi.com/?i=${imdbID}&apikey=${API_KEY}`);
    const movie = await res.json();

    const existingDetail = document.querySelector('.movie-details-inline');
    if (existingDetail) existingDetail.remove();

    const detailDiv = document.createElement('div');
    detailDiv.className = 'movie-details-inline';

    const posterSrc = movie.Poster && movie.Poster !== "N/A"
      ? movie.Poster
      : "./images/Placeholder.jpg";

    detailDiv.innerHTML = `
    <button class="close-btn" onclick="this.parentElement.remove()">✖</button>

      <img src="${posterSrc}" alt="${movie.Title}" onerror="this.onerror=null;this.src='./images/Placeholder.jpg';" />
      <div class="detail-content">
        <h2>${movie.Title}</h2>
        <p><strong>Year:</strong> ${movie.Year}</p>
        <p><strong>Genre:</strong> ${movie.Genre}</p>
        <p><strong>Plot:</strong> ${movie.Plot}</p>
        <p><strong>Cast:</strong> ${movie.Actors}</p>
      </div>
    `;

    movieCard.insertAdjacentElement('afterend', detailDiv);

  } catch (error) {
    console.error("Error loading movie details", error);
  }
}


// Pagination Buttons
function displayPagination() {
  const paginationDiv = document.getElementById('pagination');
  paginationDiv.innerHTML = '';

  const totalPages = Math.ceil(totalResults / 10);

  if (totalPages <= 1) return;

  const prevBtn = document.createElement('button');
  prevBtn.textContent = '⬅️ Previous';
  prevBtn.disabled = currentPage === 1;
  prevBtn.onclick = () => searchMovies(currentQuery, currentPage - 1);

  const nextBtn = document.createElement('button');
  nextBtn.textContent = 'Next ➡️';
  nextBtn.disabled = currentPage >= totalPages;
  nextBtn.onclick = () => searchMovies(currentQuery, currentPage + 1);

  paginationDiv.appendChild(prevBtn);
  paginationDiv.appendChild(document.createTextNode(` Page ${currentPage} of ${totalPages} `));
  paginationDiv.appendChild(nextBtn);
}


// Add movie to favorites (localStorage)
function addToFavorites(id, title) {
  let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

  if (!favorites.some(movie => movie.id === id)) {
    favorites.push({ id, title });
    localStorage.setItem('favorites', JSON.stringify(favorites));
    alert(`${title} added to favorites!`);
  } else {
    alert("Already in favorites!");
  }
}
